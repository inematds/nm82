import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * API de logout forçado
 * Limpa todos os cookies de sessão
 *
 * Acesse: http://localhost:3000/api/force-logout
 */
export async function GET() {
  try {
    const cookieStore = cookies();

    // Lista de cookies do NextAuth que precisam ser deletados
    const authCookies = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
    ];

    // Deletar todos os cookies de autenticação
    authCookies.forEach(cookieName => {
      cookieStore.delete(cookieName);
    });

    // Retornar HTML com redirect automático
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Logout Forçado</title>
  <meta http-equiv="refresh" content="2;url=/auth/login">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f3f4f6;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 { margin: 0 0 1rem; color: #059669; }
    p { color: #6b7280; margin: 0; }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 1.5rem auto;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #059669;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✅ Logout Realizado!</h1>
    <div class="spinner"></div>
    <p>Redirecionando para login...</p>
    <p style="margin-top: 1rem; font-size: 0.875rem;">
      Se não redirecionar automaticamente,
      <a href="/auth/login" style="color: #059669;">clique aqui</a>
    </p>
  </div>
  <script>
    // Limpar tudo do lado do cliente também
    localStorage.clear();
    sessionStorage.clear();

    // Redirecionar depois de 2 segundos
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 2000);
  </script>
</body>
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          // Limpar cache
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao fazer logout forçado:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer logout', details: String(error) },
      { status: 500 }
    );
  }
}
