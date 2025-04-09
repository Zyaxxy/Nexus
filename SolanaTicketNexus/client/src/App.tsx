import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Events from "./pages/Events";
import MyTickets from "./pages/MyTickets";
import Marketplace from "./pages/Marketplace";
import TicketScanner from "./pages/TicketScanner";
import EventDetails from "./pages/EventDetails";
import TicketPurchase from "./pages/TicketPurchase";
import NotFound from "@/pages/not-found";

function App() {
  const [location] = useLocation();
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={Events} />
            <Route path="/events" component={Events} />
            <Route path="/events/:id" component={EventDetails} />
            <Route path="/events/:id/purchase" component={TicketPurchase} />
            <Route path="/my-tickets" component={MyTickets} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/scanner" component={TicketScanner} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
