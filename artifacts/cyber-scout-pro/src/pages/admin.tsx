import { useAdminListUsers, useAdminUpdateUser, useAdminDeleteUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2, ShieldAlert, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-mono font-bold tracking-widest text-destructive mb-2">ACCESS_DENIED</h1>
        <p className="font-mono text-sm text-muted-foreground">Clearance level insufficient for this sector.</p>
      </div>
    );
  }

  return <AdminPanel />;
}

function AdminPanel() {
  const { data: users, isLoading } = useAdminListUsers();
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const handleRoleChange = (id: number, newRole: "admin" | "user") => {
    updateUser.mutate({ id, data: { role: newRole } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({ title: "Operator Updated", description: "Clearance level modified." });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (id === currentUser?.id) {
      toast({ title: "Error", description: "Cannot terminate own session.", variant: "destructive" });
      return;
    }
    
    if (confirm("Permanently terminate this operator profile?")) {
      deleteUser.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
          toast({ title: "Operator Terminated", description: "Profile expunged from system." });
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-mono font-bold tracking-widest text-primary flex items-center gap-2">
          <Shield className="h-6 w-6" />
          COMMAND_CENTER
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">Operator management and system administration.</p>
      </div>

      <Card className="border-primary/20 bg-card/50 backdrop-blur rounded-none relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background/50">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-mono text-xs text-muted-foreground">ID</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">CALLSIGN</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">IDENTIFIER</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">REGISTERED</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">CLEARANCE</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-mono text-sm">
                      LOADING_OPERATOR_DATA...
                    </TableCell>
                  </TableRow>
                ) : users && users.length > 0 ? (
                  users.map((u) => (
                    <TableRow key={u.id} className="border-border/50 hover:bg-muted/30">
                      <TableCell className="font-mono text-xs text-muted-foreground">OP-{u.id.toString().padStart(3, '0')}</TableCell>
                      <TableCell className="font-mono text-sm font-bold text-foreground">
                        {u.username}
                        {u.id === currentUser?.id && <Badge variant="outline" className="ml-2 rounded-none border-primary/50 text-primary text-[8px] bg-primary/10">YOU</Badge>}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {format(new Date(u.createdAt), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={u.role} 
                          onValueChange={(val: any) => handleRoleChange(u.id, val)}
                          disabled={u.id === currentUser?.id || updateUser.isPending}
                        >
                          <SelectTrigger className={`h-7 w-[100px] font-mono text-xs rounded-none bg-transparent ${u.role === 'admin' ? 'border-orange-500/50 text-orange-500' : 'border-primary/50 text-primary'}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-primary/30 rounded-none">
                            <SelectItem value="user" className="font-mono text-xs rounded-none focus:bg-primary/20">USER</SelectItem>
                            <SelectItem value="admin" className="font-mono text-xs rounded-none focus:bg-orange-500/20 text-orange-500">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none"
                          onClick={() => handleDelete(u.id)}
                          disabled={u.id === currentUser?.id || deleteUser.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
