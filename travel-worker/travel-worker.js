export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // CORS preflight request handle karein
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Flights API route
    if (url.pathname === '/flights') {
      const origin = url.searchParams.get('origin') || 'DEL';
      const destination = url.searchParams.get('destination') || 'BOM';
      
      try {
        // Travelpayouts API ko call karein
        const apiRes = await fetch(`https://api.travelpayouts.com/v1/prices/cheap?origin=${origin}&destination=${destination}&token=${env.TRAVELPAYOUTS_TOKEN}`);
        const apiData = await apiRes.json();
        
        // Travelpayouts ka data format thoda alag hota hai, hum usey saaf karke bhejenge
        let flights = [];
        if (apiData.success && apiData.data) {
            // Data ko format karein taaki frontend aasani se padh sake
            for (const key in apiData.data) {
                if (apiData.data.hasOwnProperty(key)) {
                    flights.push({
                        airline: apiData.data[key].airline || 'Unknown',
                        price: apiData.data[key].price || 0,
                        departure_at: apiData.data[key].departure_at || '',
                        return_at: apiData.data[key].return_at || '',
                        flight_number: apiData.data[key].flight_number || ''
                    });
                }
            }
        }

        return new Response(JSON.stringify({
          success: true,
          data: { flights: flights }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Route not found', { status: 404, headers: corsHeaders });
  }
};
