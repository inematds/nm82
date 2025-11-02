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
  nome: string;
  email: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  dataCadastro: string;
  dataAprovacao: string | null;
  padrinhoNome: string;
}

interface StatsPorDia {
  stats: Array<{ date: string; count: number }>;
  total: number;
  days: number;
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

export default function AfiliadosPage() {
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [diasGrafico, setDiasGrafico] = useState(30);
  const [selectedAfiliado, setSelectedAfiliado] = useState<Afiliado | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [limit, setLimit] = useState(100);

  const { data: afiliados, isLoading } = useQuery({
    queryKey: ['afiliados', statusFilter, limit],
    queryFn: () => fetchAfiliados(statusFilter, limit),
  });

  const { data: stats } = useQuery({
    queryKey: ['afiliados-stats', diasGrafico],
    queryFn: () => fetchStatsPorDia(diasGrafico),
  });

  const filteredAfiliados = afiliados?.filter((afiliado) =>
    afiliado.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    afiliado.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals by status
  const total = afiliados?.length || 0;
  const pendentes = afiliados?.filter((a) => a.status === 'PENDENTE').length || 0;
  const aprovados = afiliados?.filter((a) => a.status === 'APROVADO').length || 0;
  const rejeitados = afiliados?.filter((a) => a.status === 'REJEITADO').length || 0;

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDENTE: 'warning' as const,
      APROVADO: 'success' as const,
      REJEITADO: 'destructive' as const,
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  const handleVer = (afiliado: Afiliado) => {
    setSelectedAfiliado(afiliado);
    setShowDetailsDialog(true);
  };

  const handleEditar = (afiliado: Afiliado) => {
    // TODO: Implement edit functionality
    alert(`Editar afiliado: ${afiliado.nome}\n(Funcionalidade em desenvolvimento)`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Afiliados</h1>
        <p className="text-gray-500">
          Gerencie os afiliados cadastrados (status atualizado via n8n workflow)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Total</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Pendentes</div>
          <div className="text-2xl font-bold text-yellow-600">{pendentes}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Aprovados</div>
          <div className="text-2xl font-bold text-green-600">{aprovados}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Rejeitados</div>
          <div className="text-2xl font-bold text-red-600">{rejeitados}</div>
        </div>
      </div>

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
            <SelectItem value="PENDENTE">Pendentes</SelectItem>
            <SelectItem value="APROVADO">Aprovados</SelectItem>
            <SelectItem value="REJEITADO">Rejeitados</SelectItem>
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
              <TableHead>Status</TableHead>
              <TableHead>Data Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredAfiliados && filteredAfiliados.length > 0 ? (
              filteredAfiliados.map((afiliado) => (
                <TableRow key={afiliado.id}>
                  <TableCell className="font-medium">{afiliado.nome}</TableCell>
                  <TableCell>{afiliado.email}</TableCell>
                  <TableCell>{afiliado.padrinhoNome || 'N/A'}</TableCell>
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
                <TableCell colSpan={6} className="text-center text-gray-500">
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
                {selectedAfiliado.dataAprovacao && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Data de Aprovação</div>
                    <div className="text-base">
                      {new Date(selectedAfiliado.dataAprovacao).toLocaleString('pt-BR')}
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
    </div>
  );
}
