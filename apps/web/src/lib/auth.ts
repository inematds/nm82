import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from './supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        try {
          // Authenticate with Supabase Auth
          const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          })

          if (authError || !authData.user) {
            throw new Error('Credenciais inválidas')
          }

          // Get user roles from user_roles table
          const { data: rolesData, error: rolesError } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('userId', authData.user.id) // Use user ID, not email

          if (rolesError) {
            console.error('Error fetching roles:', rolesError)
          }

          const roles = rolesData?.map(r => r.role) || []

          return {
            id: authData.user.id,
            email: authData.user.email!,
            name: authData.user.user_metadata?.name || authData.user.email,
            roles: roles
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.roles = (user as any).roles || []
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        session.user.email = token.email as string
        (session.user as any).roles = token.roles
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
