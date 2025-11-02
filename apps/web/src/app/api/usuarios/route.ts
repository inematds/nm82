import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/usuarios - Listar todos os usuários
export async function GET() {
  try {
    // TEMPORARY: Auth disabled for development
    // TODO: Re-enable after creating admin user
    /*
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRoles = (session.user as any).roles || [];
    if (!userRoles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    */

    // 1. Buscar todos os usuários do Supabase Auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    // 2. Buscar roles de cada usuário
    const usersWithRoles = await Promise.all(
      (authUsers.users || []).map(async (user) => {
        const { data: rolesData } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const roles = rolesData?.map(r => r.role) || [];

        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email,
          roles,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
        };
      })
    );

    return NextResponse.json(usersWithRoles);

  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/usuarios - Criar novo usuário
export async function POST(request: Request) {
  try {
    // TEMPORARY: Auth disabled for development
    /*
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRoles = (session.user as any).roles || [];
    if (!userRoles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    */

    const body = await request.json();
    const { email, password, name, roles } = body;

    // Validações
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos uma role é obrigatória' },
        { status: 400 }
      );
    }

    // Validar roles permitidas
    const validRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
    const invalidRoles = roles.filter(r => !validRoles.includes(r));
    if (invalidRoles.length > 0) {
      return NextResponse.json(
        { error: `Roles inválidas: ${invalidRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        name: name || email,
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { error: 'Erro ao criar usuário', details: authError.message },
        { status: 400 }
      );
    }

    // 2. Criar roles para o usuário
    const roleInserts = roles.map(role => ({
      id: crypto.randomUUID(),
      user_id: authData.user.id,
      role,
    }));

    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .insert(roleInserts);

    if (rolesError) {
      console.error('Error creating user roles:', rolesError);
      // Tentar reverter criação do usuário
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erro ao criar roles do usuário', details: rolesError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name,
        roles,
      },
    });

  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
