import { useListReports, useDeleteReport } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2, Download, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { data: reports, isLoading } = useListReports();
  const deleteReport = useDeleteReport();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Delete this report from the archives?")) {
      deleteReport.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
          toast({
            title: "Report Deleted",
            description: "Document successfully purged.",
          });
        }
      });
    }
  };

  const handleDownload = (report: any) => {
    const blob = new Blob([report.content], { type: report.format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${report.id}_${format(new Date(report.createdAt), 'yyyyMMdd')}.${report.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-mono font-bold tracking-widest text-primary flex items-center gap-2">
          <FileText className="h-6 w-6" />
          REPORT_ARCHIVES
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">Compiled intelligence documents and scan summaries.</p>
      </div>

      <Card className="border-primary/20 bg-card/50 backdrop-blur rounded-none relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background/50">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-mono text-xs text-muted-foreground">DOCUMENT_ID</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">TITLE</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">GENERATED</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">FORMAT</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id} className="border-border/50 hover:bg-muted/30 group">
                      <TableCell className="font-mono text-xs font-medium text-muted-foreground">DOC-{report.id.toString().padStart(4, '0')}</TableCell>
                      <TableCell className="font-mono text-sm">{report.title}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {format(new Date(report.createdAt), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase border-primary/30 text-primary bg-primary/5">
                          .{report.format}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 font-mono text-[10px] rounded-none border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => handleDownload(report)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            PULL
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(report.id)}
                            disabled={deleteReport.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 font-mono text-sm text-muted-foreground">
                      ARCHIVES_EMPTY
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
