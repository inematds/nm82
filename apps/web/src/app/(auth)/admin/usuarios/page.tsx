'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Edit, Trash2, Key, X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
}

interface UserFormData {
  email: string;
  password: string;
  name: string;
  roles: string[];
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function UsuariosPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    name: '',
    roles: [],
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await fetch('/api/usuarios');
      if (!response.ok) throw new Error('Erro ao buscar usuários');
      return response.json();
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setIsCreateDialogOpen(false);
      setFormData({ email: '', password: '', name: '', roles: [] });
      setSuccess('Usuário criado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFormData> }) => {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ email: '', password: '', name: '', roles: [] });
      setSuccess('Usuário atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setSuccess('Usuário deletado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { userId?: string; currentPassword?: string; newPassword: string; isAdmin?: boolean; targetUserId?: string }) => {
      const response = await fetch('/api/usuarios/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao alterar senha');
      }

      return response.json();
    },
    onSuccess: () => {
      setIsPasswordDialogOpen(false);
      setSelectedUser(null);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Senha alterada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    },
  });

  const handleCreateUser = () => {
    setError('');
    if (!formData.email || !formData.password || formData.roles.length === 0) {
      setError('Email, senha e pelo menos uma role são obrigatórios');
      return;
    }
    createUserMutation.mutate(formData);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      roles: user.roles,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    setError('');
    if (!selectedUser) return;

    updateUserMutation.mutate({
      id: selectedUser.id,
      data: {
        name: formData.name,
        email: formData.email,
        roles: formData.roles,
      },
    });
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Tem certeza que deseja deletar o usuário ${user.email}?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handlePasswordChange = (user: User) => {
    setSelectedUser(user);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsPasswordDialogOpen(true);
  };

  const handleChangePassword = () => {
    setError('');

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    // Admin pode resetar senha de qualquer usuário sem precisar da senha atual
    changePasswordMutation.mutate({
      isAdmin: true,
      targetUserId: selectedUser?.id,
      newPassword: passwordData.newPassword,
    });
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'EDITOR':
        return 'bg-blue-100 text-blue-800';
      case 'VIEWER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'EDITOR':
        return 'Editor';
      case 'VIEWER':
        return 'Visualizador';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários do Sistema</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-medium text-gray-700">Nome</th>
                    <th className="pb-3 font-medium text-gray-700">Email</th>
                    <th className="pb-3 font-medium text-gray-700">Roles</th>
                    <th className="pb-3 font-medium text-gray-700">Criado em</th>
                    <th className="pb-3 font-medium text-gray-700 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{user.name}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-gray-700">{user.email}</p>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span
                                key={role}
                                className={`inline-block text-xs px-2 py-1 rounded ${getRoleBadgeColor(
                                  role
                                )}`}
                              >
                                {getRoleLabel(role)}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">Sem permissões</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePasswordChange(user)}
                            title="Alterar senha"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                            title="Editar usuário"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user)}
                            title="Deletar usuário"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Nome</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome do usuário"
              />
            </div>

            <div>
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="create-password">Senha *</Label>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div>
              <Label>Permissões *</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('ADMIN')}
                    onChange={() => toggleRole('ADMIN')}
                    className="rounded"
                  />
                  <span className="text-sm">Administrador (acesso total)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('EDITOR')}
                    onChange={() => toggleRole('EDITOR')}
                    className="rounded"
                  />
                  <span className="text-sm">Editor (pode editar dados)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('VIEWER')}
                    onChange={() => toggleRole('VIEWER')}
                    className="rounded"
                  />
                  <span className="text-sm">Visualizador (apenas leitura)</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setFormData({ email: '', password: '', name: '', roles: [] });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize os dados do usuário
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Permissões</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('ADMIN')}
                    onChange={() => toggleRole('ADMIN')}
                    className="rounded"
                  />
                  <span className="text-sm">Administrador (acesso total)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('EDITOR')}
                    onChange={() => toggleRole('EDITOR')}
                    className="rounded"
                  />
                  <span className="text-sm">Editor (pode editar dados)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('VIEWER')}
                    onChange={() => toggleRole('VIEWER')}
                    className="rounded"
                  />
                  <span className="text-sm">Visualizador (apenas leitura)</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                setFormData({ email: '', password: '', name: '', roles: [] });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Alterar senha de {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                placeholder="Digite a senha novamente"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setSelectedUser(null);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
