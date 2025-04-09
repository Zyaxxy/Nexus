import { Link } from 'wouter';

const Footer = () => {
  return (
    <footer className="bg-dark-light border-t border-dark-lighter py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L17.5 7 12 9.5 6.5 7 12 4.5zM4 8.5l7 3.5v7l-7-3.5v-7zm9 10.5v-7l7-3.5v7l-7 3.5z" />
              </svg>
              <span className="ml-2 text-xl font-semibold text-white">SolTickets</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">The decentralized ticketing platform on Solana where tickets are NFTs and resales are fair for everyone.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="material-icons">discord</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="material-icons">telegram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="material-icons">twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="material-icons">github</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/events" className="text-gray-400 hover:text-white">Events</Link></li>
              <li><Link href="/marketplace" className="text-gray-400 hover:text-white">Marketplace</Link></li>
              <li><Link href="/my-tickets" className="text-gray-400 hover:text-white">My Tickets</Link></li>
              <li><Link href="/scanner" className="text-gray-400 hover:text-white">Ticket Scanner</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Stay up to date with the latest events and platform updates</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-dark rounded-l-lg px-4 py-2 w-full border border-dark-lighter focus:outline-none focus:border-primary" 
              />
              <button className="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-r-lg">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-dark-lighter mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} SolTickets. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 text-sm hover:text-white">Terms of Service</a>
            <a href="#" className="text-gray-400 text-sm hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-400 text-sm hover:text-white">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
