import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/usuarios/change-password - Trocar senha
export async function POST(request: Request) {
  try {
    // Obter sessão do usuário logado
    const session = await getServerSession(authOptions);

    // TEMPORARY: Durante desenvolvimento, permitir sem auth se fornecer userId
    // TODO: Remover após ativar autenticação
    let userId: string;
    const body = await request.json();

    if (session) {
      userId = (session.user as any).id;
    } else if (body.userId) {
      // Modo desenvolvimento: aceitar userId no body
      userId = body.userId;
    } else {
      return NextResponse.json(
        { error: 'Unauthorized - É necessário estar logado' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, isAdmin } = body;

    // Validações
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Se for ADMIN trocando senha de outro usuário
    if (isAdmin && body.targetUserId) {
      // Verificar se usuário logado é ADMIN
      const { data: rolesData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const isUserAdmin = rolesData?.some(r => r.role === 'ADMIN');

      if (!isUserAdmin) {
        return NextResponse.json(
          { error: 'Apenas administradores podem alterar senha de outros usuários' },
          { status: 403 }
        );
      }

      // Admin pode alterar senha sem precisar da senha atual
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        body.targetUserId,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Error updating password:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar senha', details: updateError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Senha atualizada com sucesso',
      });
    }

    // Usuário trocando sua própria senha
    // Primeiro, validar a senha atual
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Senha atual é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar email do usuário
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Tentar fazer login com senha atual para validar
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: userData.user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 400 }
      );
    }

    // Atualizar para nova senha
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar senha', details: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso',
    });

  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
