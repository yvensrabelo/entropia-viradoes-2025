-- Criar tabela para cache de CPF
CREATE TABLE IF NOT EXISTS public.cpf_cache (
  id BIGSERIAL PRIMARY KEY,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  api_response JSONB NOT NULL,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar indice para busca rapida por CPF
CREATE INDEX IF NOT EXISTS idx_cpf_cache_cpf ON public.cpf_cache(cpf);

-- Criar indice para limpeza de dados antigos
CREATE INDEX IF NOT EXISTS idx_cpf_cache_created_at ON public.cpf_cache(created_at);

-- Funcao para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cpf_cache_updated_at
  BEFORE UPDATE ON public.cpf_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE public.cpf_cache ENABLE ROW LEVEL SECURITY;

-- Politica para permitir leitura anonima
CREATE POLICY "Permitir leitura anonima" ON public.cpf_cache
  FOR SELECT USING (true);

-- Politica para permitir insercao anonima
CREATE POLICY "Permitir insercao anonima" ON public.cpf_cache
  FOR INSERT WITH CHECK (true);

-- Politica para permitir atualizacao anonima
CREATE POLICY "Permitir atualizacao anonima" ON public.cpf_cache
  FOR UPDATE USING (true) WITH CHECK (true);

-- Comentario na tabela
COMMENT ON TABLE public.cpf_cache IS 'Cache de consultas de CPF para economizar chamadas a API Brasil';
COMMENT ON COLUMN public.cpf_cache.cpf IS 'CPF sem formatacao (apenas numeros)';
COMMENT ON COLUMN public.cpf_cache.api_response IS 'Resposta completa da API em formato JSON';
COMMENT ON COLUMN public.cpf_cache.nome IS 'Nome extraido para busca rapida';
COMMENT ON COLUMN public.cpf_cache.email IS 'Email extraido para busca rapida';
COMMENT ON COLUMN public.cpf_cache.telefone IS 'Telefone extraido para busca rapida';