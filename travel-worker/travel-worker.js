export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS Headers taaki aapki app isko access kar sake
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ✈️ FLIGHTS ROUTE (Asli Travelpayouts Data)
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
                        airline: apiData.data[key].airline || 'Unknown Airline',
                        price: apiData.data[key].price || 0,
                        departure_at: apiData.data[key].departure_at || '',
                        flight_number: apiData.data[key].flight_number || '',
                        link: apiData.data[key].link || ''
                    });
                }
            }
        }

        return new Response(JSON.stringify({ success: true, data: { flights: flights } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 🏨 HOTELS ROUTE (Abhi Test Data Hai)
    if (url.pathname === '/hotels') {
      const city = url.searchParams.get('city') || 'Delhi';
      
      // Jab Travelpayouts Hotel API ka access mil jaye, tab yahan asli API call laga denge
      let hotels = [
        { name: "The Grand Palace", price: "₹4,500", rating: "4.5", city: city },
        { name: "City Inn", price: "₹2,800", rating: "4.2", city: city },
        { name: "Luxury Stay", price: "₹6,000", rating: "4.8", city: city }
      ];

      return new Response(JSON.stringify({ success: true, data: { hotels: hotels } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Route not found', { status: 404, headers: corsHeaders });
  }
};
