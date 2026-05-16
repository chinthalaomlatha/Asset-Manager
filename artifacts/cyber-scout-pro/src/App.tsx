import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Shell } from "@/components/layout/shell";

import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Scanner from "@/pages/scanner";
import History from "@/pages/history";
import Reports from "@/pages/reports";
import Admin from "@/pages/admin";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;
  
  return (
    <Shell>
      <Component {...rest} />
    </Shell>
  );
}

function PublicRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (user) return <Redirect to="/dashboard" />;
  
  return <Component {...rest} />;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/">
        {() => {
          const { user, isLoading } = useAuth();
          if (isLoading) return null;
          return user ? <Redirect to="/dashboard" /> : <Redirect to="/login" />;
        }}
      </Route>
      <Route path="/login">{() => <PublicRoute component={Login} />}</Route>
      <Route path="/register">{() => <PublicRoute component={Register} />}</Route>
      
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/scanner">{() => <ProtectedRoute component={Scanner} />}</Route>
      <Route path="/history">{() => <ProtectedRoute component={History} />}</Route>
      <Route path="/reports">{() => <ProtectedRoute component={Reports} />}</Route>
      <Route path="/admin">{() => <ProtectedRoute component={Admin} />}</Route>
      <Route path="/settings">{() => <ProtectedRoute component={Settings} />}</Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <SidebarProvider>
              <AppRouter />
            </SidebarProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
