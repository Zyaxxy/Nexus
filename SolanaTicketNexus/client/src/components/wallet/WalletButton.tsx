import { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { formatWalletAddress } from '../../lib/mock-data';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface WalletButtonProps {
  fullWidth?: boolean;
}

const WalletButton = ({ fullWidth = false }: WalletButtonProps) => {
  const { connected, connecting, walletAddress, connectWallet, disconnectWallet } = useWallet();
  
  const handleConnect = async () => {
    await connectWallet();
  };
  
  const handleDisconnect = () => {
    disconnectWallet();
  };
  
  return connected ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="default" 
          className={`bg-primary hover:bg-primary-dark text-white font-medium transition-colors flex items-center ${fullWidth ? 'w-full' : ''}`}
        >
          <span>{formatWalletAddress(walletAddress || '')}</span>
          <span className="material-icons ml-2">account_balance_wallet</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-dark-light border border-dark-lighter">
        <DropdownMenuItem 
          className="text-white hover:bg-dark-lighter cursor-pointer"
          onClick={() => window.open(`https://explorer.solana.com/address/${walletAddress}`, '_blank')}
        >
          <span className="material-icons mr-2 text-sm">open_in_new</span>
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-white hover:bg-dark-lighter cursor-pointer"
          onClick={handleDisconnect}
        >
          <span className="material-icons mr-2 text-sm">logout</span>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button 
      variant="default" 
      className={`bg-primary hover:bg-primary-dark text-white font-medium transition-colors flex items-center ${fullWidth ? 'w-full' : ''}`}
      onClick={handleConnect}
      disabled={connecting}
    >
      <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
      <span className="material-icons ml-2">account_balance_wallet</span>
    </Button>
  );
};

export default WalletButton;
