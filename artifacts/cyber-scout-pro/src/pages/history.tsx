import { useState } from "react";
import { useListScans, useDeleteScan, useCreateReport, useCreateScan, getListScansQueryKey, getListReportsQueryKey } from "@workspace/api-client-react";
import { useScanNotifier } from "@/lib/scan-notifier";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Search, Trash2, FileText, Loader2, Download, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getRiskColorClass, formatRiskLevel, getScoreColorClass } from "@/lib/color-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function History() {
  const { data: scans, isLoading } = useListScans();
  const deleteScan = useDeleteScan();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredScans = scans?.filter(s => s.target.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  const handleDelete = (id: number) => {
    if (confirm("Confirm deletion of scan record?")) {
      deleteScan.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListScansQueryKey() });
          toast({
            title: "Record Deleted",
            description: "Scan history record has been expunged.",
          });
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-widest text-primary flex items-center gap-2">
            <Clock className="h-6 w-6" />
            SCAN_HISTORY
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">Archived intelligence and assessment records.</p>
        </div>
        
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search targets..."
            className="pl-9 font-mono bg-card/50 border-primary/20 focus-visible:ring-primary rounded-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-primary/20 bg-card/50 backdrop-blur rounded-none relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background/50">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-mono text-xs text-muted-foreground w-[250px]">TARGET</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">DATE</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">TYPE</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">STATUS</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">RISK</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">SCORE</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredScans.length > 0 ? (
                  filteredScans.map((scan) => (
                    <TableRow key={scan.id} className="border-border/50 hover:bg-muted/30 group">
                      <TableCell className="font-mono text-sm font-medium">{scan.target}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {format(new Date(scan.createdAt), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="font-mono text-xs uppercase">{scan.scanType || 'FULL'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-none font-mono text-[10px] uppercase ${
                          scan.status === 'completed' ? 'border-green-500/50 text-green-500' :
                          scan.status === 'failed' ? 'border-destructive/50 text-destructive' :
                          'border-primary/50 text-primary animate-pulse'
                        }`}>
                          {scan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {scan.status === 'completed' ? (
                          <span className={`font-mono text-xs font-bold ${getRiskColorClass(scan.riskLevel).text}`}>
                            {formatRiskLevel(scan.riskLevel)}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {scan.status === 'completed' && scan.securityScore !== null ? (
                          <span className={`font-mono text-xs font-bold ${getScoreColorClass(scan.securityScore).text}`}>
                            {scan.securityScore}/100
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <RescanButton target={scan.target} scanType={scan.scanType ?? "full"} />
                          {scan.status === 'completed' && (
                            <ReportGenerator scanId={scan.id} target={scan.target} />
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(scan.id)}
                            disabled={deleteScan.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 font-mono text-sm text-muted-foreground">
                      NO_RECORDS_FOUND
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RescanButton({ target, scanType }: { target: string; scanType: string }) {
  const createScan = useCreateScan();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { watchScan } = useScanNotifier();

  const handleRescan = () => {
    createScan.mutate(
      { data: { target, scanType: scanType as "full" | "ports" | "headers" | "ssl" } },
      {
        onSuccess: (scan) => {
          queryClient.invalidateQueries({ queryKey: getListScansQueryKey() });
          watchScan(scan.id, target);
          toast({
            title: "Rescan Initiated",
            description: `New assessment queued for ${target}`,
          });
        },
        onError: () => {
          toast({
            title: "Rescan Failed",
            description: "Unable to initiate new scan. Try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Button
      variant="outline"
      size="sm"
      data-testid={`button-rescan-${target}`}
      className="h-8 font-mono text-[10px] rounded-none border-primary/30 text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handleRescan}
      disabled={createScan.isPending}
    >
      {createScan.isPending ? (
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      ) : (
        <RefreshCw className="h-3 w-3 mr-1" />
      )}
      {createScan.isPending ? "QUEUING..." : "RE-SCAN"}
    </Button>
  );
}

function ReportGenerator({ scanId, target }: { scanId: number, target: string }) {
  const [format, setFormat] = useState<"txt" | "json">("txt");
  const [open, setOpen] = useState(false);
  const createReport = useCreateReport();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleGenerate = () => {
    createReport.mutate({
      data: {
        scanId,
        format,
        title: `Report - ${target}`
      }
    }, {
      onSuccess: () => {
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        toast({
          title: "Report Generated",
          description: "Report has been successfully compiled and saved to archives.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 font-mono text-[10px] rounded-none border-primary/30 text-primary hover:bg-primary/10">
          <FileText className="h-3 w-3 mr-1" />
          GEN_REPORT
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary/30 rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-primary flex items-center gap-2">
            <Download className="h-5 w-5" />
            COMPILE_REPORT
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="font-mono text-xs text-muted-foreground">FORMAT_SELECTION</label>
            <Select value={format} onValueChange={(val: any) => setFormat(val)}>
              <SelectTrigger className="font-mono bg-background border-primary/30 rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/30 rounded-none">
                <SelectItem value="txt" className="font-mono rounded-none">PLAINTEXT (.txt)</SelectItem>
                <SelectItem value="json" className="font-mono rounded-none">STRUCTURED (.json)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="font-mono text-xs text-muted-foreground bg-muted/20 p-2 border border-muted">
            TARGET: {target}<br/>
            ID: {scanId}
          </p>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleGenerate}
            disabled={createReport.isPending}
            className="w-full font-mono rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {createReport.isPending ? "COMPILING..." : "EXECUTE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
