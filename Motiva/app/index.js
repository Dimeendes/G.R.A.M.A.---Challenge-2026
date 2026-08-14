import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasUsernameError, setHasUsernameError] = useState(false);
  const [hasPasswordError, setHasPasswordError] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { auth } = useAuth();

  async function handleLogin() {
    setHasUsernameError(false);
    setHasPasswordError(false);
    const result = await auth(username, password);

    if (result === 'user') {
      setHasUsernameError(true);
    } else if (result === 'password') {
      setHasPasswordError(true);
    } else {
      router.push('/home');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.login}>
        <Image source={require('../assets/motiva-logo-roxa.png')} style={styles.logo} />
        <Text style={styles.subtitle}>Sistema de monitoramento rodoviário</Text>
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          placeholder="Digite seu usuario"
          value={username}
          onChangeText={setUsername}
          style={hasUsernameError ? styles.usernameInputError : styles.usernameInput}
          placeholderTextColor="#000"
        />
        {hasUsernameError ? <Text style={styles.errorText}>Usuário não encontrado!</Text> : null}
        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordInput}>
          <TextInput
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            style={hasPasswordError ? styles.passwordInputError : styles.passwordField}
            placeholderTextColor="#000"
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.passwordToggle}
          >
            <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#000" />
          </TouchableOpacity>
        </View>
        {hasPasswordError ? <Text style={styles.errorText}>Senha incorreta!</Text> : null}
        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>ENTRAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5E22F3' },
  login:              { alignItems: 'center', backgroundColor: '#fff', width: '90%', maxWidth: 380, paddingVertical: 35, borderRadius: 30, borderWidth: 1, borderColor: '#dfdfdf' },
  logo:               { width: 150, height: 150 },
  subtitle:           { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 60 },
  label:              { fontSize: 16, fontWeight: 'bold', color: '#5E22F3', alignSelf: 'flex-start', marginLeft: '12%', marginBottom: 3 },
  usernameInput:      { width: '80%', paddingHorizontal: 15, borderWidth: 1, borderColor: '#dfdfdf', borderRadius: 15, backgroundColor: '#ddd', marginBottom: 15 },
  usernameInputError: { width: '80%', paddingHorizontal: 15, borderWidth: 1, borderColor: '#EF4444', borderRadius: 15, backgroundColor: '#ddd' },
  passwordField:      { width: '100%', borderWidth: 1, paddingHorizontal: 15, borderColor: '#dfdfdf', borderRadius: 15, backgroundColor: '#ddd', marginBottom: 15 },
  passwordInputError: { width: '100%', borderWidth: 1, paddingHorizontal: 15, borderColor: '#EF4444', borderRadius: 15,backgroundColor: '#ddd' },
  buttonText:         { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  button:             { backgroundColor: '#5E22F3', width: '40%', marginTop: 30, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  passwordInput:      { width: '80%' },
  passwordToggle:     { position: 'absolute', right: 10, top: 8 },
  errorText:          { color: '#EF4444', fontSize: 15, marginLeft: '12%', alignSelf: 'flex-start', fontWeight: 'bold', marginBottom: 5 },
});
