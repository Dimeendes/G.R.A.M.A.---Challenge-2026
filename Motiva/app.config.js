import "dotenv/config";

export default {
  expo: {
    name: "Meu App",
    slug: "meu-app",
    version: "1.0.0",
    orientation: "portrait",
    extra: {
      IPESP32: process.env.EXPO_PUBLIC_ESP32_URL,
    },
    android: {
        config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
        googleRoutes: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY,
        }
      }
    }
  },
};