"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Mail, Edit, Eye, CheckCircle, XCircle } from "lucide-react";

interface EmailTemplate {
  id: string;
  nome: string;
  codigo: string;
  assunto: string;
  corpo: string;
  variaveis: string[];
  remetentNome: string | null;
  remetenteEmail: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export default function TemplatesEmailPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<EmailTemplate | null>(null);
  const [preview, setPreview] = useState<EmailTemplate | null>(null);

  // Buscar templates
  useEffect(() => {
    buscarTemplates();
  }, []);

  async function buscarTemplates() {
    try {
      const res = await fetch("/api/admin/templates-email");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Erro ao buscar templates:", error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarTemplate() {
    if (!editando) return;

    try {
      const res = await fetch(`/api/admin/templates-email/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editando.nome,
          assunto: editando.assunto,
          corpo: editando.corpo,
          ativo: editando.ativo,
        }),
      });

      if (res.ok) {
        await buscarTemplates();
        setEditando(null);
        alert("Template salvo com sucesso!");
      } else {
        alert("Erro ao salvar template");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar template");
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Templates de Email</h1>
        <p className="text-gray-600 mt-1">
          Gerencie os templates de emails automáticos do sistema
        </p>
      </div>

      {/* Lista de Templates */}
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <CardTitle>{template.nome}</CardTitle>
                    {template.ativo ? (
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
                    )}
                  </div>
                  <CardDescription>
                    Código: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{template.codigo}</code>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreview(template)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setEditando(template)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Assunto:</strong> {template.assunto}
                </div>
                <div>
                  <strong>Variáveis disponíveis:</strong>{" "}
                  {template.variaveis.map((v, i) => (
                    <code key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs mr-1">
                      {`{{ ${v} }}`}
                    </code>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  Última atualização: {new Date(template.atualizadoEm).toLocaleString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edição */}
      {editando && (
        <Dialog open={!!editando} onOpenChange={() => setEditando(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Template: {editando.nome}</DialogTitle>
              <DialogDescription>
                Código: {editando.codigo}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={editando.ativo}
                  onChange={(e) =>
                    setEditando({ ...editando, ativo: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="ativo">Template ativo</Label>
              </div>

              {/* Nome */}
              <div>
                <Label htmlFor="nome">Nome do Template</Label>
                <Input
                  id="nome"
                  value={editando.nome}
                  onChange={(e) =>
                    setEditando({ ...editando, nome: e.target.value })
                  }
                />
              </div>

              {/* Assunto */}
              <div>
                <Label htmlFor="assunto">Assunto do Email</Label>
                <Input
                  id="assunto"
                  value={editando.assunto}
                  onChange={(e) =>
                    setEditando({ ...editando, assunto: e.target.value })
                  }
                />
              </div>

              {/* Variáveis Disponíveis */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Variáveis disponíveis:
                </p>
                <div className="flex flex-wrap gap-1">
                  {editando.variaveis.map((v, i) => (
                    <code
                      key={i}
                      className="bg-white text-blue-700 px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-100"
                      onClick={() => {
                        navigator.clipboard.writeText(`{{ ${v} }}`);
                        alert(`Copiado: {{ ${v} }}`);
                      }}
                    >
                      {`{{ ${v} }}`}
                    </code>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Clique para copiar. Use essas variáveis no corpo do email.
                </p>
              </div>

              {/* Corpo */}
              <div>
                <Label htmlFor="corpo">Corpo do Email</Label>
                <textarea
                  id="corpo"
                  value={editando.corpo}
                  onChange={(e) =>
                    setEditando({ ...editando, corpo: e.target.value })
                  }
                  rows={15}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                  placeholder="Use variáveis no formato {{ nome }}, {{ email }}, etc."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Quebras de linha serão convertidas em &lt;br&gt; no HTML
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={salvarTemplate} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditando(null)}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Preview */}
      {preview && (
        <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview: {preview.nome}</DialogTitle>
              <DialogDescription>
                Visualização do template com variáveis de exemplo
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-600 mb-2">De:</div>
                <div className="font-semibold">
                  {preview.remetentNome || "INEMA.VIP"} &lt;
                  {preview.remetenteEmail || "inematds@gmail.com"}&gt;
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-600 mb-2">Assunto:</div>
                <div className="font-semibold">{preview.assunto}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-600 mb-2">Corpo:</div>
                <div className="whitespace-pre-wrap text-sm">{preview.corpo}</div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" onClick={() => setPreview(null)} className="w-full">
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
