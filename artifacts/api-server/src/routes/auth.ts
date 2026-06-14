import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  AuthRegisterBody,
  AuthLoginBody,
  AuthUpdateProfileBody,
} from "@workspace/api-zod";
import { hashPassword, verifyPassword, generateToken } from "../lib/auth";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// ── POST /register ──────────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  try {
    const body = AuthRegisterBody.parse(req.body);

    // At least one of email or phone must be provided
    if (!body.email && !body.phone) {
      res
        .status(400)
        .json({ message: "At least one of email or phone is required" });
      return;
    }

    // Check for existing users with the same email or phone
    const conditions = [];
    if (body.email) conditions.push(eq(usersTable.email, body.email));
    if (body.phone) conditions.push(eq(usersTable.phone, body.phone));

    const existing = await db
      .select({ id: usersTable.id, email: usersTable.email, phone: usersTable.phone })
      .from(usersTable)
      .where(or(...conditions))
      .limit(1);

    if (existing.length > 0) {
      const match = existing[0];
      if (body.email && match.email === body.email) {
        res.status(409).json({ message: "Email already in use" });
        return;
      }
      if (body.phone && match.phone === body.phone) {
        res.status(409).json({ message: "Phone number already in use" });
        return;
      }
      res.status(409).json({ message: "Credentials already in use" });
      return;
    }

    const passwordHash = await hashPassword(body.password);

    const [user] = await db
      .insert(usersTable)
      .values({
        name: body.name,
        email: body.email ?? null,
        phone: body.phone ?? null,
        city: body.city ?? null,
        passwordHash,
      })
      .returning();

    const token = await generateToken({ userId: user.id });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ message: "Validation failed", errors: err.issues });
      return;
    }
    throw err;
  }
});

// ── POST /login ─────────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  try {
    const body = AuthLoginBody.parse(req.body);

    // Determine if identifier is an email or phone
    const identifier = body.identifier.trim();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, identifier),
          eq(usersTable.phone, identifier),
        ),
      )
      .limit(1);

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = await generateToken({ userId: user.id });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ message: "Validation failed", errors: err.issues });
      return;
    }
    throw err;
  }
});

// ── GET /me ─────────────────────────────────────────────────────────────────

router.get("/me", requireAuth, async (req, res) => {
  const userId = req.user!.userId;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    res.status(401).json({ message: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    createdAt: user.createdAt.toISOString(),
  });
});

// ── PUT /me ─────────────────────────────────────────────────────────────────

router.put("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const body = AuthUpdateProfileBody.parse(req.body);

    if (body.email) {
      const [existingEmail] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, body.email))
        .limit(1);

      if (existingEmail && existingEmail.id !== userId) {
        res.status(409).json({ message: "Email already in use" });
        return;
      }
    }

    if (body.phone) {
      const [existingPhone] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.phone, body.phone))
        .limit(1);

      if (existingPhone && existingPhone.id !== userId) {
        res.status(409).json({ message: "Phone number already in use" });
        return;
      }
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        city: body.city || null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId))
      .returning();

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email ?? undefined,
      phone: updatedUser.phone ?? undefined,
      city: updatedUser.city ?? undefined,
      createdAt: updatedUser.createdAt.toISOString(),
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ message: "Validation failed", errors: err.issues });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
