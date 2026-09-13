import {
  Modal,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from "react-native-maps";
import { useRouter } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from 'react';
import { useSensors } from "./context/SensorsContext";
import markers from "./data/marker";
 import Constants from 'expo-constants';

export default function Map() {
  const { IPESP32 } = Constants.expoConfig.extra;
  const router = useRouter();
  const { logout } = useAuth();
  const { sensors, isLoading } = useSensors();
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [modalSensor, setModalSensor] = useState(false);
  const [searchSensor, setSearchSensor] = useState("");
  const mapRef = useRef(null);

  function selectSensor(sensor) {
    const marker = markers.find(
      (item) => Number(item.id) === Number(sensor.id)
    );

    setSelectedSensor({
      ...sensor,
      ...(marker || {}),
      nome: sensor.nome || marker?.nome || `Sensor ${sensor.id}`,
    });
  }
  const filteredSensors = sensors.filter((sensor) => {
  const search = searchSensor.toLowerCase();

  return (
    String(sensor.id).toLowerCase().includes(search) ||
    String(sensor.highway || "").toLowerCase().includes(search) ||
    String(sensor.km || "").toLowerCase().includes(search)
  );
});
  function decodePolyline(encoded) {
  const points = [];

  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat =
      result & 1 ? ~(result >> 1) : result >> 1;

    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng =
      result & 1 ? ~(result >> 1) : result >> 1;

    lng += deltaLng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}
  useEffect(() => {
  async function getUserLocation() {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Permissão de localização negada");
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  }

  getUserLocation();
}, []);
  async function getRoute(sensor) {
  try {
    if (!userLocation) {
      console.log(
        "A localização do usuário ainda não foi obtida"
      );
      return;
    }

    console.log(
      "Calculando rota até:",
      sensor.nome
    );

    setRouteCoordinates([]);

    console.log("URL da rota:", `http://${IPESP32}:5000/rota`);
    console.log("Origem:", userLocation);
    console.log("Destino:", {
    latitude: sensor.latitude,
    longitude: sensor.longitude,
  });

    const response = await fetch(
      `http://${IPESP32}:5000/rota`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          origin: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },

          destination: {
            latitude: sensor.latitude,
            longitude: sensor.longitude,
          },
        }),
      }
    );    

    const responseText = await response.text();

    console.log("STATUS:", response.status);
    console.log("RESPOSTA DO SERVIDOR:", responseText);

    if (!response.ok) {
      console.error(
        "Erro retornado pela API:",
        data
      );
      return;
    }

    const coordinates = decodePolyline(
      data.encodedPolyline
    );

    setRouteCoordinates(coordinates);

    console.log(
      "Distância:",
      data.distanceMeters,
      "metros"
    );

    console.log(
      "Duração:",
      data.duration
    );

  } catch (error) {
    console.error(
      "Erro ao calcular rota:",
      error
    );
  }
}
 
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
  <View style={styles.searchContainer}>
    <TouchableOpacity
      style={styles.sensorSelector}
      onPress={() => setModalSensor(true)}
    >
      <Ionicons name="radio-outline" size={20} color="#5E22F3" />
      <Text style={styles.sensorSelectorText}>
        {selectedSensor
          ? `Sensor #${selectedSensor.id}`
          : "Selecione um sensor"}
      </Text>
      <Ionicons name="chevron-down" size={20} color="#777" />
    </TouchableOpacity>

    {selectedSensor && (
      <TouchableOpacity
        style={styles.routeButton}
        onPress={() => getRoute(selectedSensor)}
        disabled={!userLocation}
      >
        <Ionicons name="navigate-outline" size={19} color="#FFFFFF" />
        <Text style={styles.routeButtonText}>
          Criar rota para {selectedSensor.nome}
        </Text>
      </TouchableOpacity>
    )}
  </View>
{userLocation ? (
  <MapView
    ref={mapRef}
    provider={PROVIDER_GOOGLE}
    style={styles.map}
    showsUserLocation={true}
    showsMyLocationButton={true}
    initialRegion={{
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }}
  >
    {markers.map((marker) => {
      const sensor = sensors.find(
        (item) => Number(item.id) === Number(marker.id)
      );

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
          onPress={() => getRoute({ ...sensor, ...marker })}
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

    {routeCoordinates.length > 0 && (
  <Polyline
    coordinates={routeCoordinates}
    strokeWidth={5}
    strokeColor="#5E22F3"
  />
)}
  </MapView>
) : (
  <View style={styles.locationLoading}>
    <Text>Obtendo sua localização...</Text>
  </View>
)}

      <Modal
        visible={modalSensor}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSensor(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.sensorModalContent}>
            <Text style={styles.modalTitle}>Escolha um sensor para criar uma rota</Text>
            
            <ScrollView
              style={styles.sensorList}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
              {filteredSensors.map((sensor) => (
                <TouchableOpacity
                  key={sensor.id}
                  style={styles.sensorOption}
                  onPress={() => {
                    selectSensor(sensor);
                    setSearchSensor("");
                    setModalSensor(false);
                  }}
                >
                  <Text style={styles.sensorOptionTitle}>
                    Sensor #{sensor.id}
                  </Text>
                  <Text style={styles.sensorOptionInfo}>
                    {sensor.highway || "Trecho não informado"}
                    {sensor.km !== undefined ? ` - KM ${Number(sensor.km).toFixed(1)}` : ""}
                  </Text>
                  <Text style={styles.sensorGrassHeight}>
                    Altura da grama: {sensor.grassHeight ?? "Não informada"} cm
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalSensor(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  locationLoading: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#fff",
},
  container: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: 18,
    left: 16,
    right: 16,
    zIndex: 20,
  },

  sensorSelector: {
    height: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  sensorSelectorText: {
    flex: 1,
    marginLeft: 10,
    color: "#222",
    fontSize: 16,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  sensorModalContent: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    marginBottom: 4,
    color: "#222",
    fontSize: 20,
    fontWeight: "bold",
  },

  sensorList: {
    maxHeight: 420,
    marginTop: 16,
  },

  sensorOption: {
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  sensorOptionTitle: {
    color: "#222",
    fontSize: 16,
    fontWeight: "bold",
  },

  sensorOptionInfo: {
    marginTop: 5,
    color: "#555",
    fontSize: 14,
  },

  sensorGrassHeight: {
    marginTop: 5,
    color: "#777",
    fontSize: 13,
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 6,
  },

  cancelButtonText: {
    color: "#5E22F3",
    fontSize: 15,
    fontWeight: "600",
  },

  routeButton: {
    marginTop: 8,
    minHeight: 46,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5E22F3",
    borderRadius: 10,
    elevation: 4,
  },

  routeButtonText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
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