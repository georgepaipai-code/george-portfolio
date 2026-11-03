import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Professional from "@/pages/Professional";
import Personal from "@/pages/Personal";
import Travel from "@/pages/Travel";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import EventSubmit from "@/pages/EventSubmit";
import Admin from "@/pages/Admin";
const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/professional" component={Professional} />
      <Route path="/personal" component={Personal} />
      <Route path="/travel" component={Travel} />
      <Route path="/events" component={Events} />
      <Route path="/events/submit" component={EventSubmit} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
