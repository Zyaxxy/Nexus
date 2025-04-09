export interface Event {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  location: string;
  date: Date;
  category: string;
  ticketPrice: number;
  ticketsAvailable: number;
  ticketsSold: number;
  verified: boolean;
}

export interface Ticket {
  id: number;
  eventId: number;
  userId: number;
  seatNumber: string;
  tokenId: string;
  qrCodeData: string;
  purchaseDate: Date;
  isUsed: boolean;
  usedDate: Date | null;
  isForSale: boolean;
  salePrice: number | null;
  saleType: string | null;
  auctionEndDate: Date | null;
  event?: Event;
}

export interface MarketListing {
  id: number;
  ticketId: number;
  sellerId: number;
  price: number;
  listingType: string;
  createdAt: Date;
  endsAt: Date | null;
  currentBid: number | null;
  currentBidderId: number | null;
  ticket?: Ticket;
  event?: Event;
  seller?: {
    id: number;
    username: string;
    walletAddress: string;
  };
}

export interface Bid {
  id: number;
  listingId: number;
  bidderId: number;
  amount: number;
  bidTime: Date;
}

export interface UserWallet {
  id: number;
  walletAddress: string;
}

// Helper function to format a date
export function formatEventDate(date: Date | string): string {
  const eventDate = new Date(date);
  return eventDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper function to format a date with time
export function formatEventDateTime(date: Date | string): string {
  const eventDate = new Date(date);
  return eventDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper function to truncate a wallet address
export function formatWalletAddress(address: string | undefined): string {
  if (!address) return '';
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Helper function to calculate time remaining for auctions
export function getTimeRemaining(endDate: Date | string | null): string {
  if (!endDate) return '';
  
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const diff = end - now;
  
  if (diff <= 0) return 'Ended';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours}h ${minutes}m ${seconds}s`;
}
