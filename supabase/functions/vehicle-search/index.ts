import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    const brand = url.searchParams.get('brand')

    let query = supabaseClient.from('vehicles').select('*')

    if (type) query = query.eq('type', type)
    if (brand) query = query.eq('brand', brand)

    const { data, error } = await query

    if (error) throw error

    // Transform into unique lists for frontend
    const brands = [...new Set(data.map(v => v.brand))]
    const models = [...new Set(data.map(v => v.model))]

    return new Response(JSON.stringify({ brands, models, raw: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
