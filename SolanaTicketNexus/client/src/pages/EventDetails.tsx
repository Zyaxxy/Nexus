import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useLocation } from 'wouter';
import { Event, formatEventDateTime } from '../lib/mock-data';
import { useWallet } from '../context/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const EventDetails = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { connected } = useWallet();
  const { toast } = useToast();
  const [ticketQuantity, setTicketQuantity] = useState(1);

  // Fetch event details
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
  });

  const handleIncrementQuantity = () => {
    if (ticketQuantity < 5) {
      setTicketQuantity(ticketQuantity + 1);
    } else {
      toast({
        title: "Maximum Limit Reached",
        description: "You can only purchase up to 5 tickets per event",
        variant: "destructive"
      });
    }
  };

  const handleDecrementQuantity = () => {
    if (ticketQuantity > 1) {
      setTicketQuantity(ticketQuantity - 1);
    }
  };

  const handlePurchase = () => {
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase tickets",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/events/${id}/purchase?quantity=${ticketQuantity}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading event details...</p>
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

  const isEventSoldOut = event.ticketsSold >= event.ticketsAvailable;
  const ticketsRemaining = event.ticketsAvailable - event.ticketsSold;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back button */}
      <Link href="/events" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
        <span className="material-icons mr-1">arrow_back</span>
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Event Image */}
        <div className="lg:col-span-2">
          <div 
            className="w-full h-96 rounded-xl overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${event.imageSrc})` }}
          ></div>
        </div>

        {/* Purchase Panel */}
        <div className="lg:col-span-1">
          <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{event.title}</h2>
              {event.verified && (
                <div className="flex items-center text-secondary text-sm">
                  <span className="material-icons text-sm mr-1">verified</span>
                  Verified
                </div>
              )}
            </div>

            <div className="flex items-center mb-4">
              <span className="material-icons text-gray-400 mr-2">calendar_today</span>
              <span>{formatEventDateTime(event.date)}</span>
            </div>

            <div className="flex items-center mb-6">
              <span className="material-icons text-gray-400 mr-2">location_on</span>
              <span>{event.location}</span>
            </div>

            <Separator className="mb-6" />

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Price per ticket</span>
                <div className="font-mono font-bold text-xl flex items-center">
                  <svg className="w-5 h-5 mr-1 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L17.5 7 12 9.5 6.5 7 12 4.5zM4 8.5l7 3.5v7l-7-3.5v-7zm9 10.5v-7l7-3.5v7l-7 3.5z" />
                  </svg>
                  {event.ticketPrice} SOL
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Availability</span>
                {isEventSoldOut ? (
                  <Badge variant="destructive">Sold Out</Badge>
                ) : (
                  <Badge variant="outline" className="text-secondary border-secondary">
                    {ticketsRemaining} left
                  </Badge>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400">Quantity (max 5)</span>
                <div className="flex items-center">
                  <button 
                    className="w-8 h-8 rounded-full bg-dark-lighter flex items-center justify-center"
                    onClick={handleDecrementQuantity}
                    disabled={ticketQuantity <= 1}
                  >
                    <span className="material-icons text-sm">remove</span>
                  </button>
                  <span className="mx-4 font-mono font-bold">{ticketQuantity}</span>
                  <button 
                    className="w-8 h-8 rounded-full bg-dark-lighter flex items-center justify-center"
                    onClick={handleIncrementQuantity}
                    disabled={ticketQuantity >= 5}
                  >
                    <span className="material-icons text-sm">add</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Total</span>
                <div className="font-mono font-bold text-xl">
                  {(event.ticketPrice * ticketQuantity).toFixed(2)} SOL
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-lg"
              onClick={handlePurchase}
              disabled={isEventSoldOut}
            >
              {isEventSoldOut ? 'Sold Out' : 'Buy Tickets'}
            </Button>
            
            {isEventSoldOut && (
              <div className="mt-4 text-center">
                <Link href="/marketplace">
                  <Button variant="outline" className="text-secondary border-secondary hover:bg-secondary/10">
                    Check Resale Market
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter mb-8">
            <h3 className="text-xl font-bold mb-4">About This Event</h3>
            <p className="text-gray-300 whitespace-pre-line">
              {event.description}
            </p>
          </div>

          <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter">
            <h3 className="text-xl font-bold mb-4">NFT Ticket Benefits</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="material-icons text-primary mr-3">verified_user</span>
                <div>
                  <h4 className="font-medium mb-1">Secure & Authentic</h4>
                  <p className="text-gray-400 text-sm">Each ticket is a unique NFT on the Solana blockchain, impossible to counterfeit.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="material-icons text-primary mr-3">account_balance_wallet</span>
                <div>
                  <h4 className="font-medium mb-1">Digital Ownership</h4>
                  <p className="text-gray-400 text-sm">Tickets are stored in your Solana wallet, accessible anywhere.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="material-icons text-primary mr-3">swap_horiz</span>
                <div>
                  <h4 className="font-medium mb-1">Regulated Resale</h4>
                  <p className="text-gray-400 text-sm">Safely resell your ticket through our marketplace if you can't attend.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="material-icons text-primary mr-3">history</span>
                <div>
                  <h4 className="font-medium mb-1">Collectible</h4>
                  <p className="text-gray-400 text-sm">Keep your ticket as a digital collectible after the event.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter mb-8">
            <h3 className="text-xl font-bold mb-4">Event Details</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Date and Time</h4>
                <div className="flex items-center">
                  <span className="material-icons text-primary mr-2">event</span>
                  <span>{formatEventDateTime(event.date)}</span>
                </div>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Location</h4>
                <div className="flex items-center">
                  <span className="material-icons text-primary mr-2">location_on</span>
                  <span>{event.location}</span>
                </div>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Category</h4>
                <div className="flex items-center">
                  <span className="material-icons text-primary mr-2">category</span>
                  <span>{event.category}</span>
                </div>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Tickets Sold</h4>
                <div className="flex items-center">
                  <span className="material-icons text-primary mr-2">confirmation_number</span>
                  <span>{event.ticketsSold} / {event.ticketsAvailable}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter">
            <h3 className="text-xl font-bold mb-4">Share Event</h3>
            <div className="flex space-x-4">
              <button 
                className="flex-1 flex items-center justify-center bg-[#1DA1F2] p-2 rounded-lg text-white"
                onClick={() => toast({ title: "Share Feature", description: "Twitter sharing would be implemented in the full version" })}
              >
                <span className="material-icons mr-1">share</span>
                Twitter
              </button>
              <button 
                className="flex-1 flex items-center justify-center bg-[#4267B2] p-2 rounded-lg text-white"
                onClick={() => toast({ title: "Share Feature", description: "Facebook sharing would be implemented in the full version" })}
              >
                <span className="material-icons mr-1">share</span>
                Facebook
              </button>
              <button 
                className="flex-1 flex items-center justify-center bg-dark p-2 rounded-lg text-white"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Link Copied", description: "Event link copied to clipboard" });
                }}
              >
                <span className="material-icons mr-1">link</span>
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
