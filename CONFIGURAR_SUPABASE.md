# 🚀 Configuração Completa do Supabase com CLI

## Passo 1: Criar conta e projeto no Supabase

1. Acesse https://supabase.com e crie uma conta
2. Crie um novo projeto com nome: `entropia-cpf-cache`
3. Anote a senha do banco de dados
4. Escolha região: Brazil (São Paulo)

## Passo 2: Obter Access Token

1. No Supabase Dashboard, clique no seu avatar (canto superior direito)
2. Vá em "Account Settings"
3. Clique em "Access Tokens"
4. Crie um novo token com nome "CLI"
5. Copie o token gerado

## Passo 3: Conectar CLI ao projeto

Execute no terminal:

```bash
# Fazer login com o token
supabase login --token SEU_TOKEN_AQUI

# Listar projetos para pegar o ID
supabase projects list

# Conectar ao projeto (substitua PROJECT_ID pelo ID do seu projeto)
supabase link --project-ref PROJECT_ID
```

## Passo 4: Deploy da migração

```bash
# Fazer deploy da tabela de cache
supabase db push

# Verificar se foi criada
supabase db diff
```

## Passo 5: Obter credenciais para o Vercel

No dashboard do Supabase:
1. Vá em Settings → API
2. Copie:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: `eyJhbGci...`

## Passo 6: Adicionar no Vercel

```bash
# URL do Supabase
echo "https://xxxxx.supabase.co" | vercel env add SUPABASE_URL production --sensitive
echo "https://xxxxx.supabase.co" | vercel env add SUPABASE_URL preview --sensitive

# Anon Key
echo "eyJhbGci..." | vercel env add SUPABASE_ANON_KEY production --sensitive
echo "eyJhbGci..." | vercel env add SUPABASE_ANON_KEY preview --sensitive

# Fazer novo deploy
vercel --prod
```

## 📊 Estrutura criada

A migração criará:
- Tabela `cpf_cache` com campos:
  - `id`: identificador único
  - `cpf`: CPF sem formatação
  - `api_response`: resposta completa da API
  - `nome`, `email`, `telefone`: campos extraídos
  - `created_at`, `updated_at`: timestamps

- Índices para performance
- Trigger para auto-update de `updated_at`
- Políticas RLS para segurança

## 🎯 Como funciona

1. **Primeira consulta**:
   - Busca no cache → não encontra
   - Consulta API Brasil (gasta crédito)
   - Salva no cache

2. **Próximas consultas (30 dias)**:
   - Busca no cache → encontra
   - Retorna direto (não gasta crédito)

3. **Após 30 dias**:
   - Cache expirado → nova consulta na API
   - Atualiza cache

## 📈 Monitoramento

No Supabase Dashboard você pode:
- Ver Table Editor → cpf_cache
- Monitorar quantos CPFs estão em cache
- Ver logs de acesso
- Calcular economia de créditos