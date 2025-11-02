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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Codigo {
  id: string;
  codigo: string;
  email: string | null;
  usado: boolean;
  data_atribuicao: string | null;
  created_at: string;
}

interface StatsPorDia {
  stats: Array<{ date: string; count: number }>;
  total: number;
  days: number;
}

async function fetchCodigos(status?: string, limit?: number): Promise<Codigo[]> {
  const params = new URLSearchParams();
  if (status && status !== 'TODOS') params.set('status', status);
  if (limit) params.set('limit', limit.toString());

  const url = `/api/codigos?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch códigos');
  return res.json();
}

async function fetchStatsPorDia(dias: number = 30): Promise<StatsPorDia> {
  const res = await fetch(`/api/codigos/stats-por-dia?dias=${dias}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export default function CodigosPage() {
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGerarDialog, setShowGerarDialog] = useState(false);
  const [quantidadeGerar, setQuantidadeGerar] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [diasGrafico, setDiasGrafico] = useState(30);
  const [limit, setLimit] = useState(100);

  const { data: codigos, isLoading, refetch } = useQuery({
    queryKey: ['codigos', statusFilter, limit],
    queryFn: () => fetchCodigos(statusFilter, limit),
  });

  const { data: stats } = useQuery({
    queryKey: ['codigos-stats', diasGrafico],
    queryFn: () => fetchStatsPorDia(diasGrafico),
  });

  const filteredCodigos = codigos?.filter((codigo) =>
    codigo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (codigo.email && codigo.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleGerarCodigos = async () => {
    if (quantidadeGerar < 1 || quantidadeGerar > 1000) {
      alert('Quantidade deve estar entre 1 e 1000');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/codigos/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade: quantidadeGerar }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao gerar códigos');
      }

      const result = await res.json();
      alert(result.message);

      setShowGerarDialog(false);
      setQuantidadeGerar(10);
      refetch();
    } catch (error: any) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao gerar códigos');
    } finally {
      setIsGenerating(false);
    }
  };

  const usados = codigos?.filter((c) => c.usado).length || 0;
  const disponiveis = codigos?.filter((c) => !c.usado).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Códigos de Convite</h1>
          <p className="text-gray-500">
            Gerencie os códigos para acesso ao grupo Telegram
          </p>
        </div>

        <Button onClick={() => setShowGerarDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Gerar Códigos
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Total</div>
          <div className="text-2xl font-bold">{codigos?.length || 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Disponíveis</div>
          <div className="text-2xl font-bold text-green-600">{disponiveis}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Usados</div>
          <div className="text-2xl font-bold text-gray-600">{usados}</div>
        </div>
      </div>

      {/* Chart - Códigos Usados por Dia */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Códigos Usados por Dia</h3>
            <p className="text-sm text-gray-500">
              Últimos {diasGrafico} dias • Total: {stats?.total || 0} códigos usados
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
                formatter={(value) => [value, 'Códigos']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Nenhum código usado nos últimos {diasGrafico} dias
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por código ou email..."
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
            <SelectItem value="disponivel">Disponíveis</SelectItem>
            <SelectItem value="usado">Usados</SelectItem>
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
              <TableHead>Código</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email Vinculado</TableHead>
              <TableHead>Data de Uso</TableHead>
              <TableHead>Atualizado Em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredCodigos && filteredCodigos.length > 0 ? (
              filteredCodigos.map((codigo) => (
                <TableRow key={codigo.id}>
                  <TableCell className="font-mono font-medium">
                    {codigo.codigo}
                  </TableCell>
                  <TableCell>
                    <Badge variant={codigo.usado ? 'secondary' : 'success'}>
                      {codigo.usado ? 'Usado' : 'Disponível'}
                    </Badge>
                  </TableCell>
                  <TableCell>{codigo.email || '-'}</TableCell>
                  <TableCell>
                    {codigo.data_atribuicao
                      ? new Date(codigo.data_atribuicao).toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {codigo.created_at
                      ? new Date(codigo.created_at).toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  Nenhum código encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredCodigos && (
        <div className="text-sm text-gray-500">
          Mostrando {filteredCodigos.length} de {codigos?.length || 0} códigos
        </div>
      )}

      {/* Dialog - Gerar Códigos */}
      <Dialog open={showGerarDialog} onOpenChange={setShowGerarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Códigos em Lote</DialogTitle>
            <DialogDescription>
              Gere múltiplos códigos de convite de uma vez
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade de Códigos</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                max="1000"
                value={quantidadeGerar}
                onChange={(e) => setQuantidadeGerar(parseInt(e.target.value) || 10)}
              />
              <p className="text-xs text-gray-500">
                Máximo: 1000 códigos por vez
              </p>
            </div>

            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm">
                Serão gerados <strong>{quantidadeGerar}</strong> códigos únicos
                de 8 caracteres (letras e números).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGerarDialog(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGerarCodigos}
              disabled={isGenerating}
            >
              {isGenerating ? 'Gerando...' : 'Gerar Códigos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
