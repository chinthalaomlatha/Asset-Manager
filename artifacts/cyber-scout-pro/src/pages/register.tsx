import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, TerminalSquare } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function Register() {
  const registerMutation = useRegister();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.token, res.user);
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-5">
        <Shield className="w-[120vh] h-[120vh] text-primary" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-primary/20 text-primary flex items-center justify-center rounded-lg border border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-mono font-bold tracking-widest text-primary">CYBER_SCOUT</h1>
          <p className="text-muted-foreground font-mono text-sm mt-2 flex items-center">
            <TerminalSquare className="w-4 h-4 mr-2" />
            NEW OPERATOR REGISTRATION
          </p>
        </div>

        <div className="bg-card border border-primary/30 p-8 rounded-lg shadow-2xl relative">
          {/* Cyberpunk corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary -translate-x-[1px] -translate-y-[1px]"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary translate-x-[1px] -translate-y-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary -translate-x-[1px] translate-y-[1px]"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary translate-x-[1px] translate-y-[1px]"></div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {registerMutation.isError && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded font-mono text-sm">
                  ERROR: Registration failed. Email may be in use.
                </div>
              )}
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs tracking-wider text-muted-foreground">CALLSIGN [USERNAME]</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="operator_name" 
                        className="font-mono bg-background border-primary/30 focus-visible:ring-primary focus-visible:border-primary rounded-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs tracking-wider text-muted-foreground">IDENTIFIER [EMAIL]</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="operator@domain.com" 
                        className="font-mono bg-background border-primary/30 focus-visible:ring-primary focus-visible:border-primary rounded-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs tracking-wider text-muted-foreground">NEW PASSPHRASE</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="font-mono bg-background border-primary/30 focus-visible:ring-primary focus-visible:border-primary rounded-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full font-mono tracking-widest rounded-none border border-primary hover:bg-primary hover:text-primary-foreground bg-primary/10 text-primary transition-all duration-300 mt-2"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "GENERATING PROFILE..." : "INITIALIZE_PROFILE"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground font-mono text-xs">
              ALREADY REGISTERED?{" "}
              <Link href="/login" className="text-primary hover:underline underline-offset-4 decoration-primary/50">
                RETURN TO UPLINK
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
