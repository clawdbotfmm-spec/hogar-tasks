import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const TABS = [
  { id: 'tareas',  icon: '📋', label: 'Tareas',  adminOnly: false, hideAdmin: true },
  { id: 'logros',  icon: '🏅', label: 'Logros',  adminOnly: false, hideAdmin: true },
  { id: 'lista',   icon: '🛒', label: 'Lista',   adminOnly: false },
  { id: 'ranking', icon: '🏆', label: 'Ranking', adminOnly: false },
  { id: 'tienda',  icon: '🎁', label: 'Tienda',  adminOnly: false, hideAdmin: true },
  { id: 'admin',   icon: '👑', label: 'Admin',   adminOnly: true  },
];

export const TabBar = ({ tab, setTab, isAdmin }) => {
  const visibles = TABS.filter(t => {
    if (t.adminOnly && !isAdmin) return false;
    if (t.hideAdmin && isAdmin) return false;
    return true;
  });

  return (
    <View style={styles.tabs}>
      {visibles.map(t => (
        <TouchableOpacity
          key={t.id}
          style={[styles.tab, tab === t.id && styles.tabActive]}
          onPress={() => setTab(t.id)}
        >
          <Text style={styles.icon}>{t.icon}</Text>
          <Text style={[styles.label, tab === t.id && styles.labelActive]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgDark,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {},
  icon: { fontSize: 22, marginBottom: 2 },
  label: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  labelActive: { color: COLORS.blue },
});
