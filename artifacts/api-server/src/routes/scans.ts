import { Router, type IRouter, type Request } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, scansTable, findingsTable } from "@workspace/db";
import { CreateScanBody, GetScanParams, DeleteScanParams } from "@workspace/api-zod";
import { requireAuth, type JwtPayload } from "../middlewares/auth";
import { runScan } from "../lib/scanner";

const router: IRouter = Router();

router.get("/scans", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: JwtPayload }).user;
  const scans = await db.select().from(scansTable).where(eq(scansTable.userId, userId)).orderBy(desc(scansTable.createdAt));
  res.json(scans);
});

router.post("/scans", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: JwtPayload }).user;
  const parsed = CreateScanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { target, scanType } = parsed.data;

  const [scan] = await db.insert(scansTable).values({
    userId,
    target,
    scanType: scanType ?? "full",
    status: "pending",
  }).returning();

  // Run scan asynchronously
  runScan(scan.id, target, scanType ?? "full").catch(() => {});

  res.status(201).json(scan);
});

router.get("/scans/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: JwtPayload }).user;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetScanParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid scan ID" });
    return;
  }

  const [scan] = await db.select().from(scansTable)
    .where(and(eq(scansTable.id, params.data.id), eq(scansTable.userId, userId)))
    .limit(1);

  if (!scan) {
    res.status(404).json({ error: "Scan not found" });
    return;
  }

  const findings = await db.select().from(findingsTable).where(eq(findingsTable.scanId, scan.id));
  res.json({ ...scan, findings });
});

router.delete("/scans/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: JwtPayload }).user;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteScanParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid scan ID" });
    return;
  }

  const [deleted] = await db.delete(scansTable)
    .where(and(eq(scansTable.id, params.data.id), eq(scansTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Scan not found" });
    return;
  }

  res.json({ success: true, message: "Scan deleted" });
});

export default router;
