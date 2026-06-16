import type { Request, Response, NextFunction } from "express";
import { verifyToken, type TokenPayload } from "../lib/auth";

// Extend Express Request to include the authenticated user payload.
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware that extracts and verifies a JWT from the `Authorization` header.
 * On success, `req.user` is populated with the decoded token payload.
 * On failure, responds with 401.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  console.log("[Auth Middleware] Authorization Header:", header);

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const token = header.slice(7); // strip "Bearer "

  try {
    req.user = await verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
