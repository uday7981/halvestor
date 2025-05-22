// This is a scheduled function that will run daily to update stock prices
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Create a Supabase client with the service role key
const supabase = createClient(
  SUPABASE_URL || '', 
  SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

serve(async (req) => {
  try {
    // Check if this is a scheduled invocation
    const { scheduled } = await req.json();
    
    if (!scheduled) {
      return new Response(
        JSON.stringify({ error: 'This function is meant to be called on a schedule' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Starting scheduled stock price update...');
    
    // Call the update-stock-prices function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/update-stock-prices`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({})
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to call update-stock-prices: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    return new Response(
      JSON.stringify({
        message: 'Scheduled stock price update completed successfully',
        result
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scheduled stock price update:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : null
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
