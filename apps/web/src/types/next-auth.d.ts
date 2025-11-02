import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name?: string | null
    roles: string[]
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      roles: string[]
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    roles: string[]
  }
}
