import { Stack } from 'expo-router';
import AuthProvider from './context/AuthContext';
import SensorsProvider from './context/SensorsContext';

export default function Layout() {
  return (
  <AuthProvider>
    <SensorsProvider>
      <Stack />
    </SensorsProvider>
  </AuthProvider>
  );
}