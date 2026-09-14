import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { CRITICAL_HEIGHT, getGrassHeightStatus } from './data/sensorsData';
import { useSensors } from './context/SensorsContext';

export default function Sensors() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isGerente = user?.role === "gerente";
  const isFuncionario = user?.role === "funcionario";
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const { sensors } = useSensors();
  const [sortConfig, setSortConfig] = useState(null);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const sortedSensors = useMemo(() => {
    if (!sortConfig) {
      return sensors;
    }

    return [...sensors].sort((firstSensor, secondSensor) => {
      const firstValue = Number(firstSensor[sortConfig.field]);
      const secondValue = Number(secondSensor[sortConfig.field]);

      return (firstValue - secondValue) * sortConfig.direction;
    });
  }, [sensors, sortConfig]);

  const sortOptions = [
    { label: 'Altura: maior para menor', field: 'grassHeight', direction: -1 },
    { label: 'Altura: menor para maior', field: 'grassHeight', direction: 1 },
    { label: 'ID: maior para menor', field: 'id', direction: -1 },
    { label: 'ID: menor para maior', field: 'id', direction: 1 },
    { label: 'KM: maior para menor', field: 'km', direction: -1 },
    { label: 'KM: menor para maior', field: 'km', direction: 1 },
  ];

  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={require('../assets/motiva-logo-branca.png')} style={styles.logo} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Sensores</Text>
          <Text style={styles.subtitle}>
            {sensors.length} sensores monitorados
          </Text>

          <TouchableOpacity style={styles.sortButton} onPress={() => setSortModalVisible(true)}>
            <Ionicons name="funnel-outline" size={18} color="#fff" />
            <Text style={styles.sortButtonText}>Ordenar sensores</Text>
          </TouchableOpacity>

          {sortedSensors.map((sensor) => {
            const status = getGrassHeightStatus(sensor.grassHeight);

            return (
              <TouchableOpacity
                key={sensor.id}
                style={[styles.card, { borderColor: status.color }]}
                onPress={() => {
                  setSelectedSensor(sensor);
                  setModalVisible(true);
                }}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Sensor #{sensor.id}</Text>
                  <View style={[styles.badge, { backgroundColor: status.color }]}>
                    <Text style={styles.badgeText}>{status.label}</Text>
                  </View>
                </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="trail-sign-outline" size={18} color="#5E22F3" />
                    <Text style={styles.infoText}>Rodovia: {sensor.highway}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={18} color="#5E22F3" />
                    <Text style={styles.infoText}>KM: {sensor.km.toFixed(1)}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="leaf-outline" size={18} color="#5E22F3" />
                    <Text style={styles.infoText}>Altura da grama: {sensor.grassHeight} cm</Text>
                  </View>

                <View style={styles.infoButton}>
                    <Text style={styles.infoButtonText}>Ver Detalhes</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {sortedSensors.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhum sensor encontrado com esse filtro.</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {sortModalVisible && (
        <View style={styles.sortModalOverlay}>
          <View style={styles.sortModalContent}>
            <Text style={styles.sortModalTitle}>Ordenar sensores</Text>
            <Text style={styles.sortModalSubtitle}>Escolha o critério e a direção:</Text>

            {sortOptions.map((option) => (
              <TouchableOpacity
                key={`${option.field}-${option.direction}`}
                style={styles.sortOption}
                onPress={() => {
                  setSortConfig(option);
                  setSortModalVisible(false);
                }}
              >
                <Text style={styles.sortOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.sortCancelButton}
              onPress={() => setSortModalVisible(false)}
            >
              <Text style={styles.sortCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {modalVisible && selectedSensor && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {(() => {
              const selectedStatus = getGrassHeightStatus(selectedSensor.grassHeight);
              const isCritical = selectedSensor.criticalDate === 'Já está crítico';
              const timeRemaining = isCritical
                ? 'Já está crítico'
                : selectedSensor.weeksToCritical > 0
                  ? `${selectedSensor.weeksToCritical.toFixed(1)} semanas`
                  : 'Não disponível';

              return (
                <>
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalTitle}>Sensor #{selectedSensor.id}</Text>
                      <Text style={styles.modalSubtitle}>Detalhes do sensor</Text>
                    </View>
                    <View style={[styles.modalBadge, { backgroundColor: selectedStatus.color }]}>
                      <Text style={styles.badgeText}>{selectedStatus.label}</Text>
                    </View>
                  </View>

                  <View style={styles.coreInfo}>
                    <View style={styles.detailRow}>
                      <Ionicons name="trail-sign-outline" size={20} color="#5E22F3" />
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Rodovia</Text>
                        <Text style={styles.detailValue}>{selectedSensor.highway || 'Não informado'}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={20} color="#5E22F3" />
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Quilômetro</Text>
                        <Text style={styles.detailValue}>
                          KM {Number(selectedSensor.km || 0).toFixed(1)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="leaf-outline" size={20} color="#5E22F3" />
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Altura da grama</Text>
                        <Text style={styles.detailValue}>
                          {selectedSensor.grassHeight} cm
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={20} color="#5E22F3" />
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Tempo até ficar crítico</Text>
                        <Text style={styles.detailValue}>{timeRemaining}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={20} color="#5E22F3" />
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Data prevista para ficar crítica</Text>
                        <Text style={styles.detailValue}>
                          {selectedSensor.criticalDate || 'Não disponível'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.forecastNote}>
                    Previsão calculada pelo algoritmo de crescimento da grama.
                  </Text>

                  {!isFuncionario && (
                    <TouchableOpacity
                      style={styles.orderButton}
                      onPress={() => {
                        setModalVisible(false);
                        router.push({
                          pathname: '/OrdemServico',
                          params: { sensorId: String(selectedSensor.id) },
                        });
                      }}
                    >
                      <Ionicons name="document-text-outline" size={18} color="#fff" />
                      <Text style={styles.orderButtonText}>Criar ordem de serviço</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </View>
      )}

      <View style={styles.navigationContainer}>
        <View style={styles.navigationBar}>

          <TouchableOpacity style={styles.navButton}>
            <View style={styles.activeIcon}>
              <Ionicons name="radio" size={24} color="#5E22F3" />
            </View>
            <Text style={styles.activeIconText}>Sensores</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/map')}>
            <Ionicons name="map-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Mapa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/home')}>
            <Ionicons name="home-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Home</Text>
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
  sortButton:          { backgroundColor: '#5E22F3', borderRadius: 10, padding: 13, marginBottom: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  sortButtonText:      { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sortModalOverlay:    { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20, elevation: 20, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sortModalContent:    { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  sortModalTitle:      { fontSize: 20, fontWeight: 'bold', color: '#333' },
  sortModalSubtitle:   { color: '#666', fontSize: 14, marginTop: 4, marginBottom: 14 },
  sortOption:          { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sortOptionText:     { color: '#333', fontSize: 15, fontWeight: '600' },
  sortCancelButton:   { backgroundColor: '#5E22F3', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 16 },
  sortCancelButtonText:{ color: '#fff', fontWeight: 'bold', fontSize: 15 },
  card:                { backgroundColor: '#d0d0d0', borderRadius: 16, borderWidth: 1, borderColor: '#dfdfdf', padding: 16, marginBottom: 12 },
  cardHeader:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle:           { fontSize: 18, fontWeight: 'bold', color: '#333' },
  badge:               { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText:           { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  infoRow:             { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText:            { fontSize: 15, color: '#333' },
  emptyState:          { backgroundColor: '#fff', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  emptyStateText:      { color: '#666', fontSize: 14, textAlign: 'center' },
  navigationContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 },
  navigationBar:       { height: 95, backgroundColor: '#fff', borderWidth: 0, borderColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  navButton:           { flex: 1, alignItems: 'center', justifyContent: 'center', transform: [{ translateY: -12 }] },
  activeIcon:          { width: 42, height: 42, borderRadius: 21, backgroundColor: '#5d22f244', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  iconText:            { color: '#000', fontSize: 11, marginTop: 4 },
  activeIconText:      { color: '#5E22F3', fontSize: 11, fontWeight: 'bold' },
  infoButton:          { marginTop: 12, alignItems: 'flex-end' },
  infoButtonText:      { color: '#5E22F3', fontWeight: 'bold' },
  modalOverlay:        { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 10, elevation: 10, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent:        { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  modalTitle:          { fontSize: 22, fontWeight: 'bold', color: '#333' },
  modalSubtitle:       { color: '#666', fontSize: 14, marginTop: 4 },
  modalBadge:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  detailRow:           { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  detailText:          { flex: 1, minWidth: 0, flexDirection: 'column', alignItems: 'flex-start', gap: 2 },
  detailLabel:         { color: '#777', fontSize: 12, flexShrink: 0 },
  detailValue:         { color: '#333', fontSize: 14, fontWeight: '600', marginTop: 0, flexShrink: 1 },
  orderButton:         { backgroundColor: '#16a34a', borderRadius: 10, padding: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 20 },
  orderButtonText:     { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  closeButton:         { backgroundColor: '#5E22F3', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12 },
  closeButtonText:     { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  forecastNote:         { color: '#777', fontSize: 12, lineHeight: 17, marginTop: 14 },
  coreInfo:            { flexDirection: 'column'}
});
