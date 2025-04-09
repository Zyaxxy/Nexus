import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../context/WalletContext';
import { Link } from 'wouter';
import TicketCard from '../components/tickets/TicketCard';
import { Ticket } from '../lib/mock-data';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const MyTickets = () => {
  const { connected, userId } = useWallet();
  const [filter, setFilter] = useState('all');
  const [showListDialog, setShowListDialog] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch user tickets if wallet is connected
  const { 
    data: tickets, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets/user', userId],
    queryFn: connected && userId ? undefined : () => Promise.resolve([]),
    enabled: !!connected && !!userId,
  });

  useEffect(() => {
    if (connected && userId) {
      refetch();
    }
  }, [connected, userId, refetch]);

  const handleListForSale = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setShowListDialog(true);
  };

  const handleConfirmListing = () => {
    toast({
      title: "Listing Created",
      description: "Your ticket has been listed on the marketplace",
    });
    setShowListDialog(false);
  };

  // Filter tickets based on selected filter
  const filterTickets = (tickets: Ticket[] | undefined) => {
    if (!tickets) return [];
    
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return tickets.filter(ticket => 
          ticket.event && new Date(ticket.event.date) > now && !ticket.isUsed
        );
      case 'past':
        return tickets.filter(ticket => 
          ticket.event && (new Date(ticket.event.date) <= now || ticket.isUsed)
        );
      default:
        return tickets;
    }
  };

  const filteredTickets = filterTickets(tickets);

  return (
    <div>
      {/* Tab navigation */}
      <div className="bg-dark-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <Link href="/events">
              <button className="py-4 px-1 border-b-2 border-transparent font-medium text-gray-400 hover:text-white">
                Featured Events
              </button>
            </Link>
            <button className="py-4 px-1 border-b-2 border-primary font-medium text-primary">
              My Tickets
            </button>
            <Link href="/marketplace">
              <button className="py-4 px-1 border-b-2 border-transparent font-medium text-gray-400 hover:text-white">
                Resale Marketplace
              </button>
            </Link>
            <Link href="/scanner">
              <button className="py-4 px-1 border-b-2 border-transparent font-medium text-gray-400 hover:text-white">
                Ticket Scanner
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-gray-400">Your collection of NFT tickets</p>
        </div>

        {!connected ? (
          // Wallet Not Connected State
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-dark-lighter rounded-xl">
            <div className="text-8xl text-gray-600 mb-4">🎟️</div>
            <h2 className="text-2xl font-bold text-center mb-2">Connect your wallet to view your tickets</h2>
            <p className="text-gray-400 text-center mb-6 max-w-md">Your NFT tickets will appear here after connecting your Solana wallet</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary-dark text-white font-medium flex items-center">
                <span>Browse Events</span>
                <span className="material-icons ml-2">arrow_forward</span>
              </Button>
            </Link>
          </div>
        ) : isLoading ? (
          // Loading state
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your tickets...</p>
          </div>
        ) : (
          // Connected Wallet State
          <div>
            {/* Tickets Filter Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">Filter:</span>
                <button 
                  className={`${filter === 'all' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'} px-3 py-1 rounded-full text-sm font-medium`}
                  onClick={() => setFilter('all')}
                >
                  All Tickets
                </button>
                <button 
                  className={`${filter === 'upcoming' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'} px-3 py-1 rounded-full text-sm font-medium`}
                  onClick={() => setFilter('upcoming')}
                >
                  Upcoming
                </button>
                <button 
                  className={`${filter === 'past' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'} px-3 py-1 rounded-full text-sm font-medium`}
                  onClick={() => setFilter('past')}
                >
                  Past Events
                </button>
              </div>
            </div>

            {/* Tickets Grid */}
            {filteredTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} onListForSale={handleListForSale} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-dark-lighter rounded-xl">
                <div className="text-4xl mb-4">🎫</div>
                <h3 className="text-xl font-bold mb-2">No tickets found</h3>
                <p className="text-gray-400 mb-4">
                  {filter !== 'all' 
                    ? 'Try changing your filter selection' 
                    : "You haven't purchased any tickets yet"}
                </p>
                <Link href="/events">
                  <Button className="bg-primary hover:bg-primary-dark text-white font-medium">
                    Browse Events
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="bg-dark-light border border-dark-lighter">
          <DialogHeader>
            <DialogTitle className="text-white">List Ticket for Sale</DialogTitle>
            <DialogDescription className="text-gray-400">
              This feature is coming soon in the full version.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white">
              In the complete version, you'll be able to list your NFT tickets for resale at a fixed price or auction.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowListDialog(false)}
              className="border-gray-600 text-white hover:bg-dark-lighter"
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={handleConfirmListing}
            >
              Simulate Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyTickets;
