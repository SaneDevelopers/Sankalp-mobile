import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { SignJWT, jwtVerify } from 'jose'

const scryptAsync = promisify(scrypt)
const SALT_LENGTH = 32
const KEY_LENGTH = 64
const SCRYPT_SEPARATOR = '.'

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  return `${salt.toString('hex')}${SCRYPT_SEPARATOR}${derived.toString('hex')}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(SCRYPT_SEPARATOR)
  if (!saltHex || !keyHex) return false
  const salt = Buffer.from(saltHex, 'hex')
  const stored = Buffer.from(keyHex, 'hex')
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  return timingSafeEqual(stored, derived)
}

export interface TokenPayload {
  userId: number
}

export async function generateToken(payload: TokenPayload, jwtSecret: string): Promise<string> {
  const secret = new TextEncoder().encode(jwtSecret)
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}

export async function verifyToken(token: string, jwtSecret: string): Promise<TokenPayload> {
  const secret = new TextEncoder().encode(jwtSecret)
  const { payload } = await jwtVerify(token, secret)
  return { userId: payload.userId as number }
}
