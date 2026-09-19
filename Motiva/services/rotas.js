import polyline from "@mapbox/polyline";

const GOOGLE_ROUTES_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY ||
  process.env.GOOGLE_ROUTES_API_KEY;

export async function buscarRota(origem, destino) {
  try {
    if (!origem || !destino) {
      throw new Error("Origem ou destino não informado.");
    }

    if (!GOOGLE_ROUTES_API_KEY) {
      throw new Error(
        "Chave da Google Routes API ausente. Defina EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY no .env."
      );
    }

    console.log("ROUTES API KEY:", GOOGLE_ROUTES_API_KEY);
    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_ROUTES_API_KEY,
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
        },
 
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: origem.latitude,
                longitude: origem.longitude,
              },
            },
          },
 
          destination: {
            location: {
              latLng: {
                latitude: destino.latitude,
                longitude: destino.longitude,
              },
            },
          },
 
          travelMode: "DRIVE",
 
          routingPreference: "TRAFFIC_AWARE",
 
          polylineQuality: "HIGH_QUALITY",
 
          polylineEncoding: "ENCODED_POLYLINE",
        }),
      }
    );
 
    const data = await response.json();
 
    if (!response.ok) {
      console.error("Erro Google Routes API:", data);
 
      throw new Error(
        data?.error?.message ||
        "Erro ao calcular rota."
      );
    }
 
    if (!data.routes || data.routes.length === 0) {
      throw new Error("Nenhuma rota encontrada.");
    }
 
    const rota = data.routes[0];
 
    const coordenadas = polyline
      .decode(rota.polyline.encodedPolyline)
      .map(([latitude, longitude]) => ({
        latitude,
        longitude,
      }));
 
    return {
      coordenadas,
      distanciaMetros: rota.distanceMeters,
      distanciaKm: (rota.distanceMeters / 1000).toFixed(2),
      duracao: rota.duration,
    };
 
  } catch (error) {
    console.error("Erro ao buscar rota:", error);
    throw error;
  }
}