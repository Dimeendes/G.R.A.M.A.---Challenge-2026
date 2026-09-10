import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { useRouter } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
 
import { useSensors } from "./context/SensorsContext";
import markers from "./data/marker";
 
export default function Map() {
  const router = useRouter();
  const { logout } = useAuth();
  const { sensors, isLoading } = useSensors();
 
  function getMarkerColor(grassHeight) {
    if (grassHeight <= 10) {
      return "#22C55E"; // Verde
    }
 
    if (grassHeight < 30) {
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

      <View style={styles.navigationContainer}>
        <View style={styles.navigationBar}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/sensors')}>
            <Ionicons name="radio-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Sensores</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/OrdemServico')}>
            <Ionicons name="document-outline" size={24} color="#000" />
            <Text style={styles.iconText}>OS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton}>
            <View style={styles.activeIcon}>
              <Ionicons name="map" size={24} color="#5E22F3" />
            </View>
            <Text style={styles.activeIconText}>Mapa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/home')}>
            <Ionicons name="home-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/alertas')}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Alertas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              logout();
              router.push('/');
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
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

  navigationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  navigationBar: {
    height: 95,
    backgroundColor: "#fff",
    borderWidth: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -12 }],
  },

  activeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#5d22f244",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  iconText: { color: "#000", fontSize: 11, marginTop: 4 },
  activeIconText: { color: "#5E22F3", fontSize: 11, fontWeight: "bold" },
});