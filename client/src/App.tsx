import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import Compress from "@/pages/compress";
import Convert from "@/pages/convert";
import Resize from "@/pages/resize";
import BackgroundRemover from "@/pages/background-remover";
import Rotate from "@/pages/rotate";
import Watermark from "@/pages/watermark";
import Info from "@/pages/info";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/compress" component={Compress} />
      <Route path="/convert" component={Convert} />
      <Route path="/resize" component={Resize} />
      <Route path="/background-remover" component={BackgroundRemover} />
      <Route path="/rotate" component={Rotate} />
      <Route path="/watermark" component={Watermark} />
      <Route path="/info" component={Info} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
