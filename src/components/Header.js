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
          <Text style={styles.level}>Nv{nivel.nivel} {nivel.nombre} · {user.puntos || 0} pts</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.bgDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { fontSize: 28 },
  name: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  level: { color: COLORS.textSecondary, fontSize: 12 },
  logoutBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
});
