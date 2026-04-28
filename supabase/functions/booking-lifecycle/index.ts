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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, booking_id, mechanic_id } = await req.json()

    if (action === 'accept') {
      const { data, error } = await supabaseClient
        .from('bookings')
        .update({ 
          status: 'in-progress', 
          mechanic_id: mechanic_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking_id)
        .eq('status', 'pending') // Only accept if still pending
        .select()

      if (error) throw error
      if (!data.length) throw new Error('Booking no longer available')

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'decline') {
      // In a real scenario, we might keep it pending but mark this mechanic as having declined it
      // For now, we'll just log or return to pool
      return new Response(JSON.stringify({ success: true, message: 'Declined logged' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
