import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function Map() {
  const [destination, setDestination] = useState('');
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <>
      <View style={styles.mapContainer}>
        <Image source={require('../assets/mapa-com-dados-mock.jpeg')} style={styles.map} />
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Digite seu destino aqui"
            value={destination}
            onChangeText={setDestination}
            style={styles.searchTextInput}
            placeholderTextColor="#000"
          />
          <Image source={require('../assets/motiva-logo-roxa.png')} style={styles.logo} />
        </View>
      </View>
      <View style={styles.navigationContainer}>
        <View style={styles.navigationBar}>
          <TouchableOpacity style={styles.navButton}>
            <View style={styles.activeIcon}>
              <Ionicons name="map" size={24} color="#5E22F3" />
            </View>
            <Text style={styles.activeIconText}>Mapa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/sensors')}>
            <Ionicons name="radio-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Sensores</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  mapContainer:        { flex: 1 },
  map:                 { width: '100%', height: '100%' },
  navigationContainer: { position: 'absolute', bottom: 15, left: 15, right: 15 },
  navigationBar:       { height: 75, backgroundColor: '#d0d0d0', borderRadius: 25, borderWidth: 1, borderColor: '#dfdfdf', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  navButton:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  activeIcon:          { width: 42, height: 42, borderRadius: 21, backgroundColor: '#5d22f244', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  iconText:            { color: '#000', fontSize: 11, marginTop: 4 },
  activeIconText:      { color: '#5E22F3', fontSize: 11, fontWeight: 'bold' },
  searchContainer:     { position: 'absolute', top: 15, left: 15, right: 15 },
  searchBar:           { height: 45, backgroundColor: '#dfdfdf', borderRadius: 25, borderWidth: 1, borderColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  searchTextInput:     { flex: 1, alignItems: 'center', paddingHorizontal: 15 },
  logo:                { right: 15, height: 30, width: 30 },
});
