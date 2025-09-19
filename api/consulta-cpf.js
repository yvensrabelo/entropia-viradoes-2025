import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cpf } = req.body;

  if (!cpf) {
    return res.status(400).json({ error: 'CPF is required' });
  }

  // Limpar CPF (remover pontos e traços)
  const cpfLimpo = cpf.replace(/\D/g, '');

  // Verificar se temos Supabase configurado e tentar buscar do cache
  if (supabase) {
    try {
      // Buscar CPF no cache
      const { data: cachedData, error: cacheError } = await supabase
        .from('cpf_cache')
        .select('*')
        .eq('cpf', cpfLimpo)
        .single();

      if (cachedData && !cacheError) {
        // Se encontrou no cache e não está muito antigo (30 dias)
        const cacheDate = new Date(cachedData.created_at);
        const now = new Date();
        const daysDiff = (now - cacheDate) / (1000 * 60 * 60 * 24);

        if (daysDiff < 30) {
          console.log('CPF encontrado no cache:', cpfLimpo);
          // Retornar dados do cache
          return res.status(200).json({
            ...cachedData.api_response,
            cached: true,
            cache_date: cachedData.created_at
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar cache:', error);
      // Continuar para API mesmo com erro no cache
    }
  }

  // Se não encontrou no cache ou Supabase não está configurado, consultar API
  const API_TOKEN = process.env.API_BRASIL_TOKEN;

  if (!API_TOKEN) {
    return res.status(500).json({ error: 'API token not configured' });
  }

  try {
    console.log('Consultando API Brasil para CPF:', cpfLimpo);
    const response = await fetch('https://gateway.apibrasil.io/api/v2/dados/cpf/credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_TOKEN
      },
      body: JSON.stringify({
        cpf: cpfLimpo,
        tipo: 'dados-cadastrais',
        homolog: false
      })
    });

    const data = await response.json();

    // Salvar no cache se Supabase está configurado e a consulta foi bem-sucedida
    if (supabase && data && !data.error) {
      try {
        // Upsert (inserir ou atualizar) os dados no cache
        const { error: insertError } = await supabase
          .from('cpf_cache')
          .upsert({
            cpf: cpfLimpo,
            api_response: data,
            nome: data.nome || null,
            email: data.email || null,
            telefone: data.telefone || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'cpf'
          });

        if (insertError) {
          console.error('Erro ao salvar no cache:', insertError);
        } else {
          console.log('CPF salvo no cache:', cpfLimpo);
        }
      } catch (error) {
        console.error('Erro ao salvar cache:', error);
        // Continuar mesmo com erro no cache
      }
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error calling API:', error);
    return res.status(500).json({ error: 'Failed to fetch CPF data' });
  }
}