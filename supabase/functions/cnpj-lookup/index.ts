const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cnpj } = await req.json();
    const digits = cnpj.replace(/\D/g, '');

    if (digits.length !== 14) {
      return new Response(JSON.stringify({ error: 'CNPJ inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'CNPJ não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    const street = [data.logradouro, data.numero].filter(Boolean).join(', ');

    const result = {
      companyName: data.razao_social || '',
      address: street,
      neighborhood: data.bairro || '',
      complement: data.complemento || '',
      city: data.municipio || '',
      state: data.uf || '',
      zipCode: data.cep ? data.cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2') : '',
      phone: data.ddd_telefone_1 || '',
      email: data.email || '',
      segment: data.cnae_fiscal_descricao || '',
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
