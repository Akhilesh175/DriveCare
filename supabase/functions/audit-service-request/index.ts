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

    const { user_id, vehicle_id, service_id, lat, lng, payment_type } = await req.json()
    let integrityScore = 100
    const alerts = []

    // 1. Duplicate Prevention & Spam Check
    const { data: recentRequests } = await supabaseClient
      .from('recent_user_requests')
      .select('request_count')
      .eq('user_id', user_id)
      .single()

    if (recentRequests && recentRequests.request_count >= 1) {
      integrityScore -= 50
      alerts.push('Spam/Duplicate: Active or recent request found.')
    }

    // 2. User Trust Score Check (Cancellations)
    const { data: trustData } = await supabaseClient
      .from('user_trust_scores')
      .select('total_cancellations')
      .eq('user_id', user_id)
      .single()

    if (trustData && trustData.total_cancellations >= 3) {
      if (payment_type === 'post-service') {
        return new Response(JSON.stringify({ 
          status: 'REJECTED', 
          integrityScore: 30, 
          alerts: ['Low Trust Score: 3+ cancellations found. "Pay After Service" is blocked.'] 
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      integrityScore -= 20
      alerts.push('History Alert: User has high cancellation rate.')
    }

    // 3. Vehicle-Service Logic Check
    const { data: vehicle } = await supabaseClient.from('vehicles').select('type, brand').eq('id', vehicle_id).single()
    const { data: service } = await supabaseClient.from('services').select('vehicle_type, service_name').eq('id', service_id).single()

    if (vehicle.type !== service.vehicle_type) {
      return new Response(JSON.stringify({ 
        status: 'REJECTED', 
        integrityScore: 10, 
        alerts: [`Incompatible Request: ${service.service_name} on ${vehicle.type}.`] 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 4. Radius Guard (Geofencing)
    // Primary Service Zone: Mathura (approx center 27.4924, 77.6737)
    const centerLat = 27.4924, centerLng = 77.6737
    const distance = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2)) * 111 // rough km
    if (distance > 15) {
      return new Response(JSON.stringify({ 
        status: 'REJECTED', 
        integrityScore: 0, 
        alerts: ['Radius Guard: No mechanics available within 15km of this location.'] 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const status = integrityScore > 80 ? 'APPROVED' : integrityScore > 40 ? 'MANUAL_REVIEW' : 'REJECTED'

    return new Response(JSON.stringify({ status, integrityScore, alerts }), {
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
