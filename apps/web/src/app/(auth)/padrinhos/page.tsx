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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Edit } from 'lucide-react';

interface Padrinho {
  id: string;
  nome: string;
  email: string;
  cidade: string | null;
  uf: string | null;
  nicho_atuacao: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  sexo: string | null;
  ativo: boolean;
  convitesEnviados: number;
  convitesUsados: number;
  convitesDisponiveis: number;
  totalAfiliados: number;
  afiliadosPendentes: number;
  afiliadosAprovados: number;
  afiliadosRejeitados: number;
  createdAt: string;
  // Campos financeiros e administrativos
  tipo_assinatura: string | null;
  valor_ultimo_pagamento: number | null;
  data_ultimo_pagamento: string | null;
  data_vencimento: string | null;
  data_primeiro_contato: string | null;
  data_ultimo_envio: string | null;
  cartao: boolean;
  escolaridade: string | null;
}

interface PadrinhosStats {
  totalPadrinhos: number;
  convites: {
    enviados: number;
    usados: number;
    disponiveis: number;
  };
  afiliados: {
    total: number;
    pendentes: number;
    aprovados: number;
    rejeitados: number;
  };
}

interface AfiliadoDoPadrinho {
  id: string;
  nome: string;
  email: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  dataCadastro: string;
  dataAprovacao: string | null;
}

async function fetchPadrinhos(limit: number): Promise<Padrinho[]> {
  const res = await fetch(`/api/padrinhos?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch padrinhos');
  return res.json();
}

async function fetchPadrinhosStats(): Promise<PadrinhosStats> {
  const res = await fetch('/api/padrinhos/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

async function fetchAfiliadosDoPadrinho(padrinhoId: string): Promise<AfiliadoDoPadrinho[]> {
  const res = await fetch(`/api/padrinhos/${padrinhoId}/afiliados`);
  if (!res.ok) throw new Error('Failed to fetch afiliados');
  return res.json();
}

export default function PadrinhosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPadrinho, setSelectedPadrinho] = useState<Padrinho | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [limit, setLimit] = useState(100);
  const [isSaving, setIsSaving] = useState(false);

  // Form state para edição
  const [formData, setFormData] = useState({
    convitesEnviados: 0,
    convitesUsados: 0,
    tipo_assinatura: '',
    valor_ultimo_pagamento: '',
    data_ultimo_pagamento: '',
    data_vencimento: '',
    data_primeiro_contato: '',
    data_ultimo_envio: '',
    cartao: false,
    escolaridade: '',
  });

  const { data: padrinhos, isLoading } = useQuery({
    queryKey: ['padrinhos', limit],
    queryFn: () => fetchPadrinhos(limit),
  });

  const { data: stats } = useQuery({
    queryKey: ['padrinhos-stats'],
    queryFn: fetchPadrinhosStats,
  });

  const { data: afiliadosDoPadrinho, isLoading: isLoadingAfiliados } = useQuery({
    queryKey: ['afiliados-padrinho', selectedPadrinho?.id],
    queryFn: () => selectedPadrinho ? fetchAfiliadosDoPadrinho(selectedPadrinho.id) : Promise.resolve([]),
    enabled: !!selectedPadrinho && showDetailsDialog,
  });

  const filteredPadrinhos = padrinhos?.filter((padrinho) =>
    padrinho.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    padrinho.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVer = (padrinho: Padrinho) => {
    setSelectedPadrinho(padrinho);
    setShowDetailsDialog(true);
  };

  // Helper function to format dates for input[type="date"]
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      // Extract just the date part (YYYY-MM-DD) from ISO string or timestamp
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

  const handleEditar = (padrinho: Padrinho) => {
    setSelectedPadrinho(padrinho);
    setFormData({
      convitesEnviados: padrinho.convitesEnviados || 0,
      convitesUsados: padrinho.convitesUsados || 0,
      tipo_assinatura: padrinho.tipo_assinatura || '',
      valor_ultimo_pagamento: padrinho.valor_ultimo_pagamento?.toString() || '',
      data_ultimo_pagamento: formatDateForInput(padrinho.data_ultimo_pagamento),
      data_vencimento: formatDateForInput(padrinho.data_vencimento),
      data_primeiro_contato: formatDateForInput(padrinho.data_primeiro_contato),
      data_ultimo_envio: formatDateForInput(padrinho.data_ultimo_envio),
      cartao: padrinho.cartao || false,
      escolaridade: padrinho.escolaridade || '',
    });
    setShowEditDialog(true);
  };

  const handleSalvar = async () => {
    if (!selectedPadrinho) return;

    // Validação
    if (formData.convitesUsados > formData.convitesEnviados) {
      alert('Convites usados não pode ser maior que enviados');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(`/api/padrinhos/${selectedPadrinho.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          convitesEnviados: formData.convitesEnviados,
          convitesUsados: formData.convitesUsados,
          tipo_assinatura: formData.tipo_assinatura || null,
          valor_ultimo_pagamento: formData.valor_ultimo_pagamento ? parseFloat(formData.valor_ultimo_pagamento) : null,
          data_ultimo_pagamento: formData.data_ultimo_pagamento || null,
          data_vencimento: formData.data_vencimento || null,
          data_primeiro_contato: formData.data_primeiro_contato || null,
          data_ultimo_envio: formData.data_ultimo_envio || null,
          cartao: formData.cartao,
          escolaridade: formData.escolaridade || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar padrinho');
      }

      alert('Padrinho atualizado com sucesso!');
      setShowEditDialog(false);
      setSelectedPadrinho(null);

      // Refetch data
      window.location.reload();
    } catch (error: any) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao atualizar padrinho');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Padrinhos</h1>
        <p className="text-gray-500">
          Gerencie os padrinhos e acompanhe suas estatísticas de convites
        </p>
      </div>

      {/* Stats Cards - General */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Total Padrinhos</div>
          <div className="text-2xl font-bold">{stats?.totalPadrinhos || 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Convites Enviados</div>
          <div className="text-2xl font-bold text-blue-600">{stats?.convites.enviados || 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Convites Usados</div>
          <div className="text-2xl font-bold text-green-600">{stats?.convites.usados || 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Convites Disponíveis</div>
          <div className="text-2xl font-bold text-orange-600">{stats?.convites.disponiveis || 0}</div>
        </div>
      </div>

      {/* Stats Cards - Afiliados */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Total Afiliados</div>
          <div className="text-2xl font-bold">{stats?.afiliados.total || 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Pendentes</div>
          <div className="text-2xl font-bold text-yellow-600">{stats?.afiliados.pendentes || 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Aprovados</div>
          <div className="text-2xl font-bold text-green-600">{stats?.afiliados.aprovados || 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Rejeitados</div>
          <div className="text-2xl font-bold text-red-600">{stats?.afiliados.rejeitados || 0}</div>
        </div>
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
              <TableHead>Localização</TableHead>
              <TableHead className="text-center">Enviados</TableHead>
              <TableHead className="text-center">Usados</TableHead>
              <TableHead className="text-center">Disponíveis</TableHead>
              <TableHead className="text-center">Afiliados</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredPadrinhos && filteredPadrinhos.length > 0 ? (
              filteredPadrinhos.map((padrinho) => (
                <TableRow key={padrinho.id}>
                  <TableCell className="font-medium">
                    {padrinho.nome}
                    {!padrinho.ativo && (
                      <Badge variant="secondary" className="ml-2">
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{padrinho.email}</TableCell>
                  <TableCell>
                    {padrinho.cidade && padrinho.uf
                      ? `${padrinho.cidade}, ${padrinho.uf}`
                      : padrinho.cidade || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {padrinho.convitesEnviados}
                  </TableCell>
                  <TableCell className="text-center">
                    {padrinho.convitesUsados}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={padrinho.convitesDisponiveis > 0 ? 'success' : 'secondary'}
                    >
                      {padrinho.convitesDisponiveis}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-medium">{padrinho.totalAfiliados}</span>
                      <div className="text-xs text-gray-500 flex gap-2">
                        {padrinho.afiliadosPendentes > 0 && (
                          <span className="text-yellow-600">
                            {padrinho.afiliadosPendentes}P
                          </span>
                        )}
                        {padrinho.afiliadosAprovados > 0 && (
                          <span className="text-green-600">
                            {padrinho.afiliadosAprovados}A
                          </span>
                        )}
                        {padrinho.afiliadosRejeitados > 0 && (
                          <span className="text-red-600">
                            {padrinho.afiliadosRejeitados}R
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVer(padrinho)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleEditar(padrinho)}
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
                <TableCell colSpan={8} className="text-center text-gray-500">
                  Nenhum padrinho encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredPadrinhos && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Mostrando {filteredPadrinhos.length} de {padrinhos?.length || 0} padrinhos
          </div>
        </div>
      )}

      {/* Dialog - Ver Detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Padrinho</DialogTitle>
            <DialogDescription>
              Informações completas do padrinho e suas estatísticas
            </DialogDescription>
          </DialogHeader>

          {selectedPadrinho && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Nome Completo</div>
                  <div className="text-base font-medium">{selectedPadrinho.nome}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="text-base">{selectedPadrinho.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Localização</div>
                  <div className="text-base">
                    {selectedPadrinho.cidade && selectedPadrinho.uf
                      ? `${selectedPadrinho.cidade}, ${selectedPadrinho.uf}`
                      : selectedPadrinho.cidade || 'Não informado'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="mt-1">
                    <Badge variant={selectedPadrinho.ativo ? 'success' : 'secondary'}>
                      {selectedPadrinho.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Estatísticas de Convites</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <div className="text-xs text-gray-600">Enviados</div>
                    <div className="text-xl font-bold text-blue-600">
                      {selectedPadrinho.convitesEnviados}
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="text-xs text-gray-600">Usados</div>
                    <div className="text-xl font-bold text-green-600">
                      {selectedPadrinho.convitesUsados}
                    </div>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-3">
                    <div className="text-xs text-gray-600">Disponíveis</div>
                    <div className="text-xl font-bold text-orange-600">
                      {selectedPadrinho.convitesDisponiveis}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Estatísticas de Afiliados</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Total</div>
                    <div className="text-xl font-bold">
                      {selectedPadrinho.totalAfiliados}
                    </div>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-3">
                    <div className="text-xs text-gray-600">Pendentes</div>
                    <div className="text-xl font-bold text-yellow-600">
                      {selectedPadrinho.afiliadosPendentes}
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="text-xs text-gray-600">Aprovados</div>
                    <div className="text-xl font-bold text-green-600">
                      {selectedPadrinho.afiliadosAprovados}
                    </div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <div className="text-xs text-gray-600">Rejeitados</div>
                    <div className="text-xl font-bold text-red-600">
                      {selectedPadrinho.afiliadosRejeitados}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Afiliados */}
              {selectedPadrinho.totalAfiliados > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">
                    Lista de Afiliados ({selectedPadrinho.totalAfiliados})
                  </h4>
                  {isLoadingAfiliados ? (
                    <div className="text-center text-gray-500 py-4">
                      Carregando afiliados...
                    </div>
                  ) : afiliadosDoPadrinho && afiliadosDoPadrinho.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {afiliadosDoPadrinho.map((afiliado) => (
                            <TableRow key={afiliado.id}>
                              <TableCell className="font-medium">{afiliado.nome}</TableCell>
                              <TableCell className="text-sm">{afiliado.email}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    afiliado.status === 'APROVADO'
                                      ? 'success'
                                      : afiliado.status === 'PENDENTE'
                                      ? 'warning'
                                      : 'destructive'
                                  }
                                >
                                  {afiliado.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(afiliado.dataCadastro).toLocaleDateString('pt-BR')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Nenhum afiliado encontrado
                    </div>
                  )}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="text-sm font-medium text-gray-500">Data de Cadastro</div>
                <div className="text-base">
                  {new Date(selectedPadrinho.createdAt).toLocaleString('pt-BR')}
                </div>
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

      {/* Dialog - Editar Convites */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Padrinho</DialogTitle>
            <DialogDescription>
              Editar todos os dados do padrinho
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Informações do Padrinho */}
            {selectedPadrinho && (
              <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">👤</span>
                  Dados do Padrinho
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Nome:</span>
                    <p className="font-medium text-gray-900">{selectedPadrinho.nome}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium text-gray-900">{selectedPadrinho.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">CPF:</span>
                    <p className="font-medium text-gray-900">
                      {selectedPadrinho.cpf || 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Nicho de Atuação:</span>
                    <p className="font-medium text-gray-900">
                      {selectedPadrinho.nicho_atuacao || 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Localização:</span>
                    <p className="font-medium text-gray-900">
                      {selectedPadrinho.cidade && selectedPadrinho.uf
                        ? `${selectedPadrinho.cidade}, ${selectedPadrinho.uf}`
                        : selectedPadrinho.cidade || 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="font-medium">
                      <Badge variant={selectedPadrinho.ativo ? 'success' : 'secondary'}>
                        {selectedPadrinho.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total de Afiliados:</span>
                    <p className="font-medium text-gray-900">
                      {selectedPadrinho.totalAfiliados}
                      {selectedPadrinho.totalAfiliados > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({selectedPadrinho.afiliadosPendentes}P {selectedPadrinho.afiliadosAprovados}A {selectedPadrinho.afiliadosRejeitados}R)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cadastrado em:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedPadrinho.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Campos de Edição */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Editar Convites</h4>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="enviados">Convites Enviados</Label>
                  <Input
                    id="enviados"
                    type="number"
                    min="0"
                    value={formData.convitesEnviados}
                    onChange={(e) => updateFormData('convitesEnviados', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usados">Convites Usados</Label>
                  <Input
                    id="usados"
                    type="number"
                    min="0"
                    max={formData.convitesEnviados}
                    value={formData.convitesUsados}
                    onChange={(e) => updateFormData('convitesUsados', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500">
                    Máximo: {formData.convitesEnviados} (enviados)
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-blue-50 p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-600">Enviados</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formData.convitesEnviados}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Usados</div>
                  <div className="text-xl font-bold text-green-600">
                    {formData.convitesUsados}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Disponíveis</div>
                  <div className="text-xl font-bold text-orange-600">
                    {formData.convitesEnviados - formData.convitesUsados}
                  </div>
                </div>
              </div>
            </div>

            {/* Dados Financeiros e Administrativos */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Dados Financeiros</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_assinatura">Tipo de Assinatura</Label>
                  <Select
                    value={formData.tipo_assinatura || undefined}
                    onValueChange={(v) => updateFormData('tipo_assinatura', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_ultimo_pagamento">Valor Último Pagamento (R$)</Label>
                  <Input
                    id="valor_ultimo_pagamento"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_ultimo_pagamento}
                    onChange={(e) => updateFormData('valor_ultimo_pagamento', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_ultimo_pagamento">Data Último Pagamento</Label>
                  <Input
                    id="data_ultimo_pagamento"
                    type="date"
                    value={formData.data_ultimo_pagamento}
                    onChange={(e) => updateFormData('data_ultimo_pagamento', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => updateFormData('data_vencimento', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cartao">Possui Cartão</Label>
                  <Select
                    value={formData.cartao.toString()}
                    onValueChange={(v) => updateFormData('cartao', v === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Datas Administrativas */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Datas Administrativas</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_primeiro_contato">Data Primeiro Contato</Label>
                  <Input
                    id="data_primeiro_contato"
                    type="date"
                    value={formData.data_primeiro_contato}
                    onChange={(e) => updateFormData('data_primeiro_contato', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_ultimo_envio">Data Último Envio</Label>
                  <Input
                    id="data_ultimo_envio"
                    type="date"
                    value={formData.data_ultimo_envio}
                    onChange={(e) => updateFormData('data_ultimo_envio', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Outros Dados */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Outros Dados</h4>

              <div className="space-y-2">
                <Label htmlFor="escolaridade">Escolaridade</Label>
                <Select
                  value={formData.escolaridade || undefined}
                  onValueChange={(v) => updateFormData('escolaridade', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fundamental">Ensino Fundamental</SelectItem>
                    <SelectItem value="Médio">Ensino Médio</SelectItem>
                    <SelectItem value="Superior">Ensino Superior</SelectItem>
                    <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                    <SelectItem value="Mestrado">Mestrado</SelectItem>
                    <SelectItem value="Doutorado">Doutorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.convitesUsados > formData.convitesEnviados && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                ⚠️ Convites usados não pode ser maior que enviados
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              disabled={isSaving || formData.convitesUsados > formData.convitesEnviados}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
