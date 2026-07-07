import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  AuthRegisterBody,
  AuthLoginBody,
  AuthUpdateProfileBody,
  AuthGoogleBody,
} from "@workspace/api-zod";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { hashPassword, verifyPassword, generateToken } from "../lib/auth";
import { requireAuth } from "../middlewares/auth";
import { jwtVerify, decodeJwt } from "jose";


const googleClient = new OAuth2Client();

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
        profileImage: user.profileImage ?? undefined,
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
        profileImage: user.profileImage ?? undefined,
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

// ── POST /google ──────────────────────────────────────────────────────────────

router.post("/google", async (req, res) => {
  try {
    const body = AuthGoogleBody.parse(req.body);
    const { idToken } = body;

    // Verify token using google-auth-library or jose (for Supabase JWTs)
    let payload;
    try {
      if (idToken === "mock_dev_google_id_token") {
        // Dev bypass payload
        payload = {
          email: "dev.google.user@sankalp.com",
          name: "Dev Google User",
          picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        };
      } else {
        // Safe decode to check if the issuer is Supabase
        let decoded;
        try {
          decoded = decodeJwt(idToken);
        } catch {
          // Token isn't a JWT or is ill-formed, we let verification libraries throw
        }

        const issuer = decoded?.iss;
        const supabaseUrl = process.env.SUPABASE_URL;

        if (
          issuer &&
          (issuer.includes("supabase.co") ||
            (supabaseUrl && issuer.includes(supabaseUrl)))
        ) {
          // Verify Supabase JWT using Supabase REST API (bypasses algorithm mismatch issues like ES256)
          const supabaseUrl = process.env.SUPABASE_URL;
          const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_JWT_SECRET || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cGVsZmV6YnVscXpnc250c2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MzE3NDgsImV4cCI6MjA5NzAwNzc0OH0.2VMfnYbouPYxV-K1KBWLHeIQJg9zFqDTdww_SE7wXHM"; // fallback if anon key missing
          
          if (!supabaseUrl) {
            throw new Error("SUPABASE_URL is not configured on the backend");
          }

          const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              apikey: supabaseAnonKey || "",
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to verify Supabase token via API");
          }

          const user = (await response.json()) as any;
          const meta = user?.user_metadata || {};

          payload = {
            email: user.email,
            name: meta.full_name || meta.name || user.email?.split("@")[0] || "User",
            picture: meta.avatar_url || meta.picture || null,
          };
        } else {
          // Default to Google ID Token validation
          const audience = [
            process.env.GOOGLE_CLIENT_ID_WEB,
            process.env.GOOGLE_CLIENT_ID_IOS,
            process.env.GOOGLE_CLIENT_ID_ANDROID,
          ].filter(Boolean) as string[];

          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: audience.length > 0 ? audience : undefined,
          });
          const googlePayload = ticket.getPayload();
          if (googlePayload) {
            payload = {
              email: googlePayload.email,
              name: googlePayload.name,
              picture: googlePayload.picture,
            };
          }
        }
      }
    } catch (err: any) {
      res.status(401).json({ message: "Token verification failed: " + err.message });
      return;
    }

    if (!payload || !payload.email) {
      res.status(400).json({ message: "Google account does not contain email" });
      return;
    }

    const email = payload.email.toLowerCase();

    // Check if user exists
    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      // Register new user
      const name = payload.name || email.split("@")[0];
      const profileImage = payload.picture || null;
      const dummyPassword = crypto.randomUUID();
      const passwordHash = await hashPassword(dummyPassword);

      [user] = await db
        .insert(usersTable)
        .values({
          name,
          email,
          profileImage,
          passwordHash,
        })
        .returning();
    } else if (payload.picture && !user.profileImage) {
      // Update profile image if user exists but has no image
      const [updatedUser] = await db
        .update(usersTable)
        .set({
          profileImage: payload.picture,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, user.id))
        .returning();
      if (updatedUser) {
        user = updatedUser;
      }
    }

    // Sign app token
    const token = await generateToken({ userId: user.id });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email ?? undefined,
        phone: user.phone ?? undefined,
        city: user.city ?? undefined,
        profileImage: user.profileImage ?? undefined,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ message: "Validation failed", errors: err.issues });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
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
    profileImage: user.profileImage ?? undefined,
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
        profileImage: body.profileImage !== undefined ? body.profileImage : undefined,
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
      profileImage: updatedUser.profileImage ?? undefined,
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
