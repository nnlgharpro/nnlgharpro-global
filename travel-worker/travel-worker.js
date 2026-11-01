export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ✈️ FLIGHTS ROUTE
    if (url.pathname === '/flights') {
      const origin = url.searchParams.get('origin') || 'DEL';
      const destination = url.searchParams.get('destination') || 'BOM';
      
      try {
        const apiRes = await fetch(`https://api.travelpayouts.com/v1/prices/cheap?origin=${origin}&destination=${destination}&token=${env.TRAVELPAYOUTS_TOKEN}`);
        const apiData = await apiRes.json();
        
        let flights = [];
        if (apiData.success && apiData.data) {
            for (const key in apiData.data) {
                if (apiData.data.hasOwnProperty(key)) {
                    flights.push({
                        airline: apiData.data[key].airline || 'Unknown',
                        price: apiData.data[key].price || 0,
                        departure_at: apiData.data[key].departure_at || '',
                        flight_number: apiData.data[key].flight_number || ''
                    });
                }
            }
        }
        return new Response(JSON.stringify({ success: true, data: { flights: flights } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 🏨 HOTELS ROUTE (Jab aapko access milega tab kaam karega)
    if (url.pathname === '/hotels') {
      const city = url.searchParams.get('city') || 'Delhi';
      
      try {
        // Note: Yeh Travelpayouts ki Hotel API ka endpoint hai. 
        // Abhi ke liye yeh dummy data bhejega kyunki aapke paas access nahi hai.
        // Jab access milega, tab isko real API se replace kar denge.
        
        let hotels = [
            { name: "The Grand Hotel", price: "₹4,500", rating: "4.5" },
            { name: "City Palace Stay", price: "₹2,800", rating: "4.2" }
        ];

        return new Response(JSON.stringify({ success: true, data: { hotels: hotels } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Route not found', { status: 404, headers: corsHeaders });
  }
};
