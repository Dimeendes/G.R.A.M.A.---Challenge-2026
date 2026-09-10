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
    },
    android: {
        config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        }
      }
    }
  },
};