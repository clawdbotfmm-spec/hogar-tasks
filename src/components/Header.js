import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { getNivel } from '../constants/niveles';

export const Header = ({ user, onLogout }) => {
  const nivel = getNivel(user.puntos || 0);

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Text style={styles.icon}>{nivel.icono}</Text>
        <View>
          <Text style={styles.name}>{user.nombre}</Text>
          <Text style={styles.level}>Nivel {nivel.nivel}: {nivel.nombre}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.points}>{user.puntos || 0} pts</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.bgDark,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { fontSize: 36 },
  name: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '600' },
  level: { color: COLORS.textSecondary, fontSize: 12 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  points: { color: COLORS.green, fontSize: 18, fontWeight: '700' },
  logoutBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: { color: COLORS.textSecondary, fontSize: 12 },
});
