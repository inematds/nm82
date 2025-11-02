'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardMetrics {
  totalPessoasFisicas: number;
  pessoasFisicasAtivas: number;
  pessoasFisicasInativas: number;
  topUFs: Array<{ uf: string; count: number }>;
  totalPadrinhos: number;
  totalAfiliados: number;
  afiliadosPendentes: number;
  afiliadosAprovados: number;
  afiliadosRejeitados: number;
  codigosDisponiveis: number;
  codigosUsados: number;
}

interface UFStats {
  uf: string;
  count: number;
}

interface UltimoAfiliado {
  id: string;
  nome: string;
  email: string;
  localizacao: string;
  padrinhoNome: string;
  padrinhoLocalizacao: string;
  padrinhoDataUltimoPagamento: string | null;
  status: string;
  dataCadastro: string;
}

interface StatsPorDia {
  stats: Array<{ date: string; count: number }>;
  total: number;
  days: number;
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch('/api/dashboard/metrics', {
    credentials: 'include', // Send cookies
  });
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

async function fetchUltimosAfiliados(): Promise<UltimoAfiliado[]> {
  const res = await fetch('/api/dashboard/ultimos-afiliados', {
    credentials: 'include', // Send cookies
  });
  if (!res.ok) throw new Error('Failed to fetch afiliados');
  return res.json();
}

async function fetchAfiliadosPorDia(dias: number): Promise<StatsPorDia> {
  const res = await fetch(`/api/afiliados/stats-por-dia?dias=${dias}`);
  if (!res.ok) throw new Error('Failed to fetch afiliados stats');
  return res.json();
}

async function fetchPadrinhosPorDia(dias: number): Promise<StatsPorDia> {
  const res = await fetch(`/api/dashboard/padrinhos-por-dia?dias=${dias}`);
  if (!res.ok) throw new Error('Failed to fetch padrinhos stats');
  return res.json();
}

async function fetchAfiliadosPorUF(): Promise<UFStats[]> {
  const res = await fetch('/api/dashboard/afiliados-por-uf');
  if (!res.ok) throw new Error('Failed to fetch afiliados por UF');
  return res.json();
}

async function fetchPadrinhosPorUF(): Promise<UFStats[]> {
  const res = await fetch('/api/dashboard/padrinhos-por-uf');
  if (!res.ok) throw new Error('Failed to fetch padrinhos por UF');
  return res.json();
}

// Cores para os gráficos de pizza
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

export default function DashboardPage() {
  const [diasGrafico, setDiasGrafico] = useState(30);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: ultimosAfiliados, isLoading: afiliadosLoading } = useQuery({
    queryKey: ['ultimos-afiliados'],
    queryFn: fetchUltimosAfiliados,
    refetchInterval: 30000,
  });

  const { data: afiliadosStats } = useQuery({
    queryKey: ['afiliados-stats-dashboard', diasGrafico],
    queryFn: () => fetchAfiliadosPorDia(diasGrafico),
  });

  const { data: padrinhosStats } = useQuery({
    queryKey: ['padrinhos-stats-dashboard', diasGrafico],
    queryFn: () => fetchPadrinhosPorDia(diasGrafico),
  });

  const { data: afiliadosPorUF } = useQuery({
    queryKey: ['afiliados-por-uf'],
    queryFn: fetchAfiliadosPorUF,
  });

  const { data: padrinhosPorUF } = useQuery({
    queryKey: ['padrinhos-por-uf'],
    queryFn: fetchPadrinhosPorUF,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">
          Bem-vindo ao sistema de gerenciamento de convites NM82
        </p>
      </div>

      {/* Pessoas Físicas - Linha 0 (TOPO) */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pessoas Físicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metricsLoading ? '-' : metrics?.totalPessoasFisicas || 0}
            </div>
            <p className="text-xs text-gray-500">Cadastradas no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pessoas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metricsLoading ? '-' : metrics?.pessoasFisicasAtivas || 0}
            </div>
            <p className="text-xs text-gray-500">
              {metricsLoading || !metrics?.totalPessoasFisicas
                ? '-'
                : `${Math.round((metrics.pessoasFisicasAtivas / metrics.totalPessoasFisicas) * 100)}%`} do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pessoas Inativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {metricsLoading ? '-' : metrics?.pessoasFisicasInativas || 0}
            </div>
            <p className="text-xs text-gray-500">
              {metricsLoading || !metrics?.totalPessoasFisicas
                ? '-'
                : `${Math.round((metrics.pessoasFisicasInativas / metrics.totalPessoasFisicas) * 100)}%`} do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top 5 Localizações (UF)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading || !metrics?.topUFs || metrics.topUFs.length === 0 ? (
              <p className="text-sm text-gray-500">Carregando...</p>
            ) : (
              <div className="space-y-1">
                {metrics.topUFs.map((item, idx) => (
                  <div key={item.uf} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {idx + 1}. {item.uf}
                    </span>
                    <span className="text-gray-600">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metrics Cards - Linha 1 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Padrinhos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '-' : metrics?.totalPadrinhos || 0}
            </div>
            <p className="text-xs text-gray-500">Usuários ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Afiliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '-' : metrics?.totalAfiliados || 0}
            </div>
            <p className="text-xs text-gray-500">Cadastros realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Códigos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metricsLoading ? '-' : metrics?.codigosDisponiveis || 0}
            </div>
            <p className="text-xs text-gray-500">Prontos para uso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Códigos Usados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metricsLoading ? '-' : metrics?.codigosUsados || 0}
            </div>
            <p className="text-xs text-gray-500">Já utilizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Afiliados - Linha 2 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Afiliados Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metricsLoading ? '-' : metrics?.afiliadosPendentes || 0}
            </div>
            <p className="text-xs text-gray-500">
              {metricsLoading || !metrics?.totalAfiliados
                ? '-'
                : `${Math.round((metrics.afiliadosPendentes / metrics.totalAfiliados) * 100)}%`} do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Afiliados Aprovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metricsLoading ? '-' : metrics?.afiliadosAprovados || 0}
            </div>
            <p className="text-xs text-gray-500">
              {metricsLoading || !metrics?.totalAfiliados
                ? '-'
                : `${Math.round((metrics.afiliadosAprovados / metrics.totalAfiliados) * 100)}%`} do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Afiliados Rejeitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metricsLoading ? '-' : metrics?.afiliadosRejeitados || 0}
            </div>
            <p className="text-xs text-gray-500">
              {metricsLoading || !metrics?.totalAfiliados
                ? '-'
                : `${Math.round((metrics.afiliadosRejeitados / metrics.totalAfiliados) * 100)}%`} do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Afiliados por Dia */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Afiliados Cadastrados por Dia</CardTitle>
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
            <p className="text-sm text-gray-500">
              Total: {afiliadosStats?.total || 0} afiliados nos últimos {diasGrafico} dias
            </p>
          </CardHeader>
          <CardContent>
            {afiliadosStats && afiliadosStats.stats.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={afiliadosStats.stats}>
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
                    dot={{ fill: '#10b981', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                Nenhum afiliado nos últimos {diasGrafico} dias
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pessoas Cadastradas por Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Pessoas Cadastradas por Dia</CardTitle>
            <p className="text-sm text-gray-500">
              Total: {padrinhosStats?.total || 0} pessoas nos últimos {diasGrafico} dias
            </p>
          </CardHeader>
          <CardContent>
            {padrinhosStats && padrinhosStats.stats.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={padrinhosStats.stats}>
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
                    formatter={(value) => [value, 'Pessoas']}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                Nenhuma pessoa nos últimos {diasGrafico} dias
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Pizza - Distribuição por Estado */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Afiliados por UF */}
        <Card>
          <CardHeader>
            <CardTitle>Afiliados por Estado (Top 10)</CardTitle>
            <p className="text-sm text-gray-500">
              Distribuição geográfica dos afiliados
            </p>
          </CardHeader>
          <CardContent>
            {afiliadosPorUF && afiliadosPorUF.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={afiliadosPorUF}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ uf, percent }) => `${uf} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {afiliadosPorUF.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} afiliados`, 'Total']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-5 gap-2 mt-4 w-full">
                  {afiliadosPorUF.slice(0, 10).map((item, index) => (
                    <div key={item.uf} className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs font-medium">{item.uf}</span>
                      <span className="text-xs text-gray-500">({item.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Sem dados de localização
              </div>
            )}
          </CardContent>
        </Card>

        {/* Padrinhos por UF */}
        <Card>
          <CardHeader>
            <CardTitle>Padrinhos por Estado (Top 10)</CardTitle>
            <p className="text-sm text-gray-500">
              Distribuição geográfica dos padrinhos
            </p>
          </CardHeader>
          <CardContent>
            {padrinhosPorUF && padrinhosPorUF.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={padrinhosPorUF}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ uf, percent }) => `${uf} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {padrinhosPorUF.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} padrinhos`, 'Total']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-5 gap-2 mt-4 w-full">
                  {padrinhosPorUF.slice(0, 10).map((item, index) => (
                    <div key={item.uf} className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs font-medium">{item.uf}</span>
                      <span className="text-xs text-gray-500">({item.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Sem dados de localização
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Últimos Afiliados */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Afiliados Cadastrados</CardTitle>
          <p className="text-sm text-gray-500">
            Últimos 10 afiliados com informações de padrinho e localização
          </p>
        </CardHeader>
        <CardContent>
          {afiliadosLoading ? (
            <p className="text-sm text-gray-500">Carregando...</p>
          ) : ultimosAfiliados && ultimosAfiliados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-2 font-medium text-gray-700">Afiliado</th>
                    <th className="pb-2 font-medium text-gray-700">Localização</th>
                    <th className="pb-2 font-medium text-gray-700">Data Cadastro</th>
                    <th className="pb-2 font-medium text-gray-700">Padrinho</th>
                    <th className="pb-2 font-medium text-gray-700">Últ. Pag. Padrinho</th>
                    <th className="pb-2 font-medium text-gray-700 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosAfiliados.map((afiliado) => (
                    <tr key={afiliado.id} className="border-b last:border-0">
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{afiliado.nome}</p>
                        <p className="text-xs text-gray-500">{afiliado.email}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-gray-700">{afiliado.localizacao}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-gray-700">
                          {afiliado.dataCadastro
                            ? new Date(afiliado.dataCadastro).toLocaleDateString('pt-BR')
                            : '-'}
                        </p>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{afiliado.padrinhoNome}</p>
                        {afiliado.padrinhoLocalizacao && (
                          <p className="text-xs text-gray-500">{afiliado.padrinhoLocalizacao}</p>
                        )}
                      </td>
                      <td className="py-3">
                        <p className="text-gray-700">
                          {afiliado.padrinhoDataUltimoPagamento
                            ? new Date(afiliado.padrinhoDataUltimoPagamento).toLocaleDateString('pt-BR')
                            : '-'}
                        </p>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded ${
                            afiliado.status === 'APROVADO'
                              ? 'bg-green-100 text-green-800'
                              : afiliado.status === 'PENDENTE'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {afiliado.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum afiliado cadastrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
