import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const TABS = [
  { id: 'tareas',    label: '📋 Tareas',   adminOnly: false, hideAdmin: true },
  { id: 'extras',    label: '⭐ Extras',   adminOnly: false, hideAdmin: true },
  { id: 'revisar',   label: '🔍 Revisar',  adminOnly: false, hideAdmin: true },
  { id: 'ranking',   label: '🏆 Rank',     adminOnly: false },
  { id: 'tienda',    label: '🎁 Tienda',   adminOnly: false, hideAdmin: true },
  { id: 'admin',     label: '👑 Admin',    adminOnly: true  },
];

export const TabBar = ({ tab, setTab, isAdmin, pendientesRevisar = 0 }) => {
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
          <View style={styles.tabInner}>
            <Text style={[styles.text, tab === t.id && styles.textActive]}>
              {t.label}
            </Text>
            {t.id === 'revisar' && pendientesRevisar > 0 && (
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>{pendientesRevisar}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeWrap: {
    backgroundColor: COLORS.red,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.blue,
  },
  text: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  textActive: { color: COLORS.blue },
});
