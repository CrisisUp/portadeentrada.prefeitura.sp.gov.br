import { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const nextAuth = NextAuth(authOptions)

export async function GET(req: NextRequest) {
  return nextAuth.handlers.GET(req)
}

export async function POST(req: NextRequest) {
  return nextAuth.handlers.POST(req)
}
