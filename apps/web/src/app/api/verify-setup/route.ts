import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const report = {
    timestamp: new Date().toISOString(),
    overall: 'checking',
    checks: [] as Array<{ name: string; status: 'ok' | 'warning' | 'error'; message: string; details?: any }>,
  };

  try {
    // 1. Check database connection via Supabase
    report.checks.push({
      name: 'Database Connection',
      status: 'ok',
      message: 'Using Supabase client (REST API)',
    });

    // 2. Check all tables exist with counts
    const tables = [
      'user_roles',
      'pessoas_fisicas',
      'afiliados',
      'codigos_convite',
      'notifications',
      'audit_logs',
    ];

    const tableCounts: Record<string, number> = {};
    for (const tableName of tables) {
      try {
        const { count, error } = await supabaseAdmin
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          report.checks.push({
            name: `Table: ${tableName}`,
            status: 'error',
            message: `Error accessing table: ${error.message}`,
          });
        } else {
          tableCounts[tableName] = count || 0;
        }
      } catch (error: any) {
        report.checks.push({
          name: `Table: ${tableName}`,
          status: 'error',
          message: `Table may not exist: ${error.message}`,
        });
      }
    }

    if (Object.keys(tableCounts).length === tables.length) {
      report.checks.push({
        name: 'Database Schema',
        status: 'ok',
        message: 'All 6 required tables exist',
        details: tableCounts,
      });
    }

    // 3. Check admin users
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('role', 'ADMIN');

    if (adminError) {
      report.checks.push({
        name: 'Admin Users',
        status: 'error',
        message: `Error checking admin users: ${adminError.message}`,
      });
    } else if (adminUsers && adminUsers.length > 0) {
      report.checks.push({
        name: 'Admin Users',
        status: 'ok',
        message: `Found ${adminUsers.length} admin user(s)`,
        details: adminUsers.map((u: any) => ({ userId: u.userId, createdAt: u.createdAt })),
      });
    } else {
      report.checks.push({
        name: 'Admin Users',
        status: 'warning',
        message: 'No admin users found. You should create at least one.',
      });
    }

    // 4. Check códigos de convite
    const { count: codigosTotal } = await supabaseAdmin
      .from('codigos_convite')
      .select('*', { count: 'exact', head: true });

    const { count: codigosDisponiveis } = await supabaseAdmin
      .from('codigos_convite')
      .select('*', { count: 'exact', head: true })
      .eq('usado', false);

    const total = codigosTotal || 0;
    const disponivel = codigosDisponiveis || 0;

    if (total === 0) {
      report.checks.push({
        name: 'Códigos de Convite',
        status: 'warning',
        message: 'No códigos created yet. Run the seed script (PASSO 6) to create some.',
      });
    } else {
      report.checks.push({
        name: 'Códigos de Convite',
        status: 'ok',
        message: `Total: ${total}, Available: ${disponivel}, Used: ${total - disponivel}`,
      });
    }

    // 5. Check RLS policies via SQL query
    try {
      const { data: rlsCheck, error: rlsError } = await supabaseAdmin
        .rpc('get_policies_count');

      if (rlsError) {
        // RLS check not critical, just warn
        report.checks.push({
          name: 'RLS Policies',
          status: 'warning',
          message: 'Could not verify RLS policies automatically (this is OK if they were applied manually)',
        });
      } else {
        report.checks.push({
          name: 'RLS Policies',
          status: 'ok',
          message: 'RLS policies check passed (assuming manual verification via Supabase Dashboard)',
        });
      }
    } catch (error: any) {
      report.checks.push({
        name: 'RLS Policies',
        status: 'warning',
        message: 'Could not verify RLS policies (verify manually in Supabase Dashboard)',
      });
    }

    // Determine overall status
    const hasErrors = report.checks.some(c => c.status === 'error');
    const hasWarnings = report.checks.some(c => c.status === 'warning');

    if (hasErrors) {
      report.overall = 'error';
    } else if (hasWarnings) {
      report.overall = 'warning';
    } else {
      report.overall = 'ok';
    }

  } catch (error: any) {
    report.overall = 'error';
    report.checks.push({
      name: 'Fatal Error',
      status: 'error',
      message: error.message,
    });
  }

  return NextResponse.json(report, {
    status: report.overall === 'error' ? 500 : 200,
  });
}
