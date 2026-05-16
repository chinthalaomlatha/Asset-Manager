import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateScan, useGetScan, ScanDetail } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Target, Play, Loader2, Bot, AlertTriangle, CheckCircle, Info, Zap } from "lucide-react";
import { getRiskColorClass, formatRiskLevel, getScoreColorClass } from "@/lib/color-utils";
import { Progress } from "@/components/ui/progress";

const scanSchema = z.object({
  target: z.string().min(1, { message: "Target URL is required" }),
  scanType: z.enum(["full", "ports", "headers", "ssl"]),
});

export default function Scanner() {
  const [activeScanId, setActiveScanId] = useState<number | null>(null);
  const createScan = useCreateScan();

  const form = useForm<z.infer<typeof scanSchema>>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      target: "",
      scanType: "full",
    },
  });

  const onSubmit = (data: z.infer<typeof scanSchema>) => {
    createScan.mutate({ data }, {
      onSuccess: (scan) => {
        setActiveScanId(scan.id);
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-mono font-bold tracking-widest text-primary flex items-center gap-2">
          <Target className="h-6 w-6" />
          ACTIVE_SCANNER
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">Initiate and monitor vulnerability assessments.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-1 border-primary/20 bg-card/50 backdrop-blur rounded-none h-fit relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <CardHeader>
            <CardTitle className="font-mono text-sm tracking-wider text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              NEW_SCAN_PARAMETERS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs tracking-wider text-muted-foreground">TARGET_URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com" 
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
                  name="scanType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs tracking-wider text-muted-foreground">SCAN_PROFILE</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="font-mono bg-background border-primary/30 focus:ring-primary rounded-none">
                            <SelectValue placeholder="Select profile" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none border-primary/30 bg-card">
                          <SelectItem value="full" className="font-mono text-sm focus:bg-primary/20 cursor-pointer rounded-none">FULL_ASSESSMENT</SelectItem>
                          <SelectItem value="ports" className="font-mono text-sm focus:bg-primary/20 cursor-pointer rounded-none">PORT_DISCOVERY</SelectItem>
                          <SelectItem value="headers" className="font-mono text-sm focus:bg-primary/20 cursor-pointer rounded-none">HEADER_ANALYSIS</SelectItem>
                          <SelectItem value="ssl" className="font-mono text-sm focus:bg-primary/20 cursor-pointer rounded-none">TLS_VERIFICATION</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full font-mono tracking-widest rounded-none border border-primary hover:bg-primary hover:text-primary-foreground bg-primary/10 text-primary transition-all duration-300 mt-4 group"
                  disabled={createScan.isPending || activeScanId !== null}
                >
                  {createScan.isPending ? "INITIALIZING..." : (
                    <>
                      <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      ENGAGE_SCAN
                    </>
                  )}
                </Button>
                {activeScanId && (
                   <Button 
                    type="button"
                    variant="outline"
                    className="w-full font-mono tracking-widest rounded-none border-muted hover:bg-muted/50 mt-2"
                    onClick={() => setActiveScanId(null)}
                   >
                     RESET_TERMINAL
                   </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="col-span-1 lg:col-span-2">
          {activeScanId ? (
            <ScanMonitor scanId={activeScanId} />
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-primary/20 bg-background/30 flex flex-col items-center justify-center text-muted-foreground relative">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,128,0.05),transparent_50%)]"></div>
               <Shield className="w-16 h-16 mb-4 opacity-20" />
               <p className="font-mono tracking-widest text-sm opacity-50">AWAITING_TARGET_DESIGNATION</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScanMonitor({ scanId }: { scanId: number }) {
  const [polling, setPolling] = useState(true);

  const { data: scan, error } = useGetScan(scanId, {
    query: {
      refetchInterval: polling ? 3000 : false,
      enabled: !!scanId,
    }
  });

  useEffect(() => {
    if (scan && (scan.status === 'completed' || scan.status === 'failed')) {
      setPolling(false);
    }
  }, [scan]);

  if (!scan) {
    return (
      <Card className="h-full min-h-[400px] border-primary/20 bg-card/50 rounded-none flex items-center justify-center">
        <div className="flex flex-col items-center">
           <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
           <p className="font-mono text-sm text-primary tracking-widest animate-pulse">ESTABLISHING_LINK...</p>
        </div>
      </Card>
    );
  }

  const isRunning = scan.status === 'pending' || scan.status === 'running';

  return (
    <div className="space-y-4 h-full flex flex-col">
      <Card className="border-primary/20 bg-card/50 backdrop-blur rounded-none shrink-0 relative overflow-hidden">
        {isRunning && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary animate-pulse"></div>}
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-mono font-bold text-lg text-foreground mb-1 break-all">{scan.target}</h3>
            <div className="flex items-center gap-3 font-mono text-xs">
              <Badge variant="outline" className={`rounded-none uppercase tracking-wider ${
                isRunning ? 'border-primary/50 text-primary animate-pulse' : 
                scan.status === 'failed' ? 'border-destructive text-destructive' : 'border-green-500 text-green-500'
              }`}>
                STATUS: {scan.status}
              </Badge>
              <span className="text-muted-foreground">TYPE: {scan.scanType?.toUpperCase()}</span>
            </div>
          </div>
          
          {!isRunning && scan.status === 'completed' && (
            <div className="flex items-center gap-4 shrink-0 bg-background/50 p-3 border border-border/50">
              <div className="text-right">
                <p className="font-mono text-[10px] text-muted-foreground mb-1">SECURITY_SCORE</p>
                <p className={`font-mono text-2xl font-bold ${getScoreColorClass(scan.securityScore).text}`}>
                  {scan.securityScore}/100
                </p>
              </div>
              <div className="h-10 w-[1px] bg-border/50"></div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-muted-foreground mb-1">RISK_LEVEL</p>
                <p className={`font-mono text-lg font-bold ${getRiskColorClass(scan.riskLevel).text}`}>
                  {formatRiskLevel(scan.riskLevel)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isRunning ? (
        <Card className="flex-1 border-primary/20 bg-card/50 rounded-none flex flex-col items-center justify-center p-8 min-h-[300px]">
          <div className="w-full max-w-md space-y-6">
            <div className="flex justify-between font-mono text-xs text-primary mb-2">
              <span>SCAN_PROGRESS</span>
              <span className="animate-pulse">RUNNING...</span>
            </div>
            <div className="relative h-2 bg-muted/30 overflow-hidden">
               <div className="absolute top-0 bottom-0 bg-primary/80 w-1/3 animate-[slide_2s_ease-in-out_infinite]"></div>
            </div>
            <div className="font-mono text-xs text-muted-foreground space-y-2 mt-8 opacity-70">
              <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-primary" /> Target identified and resolved.</p>
              <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-primary" /> Initiating selected scan profile...</p>
              <p className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin text-primary" /> Analyzing responses...</p>
            </div>
          </div>
        </Card>
      ) : scan.status === 'completed' ? (
        <ScanResults findings={scan.findings} />
      ) : (
        <Card className="flex-1 border-destructive/20 bg-destructive/5 rounded-none flex items-center justify-center">
          <div className="text-center space-y-2">
             <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
             <h3 className="font-mono font-bold text-destructive">SCAN_FAILED</h3>
             <p className="font-mono text-sm text-muted-foreground">Unable to complete assessment for target.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

function ScanResults({ findings }: { findings: ScanDetail['findings'] }) {
  const recommendations = findings?.filter(f => f.type === 'recommendation') || [];
  const vulnerabilities = findings?.filter(f => f.type !== 'recommendation') || [];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Info className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return "text-destructive border-destructive bg-destructive/10";
      case 'high': return "text-orange-500 border-orange-500 bg-orange-500/10";
      case 'medium': return "text-yellow-500 border-yellow-500 bg-yellow-500/10";
      case 'low': return "text-green-500 border-green-500 bg-green-500/10";
      default: return "text-blue-400 border-blue-400 bg-blue-400/10";
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
      {recommendations.length > 0 && (
        <Card className="border-primary/50 bg-primary/5 rounded-none shrink-0 relative overflow-hidden shadow-[0_0_15px_rgba(var(--primary),0.1)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <CardHeader className="py-3 px-4 flex flex-row items-center gap-2 bg-primary/10 border-b border-primary/20">
            <Bot className="w-5 h-5 text-primary" />
            <CardTitle className="font-mono text-sm tracking-wider text-primary">AI_RECOMMENDATIONS</CardTitle>
          </CardHeader>
          <CardContent className="p-4 max-h-[200px] overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {recommendations.map(rec => (
                <div key={rec.id} className="space-y-1">
                  <h4 className="font-mono font-bold text-sm text-foreground">{rec.title}</h4>
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="flex-1 border-primary/20 bg-card/50 rounded-none flex flex-col min-h-0">
        <CardHeader className="py-3 px-4 border-b border-border/50 shrink-0">
          <CardTitle className="font-mono text-sm tracking-wider text-muted-foreground">VULNERABILITY_LOG</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
          {vulnerabilities.length > 0 ? (
            <div className="divide-y divide-border/50">
              {vulnerabilities.map(vuln => (
                <div key={vuln.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(vuln.severity)}
                        <h4 className="font-mono font-bold text-sm text-foreground">{vuln.title}</h4>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground pl-6">{vuln.description}</p>
                      {vuln.detail && (
                        <div className="pl-6 mt-2">
                          <code className="bg-background/80 border border-border/50 p-2 block font-mono text-[10px] text-primary break-all rounded-sm">
                            {vuln.detail}
                          </code>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={`rounded-none font-mono text-[10px] uppercase shrink-0 border ${getSeverityColor(vuln.severity)}`}>
                      {vuln.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4 opacity-50" />
              <p className="font-mono text-sm text-muted-foreground tracking-widest">NO_VULNERABILITIES_DETECTED</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
