/**
 * Sistema de Permissões
 *
 * Roles disponíveis:
 * - ADMIN: Acesso total (criar, ler, editar, deletar tudo)
 * - EDITOR: Pode ler e editar dados (exceto gerenciar usuários)
 * - VIEWER: Apenas leitura (não pode editar nada)
 */

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface UserPermissions {
  roles: Role[];
}

/**
 * Verifica se o usuário tem pelo menos uma das roles especificadas
 */
export function hasRole(userRoles: string[], requiredRoles: Role[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Verifica se o usuário é ADMIN
 */
export function isAdmin(userRoles: string[]): boolean {
  return userRoles.includes('ADMIN');
}

/**
 * Verifica se o usuário pode editar dados
 */
export function canEdit(userRoles: string[]): boolean {
  return hasRole(userRoles, ['ADMIN', 'EDITOR']);
}

/**
 * Verifica se o usuário pode apenas visualizar
 */
export function isViewer(userRoles: string[]): boolean {
  return userRoles.includes('VIEWER') && !canEdit(userRoles);
}

/**
 * Verifica se o usuário pode gerenciar usuários
 */
export function canManageUsers(userRoles: string[]): boolean {
  return isAdmin(userRoles);
}

/**
 * Verifica se o usuário pode acessar área administrativa
 */
export function canAccessAdmin(userRoles: string[]): boolean {
  return isAdmin(userRoles);
}

/**
 * Retorna mensagem de erro baseada na permissão
 */
export function getPermissionErrorMessage(action: 'edit' | 'delete' | 'create' | 'admin'): string {
  const messages = {
    edit: 'Você não tem permissão para editar este item',
    delete: 'Você não tem permissão para deletar este item',
    create: 'Você não tem permissão para criar novos itens',
    admin: 'Apenas administradores podem acessar esta funcionalidade',
  };
  return messages[action];
}

/**
 * Aplica filtro em APIs baseado nas permissões do usuário
 * ADMIN e EDITOR veem tudo
 * VIEWER vê apenas dados ativos
 */
export function applyPermissionFilter(userRoles: string[]) {
  if (canEdit(userRoles)) {
    return {}; // Sem filtro - vê tudo
  }

  // VIEWER vê apenas dados ativos
  return { ativo: true };
}
