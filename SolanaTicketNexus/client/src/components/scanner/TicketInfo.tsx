import { useState } from 'react';
import { apiRequest } from '../../lib/queryClient';
import { formatEventDateTime, formatWalletAddress } from '../../lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface TicketDetailsType {
  ticket: {
    id: number;
    eventId: number;
    userId: number;
    seatNumber: string;
    tokenId: string;
    isUsed: boolean;
    usedDate: string | null;
  };
  event: {
    id: number;
    title: string;
    location: string;
    date: string;
  };
  valid: boolean;
  usedDate: string | null;
}

interface TicketInfoProps {
  qrCode: string | null;
  onReset: () => void;
}

const TicketInfo = ({ qrCode, onReset }: TicketInfoProps) => {
  const [loading, setLoading] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<TicketDetailsType | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  // Fetch ticket details if QR code is provided
  useState(() => {
    if (qrCode) {
      fetchTicketDetails(qrCode);
    }
  });

  const fetchTicketDetails = async (code: string) => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", `/api/tickets/verify/${code}`, undefined);
      const data = await res.json();
      setTicketDetails(data);
    } catch (err) {
      console.error("Error verifying ticket:", err);
      toast({
        title: "Verification Failed",
        description: err instanceof Error ? err.message : "Could not verify ticket",
        variant: "destructive"
      });
      setTicketDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!ticketDetails) return;
    
    try {
      setProcessing(true);
      const res = await apiRequest(
        "PATCH", 
        `/api/tickets/${ticketDetails.ticket.id}/use`, 
        undefined
      );
      
      const data = await res.json();
      
      toast({
        title: "Check-In Successful",
        description: "Attendee has been checked in",
      });
      
      // Update local state to reflect used status
      setTicketDetails({
        ...ticketDetails,
        valid: false,
        ticket: {
          ...ticketDetails.ticket,
          isUsed: true,
          usedDate: new Date().toISOString()
        },
        usedDate: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error checking in attendee:", err);
      toast({
        title: "Check-In Failed",
        description: err instanceof Error ? err.message : "Could not check in attendee",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    toast({
      title: "Entry Rejected",
      description: "Attendee has been denied entry",
    });
    onReset();
  };

  const handleOverrideCheckIn = async () => {
    if (!ticketDetails) return;
    
    try {
      setProcessing(true);
      // In a real implementation, this would use a special admin endpoint
      // For this mockup, we'll use the same endpoint
      const res = await apiRequest(
        "PATCH", 
        `/api/tickets/${ticketDetails.ticket.id}/use`, 
        undefined
      );
      
      const data = await res.json();
      
      toast({
        title: "Override Successful",
        description: "Attendee has been checked in (Override)",
        variant: "destructive"
      });
      
      onReset();
    } catch (err) {
      console.error("Error overriding check-in:", err);
      toast({
        title: "Override Failed",
        description: err instanceof Error ? err.message : "Could not override check-in",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!qrCode) {
    return (
      <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter">
        <h2 className="text-xl font-semibold mb-4">Ticket Information</h2>
        
        <div id="scan-empty-state">
          <div className="border-2 border-dashed border-dark-lighter rounded-lg py-12 text-center">
            <div className="bg-dark-lighter inline-flex rounded-full p-3 mb-4">
              <span className="material-icons text-2xl text-gray-400">info</span>
            </div>
            <h3 className="text-lg font-medium mb-2">No Ticket Scanned</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Scan a ticket QR code to see validation results and ticket details
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter">
        <h2 className="text-xl font-semibold mb-4">Ticket Information</h2>
        
        <div className="border-2 border-dark-lighter rounded-lg py-12 text-center">
          <div className="mb-4 animate-pulse">
            <span className="material-icons text-4xl text-gray-600">hourglass_top</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Verifying Ticket...</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Checking ticket authenticity on the blockchain
          </p>
        </div>
      </div>
    );
  }

  // Mock successful ticket validation
  if (!ticketDetails) {
    // Simulate a successful scan for demo purposes
    const mockTicket: TicketDetailsType = {
      ticket: {
        id: 1,
        eventId: 1,
        userId: 1,
        seatNumber: "VIP-25",
        tokenId: "NFT#8723jf92a71c",
        isUsed: false,
        usedDate: null
      },
      event: {
        id: 1,
        title: "Solana Breakpoint 2023",
        location: "Marina Bay Sands, Singapore",
        date: "2023-11-04T09:00:00Z"
      },
      valid: true,
      usedDate: null
    };
    
    return (
      <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter">
        <h2 className="text-xl font-semibold mb-4">Ticket Information</h2>
        
        <div className="border-2 border-green-800 bg-green-900/20 rounded-lg p-4 mb-6 flex items-center">
          <span className="material-icons text-green-500 mr-2">check_circle</span>
          <span className="text-green-400 font-medium">Valid Ticket • Not Yet Used</span>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="font-bold text-xl mb-1">{mockTicket.event.title}</h3>
          <p className="text-gray-400 text-sm">{mockTicket.ticket.seatNumber}</p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <div className="text-gray-400">Ticket ID</div>
            <div className="font-mono">BP23-VIP-025</div>
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="text-gray-400">Seat Assignment</div>
            <div className="font-medium">{mockTicket.ticket.seatNumber}</div>
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="text-gray-400">Date & Time</div>
            <div className="font-medium">{formatEventDateTime(mockTicket.event.date)}</div>
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="text-gray-400">Ticket Holder</div>
            <div className="font-mono text-xs">{formatWalletAddress("sol8f3d7a")}</div>
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="text-gray-400">Token ID</div>
            <div className="font-mono text-xs truncate max-w-[150px]">{mockTicket.ticket.tokenId}</div>
          </div>
        </div>
        
        <Button 
          className="w-full bg-secondary hover:bg-secondary-dark text-dark font-bold py-3 rounded-lg transition-colors"
          onClick={handleCheckIn}
          disabled={processing}
        >
          {processing ? "Processing..." : "Check-In Attendee"}
        </Button>
      </div>
    );
  }

  // Used ticket validation
  if (!ticketDetails.valid) {
    return (
      <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter">
        <h2 className="text-xl font-semibold mb-4">Ticket Information</h2>
        
        <div className="border-2 border-red-800 bg-red-900/20 rounded-lg p-4 mb-6 flex items-center">
          <span className="material-icons text-red-500 mr-2">error</span>
          <span className="text-red-400 font-medium">Invalid Ticket • Already Used</span>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="font-bold text-xl mb-1">{ticketDetails.event.title}</h3>
          <p className="text-gray-400 text-sm">{ticketDetails.ticket.seatNumber}</p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <div className="text-gray-400">Ticket ID</div>
            <div className="font-mono">TKT-{ticketDetails.ticket.id}</div>
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="text-gray-400">Seat Assignment</div>
            <div className="font-medium">{ticketDetails.ticket.seatNumber}</div>
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="text-gray-400">Date & Time</div>
            <div className="font-medium">{formatEventDateTime(ticketDetails.event.date)}</div>
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="text-gray-400">Ticket Holder</div>
            <div className="font-mono text-xs">{formatWalletAddress("sol8f3d7a")}</div>
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="text-gray-400">Used At</div>
            <div className="font-medium text-red-400">
              {ticketDetails.usedDate ? formatEventDateTime(ticketDetails.usedDate) : 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-dark-lighter hover:bg-dark-light text-white font-medium py-3 rounded-lg transition-colors"
            onClick={handleReject}
          >
            Reject Entry
          </Button>
          <Button 
            className="flex-1 bg-red-800 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors"
            onClick={handleOverrideCheckIn}
            disabled={processing}
          >
            {processing ? "Processing..." : "Override & Check-In"}
          </Button>
        </div>
      </div>
    );
  }

  // Valid ticket
  return (
    <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter">
      <h2 className="text-xl font-semibold mb-4">Ticket Information</h2>
      
      <div className="border-2 border-green-800 bg-green-900/20 rounded-lg p-4 mb-6 flex items-center">
        <span className="material-icons text-green-500 mr-2">check_circle</span>
        <span className="text-green-400 font-medium">Valid Ticket • Not Yet Used</span>
      </div>
      
      <div className="text-center mb-6">
        <h3 className="font-bold text-xl mb-1">{ticketDetails.event.title}</h3>
        <p className="text-gray-400 text-sm">{ticketDetails.ticket.seatNumber}</p>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <div className="text-gray-400">Ticket ID</div>
          <div className="font-mono">TKT-{ticketDetails.ticket.id}</div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="text-gray-400">Seat Assignment</div>
          <div className="font-medium">{ticketDetails.ticket.seatNumber}</div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="text-gray-400">Date & Time</div>
          <div className="font-medium">{formatEventDateTime(ticketDetails.event.date)}</div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="text-gray-400">Ticket Holder</div>
          <div className="font-mono text-xs">{formatWalletAddress("sol8f3d7a")}</div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="text-gray-400">Token ID</div>
          <div className="font-mono text-xs truncate max-w-[150px]">{ticketDetails.ticket.tokenId}</div>
        </div>
      </div>
      
      <Button 
        className="w-full bg-secondary hover:bg-secondary-dark text-dark font-bold py-3 rounded-lg transition-colors"
        onClick={handleCheckIn}
        disabled={processing}
      >
        {processing ? "Processing..." : "Check-In Attendee"}
      </Button>
    </div>
  );
};

export default TicketInfo;
