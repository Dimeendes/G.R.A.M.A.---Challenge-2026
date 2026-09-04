import "dotenv/config";

export default {
  expo: {
    name: "Meu App",
    slug: "meu-app",
    version: "1.0.0",
    orientation: "portrait",
 
    android: {
        config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        }
      }
    }
  },
};