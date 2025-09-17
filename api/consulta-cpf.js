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

  const API_TOKEN = process.env.API_BRASIL_TOKEN;

  if (!API_TOKEN) {
    return res.status(500).json({ error: 'API token not configured' });
  }

  try {
    const response = await fetch('https://gateway.apibrasil.io/api/v2/dados/cpf/credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_TOKEN
      },
      body: JSON.stringify({
        cpf: cpf,
        tipo: 'dados-cadastrais',
        homolog: false
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error calling API:', error);
    return res.status(500).json({ error: 'Failed to fetch CPF data' });
  }
}