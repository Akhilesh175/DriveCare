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

    const { action, booking_id, payment_intent_id } = await req.json()

    // Scenario A: Verify payment on booking
    if (action === 'verify-upfront') {
      // Here you would normally verify the payment with Stripe/Razorpay
      // Mocking success:
      const { error } = await supabaseClient
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', booking_id)

      if (error) throw error
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Scenario B: Process payment request after completion
    if (action === 'request-post-payment') {
      const { error } = await supabaseClient
        .from('bookings')
        .update({ payment_status: 'unpaid' }) // Ensure it's ready for payment
        .eq('id', booking_id)
        .eq('status', 'completed')

      if (error) throw error
      // In real app, trigger SMS/Notification to user with payment link
      return new Response(JSON.stringify({ success: true, message: 'Payment requested from user' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error('Invalid action')

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
