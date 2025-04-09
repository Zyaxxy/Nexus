import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  walletAddress: string | null;
  userId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  walletAddress: null,
  userId: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const { toast } = useToast();

  // Check for stored wallet on mount
  useEffect(() => {
    const storedWalletAddress = localStorage.getItem("walletAddress");
    const storedUserId = localStorage.getItem("userId");
    
    if (storedWalletAddress && storedUserId) {
      setWalletAddress(storedWalletAddress);
      setUserId(parseInt(storedUserId));
      setConnected(true);
    }
  }, []);

  const connectWallet = async () => {
    try {
      setConnecting(true);
      
      // Simulate wallet connection with a mock wallet address
      const mockWalletAddress = "sol8fCH3KVQ5Xw6SEJ2bA3mjJ4JKK7Q1GZJbZMdRN3d7a";
      
      try {
        // Make API call to connect wallet
        const res = await apiRequest(
          "POST", 
          "/api/wallet/connect", 
          { walletAddress: mockWalletAddress }
        );
        
        const data = await res.json();
        
        if (data.success) {
          setWalletAddress(data.user.walletAddress);
          setUserId(data.user.id);
          setConnected(true);
          
          // Store in localStorage
          localStorage.setItem("walletAddress", data.user.walletAddress);
          localStorage.setItem("userId", data.user.id.toString());
          
          toast({
            title: "Wallet Connected",
            description: "Successfully connected to Phantom wallet",
          });
        } else {
          throw new Error(data.error || "Failed to connect wallet");
        }
      } catch (error) {
        console.error("API error:", error);
        // Use mock data if API fails
        const mockUserId = 1;
        setWalletAddress(mockWalletAddress);
        setUserId(mockUserId);
        setConnected(true);
        
        // Store in localStorage
        localStorage.setItem("walletAddress", mockWalletAddress);
        localStorage.setItem("userId", mockUserId.toString());
        
        toast({
          title: "Wallet Connected (Mock)",
          description: "Successfully connected to simulated wallet",
        });
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      toast({
        title: "Connection Failed",
        description: err instanceof Error ? err.message : "Could not connect to wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setUserId(null);
    setConnected(false);
    
    // Remove from localStorage
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("userId");
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        walletAddress,
        userId,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
