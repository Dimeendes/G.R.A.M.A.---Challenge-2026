import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { useRouter } from "expo-router";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from '@expo/vector-icons';
import { useSensors } from "./context/SensorsContext";
import { useAuth } from "./context/AuthContext";
import markers from "./data/marker";
import { buscarRota } from "../services/rotas";
 
export default function Map() {
  const { sensors, isLoading } = useSensors();
  const { logout } = useAuth();
  const router = useRouter();
 
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [sensorSelecionado, setSensorSelecionado] = useState(null);
 
  const [rota, setRota] = useState([]);
  const [distancia, setDistancia] = useState(null);
  const [duracao, setDuracao] = useState(null);
 
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(true);
  const [calculandoRota, setCalculandoRota] = useState(false);
  const [sensorIdBusca, setSensorIdBusca] = useState("");
  const [mensagemBusca, setMensagemBusca] = useState("");
  const mapRef = useRef(null);
 
  // ============================================================
  // PEGA A LOCALIZAÇÃO DO USUÁRIO
  // ============================================================
 
  useEffect(() => {
    async function obterLocalizacao() {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();
 
        if (status !== "granted") {
          console.log("Permissão de localização negada.");
          return;
        }
 
        const location =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
 
        setLocalizacaoUsuario({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error(
          "Erro ao obter localização:",
          error
        );
      } finally {
        setCarregandoLocalizacao(false);
      }
    }
 
    obterLocalizacao();
  }, []);
 
  // ============================================================
  // COR DO MARCADOR
  // ============================================================
 
  function getMarkerColor(grassHeight) {
    if (grassHeight <= 10) {
      return "#22C55E"; // Verde
    }
 
    if (grassHeight < 30) {
      return "#F59E0B"; // Amarelo
    }
 
    return "#EF4444"; // Vermelho
  }
 
  // ============================================================
  // SELECIONAR SENSOR
  // ============================================================
 
  function selecionarSensor(sensor, marker) {
    setSensorSelecionado({
      ...sensor,
      latitude: marker.latitude,
      longitude: marker.longitude,
      nome: marker.nome,
    });
 
    // Remove a rota anterior
    setRota([]);
    setDistancia(null);
    setDuracao(null);
  }

  function focarNoSensor(sensor, marker) {
    setMensagemBusca("");
    setSensorIdBusca(String(sensor.id));
    mapRef.current?.animateToRegion(
      {
        latitude: marker.latitude,
        longitude: marker.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500
    );
    selecionarSensor(sensor, marker);
  }

  function buscarSensorPorId() {
    const idBuscado = sensorIdBusca.trim();
    const marker = markers.find(
      (item) => String(item.id) === idBuscado
    );
    const sensor = sensors.find(
      (item) => String(item.id) === idBuscado
    );

    if (!marker || !sensor) {
      setMensagemBusca("Sensor não encontrado.");
      return;
    }

    focarNoSensor(sensor, marker);
  }

  const sensoresSugeridos = sensorIdBusca === ""
    ? []
    : markers
      .filter((marker) => String(marker.id).startsWith(sensorIdBusca))
      .map((marker) => ({
        marker,
        sensor: sensors.find((item) => Number(item.id) === Number(marker.id)),
      }))
      .filter(({ sensor }) => sensor);
 
  // ============================================================
  // CALCULAR ROTA
  // ============================================================
 
  async function calcularRota() {
    if (!localizacaoUsuario) {
      console.log("Localização do usuário ainda não disponível.");
      return;
    }
 
    if (!sensorSelecionado) {
      console.log("Nenhum sensor selecionado.");
      return;
    }
 
    try {
      setCalculandoRota(true);
 
      const resultado = await buscarRota(
        localizacaoUsuario,
        {
          latitude: sensorSelecionado.latitude,
          longitude: sensorSelecionado.longitude,
        }
      );
 
      setRota(resultado.coordenadas);
      setDistancia(resultado.distanciaKm);
      setDuracao(resultado.duracao);
 
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
    } finally {
      setCalculandoRota(false);
    }
  }
 
  return (
<View style={styles.container}>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          value={sensorIdBusca}
          onChangeText={(value) => {
            setSensorIdBusca(value.replace(/[^0-9]/g, ""));
            setMensagemBusca("");
          }}
          onSubmitEditing={buscarSensorPorId}
          placeholder="Buscar sensor por ID"
          placeholderTextColor="#777"
          keyboardType="number-pad"
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={buscarSensorPorId}
          accessibilityLabel="Buscar sensor"
        >
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {mensagemBusca !== "" && (
        <Text style={styles.searchMessage}>{mensagemBusca}</Text>
      )}

      {sensoresSugeridos.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {sensoresSugeridos.map(({ marker, sensor }) => (
            <TouchableOpacity
              key={marker.id}
              style={styles.suggestion}
              onPress={() => focarNoSensor(sensor, marker)}
            >
              <Ionicons name="radio-outline" size={18} color="#5E22F3" />
              <Text style={styles.suggestionText}>
                Sensor #{sensor.id}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
 
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
 
        initialRegion={{
          latitude: -23.5350,
          longitude: -46.7848,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
 
        showsUserLocation={true}
        showsMyLocationButton={true}
>
 
        {/* ================================================== */}
        {/* MARCADORES DOS SENSORES */}
        {/* ================================================== */}
 
        {markers.map((marker) => {
 
          // Procura os dados desse sensor na API/context
          const sensor = sensors.find(
            (item) =>
              Number(item.id) === Number(marker.id)
          );
 
          // Se ainda não recebeu os dados, não mostra marcador
          if (!sensor) {
            return null;
          }
 
          const markerColor =
            getMarkerColor(sensor.grassHeight);
 
          return (
<Marker
              key={marker.id}
 
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
 
              title={marker.nome}
 
              description={`${sensor.grassHeight} cm de vegetação`}
 
              onPress={() =>
                selecionarSensor(sensor, marker)
              }
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
 
        {/* ================================================== */}
        {/* ROTA */}
        {/* ================================================== */}
 
        {rota.length > 0 && (
<Polyline
            coordinates={rota}
            strokeWidth={5}
            strokeColor="#2563EB"
          />
        )}
 
      </MapView>
 
      {/* ==================================================== */}
      {/* CARREGANDO SENSORES */}
      {/* ==================================================== */}
 
      {isLoading && (
<View style={styles.loading}>
<Text style={styles.loadingText}>
            Carregando sensores...
</Text>
</View>
      )}
 
      {/* ==================================================== */}
      {/* LOCALIZAÇÃO */}
      {/* ==================================================== */}
 
      {carregandoLocalizacao && (
<View style={styles.locationLoading}>
<ActivityIndicator size="small" />
 
          <Text style={styles.locationLoadingText}>
            Obtendo localização...
</Text>
</View>
      )}
 
      {/* ==================================================== */}
      {/* PAINEL DO SENSOR */}
      {/* ==================================================== */}
 
      {sensorSelecionado && (
<View style={styles.sensorPanel}>
 
          <Text style={styles.sensorTitle}>
            {sensorSelecionado.nome}
</Text>
 
          <Text style={styles.sensorInfo}>
            Vegetação:{" "}
            {sensorSelecionado.grassHeight} cm
</Text>
 
          <Text style={styles.sensorInfo}>
            Rodovia:{" "}
            {sensorSelecionado.highWay}
</Text>
 
          <Text style={styles.sensorInfo}>
            KM:{" "}
            {sensorSelecionado.km}
</Text>
 
          {/* ================================================= */}
          {/* INFORMAÇÕES DA ROTA */}
          {/* ================================================= */}
 
          {distancia && (
<View style={styles.routeInfo}>
 
              <Text style={styles.routeText}>
                📍 Distância: {distancia} km
</Text>
 
              {duracao && (
<Text style={styles.routeText}>
                  🕐 Tempo estimado:{" "}
                  {formatarDuracao(duracao)}
</Text>
              )}
 
            </View>
          )}
 
          {/* ================================================= */}
          {/* BOTÃO CALCULAR ROTA */}
          {/* ================================================= */}
 
          <TouchableOpacity
            style={styles.routeButton}
            onPress={calcularRota}
            disabled={
              calculandoRota ||
              !localizacaoUsuario
            }
>
 
            {calculandoRota ? (
<ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
<Text style={styles.routeButtonText}>
                Calcular rota
</Text>
            )}
 
          </TouchableOpacity>
 
          {/* ================================================= */}
          {/* FECHAR */}
          {/* ================================================= */}
 
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setSensorSelecionado(null);
              setRota([]);
              setDistancia(null);
              setDuracao(null);
            }}>
 
            <Text style={styles.closeButtonText}>Fechar</Text>
 
          </TouchableOpacity>
 
        </View>
      )}
      <View style={styles.navigationContainer}>
              <View style={styles.navigationBar}>
                <TouchableOpacity style={styles.navButton} onPress={() => router.push('/sensors')}>
                  <Ionicons name="radio-outline" size={24} color="#000" />
                  <Text style={styles.iconText}>Sensores</Text>
                </TouchableOpacity>
      
                <TouchableOpacity style={styles.navButton} onPress={() => router.push('/map')}>
                  <Ionicons name="map-outline" size={24} color="#000" />
                  <Text style={styles.iconText}>Mapa</Text>
                </TouchableOpacity>
      
                <TouchableOpacity style={styles.navButton}>
                  <View style={styles.activeIcon}>
                    <Ionicons name="map" size={24} color="#5E22F3" />
                  </View>
                  <Text style={styles.activeIconText}>Mapa</Text>
                </TouchableOpacity>
      
                <TouchableOpacity style={styles.navButton} onPress={() => router.push('/OrdemServico')}>
                  <Ionicons name="document-outline" size={24} color="#000" />
                  <Text style={styles.iconText}>OS</Text>
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
 
// ============================================================
// FORMATA DURAÇÃO DA GOOGLE ROUTES API
// ============================================================
 
function formatarDuracao(duration) {
  if (!duration) {
    return "";
  }
 
  // Exemplo recebido pela API:
  // "123s"
 
  const segundos = parseInt(
    duration.replace("s", ""),
    10
  );
 
  if (isNaN(segundos)) {
    return duration;
  }
 
  const minutos = Math.round(
    segundos / 60
  );
 
  if (minutos < 60) {
    return `${minutos} min`;
  }
 
  const horas = Math.floor(
    minutos / 60
  );
 
  const minutosRestantes =
    minutos % 60;
 
  return `${horas}h ${minutosRestantes}min`;
}
 
// ============================================================
// ESTILOS
// ============================================================
 
const styles = StyleSheet.create({
 
  container: {
    flex: 1,
  },
 
  map: {
    width: "100%",
    height: "100%",
  },

  searchContainer: {
    position: "absolute",
    top: 20,
    left: 16,
    right: 16,
    zIndex: 5,
    elevation: 5,
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingLeft: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  searchInput: {
    flex: 1,
    color: "#333",
    fontSize: 15,
    marginLeft: 8,
  },

  searchButton: {
    height: 52,
    width: 52,
    backgroundColor: "#5E22F3",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  searchMessage: {
    position: "absolute",
    top: 80,
    left: 20,
    zIndex: 5,
    elevation: 5,
    backgroundColor: "#FFFFFF",
    color: "#B91C1C",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 13,
  },

  suggestionsContainer: {
    position: "absolute",
    top: 78,
    left: 16,
    right: 16,
    zIndex: 6,
    elevation: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  suggestion: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  suggestionText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
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
 
  // ==========================================================
  // LOADING SENSORES
  // ==========================================================
 
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
 
  // ==========================================================
  // LOADING LOCALIZAÇÃO
  // ==========================================================
 
  locationLoading: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
 
  locationLoadingText: {
    color: "#333",
    fontWeight: "600",
  },
 
  // ==========================================================
  // PAINEL SENSOR
  // ==========================================================
 
  sensorPanel: {
    position: "absolute",
    bottom: 110,
    left: 20,
    right: 20,
 
    backgroundColor: "#FFFFFF",
 
    padding: 18,
 
    borderRadius: 16,
 
    elevation: 8,
 
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
 
  sensorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
 
  sensorInfo: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
 
  // ==========================================================
  // INFORMAÇÕES DA ROTA
  // ==========================================================
 
  routeInfo: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
  },
 
  routeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1D4ED8",
    marginBottom: 3,
  },
 
  // ==========================================================
  // BOTÃO
  // ==========================================================
 
  routeButton: {
    marginTop: 14,
 
    backgroundColor: "#2563EB",
 
    paddingVertical: 12,
 
    borderRadius: 10,
 
    alignItems: "center",
    justifyContent: "center",
  },
 
  routeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
 
  // ==========================================================
  // FECHAR
  // ==========================================================
 
  closeButton: {
    marginTop: 8,
 
    paddingVertical: 8,
 
    alignItems: "center",
  },
 
  closeButtonText: {
    color: "#6B7280",
    fontWeight: "600",
  },

  navigationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },

  navigationBar: {
    height: 95,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
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

  iconText: {
    color: "#000",
    fontSize: 11,
    marginTop: 4,
  },

  activeIconText: {
    color: "#5E22F3",
    fontSize: 11,
    fontWeight: "bold",
  },
 
});