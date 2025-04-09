import {
  users, User, InsertUser,
  events, Event, InsertEvent,
  tickets, Ticket, InsertTicket,
  marketListings, MarketListing, InsertMarketListing,
  bids, Bid, InsertBid
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;

  // Ticket operations
  getTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketsByUser(userId: number): Promise<Ticket[]>;
  getTicketsByEvent(eventId: number): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<Ticket>): Promise<Ticket | undefined>;

  // Marketplace operations
  getMarketListings(): Promise<MarketListing[]>;
  getMarketListing(id: number): Promise<MarketListing | undefined>;
  createMarketListing(listing: InsertMarketListing): Promise<MarketListing>;
  updateMarketListing(id: number, listing: Partial<MarketListing>): Promise<MarketListing | undefined>;
  deleteMarketListing(id: number): Promise<boolean>;

  // Bid operations
  getBidsByListing(listingId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private tickets: Map<number, Ticket>;
  private marketListings: Map<number, MarketListing>;
  private bids: Map<number, Bid>;
  
  private userId: number;
  private eventId: number;
  private ticketId: number;
  private marketListingId: number;
  private bidId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.tickets = new Map();
    this.marketListings = new Map();
    this.bids = new Map();
    
    this.userId = 1;
    this.eventId = 1;
    this.ticketId = 1;
    this.marketListingId = 1;
    this.bidId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const event: Event = {
      ...insertEvent,
      id,
      verified: true,
      ticketsSold: 0
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined> {
    const existingEvent = this.events.get(id);
    if (!existingEvent) return undefined;
    
    const updatedEvent = { ...existingEvent, ...event };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  // Ticket operations
  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTicketsByUser(userId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.userId === userId
    );
  }

  async getTicketsByEvent(eventId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.eventId === eventId
    );
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.ticketId++;
    const ticket: Ticket = {
      ...insertTicket,
      id,
      purchaseDate: new Date(),
      isUsed: false,
      usedDate: null,
      isForSale: false
    };
    this.tickets.set(id, ticket);
    
    // Update event ticket count
    const event = this.events.get(ticket.eventId);
    if (event) {
      this.events.set(event.id, {
        ...event,
        ticketsSold: event.ticketsSold + 1
      });
    }
    
    return ticket;
  }

  async updateTicket(id: number, ticketUpdate: Partial<Ticket>): Promise<Ticket | undefined> {
    const existingTicket = this.tickets.get(id);
    if (!existingTicket) return undefined;
    
    const updatedTicket = { ...existingTicket, ...ticketUpdate };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  // Marketplace operations
  async getMarketListings(): Promise<MarketListing[]> {
    return Array.from(this.marketListings.values());
  }

  async getMarketListing(id: number): Promise<MarketListing | undefined> {
    return this.marketListings.get(id);
  }

  async createMarketListing(insertListing: InsertMarketListing): Promise<MarketListing> {
    const id = this.marketListingId++;
    const listing: MarketListing = {
      ...insertListing,
      id,
      createdAt: new Date()
    };
    this.marketListings.set(id, listing);
    
    // Update ticket to mark as for sale
    const ticket = this.tickets.get(listing.ticketId);
    if (ticket) {
      this.tickets.set(ticket.id, {
        ...ticket,
        isForSale: true,
        salePrice: listing.price,
        saleType: listing.listingType
      });
    }
    
    return listing;
  }

  async updateMarketListing(id: number, listingUpdate: Partial<MarketListing>): Promise<MarketListing | undefined> {
    const existingListing = this.marketListings.get(id);
    if (!existingListing) return undefined;
    
    const updatedListing = { ...existingListing, ...listingUpdate };
    this.marketListings.set(id, updatedListing);
    return updatedListing;
  }

  async deleteMarketListing(id: number): Promise<boolean> {
    const listing = this.marketListings.get(id);
    if (!listing) return false;
    
    this.marketListings.delete(id);
    
    // Update ticket to mark as not for sale
    const ticket = this.tickets.get(listing.ticketId);
    if (ticket) {
      this.tickets.set(ticket.id, {
        ...ticket,
        isForSale: false,
        salePrice: null,
        saleType: null
      });
    }
    
    return true;
  }

  // Bid operations
  async getBidsByListing(listingId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      (bid) => bid.listingId === listingId
    );
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = this.bidId++;
    const bid: Bid = {
      ...insertBid,
      id,
      bidTime: new Date()
    };
    this.bids.set(id, bid);
    
    // Update listing with new current bid
    const listing = this.marketListings.get(bid.listingId);
    if (listing && (!listing.currentBid || bid.amount > listing.currentBid)) {
      this.marketListings.set(listing.id, {
        ...listing,
        currentBid: bid.amount,
        currentBidderId: bid.bidderId
      });
    }
    
    return bid;
  }

  // Initialize sample data for development
  private initializeData() {
    // Sample user
    const user1: User = {
      id: this.userId++,
      username: 'demo_user',
      password: 'password123',
      walletAddress: 'sol8fCH3KVQ5Xw6SEJ2bA3mjJ4JKK7Q1GZJbZMdRN3d7a'
    };
    this.users.set(user1.id, user1);

    // Sample events
    const event1: Event = {
      id: this.eventId++,
      title: "Solana Breakpoint Conference 2023",
      description: "The premier Solana developer conference with workshops, talks, and networking opportunities.",
      imageSrc: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14",
      location: "Singapore",
      date: new Date("2023-11-04T09:00:00"),
      category: "Conference",
      ticketPrice: 2.5,
      ticketsAvailable: 500,
      ticketsSold: 350,
      verified: true
    };

    const event2: Event = {
      id: this.eventId++,
      title: "EDM Summer Festival",
      description: "A high-energy electronic dance music festival featuring top DJs from around the world.",
      imageSrc: "https://images.unsplash.com/photo-1564585222527-c2777a5bc6cb",
      location: "Crypto Arena, Los Angeles",
      date: new Date("2023-07-15T18:00:00"),
      category: "Music",
      ticketPrice: 0.5,
      ticketsAvailable: 2000,
      ticketsSold: 1200,
      verified: true
    };

    const event3: Event = {
      id: this.eventId++,
      title: "Lakers vs. Warriors",
      description: "NBA regular season basketball game between the Los Angeles Lakers and Golden State Warriors.",
      imageSrc: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
      location: "Chase Center, San Francisco",
      date: new Date("2023-08-21T19:30:00"),
      category: "Sports",
      ticketPrice: 1.2,
      ticketsAvailable: 18000,
      ticketsSold: 12000,
      verified: true
    };

    const event4: Event = {
      id: this.eventId++,
      title: "Web3 Developer Summit",
      description: "A comprehensive conference for blockchain and web3 developers to learn the latest technologies.",
      imageSrc: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a",
      location: "Moscone Center, San Francisco",
      date: new Date("2023-09-05T09:00:00"),
      category: "Conference",
      ticketPrice: 2.5,
      ticketsAvailable: 1000,
      ticketsSold: 750,
      verified: true
    };

    this.events.set(event1.id, event1);
    this.events.set(event2.id, event2);
    this.events.set(event3.id, event3);
    this.events.set(event4.id, event4);

    // Sample tickets
    const ticket1: Ticket = {
      id: this.ticketId++,
      eventId: event1.id,
      userId: user1.id,
      seatNumber: "VIP-25",
      tokenId: "NFT#8723jf92a71c",
      qrCodeData: "solticket:event1:seat25:0x123abc",
      purchaseDate: new Date("2023-10-01"),
      isUsed: false,
      usedDate: null,
      isForSale: false,
      salePrice: null,
      saleType: null,
      auctionEndDate: null
    };

    const ticket2: Ticket = {
      id: this.ticketId++,
      eventId: event2.id,
      userId: user1.id,
      seatNumber: "GA-45",
      tokenId: "NFT#5243ab71f9c2",
      qrCodeData: "solticket:event2:seatA12:0xdef456",
      purchaseDate: new Date("2023-06-10"),
      isUsed: false,
      usedDate: null,
      isForSale: false,
      salePrice: null,
      saleType: null,
      auctionEndDate: null
    };

    this.tickets.set(ticket1.id, ticket1);
    this.tickets.set(ticket2.id, ticket2);

    // Sample marketplace listings
    const listing1: MarketListing = {
      id: this.marketListingId++,
      ticketId: this.ticketId++,
      sellerId: user1.id,
      price: 1.5,
      listingType: "fixed",
      createdAt: new Date(),
      endsAt: null,
      currentBid: null,
      currentBidderId: null
    };

    const listing2: MarketListing = {
      id: this.marketListingId++,
      ticketId: this.ticketId++,
      sellerId: user1.id,
      price: 2.8,
      listingType: "auction",
      createdAt: new Date(),
      endsAt: new Date(Date.now() + 86400000), // 24 hours from now
      currentBid: 2.8,
      currentBidderId: 2
    };

    const listing3: MarketListing = {
      id: this.marketListingId++,
      ticketId: this.ticketId++,
      sellerId: user1.id,
      price: 0.6,
      listingType: "fixed",
      createdAt: new Date(),
      endsAt: null,
      currentBid: null,
      currentBidderId: null
    };

    this.marketListings.set(listing1.id, listing1);
    this.marketListings.set(listing2.id, listing2);
    this.marketListings.set(listing3.id, listing3);
  }
}

export const storage = new MemStorage();
