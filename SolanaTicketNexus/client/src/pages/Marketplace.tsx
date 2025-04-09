import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import MarketplaceCard from '../components/marketplace/MarketplaceCard';
import { MarketListing } from '../lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [saleTypeFilter, setSaleTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('priceLow');

  // Fetch marketplace listings from the API
  const { data: listings, isLoading, error, refetch } = useQuery<MarketListing[]>({
    queryKey: ['/api/marketplace'],
  });

  // Filter listings based on search term and filters
  const filteredListings = listings?.filter(listing => {
    // Search term filter
    const matchesSearch = listing.event?.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           listing.event?.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || (listing.event?.category === categoryFilter);
    
    // Sale type filter
    const matchesSaleType = saleTypeFilter === 'all' || listing.listingType === saleTypeFilter;
    
    return matchesSearch && matchesCategory && matchesSaleType;
  });

  // Sort listings
  const sortedListings = filteredListings?.slice().sort((a, b) => {
    switch (sortOrder) {
      case 'priceLow':
        return a.price - b.price;
      case 'priceHigh':
        return b.price - a.price;
      case 'endingSoon':
        if (!a.endsAt && !b.endsAt) return 0;
        if (!a.endsAt) return 1;
        if (!b.endsAt) return -1;
        return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const handlePurchaseComplete = () => {
    refetch();
  };

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
            <Link href="/my-tickets">
              <button className="py-4 px-1 border-b-2 border-transparent font-medium text-gray-400 hover:text-white">
                My Tickets
              </button>
            </Link>
            <button className="py-4 px-1 border-b-2 border-primary font-medium text-primary">
              Resale Marketplace
            </button>
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
          <h1 className="text-3xl font-bold mb-2">Resale Marketplace</h1>
          <p className="text-gray-400">Buy and sell NFT tickets at fixed prices or auctions</p>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center bg-dark-light rounded-lg p-2 w-full md:w-auto">
            <span className="material-icons text-gray-400 mx-2">search</span>
            <Input 
              type="text" 
              placeholder="Search marketplace..." 
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
            
            <Select defaultValue="all" onValueChange={(value) => setSaleTypeFilter(value)}>
              <SelectTrigger className="bg-dark-light text-white border border-dark-lighter rounded-lg">
                <SelectValue placeholder="All Sale Types" />
              </SelectTrigger>
              <SelectContent className="bg-dark-light border border-dark-lighter text-white">
                <SelectItem value="all">All Sale Types</SelectItem>
                <SelectItem value="fixed">Fixed Price</SelectItem>
                <SelectItem value="auction">Auction</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="priceLow" onValueChange={(value) => setSortOrder(value)}>
              <SelectTrigger className="bg-dark-light text-white border border-dark-lighter rounded-lg">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-dark-light border border-dark-lighter text-white">
                <SelectItem value="priceLow">Price: Low to High</SelectItem>
                <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                <SelectItem value="endingSoon">Ending Soon</SelectItem>
                <SelectItem value="recent">Recently Listed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Marketplace Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Loading marketplace listings...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">Error loading marketplace</div>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : sortedListings && sortedListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedListings.map(listing => (
              <MarketplaceCard 
                key={listing.id} 
                listing={listing} 
                onPurchaseComplete={handlePurchaseComplete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-dark-lighter rounded-xl">
            <div className="text-4xl mb-4">🎟️</div>
            <h3 className="text-xl font-bold mb-2">No listings found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setSaleTypeFilter('all');
                setSortOrder('priceLow');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {sortedListings && sortedListings.length > 0 && (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Load More Listings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
