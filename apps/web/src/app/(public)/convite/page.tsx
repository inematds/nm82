"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ConvitePage() {
  const [padrinhoId, setPadrinhoId] = useState<string>("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("pid");
    if (pid) {
      setPadrinhoId(pid);
      console.log("🔗 Padrinho ID detectado:", pid);
    } else {
      setMessage({
        text: "Link inválido: falta o identificador do padrinho.",
        type: "error",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "Processando...", type: "" });

    const formData = new FormData(e.currentTarget);

    try {
      if (!padrinhoId) {
        throw new Error("Padrinho não identificado na URL.");
      }

      const afiliado = {
        padrinho_id: padrinhoId,
        nome: formData.get("nome") as string,
        email: formData.get("email") as string,
        telefone: formData.get("telefone") as string,
        cpf: formData.get("cpf") as string || null,
        data_nascimento: formData.get("data_nascimento") as string || null,
        sexo: formData.get("sexo") as string || null,
        cidade: formData.get("cidade") as string || null,
        uf: (formData.get("uf") as string)?.toUpperCase() || null,
        nicho_atuacao: formData.get("nicho_atuacao") as string || null,
        status: "PENDENTE",
        data_cadastro: new Date().toISOString(),
      };

      const { error } = await supabase.from("afiliados").insert([afiliado]);

      if (error) {
        throw new Error("Erro ao cadastrar: " + error.message);
      }

      setMessage({
        text: "🎉 Afiliado cadastrado com sucesso! Aguarde a aprovação.",
        type: "success",
      });

      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error(err);
      setMessage({
        text: err.message || "Erro inesperado. Tente novamente.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/15 rounded-2xl p-8 shadow-2xl">
        {/* Imagem do convite */}
        <div className="mb-6">
          <Image
            src="/conviteinema.png"
            alt="Convite INEMA.VIP"
            width={480}
            height={270}
            className="w-full rounded-xl"
            priority
          />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-yellow-400 text-center mb-4">
          Bem-vindo à INEMA.VIP
        </h1>

        {/* Texto introdutório */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6 text-center">
          Somos uma grande comunidade de autoaprendizado e você recebeu um{" "}
          <span className="text-yellow-400 font-semibold">CONVITE ESPECIAL</span>{" "}
          de um PADRINHO para conhecer a nossa comunidade — e também para viver
          sua própria transformação.
          <br />
          <br />
          Estamos em uma nova era, onde a Inteligência Artificial e os
          Humanoides estão moldando o futuro da humanidade.
          <br />
          <br />
          Faça seu cadastro e aguarde a aprovação de acesso para iniciar essa
          jornada conosco. Receberá email para o acesso.
        </p>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="nome"
            placeholder="Nome completo"
            required
            className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />

          <input
            type="text"
            name="telefone"
            placeholder="Telefone (WhatsApp)"
            required
            className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />

          <input
            type="text"
            name="cpf"
            placeholder="CPF"
            maxLength={14}
            className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />

          <input
            type="date"
            name="data_nascimento"
            className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />

          <select
            name="sexo"
            className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="">Sexo</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>

          <input
            type="text"
            name="cidade"
            placeholder="Cidade"
            className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />

          <input
            type="text"
            name="uf"
            placeholder="UF"
            maxLength={2}
            className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />

          <input
            type="text"
            name="nicho_atuacao"
            placeholder="Nicho de atuação"
            className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={isLoading || !padrinhoId}
            className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-400 text-gray-900 font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </button>

          {/* Mensagem de feedback */}
          {message.text && (
            <div
              className={`text-center text-sm mt-4 ${
                message.type === "success"
                  ? "text-green-400"
                  : message.type === "error"
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
