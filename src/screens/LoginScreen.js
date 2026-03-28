import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, crearUsuarioFirestore } from '../hooks/useFirestore';
import { COLORS } from '../constants/colors';

export const LoginScreen = ({ onLogin }) => {
  const [modo, setModo]           = useState('login'); // 'login' | 'registro'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [nombre, setNombre]       = useState('');
  const [error, setError]         = useState('');
  const [cargando, setCargando]   = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);
  const [verPassword, setVerPassword]   = useState(false);

  const limpiarError = () => setError('');

  const traducirError = (code) => {
    const errores = {
      'auth/invalid-email': 'Email no válido',
      'auth/user-disabled': 'Cuenta deshabilitada',
      'auth/user-not-found': 'No hay cuenta con ese email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Email o contraseña incorrectos',
      'auth/email-already-in-use': 'Ya hay una cuenta con ese email',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/too-many-requests': 'Demasiados intentos. Espera un momento',
      'auth/network-request-failed': 'Error de conexión. Comprueba tu internet',
    };
    return errores[code] || 'Error inesperado. Inténtalo de nuevo';
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Rellena email y contraseña');
      return;
    }
    setCargando(true);
    setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      onLogin(cred.user);
    } catch (e) {
      console.error('LOGIN ERROR:', e.code, e.message);
      setError(traducirError(e.code));
    }
    setCargando(false);
  };

  const handleRegistro = async () => {
    if (!nombre.trim()) {
      setError('Escribe tu nombre');
      return;
    }
    if (!email.trim() || !password) {
      setError('Rellena email y contraseña');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setCargando(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      await crearUsuarioFirestore(cred.user.uid, email.trim(), nombre.trim());
      onLogin(cred.user);
    } catch (e) {
      console.error('REGISTRO ERROR:', e.code, e.message);
      setError(traducirError(e.code));
    }
    setCargando(false);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Escribe tu email para recuperar la contraseña');
      return;
    }
    setCargando(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setResetEnviado(true);
    } catch (e) {
      setError(traducirError(e.code));
    }
    setCargando(false);
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} translucent={false} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={require('../../icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Hogar Tasks</Text>
          <Text style={styles.subtitle}>
            {modo === 'login' ? 'Inicia sesión' : 'Crear cuenta'}
          </Text>

          {/* Nombre solo en registro */}
          {modo === 'registro' && (
            <TextInput
              style={styles.input}
              placeholder="Tu nombre (Daniel, Sergio...)"
              placeholderTextColor={COLORS.textMuted}
              value={nombre}
              onChangeText={(t) => { setNombre(t); limpiarError(); }}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={(t) => { setEmail(t); limpiarError(); setResetEnviado(false); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={(t) => { setPassword(t); limpiarError(); }}
              secureTextEntry={!verPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setVerPassword(!verPassword)}
            >
              <Text style={styles.eyeIcon}>{verPassword ? '◉' : '◎'}</Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Reset enviado */}
          {resetEnviado && (
            <Text style={styles.resetOk}>
              Email de recuperación enviado. Revisa tu bandeja.
            </Text>
          )}

          {/* Botón principal */}
          <TouchableOpacity
            style={[styles.btn, cargando && styles.btnDisabled]}
            onPress={modo === 'login' ? handleLogin : handleRegistro}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {modo === 'login' ? 'Entrar' : 'Crear cuenta'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Olvidé contraseña (solo en login) */}
          {modo === 'login' && (
            <TouchableOpacity style={styles.link} onPress={handleResetPassword}>
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          )}

          {/* Cambiar entre login y registro */}
          <TouchableOpacity
            style={styles.link}
            onPress={() => {
              setModo(modo === 'login' ? 'registro' : 'login');
              setError('');
              setResetEnviado(false);
            }}
          >
            <Text style={styles.linkText}>
              {modo === 'login'
                ? '¿Primera vez? Crear cuenta'
                : 'Ya tengo cuenta, iniciar sesión'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const STATUSBAR_HEIGHT = Platform.OS === 'web' ? 0 : Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 50;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg, paddingTop: STATUSBAR_HEIGHT },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: { width: 140, height: 140, marginBottom: 12 },
  title: { color: COLORS.textPrimary, fontSize: 32, fontWeight: '700' },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 28,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  passwordRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  eyeIcon: {
    fontSize: 20,
  },
  error: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  resetOk: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  btn: {
    width: '100%',
    backgroundColor: COLORS.blue,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  link: { padding: 8 },
  linkText: { color: COLORS.blue, fontSize: 14 },
});
