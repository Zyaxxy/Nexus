import { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { apiRequest } from '../../lib/queryClient';
import { MarketListing, formatWalletAddress, formatEventDateTime, getTimeRemaining } from '../../lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MarketplaceCardProps {
  listing: MarketListing;
  onPurchaseComplete?: () => void;
}

const MarketplaceCard = ({ listing, onPurchaseComplete }: MarketplaceCardProps) => {
  const { connected, userId } = useWallet();
  const { toast } = useToast();
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (listing.listingType === 'auction' && listing.endsAt) {
      const timer = setInterval(() => {
        setTimeRemaining(getTimeRemaining(listing.endsAt));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [listing]);

  const handlePurchase = async () => {
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make a purchase",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      const res = await apiRequest(
        "POST",
        `/api/marketplace/buy/${listing.id}`,
        { buyerId: userId }
      );
      
      const data = await res.json();
      
      toast({
        title: "Purchase Successful",
        description: "The ticket has been added to your collection",
      });
      
      setShowBuyDialog(false);
      if (onPurchaseComplete) onPurchaseComplete();
    } catch (err) {
      console.error("Error purchasing ticket:", err);
      toast({
        title: "Purchase Failed",
        description: err instanceof Error ? err.message : "Could not complete purchase",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place a bid",
        variant: "destructive"
      });
      return;
    }

    const bidAmountNum = parseFloat(bidAmount);
    if (isNaN(bidAmountNum) || bidAmountNum <= 0) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a valid bid amount",
        variant: "destructive"
      });
      return;
    }

    if (listing.currentBid && bidAmountNum <= listing.currentBid) {
      toast({
        title: "Bid Too Low",
        description: `Your bid must be higher than the current bid of ${listing.currentBid} SOL`,
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      const res = await apiRequest(
        "POST",
        "/api/marketplace/bid",
        {
          listingId: listing.id,
          bidderId: userId,
          amount: bidAmountNum
        }
      );
      
      const data = await res.json();
      
      toast({
        title: "Bid Placed Successfully",
        description: `You are now the highest bidder at ${bidAmountNum} SOL`,
      });
      
      setShowBidDialog(false);
      if (onPurchaseComplete) onPurchaseComplete();
    } catch (err) {
      console.error("Error placing bid:", err);
      toast({
        title: "Bid Failed",
        description: err instanceof Error ? err.message : "Could not place bid",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="ticket-card bg-dark-light rounded-xl overflow-hidden border border-dark-lighter">
        <div className="p-4 relative">
          <div className="absolute top-4 right-4 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
            {listing.listingType === 'fixed' ? 'Fixed Price' : 'Live Auction'}
          </div>
          
          <div className="flex justify-center my-4">
            <div className="bg-white p-3 rounded-lg relative">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=solticket:resale:${listing.ticket?.eventId}:${listing.ticket?.seatNumber}`} 
                className="w-32 h-32 opacity-30" 
                alt="QR Code (blurred for security)" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-dark-lighter/80 rounded-lg p-2">
                  <span className="material-icons text-4xl text-gray-400">lock</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h3 className="font-bold text-xl mb-1">{listing.event?.title}</h3>
            <p className="text-gray-400 text-sm">{listing.ticket?.seatNumber}</p>
          </div>
          
          <div className="flex justify-between text-sm mb-2">
            <div className="text-gray-400">Date & Time</div>
            <div className="font-medium">{listing.event ? formatEventDateTime(listing.event.date) : 'Unknown'}</div>
          </div>
          
          <div className="flex justify-between text-sm mb-2">
            <div className="text-gray-400">Location</div>
            <div className="font-medium">{listing.event?.location || 'Unknown'}</div>
          </div>
          
          <div className="flex justify-between text-sm mb-2">
            <div className="text-gray-400">Seller</div>
            <div className="font-mono text-xs">{formatWalletAddress(listing.seller?.walletAddress)}</div>
          </div>
          
          <div className="py-3 my-3 border-t border-b border-dark-lighter">
            {listing.listingType === 'fixed' ? (
              <div className="flex justify-between items-center">
                <div className="text-gray-400 text-sm">Price</div>
                <div className="font-mono font-bold text-lg flex items-center">
                  <svg className="w-5 h-5 mr-1 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L17.5 7 12 9.5 6.5 7 12 4.5zM4 8.5l7 3.5v7l-7-3.5v-7zm9 10.5v-7l7-3.5v7l-7 3.5z" />
                  </svg>
                  {listing.price} SOL
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-gray-400 text-sm">Current Bid</div>
                  <div className="font-mono font-bold text-lg flex items-center">
                    <svg className="w-5 h-5 mr-1 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L17.5 7 12 9.5 6.5 7 12 4.5zM4 8.5l7 3.5v7l-7-3.5v-7zm9 10.5v-7l7-3.5v7l-7 3.5z" />
                    </svg>
                    {listing.currentBid || listing.price} SOL
                  </div>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-gray-400 text-sm">Ends in</div>
                  <div className="font-medium text-secondary">{timeRemaining}</div>
                </div>
              </>
            )}
            {listing.event && (
              <div className="text-xs text-gray-500 text-right">
                (Original price: {listing.event.ticketPrice} SOL)
              </div>
            )}
          </div>
          
          <button 
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors"
            onClick={() => listing.listingType === 'fixed' ? setShowBuyDialog(true) : setShowBidDialog(true)}
          >
            {listing.listingType === 'fixed' ? 'Buy Now' : 'Place Bid'}
          </button>
        </div>
      </div>

      {/* Buy Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="bg-dark-light border border-dark-lighter">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Purchase</DialogTitle>
            <DialogDescription className="text-gray-400">
              You are about to purchase a ticket NFT for {listing.event?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between py-2 border-b border-dark-lighter">
              <span className="text-gray-400">Ticket</span>
              <span className="font-medium">{listing.event?.title} - {listing.ticket?.seatNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-lighter">
              <span className="text-gray-400">Date</span>
              <span className="font-medium">{listing.event ? formatEventDateTime(listing.event.date) : 'Unknown'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-lighter">
              <span className="text-gray-400">Price</span>
              <span className="font-medium font-mono">{listing.price} SOL</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-lighter">
              <span className="text-gray-400">Seller</span>
              <span className="font-mono text-xs">{formatWalletAddress(listing.seller?.walletAddress)}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBuyDialog(false)}
              className="border-gray-600 text-white hover:bg-dark-lighter"
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={handlePurchase}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bid Dialog */}
      <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
        <DialogContent className="bg-dark-light border border-dark-lighter">
          <DialogHeader>
            <DialogTitle className="text-white">Place a Bid</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your bid amount for this ticket
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between py-2 border-b border-dark-lighter">
              <span className="text-gray-400">Ticket</span>
              <span className="font-medium">{listing.event?.title} - {listing.ticket?.seatNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-lighter">
              <span className="text-gray-400">Current Bid</span>
              <span className="font-medium font-mono">{listing.currentBid || listing.price} SOL</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-lighter">
              <span className="text-gray-400">Ends In</span>
              <span className="font-medium text-secondary">{timeRemaining}</span>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Your Bid (in SOL)
              </label>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L17.5 7 12 9.5 6.5 7 12 4.5zM4 8.5l7 3.5v7l-7-3.5v-7zm9 10.5v-7l7-3.5v7l-7 3.5z" />
                </svg>
                <Input 
                  type="number" 
                  value={bidAmount} 
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="bg-dark border-dark-lighter text-white"
                  placeholder="Enter amount"
                  step="0.01"
                  min={listing.currentBid ? (listing.currentBid + 0.01).toFixed(2) : (listing.price + 0.01).toFixed(2)}
                />
              </div>
              {(listing.currentBid || listing.price) > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum bid: {(listing.currentBid ? (listing.currentBid + 0.01) : (listing.price + 0.01)).toFixed(2)} SOL
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBidDialog(false)}
              className="border-gray-600 text-white hover:bg-dark-lighter"
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={handlePlaceBid}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Place Bid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MarketplaceCard;
