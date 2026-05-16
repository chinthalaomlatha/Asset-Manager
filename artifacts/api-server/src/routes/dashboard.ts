import { Router, type IRouter, type Request } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, scansTable, findingsTable } from "@workspace/db";
import { requireAuth, type JwtPayload } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: JwtPayload }).user;

  const scans = await db.select().from(scansTable).where(eq(scansTable.userId, userId));

  const totalScans = scans.length;
  const completedScans = scans.filter(s => s.status === "completed").length;
  const totalVulnerabilities = scans.reduce((sum, s) => sum + (s.totalFindings ?? 0), 0);
  const scoredScans = scans.filter(s => s.securityScore != null);
  const avgSecurityScore = scoredScans.length > 0
    ? scoredScans.reduce((sum, s) => sum + (s.securityScore ?? 0), 0) / scoredScans.length
    : null;
  const highRiskTargets = scans.filter(s => s.riskLevel === "high" || s.riskLevel === "critical").length;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const scansThisWeek = scans.filter(s => new Date(s.createdAt) >= oneWeekAgo).length;

  res.json({
    totalScans,
    completedScans,
    totalVulnerabilities,
    avgSecurityScore: avgSecurityScore != null ? Math.round(avgSecurityScore) : null,
    highRiskTargets,
    scansThisWeek,
  });
});

router.get("/dashboard/activity", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: JwtPayload }).user;
  const scans = await db.select().from(scansTable)
    .where(eq(scansTable.userId, userId))
    .orderBy(desc(scansTable.createdAt))
    .limit(10);

  res.json(scans.map(s => ({
    id: s.id,
    target: s.target,
    status: s.status,
    riskLevel: s.riskLevel,
    securityScore: s.securityScore,
    createdAt: s.createdAt,
  })));
});

router.get("/dashboard/risk-breakdown", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: JwtPayload }).user;
  const userScans = await db.select({ id: scansTable.id }).from(scansTable).where(eq(scansTable.userId, userId));
  const scanIds = userScans.map(s => s.id);

  const breakdown = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  if (scanIds.length === 0) {
    res.json(breakdown);
    return;
  }

  const allFindings = await db.select().from(findingsTable);
  const userFindings = allFindings.filter(f => scanIds.includes(f.scanId));

  for (const f of userFindings) {
    const sev = f.severity as keyof typeof breakdown;
    if (sev in breakdown) breakdown[sev]++;
  }

  res.json(breakdown);
});

export default router;
