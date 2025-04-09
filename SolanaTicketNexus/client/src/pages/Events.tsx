import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import EventCard from '../components/events/EventCard';
import { Event, formatEventDate } from '../lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('upcoming');

  // Fetch events from the API
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // Filter events based on search term and filters
  const filteredEvents = events?.filter(event => {
    // Search term filter
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    // Time filter (simplified)
    const now = new Date();
    const eventDate = new Date(event.date);
    
    const matchesTime = timeFilter === 'upcoming' ? eventDate >= now : true;
    
    return matchesSearch && matchesCategory && matchesTime;
  });

  // Get featured event (first event with highest ticket price)
  const featuredEvent = events?.sort((a, b) => b.ticketPrice - a.ticketPrice)[0];

  return (
    <div>
      {/* Tab navigation */}
      <div className="bg-dark-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button className="py-4 px-1 border-b-2 border-primary font-medium text-primary">
              Featured Events
            </button>
            <Link href="/my-tickets">
              <button className="py-4 px-1 border-b-2 border-transparent font-medium text-gray-400 hover:text-white">
                My Tickets
              </button>
            </Link>
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
          <h1 className="text-3xl font-bold mb-2">Featured Events</h1>
          <p className="text-gray-400">Discover and buy tickets to amazing events</p>
        </div>

        {/* Featured Event Banner */}
        {featuredEvent && (
          <div 
            className="rounded-xl overflow-hidden mb-8 relative event-card h-80 md:h-96 bg-cover bg-center"
            style={{ backgroundImage: `url(${featuredEvent.imageSrc})` }}
          >
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-black/70 to-black/40">
              <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium w-max mb-4">Limited NFT tickets</div>
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{featuredEvent.title}</h2>
              <div className="flex items-center mb-4">
                <span className="material-icons text-sm mr-1">calendar_today</span>
                <span className="text-sm mr-4">{formatEventDate(featuredEvent.date)}</span>
                <span className="material-icons text-sm mr-1">location_on</span>
                <span className="text-sm">{featuredEvent.location}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/events/${featuredEvent.id}`}>
                  <Button className="bg-secondary hover:bg-secondary-dark text-dark font-medium px-6 py-2 rounded-lg transition-colors">
                    Buy Tickets
                  </Button>
                </Link>
                <Link href={`/events/${featuredEvent.id}`}>
                  <Button variant="outline" className="bg-dark-lighter hover:bg-dark-light border border-gray-600 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center bg-dark-light rounded-lg p-2 w-full md:w-auto">
            <span className="material-icons text-gray-400 mx-2">search</span>
            <Input 
              type="text" 
              placeholder="Search events..." 
              className="bg-transparent border-none outline-none text-white placeholder-gray-400 w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select defaultValue="all" onValueChange={(value) => setCategoryFilter(value)}>
              <SelectTrigger className="bg-dark-light text-white border border-dark-lighter rounded-lg">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-dark-light border border-dark-lighter text-white">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Conference">Conferences</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="upcoming" onValueChange={(value) => setTimeFilter(value)}>
              <SelectTrigger className="bg-dark-light text-white border border-dark-lighter rounded-lg">
                <SelectValue placeholder="Upcoming" />
              </SelectTrigger>
              <SelectContent className="bg-dark-light border border-dark-lighter text-white">
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="nextMonth">Next Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Event Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Loading events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">Error loading events</div>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : filteredEvents && filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-dark-lighter rounded-xl">
            <div className="text-4xl mb-4">🎟️</div>
            <h3 className="text-xl font-bold mb-2">No events found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setTimeFilter('upcoming');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {filteredEvents && filteredEvents.length > 0 && (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Load More Events
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
