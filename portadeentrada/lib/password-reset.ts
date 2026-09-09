import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const TOKEN_LENGTH = 32
const TOKEN_EXPIRY_HOURS = 1

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex')
}

/**
 * Create a password reset token for a user
 * Invalidates any existing tokens for this user first
 */
export async function createResetToken(userId: string): Promise<string> {
  // Invalidate all existing tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  })

  const token = generateResetToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS)

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })

  return token
}

/**
 * Validate a reset token and return the userId if valid
 * Returns null if token is invalid, expired, or already used
 */
export async function validateResetToken(token: string): Promise<string | null> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!resetToken) return null
  if (resetToken.usedAt) return null
  if (new Date() > resetToken.expiresAt) return null

  return resetToken.userId
}

/**
 * Mark a reset token as used
 */
export async function markTokenUsed(token: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { token },
    data: { usedAt: new Date() },
  })
}

/**
 * Reset a user's password using a valid token
 * Returns true if successful, false if token invalid
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<boolean> {
  const userId = await validateResetToken(token)
  if (!userId) return false

  const passwordHash = await bcrypt.hash(newPassword, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ])

  return true
}

/**
 * Clean up expired tokens (call periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  })
  return result.count
}
