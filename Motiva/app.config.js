import "dotenv/config";

export default {
  expo: {
    name: "Meu App",
    slug: "meu-app",
    version: "1.0.0",
    orientation: "portrait",
    extra: {
      admUser: process.env.admUser,
      admPassword: process.env.admPassword,
      funcionarioUser: process.env.funcionarioUser,
      funcionarioPassword: process.env.funcionarioPassword,
      IPESP32: process.env.EXPO_PUBLIC_ESP32_URL,
    },
    android: {
        config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
        googleRoutes: {
          apiKey: process.env.GOOGLE_ROUTES_API_KEY,
        }
      }
    }
  },
};