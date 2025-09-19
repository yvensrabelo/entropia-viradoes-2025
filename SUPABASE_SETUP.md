# Configuração do Supabase para Cache de CPF

## 🚀 Passo a Passo

### 1. Criar conta no Supabase (se ainda não tiver)
- Acesse https://supabase.com
- Clique em "Start your project"
- Faça login com GitHub

### 2. Criar novo projeto
- Clique em "New project"
- Nome do projeto: `entropia-cpf-cache`
- Database Password: (anote esta senha, você precisará dela)
- Region: Brazil (São Paulo) - para menor latência
- Clique em "Create new project"

### 3. Executar SQL para criar tabela
- No painel do Supabase, vá para "SQL Editor"
- Cole o conteúdo do arquivo `supabase-setup.sql`
- Clique em "Run"

### 4. Obter as credenciais
No painel do projeto, vá para "Settings" > "API":

- **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
- **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 5. Adicionar variáveis no Vercel

Execute os comandos abaixo com suas credenciais:

```bash
# Adicionar URL do Supabase
vercel env add SUPABASE_URL production
# Cole: https://xxxxxxxxxxxxx.supabase.co

# Adicionar chave anônima
vercel env add SUPABASE_ANON_KEY production
# Cole: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Fazer o mesmo para preview
vercel env add SUPABASE_URL preview
vercel env add SUPABASE_ANON_KEY preview
```

## 📊 Como funciona o cache

1. **Primeira consulta de um CPF:**
   - Sistema busca no Supabase
   - Não encontra → consulta API Brasil (gasta créditos)
   - Salva resultado no Supabase para futuras consultas

2. **Consultas posteriores do mesmo CPF:**
   - Sistema busca no Supabase
   - Encontra dados (menos de 30 dias) → retorna do cache (NÃO gasta créditos)
   - Dados muito antigos (>30 dias) → consulta API Brasil novamente

## 🎯 Benefícios

- **Economia:** Reduz drasticamente o consumo de créditos da API
- **Velocidade:** Respostas instantâneas para CPFs já consultados
- **Confiabilidade:** Sistema continua funcionando mesmo se o cache falhar
- **Atualização:** Dados são renovados automaticamente após 30 dias

## 🔍 Monitoramento

No painel do Supabase você pode:
- Ver quantos CPFs estão em cache
- Monitorar economia de consultas
- Verificar logs de acesso
- Exportar dados se necessário

## 🛡️ Segurança

- Dados são armazenados de forma segura no Supabase
- Row Level Security (RLS) ativado
- Apenas operações de leitura e escrita permitidas
- Sem acesso direto de delete via API pública