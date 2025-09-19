-- Criar tabela para cache de CPF
CREATE TABLE IF NOT EXISTS cpf_cache (
  id SERIAL PRIMARY KEY,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  api_response JSONB NOT NULL,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar índice para busca rápida por CPF
CREATE INDEX IF NOT EXISTS idx_cpf_cache_cpf ON cpf_cache(cpf);

-- Criar índice para limpeza de dados antigos
CREATE INDEX IF NOT EXISTS idx_cpf_cache_created_at ON cpf_cache(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cpf_cache_updated_at BEFORE UPDATE ON cpf_cache
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Políticas de segurança (RLS)
ALTER TABLE cpf_cache ENABLE ROW LEVEL SECURITY;

-- Permitir apenas inserção e leitura via API (sem delete direto)
CREATE POLICY "Enable read for service" ON cpf_cache
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for service" ON cpf_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for service" ON cpf_cache
  FOR UPDATE USING (true);