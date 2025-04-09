import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import WalletButton from '../wallet/WalletButton';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path ? 'text-white' : 'text-white hover:text-secondary';
  };

  return (
    <nav className="bg-dark-light border-b border-dark-lighter sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L17.5 7 12 9.5 6.5 7 12 4.5zM4 8.5l7 3.5v7l-7-3.5v-7zm9 10.5v-7l7-3.5v7l-7 3.5z" />
              </svg>
              <span className="ml-2 text-xl font-semibold text-white">SolTickets</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/events" className={`px-3 py-2 text-sm font-medium ${isActive('/events')}`}>
              Events
            </Link>
            <Link href="/marketplace" className={`px-3 py-2 text-sm font-medium ${isActive('/marketplace')}`}>
              Marketplace
            </Link>
            <Link href="/my-tickets" className={`px-3 py-2 text-sm font-medium ${isActive('/my-tickets')}`}>
              My Tickets
            </Link>
            <Link href="/scanner" className={`px-3 py-2 text-sm font-medium ${isActive('/scanner')}`}>
              Scanner
            </Link>
            <WalletButton />
          </div>
          
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-white"
            >
              <span className="material-icons">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-dark-lighter">
          <Link 
            href="/events" 
            className="block px-3 py-2 text-base font-medium text-white hover:text-secondary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Events
          </Link>
          <Link 
            href="/marketplace" 
            className="block px-3 py-2 text-base font-medium text-white hover:text-secondary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Marketplace
          </Link>
          <Link 
            href="/my-tickets" 
            className="block px-3 py-2 text-base font-medium text-white hover:text-secondary"
            onClick={() => setMobileMenuOpen(false)}
          >
            My Tickets
          </Link>
          <Link 
            href="/scanner" 
            className="block px-3 py-2 text-base font-medium text-white hover:text-secondary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Scanner
          </Link>
          <div className="px-3 py-2">
            <WalletButton fullWidth />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
