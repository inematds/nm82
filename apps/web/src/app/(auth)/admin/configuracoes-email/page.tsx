"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Mail, Clock, Save, TestTube } from "lucide-react";

interface Configuracao {
  id: string;
  chave: string;
  valor: string;
  tipo: string;
  descricao: string | null;
  grupo: string;
  criptografado: boolean;
}

interface ConfiguracoesAgrupadas {
  [grupo: string]: Configuracao[];
}

export default function ConfiguracoesEmailPage() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesAgrupadas>({});
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  const [emailTeste, setEmailTeste] = useState("");

  useEffect(() => {
    buscarConfiguracoes();
  }, []);

  async function buscarConfiguracoes() {
    try {
      const res = await fetch("/api/admin/configuracoes-email");
      const data = await res.json();

      // Agrupar por grupo
      const agrupadas = data.configuracoes.reduce((acc: ConfiguracoesAgrupadas, config: Configuracao) => {
        if (!acc[config.grupo]) {
          acc[config.grupo] = [];
        }
        acc[config.grupo].push(config);
        return acc;
      }, {});

      setConfiguracoes(agrupadas);
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarConfiguracao(chave: string, valor: string) {
    setSalvando(true);
    try {
      const res = await fetch("/api/admin/configuracoes-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave, valor }),
      });

      if (res.ok) {
        alert("Configuração salva com sucesso!");
        await buscarConfiguracoes();
      } else {
        alert("Erro ao salvar configuração");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar configuração");
    } finally {
      setSalvando(false);
    }
  }

  async function enviarEmailTeste() {
    if (!emailTeste) {
      alert("Digite um email para teste");
      return;
    }

    setTestando(true);
    try {
      const res = await fetch("/api/admin/configuracoes-email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTeste }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Email de teste enviado com sucesso! Verifique sua caixa de entrada.");
      } else {
        alert(`❌ Erro: ${data.error || 'Falha ao enviar email'}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("❌ Erro ao enviar email de teste");
    } finally {
      setTestando(false);
    }
  }

  function atualizarValor(chave: string, novoValor: string) {
    setConfiguracoes((prev) => {
      const novasConfigs = { ...prev };
      Object.keys(novasConfigs).forEach((grupo) => {
        novasConfigs[grupo] = novasConfigs[grupo].map((config) =>
          config.chave === chave ? { ...config, valor: novoValor } : config
        );
      });
      return novasConfigs;
    });
  }

  const grupoIcones: { [key: string]: any } = {
    smtp: Mail,
    remetente: Mail,
    limites: Clock,
    worker: Settings,
    logs: Settings,
    templates: Settings,
    geral: Settings,
  };

  const grupoTitulos: { [key: string]: string } = {
    smtp: "Configurações SMTP",
    remetente: "Remetente dos Emails",
    limites: "Limites e Rate Limiting",
    worker: "Worker Automático",
    logs: "Logs de Email",
    templates: "Templates",
    geral: "Geral",
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando configurações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configurações de Email</h1>
        <p className="text-gray-600 mt-1">
          Configure SMTP, remetente e parâmetros do sistema de emails
        </p>
      </div>

      {/* Teste de Email */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            Testar Envio de Email
          </CardTitle>
          <CardDescription>
            Envie um email de teste para verificar se as configurações SMTP estão corretas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="seu-email@exemplo.com"
              value={emailTeste}
              onChange={(e) => setEmailTeste(e.target.value)}
              className="flex-1"
            />
            <Button onClick={enviarEmailTeste} disabled={testando || !emailTeste}>
              {testando ? "Enviando..." : "Enviar Teste"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configurações por Grupo */}
      <div className="grid gap-6">
        {Object.entries(configuracoes).map(([grupo, configs]) => {
          const IconeGrupo = grupoIcones[grupo] || Settings;
          return (
            <Card key={grupo}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconeGrupo className="h-5 w-5 text-blue-600" />
                  {grupoTitulos[grupo] || grupo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {configs.map((config) => (
                    <div key={config.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Label htmlFor={config.chave} className="text-sm font-semibold">
                            {config.chave.replace(/_/g, " ").toUpperCase()}
                          </Label>
                          {config.descricao && (
                            <p className="text-xs text-gray-500 mt-1">{config.descricao}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {config.tipo}
                          </Badge>
                          {config.criptografado && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              Sensível
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          id={config.chave}
                          type={config.criptografado ? "password" : "text"}
                          value={config.valor}
                          onChange={(e) => atualizarValor(config.chave, e.target.value)}
                          className="flex-1"
                          placeholder={config.tipo === "boolean" ? "true ou false" : ""}
                        />
                        <Button
                          size="sm"
                          onClick={() => salvarConfiguracao(config.chave, config.valor)}
                          disabled={salvando}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerta sobre App Password do Gmail */}
      {configuracoes.smtp && (
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">⚠️ Importante: Gmail App Password</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-800">
            <p className="mb-2">
              Para usar o Gmail como SMTP, você precisa criar um <strong>App Password</strong>:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Acesse: <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline">Google Account Security</a></li>
              <li>Ative "Verificação em duas etapas"</li>
              <li>Vá em "Senhas de app"</li>
              <li>Gere uma senha para "Email"</li>
              <li>Use essa senha (16 caracteres) no campo <code className="bg-yellow-100 px-1 rounded">smtp_password</code></li>
            </ol>
            <p className="mt-2 font-semibold">
              ⚠️ Não use sua senha normal do Gmail!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
