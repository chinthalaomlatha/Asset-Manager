import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const scansTable = pgTable("scans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  target: text("target").notNull(),
  scanType: text("scan_type").notNull().default("full"),
  status: text("status").notNull().default("pending"),
  securityScore: integer("security_score"),
  riskLevel: text("risk_level"),
  totalFindings: integer("total_findings"),
  openPortsCount: integer("open_ports_count"),
  missingHeadersCount: integer("missing_headers_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertScanSchema = createInsertSchema(scansTable).omit({ id: true, createdAt: true });
export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scansTable.$inferSelect;
