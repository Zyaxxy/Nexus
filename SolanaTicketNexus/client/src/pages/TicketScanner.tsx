import { useState } from 'react';
import { Link } from 'wouter';
import Scanner from '../components/scanner/Scanner';
import TicketInfo from '../components/scanner/TicketInfo';
import { useWallet } from '../context/WalletContext';

const TicketScanner = () => {
  const { connected } = useWallet();
  const [scannedQRCode, setScannedQRCode] = useState<string | null>(null);

  const handleScanSuccess = (qrCode: string) => {
    setScannedQRCode(qrCode);
  };

  const handleReset = () => {
    setScannedQRCode(null);
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
            <Link href="/marketplace">
              <button className="py-4 px-1 border-b-2 border-transparent font-medium text-gray-400 hover:text-white">
                Resale Marketplace
              </button>
            </Link>
            <button className="py-4 px-1 border-b-2 border-primary font-medium text-primary">
              Ticket Scanner
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ticket Scanner</h1>
          <p className="text-gray-400">Scan QR codes to verify and validate NFT tickets</p>
        </div>

        {/* Scanner UI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Scanner onScanSuccess={handleScanSuccess} />
          <TicketInfo qrCode={scannedQRCode} onReset={handleReset} />
        </div>

        {/* Instructions Panel */}
        <div className="mt-8 bg-dark-light rounded-xl p-6 border border-dark-lighter">
          <div className="flex items-start mb-4">
            <span className="material-icons text-primary mr-3 text-xl">info</span>
            <div>
              <h3 className="text-lg font-medium mb-2">How to Use the Scanner</h3>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Click "Start Scanner" to activate your device's camera</li>
                <li>Point the camera at the ticket's QR code</li>
                <li>The system will automatically verify the ticket's authenticity</li>
                <li>For valid tickets, you can check in the attendee with a single click</li>
                <li>For already used tickets, you'll see when they were first used</li>
                <li>If needed, you can override and allow entry for previously used tickets</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="material-icons text-secondary mr-3 text-xl">security</span>
            <div>
              <h3 className="text-lg font-medium mb-2">Security Features</h3>
              <p className="text-gray-400 mb-3">Each QR code contains a unique cryptographic signature linked to the NFT on the Solana blockchain.</p>
              <p className="text-gray-400">Once a ticket is scanned and used, its status is updated on-chain to prevent reuse.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketScanner;
