import { useState } from 'react';
import { Ticket, formatEventDateTime } from '../../lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TicketCardProps {
  ticket: Ticket;
  onListForSale?: (ticketId: number) => void;
}

const TicketCard = ({ ticket, onListForSale }: TicketCardProps) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const { toast } = useToast();

  const handleViewTicket = () => {
    setShowQRModal(true);
  };

  const handleListForSale = () => {
    if (onListForSale) {
      onListForSale(ticket.id);
    } else {
      toast({
        title: "Coming Soon",
        description: "Listing for sale will be available in the future",
      });
    }
  };

  return (
    <>
      <div className="ticket-card bg-gradient-to-br from-dark-light to-dark-lighter rounded-xl overflow-hidden border border-primary/30">
        <div className="p-4 relative grid-pattern">
          <div className="flex justify-between items-start">
            <div className="bg-dark px-3 py-1 rounded-full text-xs font-medium text-secondary flex items-center">
              <span className="material-icons text-secondary text-xs mr-1">verified</span>
              Verified NFT
            </div>
            <div className="flex space-x-2">
              <button 
                className="p-1 rounded-full bg-dark-lighter hover:bg-dark-light" 
                title="View on Explorer"
                onClick={() => toast({
                  title: "Blockchain Explorer",
                  description: "This will link to Solana explorer in the full version"
                })}
              >
                <span className="material-icons text-sm">open_in_new</span>
              </button>
              <button 
                className="p-1 rounded-full bg-dark-lighter hover:bg-dark-light" 
                title="Share"
                onClick={() => toast({
                  title: "Share Ticket",
                  description: "Ticket sharing coming soon"
                })}
              >
                <span className="material-icons text-sm">share</span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-center my-4">
            <div className="bg-white p-3 rounded-lg cursor-pointer" onClick={handleViewTicket}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qrCodeData}`} 
                className="w-32 h-32" 
                alt="QR Code" 
              />
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h3 className="font-bold text-xl mb-1">{ticket.event?.title}</h3>
            <p className="text-gray-400 text-sm">{ticket.seatNumber}</p>
          </div>
          
          <div className="flex justify-between text-sm mb-2">
            <div className="text-gray-400">Date & Time</div>
            <div className="font-medium">{ticket.event ? formatEventDateTime(ticket.event.date) : 'Unknown'}</div>
          </div>
          
          <div className="flex justify-between text-sm mb-2">
            <div className="text-gray-400">Location</div>
            <div className="font-medium">{ticket.event?.location || 'Unknown'}</div>
          </div>
          
          <div className="flex justify-between text-sm mb-2">
            <div className="text-gray-400">Seat</div>
            <div className="font-medium">{ticket.seatNumber}</div>
          </div>
          
          <div className="flex justify-between text-sm mb-4">
            <div className="text-gray-400">Token ID</div>
            <div className="font-mono text-xs truncate max-w-[150px]">{ticket.tokenId}</div>
          </div>
          
          <div className="flex justify-between">
            <button 
              className="flex-1 mr-2 bg-secondary hover:bg-secondary-dark text-dark font-medium py-2 rounded-lg text-sm transition-colors"
              onClick={handleViewTicket}
            >
              View Details
            </button>
            <button 
              className="flex-1 ml-2 border border-gray-600 hover:border-white text-white font-medium py-2 rounded-lg text-sm transition-colors"
              onClick={handleListForSale}
            >
              List for Sale
            </button>
          </div>
        </div>
      </div>

      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="bg-dark-light border border-dark-lighter">
          <DialogHeader>
            <DialogTitle className="text-white text-center">Your Ticket QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <div className="bg-white p-6 rounded-lg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticket.qrCodeData}`} 
                className="w-64 h-64" 
                alt="QR Code" 
              />
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm">
            <p>Present this QR code at the venue for entry.</p>
            <p>Do not share this QR code with others - it's your unique ticket!</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TicketCard;
