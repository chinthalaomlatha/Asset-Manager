import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, User, Mail, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-mono font-bold tracking-widest text-primary flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          SYSTEM_PREFERENCES
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">Configure operator profile and interface parameters.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-card/50 backdrop-blur rounded-none relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <CardHeader>
            <CardTitle className="font-mono text-sm tracking-wider text-muted-foreground">OPERATOR_PROFILE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-none shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-mono text-xl font-bold text-foreground">{user?.username}</h3>
                <p className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 inline-block border border-primary/30">
                  CLEARANCE: {user?.role.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="grid gap-1">
                <label className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3" /> IDENTIFIER
                </label>
                <div className="font-mono text-sm bg-background/50 border border-border/50 p-2 text-foreground">
                  {user?.email}
                </div>
              </div>
              
              <div className="grid gap-1">
                <label className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                  <Shield className="h-3 w-3" /> ENLISTMENT_DATE
                </label>
                <div className="font-mono text-sm bg-background/50 border border-border/50 p-2 text-foreground">
                  {user?.createdAt ? format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss 'UTC'") : 'UNKNOWN'}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/50 backdrop-blur rounded-none relative opacity-70">
           <CardHeader>
            <CardTitle className="font-mono text-sm tracking-wider text-muted-foreground">AUTHENTICATION</CardTitle>
            <CardDescription className="font-mono text-xs">Module currently locked.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button variant="outline" className="w-full font-mono rounded-none border-primary/30 text-primary hover:bg-primary/10 justify-start" disabled>
               <Key className="mr-2 h-4 w-4" />
               ROTATE_PASSPHRASE
             </Button>
             <p className="font-mono text-xs text-muted-foreground mt-4 border-l-2 border-primary/30 pl-3 py-1">
               Contact system administrator to request credential rotation.
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
