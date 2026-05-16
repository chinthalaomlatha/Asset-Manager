export function getScoreColorClass(score: number | null | undefined): { text: string, bg: string, border: string } {
  if (score === null || score === undefined) return { text: "text-muted-foreground", bg: "bg-muted/20", border: "border-muted" };
  
  if (score >= 90) return { text: "text-primary", bg: "bg-primary/10", border: "border-primary/50" };
  if (score >= 70) return { text: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/50" };
  if (score >= 41) return { text: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/50" };
  return { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/50" };
}

export function getRiskColorClass(riskLevel: string | null | undefined): { text: string, bg: string, border: string } {
  if (!riskLevel) return { text: "text-muted-foreground", bg: "bg-muted/20", border: "border-muted" };
  
  const level = riskLevel.toLowerCase();
  switch(level) {
    case 'critical':
      return { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive" };
    case 'high':
      return { text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500" };
    case 'medium':
      return { text: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500" };
    case 'low':
      return { text: "text-green-500", bg: "bg-green-500/10", border: "border-green-500" };
    case 'info':
    default:
      return { text: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400" };
  }
}

export function formatRiskLevel(riskLevel: string | null | undefined): string {
  if (!riskLevel) return "UNKNOWN";
  return riskLevel.toUpperCase();
}