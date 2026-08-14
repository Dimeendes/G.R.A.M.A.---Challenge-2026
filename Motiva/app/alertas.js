import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { getAlerts } from './data/sensorsData';
import { useSensors } from './context/SensorsContext';

export default function Alertas() {
  const router = useRouter();
  const { logout } = useAuth();
  const { sensors } = useSensors();
  const alerts = getAlerts(sensors);

  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={require('../assets/motiva-logo-branca.png')} style={styles.logo} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Alertas</Text>
          <Text style={styles.subtitle}>
            {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} de grama muito alta
          </Text>

          {alerts.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#22C55E" />
              <Text style={styles.emptyText}>Nenhum alerta no momento</Text>
            </View>
          ) : (
            alerts.map((alert) => (
              <View key={alert.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="warning" size={22} color="#EF4444" />
                  <Text style={styles.cardTitle}>Grama muito alta</Text>
                </View>

                <Text style={styles.message}>{alert.message}</Text>

                <View style={styles.infoRow}>
                  <Ionicons name="trail-sign-outline" size={18} color="#5E22F3" />
                  <Text style={styles.infoText}>Rodovia: {alert.highway}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color="#5E22F3" />
                  <Text style={styles.infoText}>KM: {alert.km.toFixed(1)}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="leaf-outline" size={18} color="#5E22F3" />
                  <Text style={styles.infoText}>Altura: {alert.grassHeight} cm</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="radio-outline" size={18} color="#5E22F3" />
                  <Text style={styles.infoText}>Sensor ID: {alert.sensorId}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <View style={styles.navigationBar}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/map')}>
            <Ionicons name="map-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Mapa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/sensors')}>
            <Ionicons name="radio-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Sensores</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/home')}>
            <Ionicons name="home-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton}>
            <View style={styles.activeIcon}>
              <Ionicons name="notifications" size={24} color="#5E22F3" />
            </View>
            <Text style={styles.activeIconText}>Alertas</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  scroll:              { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent:       { paddingBottom: 110 },
  header:              { backgroundColor: '#5E22F3', height: 100, alignItems: 'center', justifyContent: 'center' },
  logo:                { height: 100, width: 200 },
  content:             { padding: 16 },
  title:               { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  subtitle:            { fontSize: 14, color: '#666', marginBottom: 16 },
  empty:               { alignItems: 'center', paddingVertical: 40 },
  emptyText:           { fontSize: 16, color: '#666', marginTop: 12 },
  card:                { backgroundColor: '#d0d0d0', borderRadius: 16, borderWidth: 1, borderColor: '#dfdfdf', padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  cardHeader:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle:           { fontSize: 18, fontWeight: 'bold', color: '#EF4444' },
  message:             { fontSize: 14, color: '#555', marginBottom: 12 },
  infoRow:             { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText:            { fontSize: 15, color: '#333' },
  navigationContainer: { position: 'absolute', bottom: 15, left: 15, right: 15 },
  navigationBar:       { height: 75, backgroundColor: '#d0d0d0', borderRadius: 25, borderWidth: 1, borderColor: '#dfdfdf', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  navButton:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  activeIcon:          { width: 42, height: 42, borderRadius: 21, backgroundColor: '#5d22f244', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  iconText:            { color: '#000', fontSize: 11, marginTop: 4 },
  activeIconText:      { color: '#5E22F3', fontSize: 11, fontWeight: 'bold' },
});
