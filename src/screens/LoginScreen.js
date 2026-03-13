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

const LogoColorido = () => (
  <View style={logoStyles.container}>
    {/* Anillo exterior colorido */}
    <View style={logoStyles.ringOuter} />
    {/* Círculo central */}
    <View style={logoStyles.circle}>
      <Text style={logoStyles.emoji}>🏠</Text>
    </View>
    {/* Puntos decorativos */}
    <View style={[logoStyles.dot, { top: 6,  left: 28,  backgroundColor: COLORS.yellow,  width: 14, height: 14 }]} />
    <View style={[logoStyles.dot, { top: 6,  right: 28, backgroundColor: COLORS.green,   width: 10, height: 10 }]} />
    <View style={[logoStyles.dot, { bottom: 6, left: 24, backgroundColor: COLORS.purple, width: 12, height: 12 }]} />
    <View style={[logoStyles.dot, { bottom: 6, right: 22, backgroundColor: COLORS.red,   width: 9,  height: 9  }]} />
    <View style={[logoStyles.dot, { top: '42%', left: 2, backgroundColor: COLORS.blue,   width: 8,  height: 8  }]} />
    <View style={[logoStyles.dot, { top: '42%', right: 2, backgroundColor: '#f97316',    width: 10, height: 10 }]} />
  </View>
);

const logoStyles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ringOuter: {
    position: 'absolute',
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 5,
    borderColor: COLORS.blue,
    opacity: 0.6,
  },
  circle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.card,
    borderWidth: 3,
    borderColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.blue,
    shadowRadius: 12,
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
  },
  emoji: {
    fontSize: 72,
  },
  dot: {
    position: 'absolute',
    borderRadius: 999,
  },
});

const ICONOS = {
  Daniel: '👦',
  Sergio: '🧑',
  Diego:  '🧒',
  Adulto: '👑',
};

export const LoginScreen = ({ usuarios, onSelect }) => {
  if (usuarios.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
        <View style={styles.container}>
          <LogoColorido />
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
        <LogoColorido />
        <Text style={styles.title}>Hogar Tasks</Text>
        <Text style={styles.subtitle}>¿Quién eres?</Text>

        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.btn} onPress={() => onSelect(item)}>
              <Text style={styles.btnText}>
                {ICONOS[item.nombre] || '🙂'} {item.nombre}
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
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
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
  btnPts:  { color: COLORS.green,       fontSize: 16, fontWeight: '700' },
});
