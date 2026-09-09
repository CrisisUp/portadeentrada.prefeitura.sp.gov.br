import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'ADMIN' | 'EDITOR' | 'VIEWER'
    } & DefaultSession['user']
  }

  interface User {
    role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'EDITOR' | 'VIEWER'
    id: string
  }
}
