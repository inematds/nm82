# 🤖 FLUXO AUTOMÁTICO - Sistema de Convites INEMA.VIP

**Data**: 02/11/2025
**Baseado em**: nm81-3 e nm81-4 (workflows n8n)

---

## 📊 VISÃO GERAL

O sistema opera de forma **100% automática**, sem necessidade de aprovação manual por administradores.
Tudo é baseado em **lógica de negócio** e **fluxos condicionais**.

---

## 🔄 WORKFLOW 1: Envio de Convites para Padrinhos (nm81-3)

### Objetivo
Enviar convites para pessoas se tornarem padrinhos da comunidade.

### Trigger
- **Schedule**: A cada hora (ou manual)

### Fluxo
```
1. Buscar pessoas_fisicas WHERE convites_enviados = 0
2. Dividir em lotes de 3
3. Para cada pessoa:
   a. Preparar dados (email_Id, pid, nome)
   b. Enviar email de convite
   c. Aguardar 25s (random 45-65s)
   d. Atualizar pessoa:
      - convites_enviados = 5
      - data_ultimo_envio = NOW()
4. Próximo lote
```

### Email: "Convite INEMA.VIP - Você fez Parte 2025"
**De**: Gmail INEMATDS - TEC
**Para**: {email_Id}
**Assunto**: Convite INEMA.VIP - Você fez Parte 2025
**Corpo**:
```
Olá {{ nome }},

Você agora faz parte da fundação de uma nova era — um movimento de aprendizado,
automação e transformação com Inteligência Artificial.

Como membro pioneiro da comunidade INEMA.VIP, você se torna padrinho oficial
de nossa jornada de evolução humana e tecnológica.

Sua missão é simples: compartilhar o conhecimento e convidar pessoas que,
assim como você, desejam crescer e se transformar.

Cada padrinho tem direito a 5 convites gratuitos válidos até o final de novembro.

Envie este link para seus convidados se cadastrarem:
🔗 https://inema.vip/convite.html?pid={{ pid }}

[...]

Com gratidão,
Comunidade INEMA.VIP
Nei Maldaner – Incentivador
Autoaprendizado, Inovação e Evolução Humana
```

---

## ⚡ WORKFLOW 2: Processamento Automático de Afiliados (nm81-4)

### Objetivo
Processar automaticamente afiliados cadastrados via formulário de convite.

### Trigger
- **Schedule**: A cada 10 minutos
- Busca: `afiliados WHERE status = 'PENDENTE' LIMIT 1`

### Fluxo Completo com Decisões

```
┌─────────────────────────────────────┐
│ 1. BUSCAR AFILIADO PENDENTE         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. BUSCAR PADRINHO (padrinho_id)    │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────┴──────┐
        │ Existe?     │
        └──┬───────┬──┘
           │ NÃO   │ SIM
           ▼       ▼
    ┌──────────┐  ┌───────────────────────────┐
    │ Email:   │  │ 3. VERIFICAR CONVITES     │
    │ Padrinho │  │    convites_usados <      │
    │ inexist. │  │    convites_enviados?     │
    └────┬─────┘  └─────────┬─────────────────┘
         │                  │
         │           ┌──────┴──────┐
         │           │ Tem?        │
         │           └──┬───────┬──┘
         │              │ NÃO   │ SIM
         │              ▼       ▼
         │         ┌────────┐  ┌──────────────────────┐
         │         │ Email: │  │ 4. BUSCAR AFILIADO   │
         │         │ Sem    │  │    EM pessoas_fisicas│
         │         │ convit.│  │    (por email)       │
         │         └────┬───┘  └────────┬─────────────┘
         │              │               │
         ▼              ▼        ┌──────┴──────┐
    ┌────────────┐ ┌────────┐   │ Existe?     │
    │ Status:    │ │ Status:│   └──┬───────┬──┘
    │ "Sem       │ │ "Já    │      │ SIM   │ NÃO
    │ Padrinho"  │ │ Cadastr│      ▼       ▼
    └────────────┘ │ ado"   │  ┌────────┐ ┌─────────────────┐
                   └────────┘  │ Email: │ │ 5. PEGAR CÓDIGO │
                               │ Já é   │ │    DISPONÍVEL   │
                               │ membro │ │    (email NULL) │
                               └────┬───┘ └────────┬────────┘
                                    │              │
                                    ▼              ▼
                               ┌─────────┐   ┌──────────────┐
                               │ Status: │   │ 6. ATUALIZAR │
                               │ "Já     │   │    CÓDIGO    │
                               │ Cadastr"│   │    com email │
                               └─────────┘   └──────┬───────┘
                                                    │
                                                    ▼
                                             ┌──────────────┐
                                             │ 7. ATUALIZAR │
                                             │    AFILIADO  │
                                             │ status:      │
                                             │ "Enviado"    │
                                             └──────┬───────┘
                                                    │
                                                    ▼
                                             ┌──────────────┐
                                             │ 8. INCREMENTAR│
                                             │ convites_    │
                                             │ usados (+1)  │
                                             └──────┬───────┘
                                                    │
                                                    ▼
                                             ┌──────────────┐
                                             │ 9. ENVIAR    │
                                             │    EMAILS    │
                                             │ - Afiliado   │
                                             │ - Padrinho   │
                                             └──────────────┘
```

---

## 📧 TEMPLATES DE EMAIL

### Email 1: Padrinho Inexistente
**De**: Gmail FTD
**Para**: {afiliado.email}
**Assunto**: Promoção do Convite do INEMA.VIP
**Status Atualizado**: "Sem Padrinho"

```
Olá! 👋

Verificamos que o padrinho indicado não existe ou o link que você usou está incorreto.
Por favor, confirme com o seu padrinho — ele pode te enviar o link correto de convite
para que você participe da promoção e entre na nossa Comunidade INEMA.VIP.

💬 Assim que tiver o link certo, é só clicar e concluir o cadastro!

INEMA.VIP
Comunidade de Autoaprendizagem
```

---

### Email 2A: Sem Convites (Para Afiliado)
**De**: Gmail FTD
**Para**: {afiliado.email}
**Assunto**: Promoção Convite INEMA VIP
**Status Atualizado**: "Já Cadastrado"

```
Olá! 👋

Infelizmente, este padrinho já não tem mais convites disponíveis no momento. 😔
Mas não se preocupe! 💫 Você pode falar com a Tiza no INEMA.Comunidade, que está
ajudando a ver novas oportunidades e promoções para participar da Comunidade INEMA.VIP.

💬 Entra em contato com ela e diz que você veio por recomendação de um padrinho!

INEMA.VIP
```

---

### Email 2B: Sem Convites (Para Padrinho)
**De**: Gmail FTD
**Para**: {padrinho.email}
**Assunto**: Promoção de Padrinho INEMA VIP

```
Olá! 👋

Seus convites já se esgotaram nesta promoção. 🎉
Isso mostra que você realmente está ajudando muita gente a entrar na Comunidade INEMA.VIP!

💬 Se quiser ganhar mais convites, fala com a Tiza — talvez ela consiga liberar mais
alguns para você continuar convidando novos afiliados.

INEMA.VIP
```

---

### Email 3A: Afiliado Já é Membro (Para Afiliado)
**De**: Gmail FTD
**Para**: {afiliado.email}
**Assunto**: Promoção Convite INEMA VIP
**Status Atualizado**: "Já Cadastrado"

```
Olá! 🌟

A promoção atual é voltada especialmente para novas pessoas que ainda não fazem
parte da Comunidade INEMA.VIP.

Verificamos que seu cadastro já está ativo na nossa comunidade, então você já faz
parte do nosso grupo de aprendizado e conexões!

🙌 Se quiser aproveitar alguma outra promoção ou benefício, pode conversar com a Tiza.

INEMA.VIP
```

---

### Email 3B: Afiliado Já é Membro (Para Padrinho)
**De**: Gmail FTD
**Para**: {padrinho.email}
**Assunto**: Promoção Convite INEMA VIP

```
Olá! 🌟

Verificamos que o cadastro do Afiliado já está ativo na nossa comunidade, então ele
já faz parte do nosso grupo de aprendizado e conexões!

Então pode enviar o Convite para outro.

INEMA.VIP
```

---

### Email 4A: Aprovação Confirmada (Para Afiliado)
**De**: Gmail FTD
**Para**: {afiliado.email}
**Assunto**: Promoção Convite INEMA.VIP - Acesso Aprovado
**Status Atualizado**: "Enviado"

```
Olá! 👋

Seu acesso à Comunidade INEMA.VIP já está disponível! 🎉
Você pode entrar agora mesmo clicando neste link:

👉 https://t.me/INEMAMembroBot?start={{ codigo }}

Ao entrar, no GRUPO INEMA.VIP procure o tópico "REPOSITÓRIOS" — lá você encontrará
os links para todos os outros grupos e áreas da comunidade.

Conte com seu padrinho e com a Tiza, que são seus pontos de apoio dentro da comunidade.

Seu acesso Liberado até fim de Novembro 2025!

Bem-vindo(a) à comunidade! 🌟

Agradecimento ao Teu Padrinho:
{{ padrinho.nome }}

INEMA.VIP
Comunidade de Autoaprendizado
```

---

### Email 4B: Aprovação Confirmada (Para Padrinho)
**De**: Gmail FTD
**Para**: {padrinho.email}
**Assunto**: Promoção Convites INEMA.VIP - Aprovado Afiliado

```
Olá, Padrinho! 🌟

Temos uma ótima notícia:

{{ afiliado.nome }}
{{ afiliado.email }}

Acaba de ganhar acesso à Comunidade INEMA.VIP! 🎉

Como padrinho, você tem a missão de ajudá-lo a compreender nossa comunidade,
mostrar como tudo funciona e, principalmente, inspirá-lo a manter a determinação
para alcançar resultados reais.

Fique feliz — porque cada pessoa que você apoia é uma semente de transformação. 🌱

INEMA.VIP
Comunidade de Autoaprendizagem
```

---

## 🗄️ STATUS POSSÍVEIS DO AFILIADO

| Status | Significado | Ação |
|--------|-------------|------|
| `PENDENTE` | Recém cadastrado via formulário | Aguardando processamento automático |
| `Enviado` | Aprovado automaticamente | Email com código enviado |
| `Já Cadastrado` | Email já existe OU padrinho sem convites | Email informativo enviado |
| `Sem Padrinho` | Padrinho inexistente | Email solicitando link correto |

---

## 🏗️ ESTRUTURA DE IMPLEMENTAÇÃO

### 1. Tabela: `email_templates`
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) UNIQUE NOT NULL,
  codigo VARCHAR(100) UNIQUE NOT NULL, -- Ex: "padrinho_inexistente"
  assunto TEXT NOT NULL,
  corpo TEXT NOT NULL,
  remetente_nome VARCHAR(255),
  remetente_email VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

### 2. Configuração de Remetente
```sql
CREATE TABLE configuracoes_email (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

INSERT INTO configuracoes_email (chave, valor, descricao) VALUES
  ('smtp_host', 'smtp.gmail.com', 'Servidor SMTP'),
  ('smtp_port', '587', 'Porta SMTP'),
  ('smtp_user', 'inematds@gmail.com', 'Usuário SMTP'),
  ('smtp_from_name', 'INEMA.VIP', 'Nome do remetente'),
  ('smtp_from_email', 'inematds@gmail.com', 'Email do remetente');
```

### 3. Worker/Cron Job
```typescript
// Executar a cada 10 minutos
export async function processarAfiliadosPendentes() {
  // 1. Buscar próximo afiliado pendente
  // 2. Validar padrinho
  // 3. Verificar convites
  // 4. Verificar se já é membro
  // 5. Processar aprovação ou rejeição
  // 6. Enviar emails
  // 7. Atualizar status
}
```

### 4. Serviço de Email
```typescript
interface EmailParams {
  template: string;
  to: string;
  variables: Record<string, any>;
}

export async function enviarEmailPorTemplate(params: EmailParams) {
  // 1. Buscar template do banco
  // 2. Substituir variáveis {{ }}
  // 3. Buscar configurações SMTP
  // 4. Enviar email
  // 5. Registrar log
}
```

### 5. Interface Admin
- Página: `/admin/templates-email`
  - Lista de templates
  - Editor de template (assunto + corpo)
  - Preview com variáveis
  - Configurações de remetente

- Página: `/admin/configuracoes-email`
  - SMTP settings
  - Email de teste

---

## 🎯 PRÓXIMOS PASSOS DE IMPLEMENTAÇÃO

1. ✅ Analisar workflows (FEITO)
2. ⏳ Criar schema de banco (email_templates + configuracoes_email)
3. ⏳ Criar API para templates
4. ⏳ Implementar worker automático
5. ⏳ Criar interface de gerenciamento
6. ⏳ Remover botões de aprovar/rejeitar manual
7. ⏳ Testes end-to-end

---

## 🔐 SEGURANÇA

- Templates devem ser sanitizados (evitar XSS)
- SMTP credentials devem estar em variáveis de ambiente
- Logs de envio para auditoria
- Rate limiting para evitar spam

---

**Documentação criada em**: 02/11/2025
**Baseado em**: Workflows n8n nm81-3 e nm81-4
**Status**: Pronto para implementação
