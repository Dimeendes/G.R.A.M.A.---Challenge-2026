import { StyleSheet, View, Text } from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
 
import { useSensors } from "./context/SensorsContext";
import markers from "./data/marker";
 
export default function Map() {
  const { sensors, isLoading } = useSensors();
 
  function getMarkerColor(grassHeight) {
    if (grassHeight <= 10) {
      return "#22C55E"; // Verde
    }
 
    if (grassHeight <= 30) {
      return "#F59E0B"; // Amarelo
    }
 
    return "#EF4444"; // Vermelho
  }
 
  return (
<View style={styles.container}>
<MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: -23.5350,
          longitude: -46.7848,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
>
        {markers.map((marker) => {
          // Procura os dados desse sensor na API/context
          const sensor = sensors.find(
            (item) => Number(item.id) === Number(marker.id)
          );
 
          // Se ainda não recebeu os dados, não mostra marcador
          if (!sensor) {
            return null;
          }
 
          const markerColor = getMarkerColor(sensor.grassHeight);
 
          return (
<Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.nome}
              description={`${sensor.grassHeight} cm de vegetação`}
>
<View
                style={[
                  styles.marker,
                  {
                    backgroundColor: markerColor,
                  },
                ]}
>
<Text style={styles.markerText}>
                  {marker.id}
</Text>
</View>
</Marker>
          );
        })}
</MapView>
 
      {isLoading && (
<View style={styles.loading}>
<Text style={styles.loadingText}>
            Carregando sensores...
</Text>
</View>
      )}
</View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
 
  map: {
    width: "100%",
    height: "100%",
  },
 
  marker: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 5,
  },
 
  markerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
 
  loading: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    elevation: 5,
  },
 
  loadingText: {
    textAlign: "center",
    color: "#333",
    fontWeight: "600",
  },
});