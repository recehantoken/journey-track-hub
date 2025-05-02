
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables for Traccar
const TRACCAR_URL = Deno.env.get("TRACCAR_URL") || "https://demo.traccar.org";
const TRACCAR_USER = Deno.env.get("TRACCAR_USER") || "demo";
const TRACCAR_PASSWORD = Deno.env.get("TRACCAR_PASSWORD") || "demo";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const endpoint = url.searchParams.get('endpoint') || 'devices';
      
      // Get authentication token
      const authResponse = await fetch(`${TRACCAR_URL}/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(TRACCAR_USER)}&password=${encodeURIComponent(TRACCAR_PASSWORD)}`,
      });
      
      if (!authResponse.ok) {
        throw new Error(`Failed to authenticate with Traccar: ${authResponse.statusText}`);
      }
      
      const cookies = authResponse.headers.get('set-cookie');
      
      // Fetch data from Traccar
      const apiResponse = await fetch(`${TRACCAR_URL}/api/${endpoint}`, {
        headers: {
          'Cookie': cookies || '',
        },
      });
      
      if (!apiResponse.ok) {
        throw new Error(`Traccar API error: ${apiResponse.statusText}`);
      }
      
      const data = await apiResponse.json();
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
