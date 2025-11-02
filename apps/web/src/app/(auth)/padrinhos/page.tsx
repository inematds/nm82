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
  const [convitesEnviados, setConvitesEnviados] = useState(0);
  const [convitesUsados, setConvitesUsados] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

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
    padrinho.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    padrinho.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVer = (padrinho: Padrinho) => {
    setSelectedPadrinho(padrinho);
    setShowDetailsDialog(true);
  };

  const handleEditar = (padrinho: Padrinho) => {
    setSelectedPadrinho(padrinho);
    setConvitesEnviados(padrinho.convitesEnviados);
    setConvitesUsados(padrinho.convitesUsados);
    setShowEditDialog(true);
  };

  const handleSalvarConvites = async () => {
    if (!selectedPadrinho) return;

    // Validação
    if (convitesUsados > convitesEnviados) {
      alert('Convites usados não pode ser maior que enviados');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(`/api/padrinhos/${selectedPadrinho.id}/convites`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convitesEnviados, convitesUsados }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar convites');
      }

      alert('Convites atualizados com sucesso!');
      setShowEditDialog(false);
      setSelectedPadrinho(null);

      // Refetch data
      window.location.reload();
    } catch (error: any) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao atualizar convites');
    } finally {
      setIsSaving(false);
    }
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Convites do Padrinho</DialogTitle>
            <DialogDescription>
              Ajustar quantidade de convites enviados e usados
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
                    value={convitesEnviados}
                    onChange={(e) => setConvitesEnviados(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usados">Convites Usados</Label>
                  <Input
                    id="usados"
                    type="number"
                    min="0"
                    max={convitesEnviados}
                    value={convitesUsados}
                    onChange={(e) => setConvitesUsados(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500">
                    Máximo: {convitesEnviados} (enviados)
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-blue-50 p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-600">Enviados</div>
                  <div className="text-xl font-bold text-blue-600">
                    {convitesEnviados}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Usados</div>
                  <div className="text-xl font-bold text-green-600">
                    {convitesUsados}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Disponíveis</div>
                  <div className="text-xl font-bold text-orange-600">
                    {convitesEnviados - convitesUsados}
                  </div>
                </div>
              </div>
            </div>

            {convitesUsados > convitesEnviados && (
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
              onClick={handleSalvarConvites}
              disabled={isSaving || convitesUsados > convitesEnviados}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
