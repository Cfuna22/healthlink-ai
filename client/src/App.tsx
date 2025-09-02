import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Symptoms from "@/pages/symptoms";
import Chat from "@/pages/chat";
import Clinics from "@/pages/clinics";
import Logs from "@/pages/logs";
import Nutrition from "@/pages/nutrition";
import MentalHealth from "@/pages/mental-health";
import Fitness from "@/pages/fitness";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/symptoms" component={Symptoms} />
          <Route path="/chat" component={Chat} />
          <Route path="/clinics" component={Clinics} />
          <Route path="/logs" component={Logs} />
          <Route path="/nutrition" component={Nutrition} />
          <Route path="/mental-health" component={MentalHealth} />
          <Route path="/fitness" component={Fitness} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
