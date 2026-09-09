import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { logger } from './logger'

// Token rotation: access token lives 30 min, refresh token 7 days
const ACCESS_TOKEN_MAX_AGE = 30 * 60 // 30 minutes in seconds
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          throw new Error('Usuário não encontrado')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          throw new Error('Senha incorreta')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: REFRESH_TOKEN_MAX_AGE, // 7 days — controls refresh token lifetime
  },
  jwt: {
    maxAge: ACCESS_TOKEN_MAX_AGE, // 30 min — controls access token lifetime
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // On sign-in: initialize token with user data
      if (user) {
        token.role = user.role
        token.id = user.id as string
        token.iat = Math.floor(Date.now() / 1000)
        token.jti = crypto.randomUUID() // Unique token ID for rotation tracking
        return token
      }

      // On token refresh: check if access token has expired
      // NextAuth automatically refreshes when maxAge is hit
      // But we add extra validation: if iat is stale beyond session.maxAge, reject
      const tokenAge = Math.floor(Date.now() / 1000) - (token.iat as number)
      if (tokenAge > REFRESH_TOKEN_MAX_AGE) {
        // Token is too old — force re-authentication
        logger.audit('auth.session.regenerated', {
          userId: token.id as string,
          details: { reason: 'token_expired', tokenAge },
        })
        return null // Returns null → session expires → user must re-login
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  events: {
    async signIn({ user }) {
      logger.audit('auth.login.success', {
        userId: user.id,
        email: user.email ?? undefined,
      })
    },
    async signOut(message) {
      if ('token' in message && message.token) {
        logger.audit('auth.logout', {
          userId: message.token.id as string,
        })
      }
    },
  },
}
