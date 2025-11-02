import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const results = {
    status: 'checking',
    connection: false,
    tables: {} as Record<string, any>,
    adminUsers: 0,
    codigosDisponiveis: 0,
    errors: [] as string[],
  };

  try {
    // 1. Test connection
    await prisma.$connect();
    results.connection = true;

    // 2. Check tables
    try {
      results.tables.userRoles = await prisma.userRole.count();
    } catch (error: any) {
      results.errors.push(`user_roles: ${error.message}`);
    }

    try {
      results.tables.pessoasFisicas = await prisma.pessoaFisica.count();
    } catch (error: any) {
      results.errors.push(`pessoas_fisicas: ${error.message}`);
    }

    try {
      results.tables.afiliados = await prisma.afiliado.count();
    } catch (error: any) {
      results.errors.push(`afiliados: ${error.message}`);
    }

    try {
      results.tables.codigosConvite = await prisma.codigoConvite.count();
    } catch (error: any) {
      results.errors.push(`codigos_convite: ${error.message}`);
    }

    try {
      results.tables.pagamentos = await prisma.pagamento.count();
    } catch (error: any) {
      results.errors.push(`pagamentos: ${error.message}`);
    }

    // 3. Check admin users
    try {
      const adminRoles = await prisma.userRole.findMany({
        where: { role: 'ADMIN' }
      });
      results.adminUsers = adminRoles.length;
    } catch (error: any) {
      results.errors.push(`admin check: ${error.message}`);
    }

    // 4. Check available códigos
    try {
      results.codigosDisponiveis = await prisma.codigoConvite.count({
        where: { usado: false }
      });
    } catch (error: any) {
      results.errors.push(`codigos check: ${error.message}`);
    }

    // 5. Determine status
    if (results.errors.length === 0) {
      results.status = 'ok';
    } else if (results.errors.some(e => e.includes('does not exist') || e.includes('relation'))) {
      results.status = 'tables_missing';
    } else {
      results.status = 'error';
    }

  } catch (error: any) {
    results.status = 'connection_failed';
    results.errors.push(`Connection: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }

  return NextResponse.json(results);
}
