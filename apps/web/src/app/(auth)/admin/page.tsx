'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Database } from 'lucide-react';

export default function AdminPage() {
  const [isAnonymizing, setIsAnonymizing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnonymize = async () => {
    const confirmacao = confirm(
      '⚠️ ATENÇÃO: Esta ação irá substituir TODOS os nomes e emails do sistema por dados fictícios.\n\n' +
      'Esta operação NÃO pode ser desfeita.\n\n' +
      'Deseja continuar?'
    );

    if (!confirmacao) {
      return;
    }

    setIsAnonymizing(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/anonymize', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao anonimizar dados');
      }

      setResult(data);
      alert(`✅ Sucesso! ${data.stats.updated} registros atualizados.`);
    } catch (error: any) {
      console.error('Erro:', error);
      setResult({
        success: false,
        error: error.message,
      });
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setIsAnonymizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
        <p className="text-gray-500">
          Ferramentas administrativas e utilitários do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Anonimizar Dados
          </CardTitle>
          <CardDescription>
            Substitui todos os nomes e emails por dados fictícios (para não expor informações reais)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900 mb-1">
                  Atenção - Operação Irreversível
                </h4>
                <p className="text-sm text-yellow-800">
                  Esta operação irá substituir TODOS os nomes e emails da tabela <code className="bg-yellow-100 px-1 rounded">pessoas_fisicas</code> por dados fictícios gerados automaticamente.
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  Esta ação NÃO pode ser desfeita. Certifique-se de ter um backup antes de prosseguir.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">O que será feito:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Nomes serão substituídos por combinações de nomes comuns brasileiros</li>
              <li>Emails serão gerados baseados nos novos nomes (ex: joao.silva@email.com)</li>
              <li>A consistência será mantida - afiliados e padrinhos verão os novos nomes</li>
              <li>IDs e relacionamentos permanecerão intactos</li>
            </ul>
          </div>

          <Button
            onClick={handleAnonymize}
            disabled={isAnonymizing}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            {isAnonymizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Anonimizando dados...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Executar Anonimização
              </>
            )}
          </Button>

          {result && (
            <div className={`rounded-lg p-4 border ${
              result.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-medium mb-1 ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.success ? 'Sucesso!' : 'Erro'}
                  </h4>
                  <p className={`text-sm ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message || result.error}
                  </p>
                  {result.stats && (
                    <div className="mt-3 text-sm text-green-800">
                      <p><strong>Total de registros:</strong> {result.stats.total}</p>
                      <p><strong>Atualizados:</strong> {result.stats.updated}</p>
                      {result.stats.errors > 0 && (
                        <p className="text-red-600"><strong>Erros:</strong> {result.stats.errors}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ambiente:</span>
              <span className="font-medium">Desenvolvimento</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Autenticação:</span>
              <span className="font-medium text-yellow-600">Desabilitada (Dev)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
