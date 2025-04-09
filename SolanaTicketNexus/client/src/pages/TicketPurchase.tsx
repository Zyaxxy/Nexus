import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation, useRoute, Link } from 'wouter';
import { Event, formatEventDateTime } from '../lib/mock-data';
import { useWallet } from '../context/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TicketGenerationResponse {
  id: number;
  eventId: number;
  userId: number;
  seatNumber: string;
  tokenId: string;
  qrCodeData: string;
}

const TicketPurchase = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [matched, params] = useRoute('/events/:id/purchase');
  const { connected, userId } = useWallet();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [generatedTickets, setGeneratedTickets] = useState<TicketGenerationResponse[]>([]);
  
  // Parse quantity from URL params if available
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const qtyParam = searchParams.get('quantity');
    if (qtyParam) {
      const qty = parseInt(qtyParam);
      if (!isNaN(qty) && qty >= 1 && qty <= 5) {
        setQuantity(qty);
      }
    }
  }, []);

  // Fetch event details
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
  });

  // Mutation for purchasing tickets
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!connected || !userId || !event) {
        throw new Error("You must be connected with a wallet to purchase tickets");
      }
      
      // Create tickets in sequence
      const tickets: TicketGenerationResponse[] = [];
      
      for (let i = 0; i < quantity; i++) {
        // Generate a seat number based on event category and availability
        const seatPrefix = event.category === 'Music' ? 'GA-' : 
                          event.category === 'Conference' ? 'CONF-' : 
                          event.category === 'Sports' ? 'SEC-' : 'SEAT-';
                          
        const seatNumber = `${seatPrefix}${Math.floor(Math.random() * 1000) + 1}`;
        
        const response = await apiRequest(
          "POST",
          "/api/tickets/purchase",
          {
            eventId: event.id,
            userId: userId,
            seatNumber: seatNumber
          }
        );
        
        const ticket = await response.json();
        tickets.push(ticket);
      }
      
      return tickets;
    },
    onSuccess: (data) => {
      setGeneratedTickets(data);
      setPurchaseComplete(true);
      queryClient.invalidateQueries({ queryKey: ['/api/tickets/user', userId] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}`] });
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "An error occurred while purchasing tickets",
        variant: "destructive"
      });
    },
  });

  const handlePurchase = async () => {
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase tickets",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(true);
    await purchaseMutation.mutateAsync();
    setProcessing(false);
  };

  // Redirect to events page if not connected
  useEffect(() => {
    if (!connected && !isLoading) {
      toast({
        title: "Wallet Not Connected",
        description: "You need to connect your wallet to purchase tickets",
        variant: "destructive"
      });
      navigate('/events');
    }
  }, [connected, isLoading]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading purchase details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading event</div>
          <Link href="/events">
            <Button variant="outline" className="border-primary text-primary">
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Purchase completion view
  if (purchaseComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-dark-light border-dark-lighter">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-900/20 p-4 rounded-full">
                <span className="material-icons text-green-500 text-4xl">check_circle</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Purchase Successful!</CardTitle>
            <CardDescription>
              Your tickets have been minted as NFTs and added to your wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-dark/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Event</span>
                <span className="font-medium">{event.title}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Date & Time</span>
                <span>{formatEventDateTime(event.date)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Location</span>
                <span>{event.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Purchased</span>
                <span>{generatedTickets.length} tickets</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="font-medium mb-2">Your NFT Tickets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedTickets.map((ticket, index) => (
                  <div key={ticket.id} className="bg-dark-lighter rounded-lg p-4 border border-dark-lighter/50">
                    <div className="text-xs text-gray-400 mb-2">Ticket #{index + 1}</div>
                    <div className="text-sm font-medium mb-2">{ticket.seatNumber}</div>
                    <div className="bg-white p-2 rounded-md mx-auto w-24 h-24 mb-2">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ticket.qrCodeData}`} 
                        alt="Ticket QR Code" 
                        className="w-full h-full"
                      />
                    </div>
                    <div className="text-xs font-mono text-gray-400 truncate">
                      Token: {ticket.tokenId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/my-tickets" className="w-full">
              <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                View My Tickets
              </Button>
            </Link>
            <Link href="/events" className="w-full">
              <Button variant="outline" className="w-full border-gray-600 hover:bg-dark-lighter text-white">
                Browse More Events
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Purchase confirmation view
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="bg-dark-light border-dark-lighter">
        <CardHeader>
          <CardTitle>Confirm Purchase</CardTitle>
          <CardDescription>
            You're about to purchase NFT tickets for {event.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-4">Event Details</h3>
            <div className="bg-dark/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Event</span>
                <span className="font-medium">{event.title}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Date & Time</span>
                <span>{formatEventDateTime(event.date)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Location</span>
                <span>{event.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Category</span>
                <span>{event.category}</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="mb-6">
            <h3 className="font-medium text-lg mb-4">Purchase Summary</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ticket price</span>
                <div className="font-mono">
                  {event.ticketPrice} SOL × {quantity}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Quantity</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Transaction fee</span>
                <div className="font-mono">0.001 SOL</div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-bold">
              <span>Total</span>
              <div className="font-mono text-xl">
                {(event.ticketPrice * quantity + 0.001).toFixed(3)} SOL
              </div>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <span className="material-icons text-primary mr-2">info</span>
              <div>
                <h4 className="font-medium mb-1">NFT Ticket Information</h4>
                <p className="text-sm text-gray-300">
                  Each ticket will be minted as a unique NFT on the Solana blockchain. The NFT will include metadata such as event details, seat assignment, and a unique QR code for entry verification.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3"
            onClick={handlePurchase}
            disabled={processing}
          >
            {processing ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                Processing...
              </span>
            ) : (
              `Confirm and Pay ${(event.ticketPrice * quantity + 0.001).toFixed(3)} SOL`
            )}
          </Button>
          <Link href={`/events/${id}`}>
            <Button variant="outline" className="w-full border-gray-600 hover:bg-dark-lighter text-white">
              Cancel
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TicketPurchase;
