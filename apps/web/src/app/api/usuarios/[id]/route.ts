import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/usuarios/[id] - Buscar usuário específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Buscar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(id);

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar roles do usuário
    const { data: rolesData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', id);

    const roles = rolesData?.map(r => r.role) || [];

    return NextResponse.json({
      id: authUser.user.id,
      email: authUser.user.email,
      name: authUser.user.user_metadata?.name || authUser.user.email,
      roles,
      created_at: authUser.user.created_at,
      last_sign_in_at: authUser.user.last_sign_in_at,
    });

  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/usuarios/[id] - Atualizar usuário
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();
    const { name, roles, email } = body;

    // Atualizar dados do usuário no Auth
    const updateData: any = {};
    if (name) updateData.user_metadata = { name };
    if (email) updateData.email = email;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        updateData
      );

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar usuário', details: updateError.message },
          { status: 400 }
        );
      }
    }

    // Atualizar roles se fornecidas
    if (roles && Array.isArray(roles)) {
      console.log(`🔧 Atualizando roles do usuário ${id}:`, roles);

      // Validar roles
      const validRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
      const invalidRoles = roles.filter(r => !validRoles.includes(r));
      if (invalidRoles.length > 0) {
        return NextResponse.json(
          { error: `Roles inválidas: ${invalidRoles.join(', ')}` },
          { status: 400 }
        );
      }

      // Deletar roles antigas
      console.log(`🗑️ Deletando roles antigas do usuário ${id}`);
      const { error: deleteError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', id);

      if (deleteError) {
        console.error('❌ Erro ao deletar roles antigas:', deleteError);
      }

      // Criar novas roles
      if (roles.length > 0) {
        const roleInserts = roles.map(role => ({
          id: crypto.randomUUID(),
          user_id: id,
          role,
        }));

        console.log(`➕ Inserindo novas roles:`, roleInserts);
        const { error: rolesError } = await supabaseAdmin
          .from('user_roles')
          .insert(roleInserts);

        if (rolesError) {
          console.error('❌ Error updating roles:', rolesError);
          return NextResponse.json(
            { error: 'Erro ao atualizar roles', details: rolesError.message },
            { status: 400 }
          );
        }
        console.log('✅ Roles atualizadas com sucesso');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
    });

  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/usuarios/[id] - Deletar usuário
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // 1. Deletar roles do usuário
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', id);

    // 2. Deletar usuário do Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao deletar usuário', details: deleteError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário deletado com sucesso',
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
