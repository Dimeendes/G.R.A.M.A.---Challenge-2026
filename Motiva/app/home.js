import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useSensors } from './context/SensorsContext';
import { Ionicons } from '@expo/vector-icons';
import { getHighwaysSummary } from './data/sensorsData';

export default function Home() {
  const router = useRouter();
  const { logout } = useAuth();
  const { sensors, simulateCut, isLoading, source } = useSensors();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSensorId, setSelectedSensorId] = useState(null);

  const highways = getHighwaysSummary(sensors);
  const totalAlerts = highways.reduce((acc, highway) => acc + highway.alerts, 0);

  function openModal() {
    setSelectedSensorId(null);
    setIsModalVisible(true);
  }

  function closeModal() {
    setIsModalVisible(false);
    setSelectedSensorId(null);
  }

  function confirmCut() {
    if (!selectedSensorId) return;
    simulateCut(selectedSensorId);
    closeModal();
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={require('../assets/motiva-logo-branca.png')} style={styles.logo} />
        </View>

        <View style={styles.home}>
          <Text style={styles.title}>Painel Geral</Text>
          <Text style={styles.subtitle}>Monitoramento rodoviário em tempo real</Text>

          <View style={styles.summaryPanel}>
            <View style={styles.summaryItem}>
              <Ionicons name="trail-sign-outline" size={24} color="#5E22F3" />
              <Text style={styles.summaryNumber}>{highways.length}</Text>
              <Text style={styles.summaryLabel}>Rodovias</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="radio-outline" size={24} color="#5E22F3" />
              <Text style={styles.summaryNumber}>{sensors.length}</Text>
              <Text style={styles.summaryLabel}>Sensores</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="warning-outline" size={24} color="#EF4444" />
              <Text style={styles.summaryNumber}>{totalAlerts}</Text>
              <Text style={styles.summaryLabel}>Alertas</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Rodovias monitoradas</Text>

          {highways.map((highway) => (
            <View key={highway.name} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{highway.name}</Text>
                {highway.alerts > 0 && (
                  <View style={styles.alertBadge}>
                    <Text style={styles.badgeText}>
                      {highway.alerts} alerta{highway.alerts !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="radio-outline" size={18} color="#5E22F3" />
                <Text style={styles.infoText}>{highway.totalSensors} sensores instalados</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="resize-outline" size={18} color="#5E22F3" />
                <Text style={styles.infoText}>
                  Extensão: {highway.lengthKm.toFixed(1)} km (KM {highway.kmMin.toFixed(1)} – {highway.kmMax.toFixed(1)})
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="leaf-outline" size={18} color="#5E22F3" />
                <Text style={styles.infoText}>Altura média da grama: {highway.averageHeight} cm</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Simular corte</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Selecione o sensor para simular o corte da grama:</Text>

            <ScrollView style={styles.sensorList} nestedScrollEnabled>
              {sensors.map((sensor) => {
                const isSelected = selectedSensorId === sensor.id;

                return (
                  <TouchableOpacity
                    key={sensor.id}
                    style={[styles.sensorOption, isSelected && styles.sensorOptionSelected]}
                    onPress={() => setSelectedSensorId(sensor.id)}
                  >
                    <View style={styles.sensorOptionInfo}>
                      <Text style={styles.sensorOptionTitle}>Sensor #{sensor.id}</Text>
                      <Text style={styles.sensorOptionDetail}>
                        {sensor.highway} · KM {sensor.km.toFixed(1)} · {sensor.grassHeight} cm
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={22} color="#5E22F3" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.confirmButton, !selectedSensorId && styles.confirmButtonDisabled]}
              onPress={confirmCut}
              disabled={!selectedSensorId}
            >
              <Ionicons name="cut" size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>Simular corte</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

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
              <Ionicons name="home" size={24} color="#5E22F3" />
            </View>
            <Text style={styles.activeIconText}>Home</Text>
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
  container:             { flex: 1, backgroundColor: '#f5f5f5' },
  scroll:                { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent:         { paddingBottom: 110 },
  header:                { backgroundColor: '#5E22F3', height: 100, alignItems: 'center', justifyContent: 'center' },
  logo:                  { height: 100, width: 200 },
  home:                  { padding: 16 },
  title:                 { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  subtitle:              { fontSize: 14, color: '#666', marginBottom: 6 },
  sourceText:            { fontSize: 12, color: '#5E22F3', fontWeight: '600', marginBottom: 16 },
  summaryPanel:          { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#d0d0d0', borderRadius: 16, borderWidth: 1, borderColor: '#5E22F3', padding: 16, marginBottom: 16 },
  summaryItem:           { alignItems: 'center', flex: 1 },
  summaryNumber:         { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 6 },
  summaryLabel:          { fontSize: 12, color: '#666', marginTop: 2 },
  cutButton:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#5E22F3', borderRadius: 16, paddingVertical: 14, marginBottom: 20 },
  cutButtonText:         { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sectionTitle:          { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  card:                  { backgroundColor: '#d0d0d0', borderRadius: 16, borderWidth: 1, borderColor: '#5E22F3', padding: 16, marginBottom: 12 },
  cardHeader:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle:             { fontSize: 18, fontWeight: 'bold', color: '#333' },
  alertBadge:            { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText:             { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  infoRow:               { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText:              { fontSize: 15, color: '#333', flex: 1 },
  modalOverlay:          { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent:          { backgroundColor: '#d0d0d0', borderRadius: 20, borderWidth: 1, borderColor: '#dfdfdf', width: '100%', maxWidth: 400, maxHeight: '80%', padding: 20 },
  modalHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle:            { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalSubtitle:         { fontSize: 14, color: '#666', marginBottom: 12 },
  sensorList:            { maxHeight: 280, marginBottom: 16 },
  sensorOption:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#bbb', borderRadius: 12, borderWidth: 1, borderColor: '#dfdfdf', padding: 12, marginBottom: 8 },
  sensorOptionSelected:  { borderColor: '#5E22F3', backgroundColor: '#5d22f222' },
  sensorOptionInfo:      { flex: 1 },
  sensorOptionTitle:     { fontSize: 15, fontWeight: 'bold', color: '#333' },
  sensorOptionDetail:    { fontSize: 13, color: '#555', marginTop: 2 },
  confirmButton:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#5E22F3', borderRadius: 14, paddingVertical: 14 },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmButtonText:     { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  navigationContainer:   { position: 'absolute', bottom: 15, left: 15, right: 15, zIndex: 10 },
  navigationBar:         { height: 75, backgroundColor: '#d0d0d0', borderRadius: 25, borderWidth: 1, borderColor: '#dfdfdf', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  navButton:             { flex: 1, alignItems: 'center', justifyContent: 'center' },
  activeIcon:            { width: 42, height: 42, borderRadius: 21, backgroundColor: '#5d22f244', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  iconText:              { color: '#000', fontSize: 11, marginTop: 4 },
  activeIconText:        { color: '#5E22F3', fontSize: 11, fontWeight: 'bold' },
});
