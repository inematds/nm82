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
import { Search, Edit } from 'lucide-react';

interface PessoaFisica {
  id: string;
  nome: string;
  email: string;
  cpf: string | null;
  data_nascimento: string | null;
  sexo: string | null;
  cidade: string | null;
  uf: string | null;
  nicho_atuacao: string | null;
  convites_enviados: number;
  convites_usados: number;
  convites_disponiveis: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

async function fetchPessoas(limit: number, search: string): Promise<PessoaFisica[]> {
  try {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    if (search) params.set('search', search);

    console.log('🔍 Buscando pessoas:', { limit, search });

    const res = await fetch(`/api/pessoas-fisicas?${params.toString()}`);

    console.log('📥 Resposta da API pessoas:', { status: res.status, ok: res.ok });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ Erro na API:', errorData);
      throw new Error(errorData.error || 'Failed to fetch pessoas');
    }

    const data = await res.json();
    console.log('✅ Pessoas carregadas:', data.length);

    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar pessoas:', error);
    throw error;
  }
}

export default function PessoasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(100);
  const [selectedPessoa, setSelectedPessoa] = useState<PessoaFisica | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    data_nascimento: '',
    sexo: '',
    cidade: '',
    uf: '',
    nicho_atuacao: '',
    ativo: true,
    convites_enviados: 0,
    convites_usados: 0,
  });

  const { data: pessoas, isLoading, refetch } = useQuery({
    queryKey: ['pessoas', limit, searchTerm],
    queryFn: () => fetchPessoas(limit, searchTerm),
  });

  const handleEditar = (pessoa: PessoaFisica) => {
    try {
      console.log('📝 Abrindo edição para pessoa:', pessoa.id, pessoa.nome);
      setSelectedPessoa(pessoa);
      setFormData({
        nome: pessoa.nome || '',
        email: pessoa.email || '',
        cpf: pessoa.cpf || '',
        data_nascimento: pessoa.data_nascimento || '',
        sexo: pessoa.sexo || '',
        cidade: pessoa.cidade || '',
        uf: pessoa.uf || '',
        nicho_atuacao: pessoa.nicho_atuacao || '',
        ativo: pessoa.ativo ?? true,
        convites_enviados: pessoa.convites_enviados || 0,
        convites_usados: pessoa.convites_usados || 0,
      });
      setShowEditDialog(true);
    } catch (error) {
      console.error('❌ Erro ao abrir edição:', error);
      alert(`Erro ao abrir formulário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleSalvar = async () => {
    if (!selectedPessoa) {
      console.error('❌ selectedPessoa é null');
      return;
    }

    console.log('💾 Iniciando salvamento:', { id: selectedPessoa.id, formData });

    // Validação
    if (!formData.nome || !formData.email) {
      alert('Nome e email são obrigatórios');
      return;
    }

    if (formData.convites_usados > formData.convites_enviados) {
      alert('Convites usados não pode ser maior que enviados');
      return;
    }

    setIsSaving(true);

    try {
      console.log('📡 Enviando requisição PUT para:', `/api/pessoas-fisicas/${selectedPessoa.id}`);

      const res = await fetch(`/api/pessoas-fisicas/${selectedPessoa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('📥 Resposta recebida:', { status: res.status, ok: res.ok });

      const data = await res.json();
      console.log('📦 Dados da resposta:', data);

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Erro ao atualizar pessoa');
      }

      alert('✅ Pessoa atualizada com sucesso!');
      setShowEditDialog(false);
      setSelectedPessoa(null);
      refetch();
    } catch (error: any) {
      console.error('❌ Erro completo:', error);
      console.error('❌ Stack trace:', error.stack);
      alert(`❌ Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
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
        <h1 className="text-3xl font-bold tracking-tight">Pessoas Físicas</h1>
        <p className="text-gray-500">
          Gerencie todos os dados cadastrais das pessoas físicas
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou CPF..."
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
              <TableHead>CPF</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Nicho</TableHead>
              <TableHead className="text-center">Convites</TableHead>
              <TableHead className="text-center">Status</TableHead>
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
            ) : pessoas && pessoas.length > 0 ? (
              pessoas.map((pessoa) => (
                <TableRow key={pessoa.id}>
                  <TableCell className="font-medium">{pessoa.nome}</TableCell>
                  <TableCell>{pessoa.email}</TableCell>
                  <TableCell>{pessoa.cpf || '-'}</TableCell>
                  <TableCell>
                    {pessoa.cidade && pessoa.uf
                      ? `${pessoa.cidade}, ${pessoa.uf}`
                      : pessoa.cidade || '-'}
                  </TableCell>
                  <TableCell>{pessoa.nicho_atuacao || '-'}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs">
                      {pessoa.convites_enviados}E / {pessoa.convites_usados}U
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={pessoa.ativo ? 'success' : 'secondary'}>
                      {pessoa.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditar(pessoa)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  Nenhuma pessoa encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {pessoas && (
        <div className="text-sm text-gray-500">
          Mostrando {pessoas.length} pessoas
        </div>
      )}

      {/* Dialog - Editar Pessoa */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Pessoa Física</DialogTitle>
            <DialogDescription>
              Editar todos os dados cadastrais da pessoa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Dados Pessoais
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => updateFormData('nome', e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => updateFormData('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => updateFormData('data_nascimento', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select
                    value={formData.sexo || undefined}
                    onValueChange={(v) => updateFormData('sexo', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Não informado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Localização
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => updateFormData('cidade', e.target.value)}
                    placeholder="Cidade"
                  />
                </div>

                <div>
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    value={formData.uf}
                    onChange={(e) => updateFormData('uf', e.target.value.toUpperCase())}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            {/* Informações Profissionais */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Informações Profissionais
              </h3>

              <div>
                <Label htmlFor="nicho_atuacao">Nicho de Atuação</Label>
                <Input
                  id="nicho_atuacao"
                  value={formData.nicho_atuacao}
                  onChange={(e) => updateFormData('nicho_atuacao', e.target.value)}
                  placeholder="Ex: Marketing Digital, E-commerce, etc."
                />
              </div>
            </div>

            {/* Convites */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Convites
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="convites_enviados">Convites Enviados</Label>
                  <Input
                    id="convites_enviados"
                    type="number"
                    min="0"
                    value={formData.convites_enviados}
                    onChange={(e) => updateFormData('convites_enviados', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="convites_usados">Convites Usados</Label>
                  <Input
                    id="convites_usados"
                    type="number"
                    min="0"
                    max={formData.convites_enviados}
                    value={formData.convites_usados}
                    onChange={(e) => updateFormData('convites_usados', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="rounded-md bg-blue-50 p-3">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="text-gray-600">Enviados</div>
                    <div className="font-bold text-blue-600">{formData.convites_enviados}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Usados</div>
                    <div className="font-bold text-green-600">{formData.convites_usados}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Disponíveis</div>
                    <div className="font-bold text-orange-600">
                      {formData.convites_enviados - formData.convites_usados}
                    </div>
                  </div>
                </div>
              </div>

              {formData.convites_usados > formData.convites_enviados && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  ⚠️ Convites usados não pode ser maior que enviados
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Status
              </h3>

              <div className="flex items-center gap-4">
                <Label htmlFor="ativo">Status da Conta</Label>
                <Select
                  value={formData.ativo.toString()}
                  onValueChange={(v) => updateFormData('ativo', v === 'true')}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
              disabled={isSaving || formData.convites_usados > formData.convites_enviados}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
