import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

import {
  insertUserSchema,
  insertTicketSchema,
  insertMarketListingSchema,
  insertBidSchema,
  InsertTicket
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Error handling middleware
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const formattedError = fromZodError(err);
      return res.status(400).json({ error: formattedError.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  };

  // Events endpoints
  apiRouter.get("/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (err) {
      console.error("Error fetching events:", err);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  apiRouter.get("/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.json(event);
    } catch (err) {
      console.error("Error fetching event:", err);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // Tickets endpoints
  apiRouter.get("/tickets/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const tickets = await storage.getTicketsByUser(userId);
      
      // Expand event data for each ticket
      const ticketsWithEvents = await Promise.all(
        tickets.map(async (ticket) => {
          const event = await storage.getEvent(ticket.eventId);
          return { ...ticket, event };
        })
      );
      
      res.json(ticketsWithEvents);
    } catch (err) {
      console.error("Error fetching user tickets:", err);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  apiRouter.post("/tickets/purchase", async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      
      // Check if the event exists
      const event = await storage.getEvent(ticketData.eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Check if tickets are available
      if (event.ticketsSold !== undefined && event.ticketsAvailable !== undefined && 
          event.ticketsSold >= event.ticketsAvailable) {
        return res.status(400).json({ error: "No tickets available for this event" });
      }
      
      // Check maximum purchase limit (5 tickets per user per event)
      const userTickets = await storage.getTicketsByUser(ticketData.userId);
      const userTicketsForEvent = userTickets.filter(t => t.eventId === ticketData.eventId);
      
      if (userTicketsForEvent.length >= 5) {
        return res.status(400).json({ 
          error: "Maximum ticket purchase limit reached (5 tickets per event)"
        });
      }
      
      // Generate random token ID and QR code data
      const tokenId = `NFT#${Math.random().toString(36).substring(2, 10)}`;
      const qrCodeData = `solticket:${event.id}:${ticketData.seatNumber}:${Math.random().toString(36).substring(2, 10)}`;
      
      const ticketToInsert: InsertTicket = {
        ...ticketData,
        tokenId,
        qrCodeData
      };
      
      const ticket = await storage.createTicket(ticketToInsert);
      res.status(201).json(ticket);
    } catch (err) {
      console.error("Error purchasing ticket:", err);
      handleZodError(err, res);
    }
  });

  apiRouter.patch("/tickets/:id/use", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      if (ticket.isUsed) {
        return res.status(400).json({ 
          error: "Ticket has already been used", 
          usedDate: ticket.usedDate
        });
      }
      
      const updatedTicket = await storage.updateTicket(ticketId, {
        isUsed: true,
        usedDate: new Date()
      });
      
      res.json(updatedTicket);
    } catch (err) {
      console.error("Error using ticket:", err);
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });

  apiRouter.get("/tickets/verify/:qrCode", async (req, res) => {
    try {
      const qrCode = req.params.qrCode;
      const tickets = await storage.getTickets();
      const ticket = tickets.find(t => t.qrCodeData === qrCode);
      
      if (!ticket) {
        return res.status(404).json({ error: "Invalid ticket QR code" });
      }
      
      // Get event data
      const event = await storage.getEvent(ticket.eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.json({
        ticket,
        event,
        valid: !ticket.isUsed,
        usedDate: ticket.usedDate
      });
    } catch (err) {
      console.error("Error verifying ticket:", err);
      res.status(500).json({ error: "Failed to verify ticket" });
    }
  });

  // Marketplace endpoints
  apiRouter.get("/marketplace", async (req, res) => {
    try {
      const listings = await storage.getMarketListings();
      
      // Expand ticket and event data for each listing
      const expandedListings = await Promise.all(
        listings.map(async (listing) => {
          const ticket = await storage.getTicket(listing.ticketId);
          const event = ticket ? await storage.getEvent(ticket.eventId) : null;
          const seller = await storage.getUser(listing.sellerId);
          
          return {
            ...listing,
            ticket,
            event,
            seller: seller ? {
              id: seller.id,
              username: seller.username,
              walletAddress: seller.walletAddress
            } : null
          };
        })
      );
      
      res.json(expandedListings);
    } catch (err) {
      console.error("Error fetching marketplace listings:", err);
      res.status(500).json({ error: "Failed to fetch marketplace listings" });
    }
  });

  apiRouter.post("/marketplace/list", async (req, res) => {
    try {
      const listingData = insertMarketListingSchema.parse(req.body);
      
      // Check if the ticket exists
      const ticket = await storage.getTicket(listingData.ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      // Check if the ticket is already listed
      if (ticket.isForSale) {
        return res.status(400).json({ error: "Ticket is already listed for sale" });
      }
      
      // Check if the user owns the ticket
      if (ticket.userId !== listingData.sellerId) {
        return res.status(403).json({ error: "You don't own this ticket" });
      }
      
      // Create the listing
      const listing = await storage.createMarketListing(listingData);
      res.status(201).json(listing);
    } catch (err) {
      console.error("Error creating listing:", err);
      handleZodError(err, res);
    }
  });

  apiRouter.post("/marketplace/bid", async (req, res) => {
    try {
      const bidData = insertBidSchema.parse(req.body);
      
      // Check if the listing exists
      const listing = await storage.getMarketListing(bidData.listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Check if the listing is an auction
      if (listing.listingType !== "auction") {
        return res.status(400).json({ error: "This listing is not an auction" });
      }
      
      // Check if the auction has ended
      if (listing.endsAt && new Date(listing.endsAt) < new Date()) {
        return res.status(400).json({ error: "Auction has ended" });
      }
      
      // Check if bid is higher than current bid
      if (listing.currentBid && bidData.amount <= listing.currentBid) {
        return res.status(400).json({ 
          error: "Bid must be higher than current bid",
          currentBid: listing.currentBid
        });
      }
      
      // Process the bid
      const bid = await storage.createBid(bidData);
      res.status(201).json(bid);
    } catch (err) {
      console.error("Error creating bid:", err);
      handleZodError(err, res);
    }
  });

  apiRouter.post("/marketplace/buy/:listingId", async (req, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      const { buyerId } = req.body;
      
      if (!buyerId) {
        return res.status(400).json({ error: "Buyer ID is required" });
      }
      
      // Check if the listing exists
      const listing = await storage.getMarketListing(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Check if the listing is fixed price
      if (listing.listingType !== "fixed") {
        return res.status(400).json({ error: "This listing is not a fixed price sale" });
      }
      
      // Get the ticket
      const ticket = await storage.getTicket(listing.ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      // Update ticket ownership
      const updatedTicket = await storage.updateTicket(ticket.id, {
        userId: buyerId,
        isForSale: false,
        salePrice: null,
        saleType: null
      });
      
      // Remove the listing
      await storage.deleteMarketListing(listingId);
      
      res.json({ 
        message: "Purchase successful", 
        ticket: updatedTicket 
      });
    } catch (err) {
      console.error("Error buying ticket:", err);
      res.status(500).json({ error: "Failed to process purchase" });
    }
  });
  
  // Wallet endpoints (mock)
  apiRouter.post("/wallet/connect", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }
      
      // Check if user exists with this wallet
      let user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        // Create a new user for this wallet
        user = await storage.createUser({
          username: `user_${Math.random().toString(36).substring(2, 10)}`,
          password: Math.random().toString(36).substring(2, 15),
          walletAddress
        });
      }
      
      res.json({
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress
        }
      });
    } catch (err) {
      console.error("Error connecting wallet:", err);
      res.status(500).json({ error: "Failed to connect wallet" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
