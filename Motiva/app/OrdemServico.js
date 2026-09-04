import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function OrdemServico() {
  const router = useRouter();
  const { user } = useAuth();
  const { logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
              <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                  <Image source={require('../assets/motiva-logo-branca.png')} style={styles.logo} />
                  <TouchableOpacity style={styles.logoutButton} onPress={() => { logout(); router.push('/');}}>
                              <Ionicons name="log-out-outline" size={36} color="#fff" />
                            </TouchableOpacity>
                </View>
            {user.role === 'gestor' ? (
                <View style={styles.container}>
                    <Text style={styles.title}>Ordem de Serviço</Text>
                    <Text style={styles.subtitle}>Bem-vindo, {user.username}!</Text>
                </View>
                    ) : (
                        <Text style={styles.title}>Aqui ficam suas ordens de serviço</Text>
                )}
              </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container:             { flex: 1, backgroundColor: '#f5f5f5' },
    scroll:                { flex: 1, backgroundColor: '#f5f5f5' },
    scrollContent:         { paddingBottom: 110 },
    header:                { backgroundColor: '#5E22F3', height: 100, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', position: 'relative' },
    logo:                  { height: 100, width: 200, position: 'absolute' },
    logoutButton:          { left: 10, position: 'absolute' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#000' },
    subtitle: { fontSize: 16, marginBottom: 20 },
    button: { backgroundColor: '#5E22F3', padding: 10, borderRadius: 5 },
    buttonText: { color: '#fff', fontSize: 16 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: { width: 300, padding: 20, backgroundColor: '#fff', borderRadius: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    modalText: { fontSize: 16, marginBottom: 20 },
    modalButton: { backgroundColor: '#5E22F3', padding: 10, borderRadius: 5, alignItems: 'center' },
    modalButtonText: { color: '#fff', fontSize: 16 },
});