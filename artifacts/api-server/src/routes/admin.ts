import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { AdminUpdateUserBody, AdminUpdateUserParams, AdminDeleteUserParams } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/users", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    email: usersTable.email,
    role: usersTable.role,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.createdAt);
  res.json(users);
});

router.patch("/admin/users/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminUpdateUserParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const parsed = AdminUpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ id: user.id, username: user.username, email: user.email, role: user.role, createdAt: user.createdAt });
});

router.delete("/admin/users/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminDeleteUserParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ success: true, message: "User deleted" });
});

export default router;
