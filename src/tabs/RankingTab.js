import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const MEDALLAS = ['🥇', '🥈', '🥉'];

const getRankingSemanal = (usuarios, historial) => {
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  return usuarios
    .filter(u => !u.isAdmin)
    .map(u => {
      const pts = historial
        .filter(h =>
          h.usuarioId === u.id &&
          new Date(h.fecha) >= inicioSemana &&
          h.estado === 'verificada'
        )
        .reduce((sum, h) => sum + (h.puntos || 0), 0);
      return { ...u, puntosSemana: pts };
    })
    .sort((a, b) => b.puntosSemana - a.puntosSemana);
};

export const RankingTab = ({ user, usuarios, historial }) => {
  const ranking = getRankingSemanal(usuarios, historial);

  return (
    <View style={styles.tabContent}>
      {/* Ranking semanal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Ranking semanal</Text>
        {ranking.map((u, i) => (
          <View
            key={u.id}
            style={[styles.item, u.id === user.id && styles.itemYo]}
          >
            <Text style={styles.pos}>
              {i < 3 ? MEDALLAS[i] : `${i + 1}.`}
            </Text>
            <Text style={styles.nombre}>{u.nombre}</Text>
            <Text style={styles.pts}>{u.puntosSemana} pts</Text>
            {u.id === user.id && <Text style={styles.tu}> (tú)</Text>}
          </View>
        ))}
      </View>

      {/* Racha */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Tu racha</Text>
        <Text style={styles.rachaNum}>{user.racha || 0} días</Text>
        <Text style={styles.rachaBonus}>
          Bonus: +{Math.min(user.racha || 0, 10) * 5}% por racha
        </Text>
      </View>

      {/* Puntos totales */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Puntos totales</Text>
        {usuarios
          .filter(u => !u.isAdmin)
          .sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
          .map(u => (
            <View key={u.id} style={styles.puntosItem}>
              <Text style={styles.nombre}>{u.nombre}</Text>
              <Text style={styles.pts}>{u.puntos || 0} pts</Text>
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: { padding: 16, gap: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemYo: {
    backgroundColor: `${COLORS.blue}20`,
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  pos: { fontSize: 20, width: 40 },
  nombre: { color: COLORS.textPrimary, fontSize: 16, flex: 1 },
  pts: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
  tu: { color: COLORS.textSecondary, fontSize: 12 },
  rachaNum: {
    color: COLORS.yellow,
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
  },
  rachaBonus: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  puntosItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});
