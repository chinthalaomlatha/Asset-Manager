import { Activity, ShieldAlert, Target, Zap } from "lucide-react";
import { useGetDashboardStats, useGetRecentActivity, useGetRiskBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getScoreColorClass, getRiskColorClass, formatRiskLevel } from "@/lib/color-utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: riskBreakdown, isLoading: riskLoading } = useGetRiskBreakdown();

  const chartData = riskBreakdown ? [
    { name: "Critical", value: riskBreakdown.critical, fill: "hsl(0, 100%, 60%)" },
    { name: "High", value: riskBreakdown.high, fill: "hsl(15, 100%, 50%)" },
    { name: "Medium", value: riskBreakdown.medium, fill: "hsl(40, 100%, 50%)" },
    { name: "Low", value: riskBreakdown.low, fill: "hsl(100, 100%, 40%)" },
    { name: "Info", value: riskBreakdown.info, fill: "hsl(200, 100%, 50%)" },
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-mono font-bold tracking-widest text-primary flex items-center gap-2">
          <Activity className="h-6 w-6" />
          SYSTEM_OVERVIEW
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">Real-time telemetrics and security posture.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="TOTAL SCANS" 
          value={stats?.totalScans ?? 0} 
          icon={<Target className="h-4 w-4 text-primary" />} 
          loading={statsLoading}
        />
        <StatsCard 
          title="VULNERABILITIES" 
          value={stats?.totalVulnerabilities ?? 0} 
          icon={<ShieldAlert className="h-4 w-4 text-destructive" />} 
          loading={statsLoading}
        />
        <StatsCard 
          title="AVG SECURITY SCORE" 
          value={stats?.avgSecurityScore !== null ? stats?.avgSecurityScore : "N/A"} 
          icon={<Zap className="h-4 w-4 text-primary" />} 
          valueClass={stats?.avgSecurityScore !== null && stats?.avgSecurityScore !== undefined ? getScoreColorClass(stats.avgSecurityScore).text : ""}
          loading={statsLoading}
        />
        <StatsCard 
          title="HIGH RISK TARGETS" 
          value={stats?.highRiskTargets ?? 0} 
          icon={<Activity className="h-4 w-4 text-orange-500" />} 
          valueClass={stats?.highRiskTargets && stats.highRiskTargets > 0 ? "text-destructive" : ""}
          loading={statsLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 border-primary/20 bg-card/50 backdrop-blur rounded-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <CardHeader>
            <CardTitle className="font-mono text-sm tracking-wider text-muted-foreground">RISK_DISTRIBUTION</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 h-[300px]">
            {riskLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-none opacity-20" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--primary)/0.3)', borderRadius: 0, fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 border-primary/20 bg-card/50 backdrop-blur rounded-none relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <CardHeader>
            <CardTitle className="font-mono text-sm tracking-wider text-muted-foreground">ACTIVITY_LOG</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activityLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-none opacity-20" />)}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="divide-y divide-border/50">
                {activity.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group">
                    <div className="space-y-1 overflow-hidden pr-4">
                      <p className="text-sm font-mono font-medium truncate text-foreground group-hover:text-primary transition-colors">{item.target}</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {format(new Date(item.createdAt), "MMM d, HH:mm:ss")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {item.status === 'completed' ? (
                        <>
                          <Badge variant="outline" className={`rounded-none font-mono text-[10px] uppercase ${getRiskColorClass(item.riskLevel).border} ${getRiskColorClass(item.riskLevel).text}`}>
                            {formatRiskLevel(item.riskLevel)}
                          </Badge>
                          {item.securityScore !== null && (
                            <span className={`font-mono text-xs font-bold ${getScoreColorClass(item.securityScore).text}`}>
                              {item.securityScore}/100
                            </span>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase border-primary/50 text-primary animate-pulse">
                          {item.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center font-mono text-sm text-muted-foreground">
                NO_ACTIVITY_DETECTED
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, valueClass = "", loading = false }: { title: string, value: string | number, icon: React.ReactNode, valueClass?: string, loading?: boolean }) {
  return (
    <Card className="border-primary/20 bg-card/40 backdrop-blur rounded-none relative group overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-mono tracking-wider text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16 opacity-20 rounded-none" />
        ) : (
          <div className={`text-2xl font-mono font-bold ${valueClass}`}>{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
