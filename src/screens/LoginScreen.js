import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/colors';

const ICONOS = {
  Daniel: '👕',
  Sergio: '🍳',
  Diego:  '🚿',
  Adulto: '👑',
};

export const LoginScreen = ({ usuarios, onSelect }) => {
  if (usuarios.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
        <View style={styles.container}>
          <Text style={styles.logo}>🏠</Text>
          <Text style={styles.title}>Hogar Tasks</Text>
          <Text style={styles.subtitle}>Creando usuarios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <View style={styles.container}>
        <Text style={styles.logo}>🏠</Text>
        <Text style={styles.title}>Hogar Tasks</Text>
        <Text style={styles.subtitle}>¿Quién eres?</Text>

        <FlatList
          data={usuarios}
          keyExtractor={item => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.btn} onPress={() => onSelect(item)}>
              <Text style={styles.btnText}>
                {ICONOS[item.nombre] || '👤'} {item.nombre}
              </Text>
              <Text style={styles.btnPts}>{item.puntos || 0} pts</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: { fontSize: 64, marginBottom: 16 },
  title: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  list: { width: '100%' },
  btn: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600' },
  btnPts: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
});
