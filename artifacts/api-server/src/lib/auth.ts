import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const SCRYPT_SEPARATOR = ".";

/**
 * Hash a plaintext password using scrypt with a random salt.
 * Returns a string in the format `salt.derivedKey` (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString("hex")}${SCRYPT_SEPARATOR}${derived.toString("hex")}`;
}

/**
 * Verify a plaintext password against a previously hashed value.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(SCRYPT_SEPARATOR);
  if (!saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const storedKey = Buffer.from(keyHex, "hex");
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  return timingSafeEqual(storedKey, derived);
}

// ---------------------------------------------------------------------------
// JWT helpers using `jose`
// ---------------------------------------------------------------------------

const JWT_SECRET_STRING =
  process.env["JWT_SECRET"] ?? "sankalp-dev-secret-key-123456";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const JWT_ISSUER = "sankalp";
const JWT_EXPIRATION = "7d";

export interface TokenPayload extends JWTPayload {
  userId: number;
}

/**
 * Generate a signed JWT containing the given payload.
 */
export async function generateToken(payload: {
  userId: number;
}): Promise<string> {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token. Throws on invalid/expired tokens.
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
  });
  return payload as TokenPayload;
}
