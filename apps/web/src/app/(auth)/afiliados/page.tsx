'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Eye, Edit } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Afiliado {
  id: string;
  afiliadoId: string | null;
  padrinhoId: string;
  nome: string;
  email: string;
  cpf: string | null;
  dataNascimento: string | null;
  sexo: string | null;
  cidade: string | null;
  uf: string | null;
  nichoAtuacao: string | null;
  telefone: string | null;
  status: string; // "Enviado", "Pendente", "Rejeitado"
  dataCadastro: string;
  dataEmail: string | null;
  padrinhoNome: string;
  padrinhoDataUltimoPagamento: string | null;
}

interface StatsPorDia {
  stats: Array<{ date: string; count: number }>;
  total: number;
  days: number;
}

interface AfiliadosStats {
  total: number;
  byStatus: Record<string, number>;
  pendente: number;
  enviado: number;
  jaCadastrado: number;
  rejeitado: number;
}

async function fetchAfiliados(status?: string, limit?: number): Promise<Afiliado[]> {
  const params = new URLSearchParams();
  if (status && status !== 'TODOS') params.set('status', status);
  if (limit) params.set('limit', limit.toString());

  const url = `/api/afiliados?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch afiliados');
  return res.json();
}

async function fetchStatsPorDia(dias: number = 30): Promise<StatsPorDia> {
  const res = await fetch(`/api/afiliados/stats-por-dia?dias=${dias}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

async function fetchAfiliadosStats(): Promise<AfiliadosStats> {
  const res = await fetch('/api/afiliados/stats');
  if (!res.ok) throw new Error('Failed to fetch afiliados stats');
  return res.json();
}

// Helper function to format dates for input[type="date"]
const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

export default function AfiliadosPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [diasGrafico, setDiasGrafico] = useState(30);
  const [selectedAfiliado, setSelectedAfiliado] = useState<Afiliado | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [limit, setLimit] = useState(100);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    sexo: '',
    cidade: '',
    uf: '',
    nichoAtuacao: '',
    telefone: '',
    status: '',
  });

  const { data: afiliados, isLoading } = useQuery({
    queryKey: ['afiliados', statusFilter, limit],
    queryFn: () => fetchAfiliados(statusFilter, limit),
  });

  const { data: stats } = useQuery({
    queryKey: ['afiliados-stats', diasGrafico],
    queryFn: () => fetchStatsPorDia(diasGrafico),
  });

  const { data: afiliadosStats } = useQuery({
    queryKey: ['afiliados-totals'],
    queryFn: fetchAfiliadosStats,
  });

  const filteredAfiliados = afiliados?.filter((afiliado) =>
    afiliado.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    afiliado.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'destructive' | 'default' | 'secondary'> = {
      'pendente': 'warning',
      'Enviado': 'default',
      'Já Cadastrado': 'success',
      'Rejeitado': 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const handleVer = (afiliado: Afiliado) => {
    setSelectedAfiliado(afiliado);
    setShowDetailsDialog(true);
  };

  const handleEditar = (afiliado: Afiliado) => {
    setSelectedAfiliado(afiliado);
    setFormData({
      nome: afiliado.nome || '',
      email: afiliado.email || '',
      cpf: afiliado.cpf || '',
      dataNascimento: formatDateForInput(afiliado.dataNascimento),
      sexo: afiliado.sexo || '',
      cidade: afiliado.cidade || '',
      uf: afiliado.uf || '',
      nichoAtuacao: afiliado.nichoAtuacao || '',
      telefone: afiliado.telefone || '',
      status: afiliado.status || '',
    });
    setShowEditDialog(true);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    if (!selectedAfiliado) return;

    try {
      const response = await fetch(`/api/afiliados/${selectedAfiliado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar afiliado');
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['afiliados'] });
      setShowEditDialog(false);
      alert('Afiliado atualizado com sucesso!');
    } catch (error: any) {
      alert(`Erro ao salvar: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Afiliados</h1>
        <p className="text-gray-500">
          Gerencie os afiliados cadastrados (status atualizado via n8n workflow)
        </p>
      </div>

      {/* Stats Cards - Totals */}
      <div className="grid gap-4 md:grid-cols-4">

        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Total de Afiliados</div>
          <div className="text-2xl font-bold">{afiliadosStats?.total || 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Pendentes</div>
          <div className="text-2xl font-bold text-yellow-600">{afiliadosStats?.pendente || 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Email Enviado</div>
          <div className="text-2xl font-bold text-blue-600">{afiliadosStats?.enviado || 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Já Cadastrado</div>
          <div className="text-2xl font-bold text-green-600">{afiliadosStats?.jaCadastrado || 0}</div>
        </div>
      </div>

      {/* Stats Cards - Status Breakdown */}
      {afiliadosStats?.byStatus && Object.keys(afiliadosStats.byStatus).length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalhamento por Status</h3>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            {Object.entries(afiliadosStats.byStatus)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium text-gray-700">{status}</span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Chart - Afiliados por Dia */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Afiliados Cadastrados por Dia</h3>
            <p className="text-sm text-gray-500">
              Últimos {diasGrafico} dias • Total: {stats?.total || 0} afiliados
            </p>
          </div>
          <Select value={diasGrafico.toString()} onValueChange={(v) => setDiasGrafico(parseInt(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="14">Últimos 14 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="60">Últimos 60 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {stats && stats.stats.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.stats}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value as string);
                  return date.toLocaleDateString('pt-BR');
                }}
                formatter={(value) => [value, 'Afiliados']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Nenhum afiliado cadastrado nos últimos {diasGrafico} dias
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="Enviado">Email Enviado</SelectItem>
            <SelectItem value="Já Cadastrado">Já Cadastrado</SelectItem>
            <SelectItem value="Rejeitado">Rejeitados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50">50 registros</SelectItem>
            <SelectItem value="100">100 registros</SelectItem>
            <SelectItem value="200">200 registros</SelectItem>
            <SelectItem value="500">500 registros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Padrinho</TableHead>
              <TableHead>Último Pag. Padrinho</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredAfiliados && filteredAfiliados.length > 0 ? (
              filteredAfiliados.map((afiliado) => (
                <TableRow key={afiliado.id}>
                  <TableCell className="font-medium">{afiliado.nome}</TableCell>
                  <TableCell>{afiliado.email}</TableCell>
                  <TableCell>{afiliado.padrinhoNome || 'N/A'}</TableCell>
                  <TableCell>
                    {afiliado.padrinhoDataUltimoPagamento ? (
                      new Date(afiliado.padrinhoDataUltimoPagamento).toLocaleDateString('pt-BR')
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(afiliado.status)}</TableCell>
                  <TableCell>
                    {new Date(afiliado.dataCadastro).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVer(afiliado)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleEditar(afiliado)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  Nenhum afiliado encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredAfiliados && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Mostrando {filteredAfiliados.length} de {afiliados?.length || 0} afiliados
          </div>
        </div>
      )}

      {/* Dialog - Ver Detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Afiliado</DialogTitle>
            <DialogDescription>
              Informações completas do cadastro
            </DialogDescription>
          </DialogHeader>

          {selectedAfiliado && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Nome Completo</div>
                  <div className="text-base font-medium">{selectedAfiliado.nome}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="text-base">{selectedAfiliado.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedAfiliado.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Padrinho</div>
                  <div className="text-base">{selectedAfiliado.padrinhoNome || 'N/A'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Data de Cadastro</div>
                  <div className="text-base">
                    {new Date(selectedAfiliado.dataCadastro).toLocaleString('pt-BR')}
                  </div>
                </div>
                {selectedAfiliado.dataEmail && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Email Enviado em</div>
                    <div className="text-base">
                      {new Date(selectedAfiliado.dataEmail).toLocaleString('pt-BR')}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-md bg-blue-50 p-4 mt-4">
                <p className="text-sm text-blue-900">
                  ℹ️ O status deste afiliado é gerenciado automaticamente pelo workflow n8n.
                  Para modificar o status, utilize o sistema de automação.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog - Editar Afiliado */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Afiliado</DialogTitle>
            <DialogDescription>
              Edite as informações do afiliado cadastrado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Informações Básicas</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => updateFormData('nome', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => updateFormData('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => updateFormData('dataNascimento', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select value={formData.sexo} onValueChange={(v) => updateFormData('sexo', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => updateFormData('telefone', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Localização</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => updateFormData('cidade', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    value={formData.uf}
                    onChange={(e) => updateFormData('uf', e.target.value.toUpperCase())}
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Informações Adicionais</h3>

              <div className="space-y-2">
                <Label htmlFor="nichoAtuacao">Nicho de Atuação</Label>
                <Input
                  id="nichoAtuacao"
                  value={formData.nichoAtuacao}
                  onChange={(e) => updateFormData('nichoAtuacao', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => updateFormData('status', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="Enviado">Email Enviado</SelectItem>
                    <SelectItem value="Já Cadastrado">Já Cadastrado</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
