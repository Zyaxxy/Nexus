import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface ScannerProps {
  onScanSuccess: (qrCode: string) => void;
}

const Scanner = ({ onScanSuccess }: ScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        
        // In a real implementation, we would use a QR code scanning library
        // For this mockup, we'll simulate a successful scan after a delay
        setTimeout(() => {
          // Simulating detection of a QR code
          const mockQrCode = "solticket:event1:seat25:0x123abc";
          onScanSuccess(mockQrCode);
          stopScanner();
        }, 3000);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Access Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, we would process the image file to extract QR code
      // For this mockup, we'll simulate a successful scan
      toast({
        title: "Processing QR Code",
        description: "Reading QR code from image..."
      });
      
      // Simulate processing delay
      setTimeout(() => {
        // Simulating detection of a QR code
        const mockQrCode = "solticket:event1:seat25:0x123abc";
        onScanSuccess(mockQrCode);
      }, 1500);
    }
  };

  return (
    <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter">
      <h2 className="text-xl font-semibold mb-4">Scan Ticket QR Code</h2>
      
      {/* Scanner View */}
      <div className="bg-dark rounded-lg overflow-hidden relative aspect-video flex items-center justify-center mb-4">
        {scanning ? (
          <>
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-secondary/50"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-secondary"></div>
          </>
        ) : (
          <div className="text-center p-8">
            <div className="mb-4">
              <span className="material-icons text-6xl text-gray-600 mb-2">qr_code_scanner</span>
              <p className="text-gray-400">Camera access required to scan tickets</p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
              onClick={startScanner}
            >
              Start Scanner
            </Button>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Point your camera at the ticket's QR code to verify ticket authenticity and check in the attendee.
      </p>
      
      <div className="flex flex-wrap gap-2">
        <button 
          className="flex-1 bg-dark-lighter hover:bg-dark-light text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
          onClick={() => toast({
            title: "Flash Toggled",
            description: "Flash functionality would be enabled in production"
          })}
        >
          <span className="material-icons mr-1 text-sm">flash_on</span>
          Toggle Flash
        </button>
        <label className="flex-1 bg-dark-lighter hover:bg-dark-light text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center cursor-pointer">
          <span className="material-icons mr-1 text-sm">qr_code</span>
          Upload QR
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload}
          />
        </label>
      </div>
    </div>
  );
};

export default Scanner;
