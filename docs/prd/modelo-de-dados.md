# 📊 Modelo de Dados

### Entidades Principais

```prisma
// Schema Prisma (simplificado)

model PessoaFisica {
  id                    String    @id @default(uuid())
  nome                  String
  email                 String    @unique
  cpf                   String?
  data_nascimento       DateTime?
  sexo                  String?
  cidade                String?
  uf                    String?
  nicho_atuacao         String?
  convites_enviados     Int       @default(0)
  convites_usados       Int       @default(0)
  convites_disponiveis  Int       @default(5)
  created_at            DateTime  @default(now())

  // Relações
  afiliadosComoPadrinho Afiliado[] @relation("Padrinho")
  afiliadoComoAfiliado  Afiliado?  @relation("Afiliado")
}

model Afiliado {
  id            String    @id @default(uuid())
  afiliado_id   String    @unique
  padrinho_id   String
  status        String    // "PENDENTE", "ENVIADO", "JA_CADASTRADO", "SEM_PADRINHO", "SEM_CONVITE", "APROVADO" (deprecated), "REJEITADO" (deprecated)
  data_cadastro DateTime  @default(now())
  data_email    DateTime?
  email_enviado Boolean   @default(false)

  // Relações
  afiliado      PessoaFisica @relation("Afiliado", fields: [afiliado_id], references: [id])
  padrinho      PessoaFisica @relation("Padrinho", fields: [padrinho_id], references: [id])
}

model CodigoConvite {
  id             String    @id @default(uuid())
  codigo         String    @unique
  email          String?
  data           DateTime?
  expiration     DateTime?
  atualizado_em  DateTime?
}
```

### Regras de Negócio

1. **Padrinho**:
   - Inicia com 5 convites disponíveis
   - Ao convidar, `convites_usados++` e `convites_disponiveis--`
   - Admin pode ajustar `convites_disponiveis` manualmente
   - Padrinho deve estar ativo para seus convites funcionarem

2. **Afiliado**:
   - Status inicial: "PENDENTE"
   - Status possíveis: "PENDENTE", "ENVIADO", "JA_CADASTRADO", "SEM_PADRINHO", "SEM_CONVITE"
   - Status deprecated: "APROVADO", "REJEITADO" (mantidos para compatibilidade histórica)
   - Após aprovação: status = "ENVIADO", recebe código de convite
   - Se padrinho não existir: status = "SEM_PADRINHO"
   - Se padrinho sem convites: status = "SEM_CONVITE"
   - Afiliado não pode ser padrinho de si mesmo

3. **Código de Convite**:
   - Gerados em lote e atribuídos sob demanda
   - Expiration configurável (default: 90 dias)
   - Código usado não pode ser reutilizado
   - Um email pode usar apenas um código
