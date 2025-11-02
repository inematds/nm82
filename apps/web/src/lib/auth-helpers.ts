import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireRole(role: 'ADMIN' | 'PADRINHO' | 'AFILIADO') {
  const session = await requireAuth()
  if (!session.user.roles.includes(role)) {
    throw new Error(`Forbidden: requires ${role} role`)
  }
  return session
}

export async function requireAdmin() {
  return await requireRole('ADMIN')
}

export function hasRole(session: any, role: string): boolean {
  return session?.user?.roles?.includes(role) || false
}

export function isAdmin(session: any): boolean {
  return hasRole(session, 'ADMIN')
}

export function isPadrinho(session: any): boolean {
  return hasRole(session, 'PADRINHO')
}

export function isAfiliado(session: any): boolean {
  return hasRole(session, 'AFILIADO')
}
