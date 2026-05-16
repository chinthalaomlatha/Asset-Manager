import React from "react";
import { Link, useLocation } from "wouter";
import { Activity, ShieldAlert, Clock, FileText, Settings, LogOut, Shield, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const logoutMutation = useLogout();
  const { toggleSidebar } = useSidebar();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        logout();
      }
    });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/scanner", label: "Scanner", icon: ShieldAlert },
    { href: "/history", label: "Scan History", icon: Clock },
    { href: "/reports", label: "Reports", icon: FileText },
    ...(user?.role === 'admin' ? [{ href: "/admin", label: "Admin Panel", icon: Users }] : []),
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary selection:text-primary-foreground">
      <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border bg-card">
        <SidebarHeader className="border-b border-border/50 py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary/20 text-primary flex items-center justify-center rounded border border-primary/50 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
              <Shield className="h-5 w-5" />
            </div>
            <span className="font-mono font-bold tracking-wider text-primary truncate">CYBER_SCOUT</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="py-4">
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                    <Link href={item.href} className="font-mono text-sm">
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-border/50 p-4">
          <div className="mb-4 px-2 hidden group-data-[collapsible=icon]:block">
             <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-mono text-xs text-primary border border-primary/30">
               {user?.username.substring(0, 2).toUpperCase()}
             </div>
          </div>
          <div className="mb-4 px-2 group-data-[collapsible=icon]:hidden">
            <p className="font-mono text-xs text-muted-foreground mb-1">LOGGED IN AS</p>
            <p className="font-mono text-sm font-bold text-primary truncate">{user?.username}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary border border-primary/30">
                {user?.role.toUpperCase()}
              </span>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10 font-mono text-sm">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Disconnect</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-0">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
        {/* CRT Scanline overlay effect */}
        <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
      </main>
    </div>
  );
}
