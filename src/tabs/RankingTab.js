import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { getGrupoPorId, getDiaEnBloque, diasRestantesBloque } from '../constants/rotacion';
import { fechaLocalHoy } from '../utils/fecha';

const MEDALLAS = ['🥇', '🥈', '🥉'];

const getRankingGlobal = (usuarios, historial) => {
  return usuarios
    .filter(u => !u.isAdmin)
    .map(u => {
      const tareasVerificadas = historial.filter(h =>
        h.usuarioId === u.id &&
        h.estado === 'verificada' &&
        h.puntos > 0
      );
      const pts = tareasVerificadas.reduce((sum, h) => sum + (h.puntos || 0), 0);
      const tareas = tareasVerificadas.length;
      return { ...u, puntosTotal: pts, tareasTotal: tareas };
    })
    .sort((a, b) => b.puntosTotal - a.puntosTotal);
};

const getStatsHoy = (usuarioId, historial) => {
  const fechaHoy = fechaLocalHoy();
  const tareasHoy = historial.filter(h =>
    h.usuarioId === usuarioId &&
    h.fechaDia === fechaHoy &&
    h.estado === 'verificada' &&
    h.puntos > 0
  );
  const pts = tareasHoy.reduce((sum, h) => sum + (h.puntos || 0), 0);
  return { puntos: pts, tareas: tareasHoy.length };
};

export const RankingTab = ({ user, usuarios, historial, configRotacion }) => {
  const ranking = getRankingGlobal(usuarios, historial);
  const misStatsHoy = getStatsHoy(user.id, historial);
  const grupo = user.grupoActual ? getGrupoPorId(user.grupoActual) : null;
  const inicioCiclo = configRotacion?.inicioCiclo || null;
  const diasRest = diasRestantesBloque(inicioCiclo);
  const diaActual = getDiaEnBloque(inicioCiclo);

  return (
    <View style={styles.tabContent}>

      {/* Mi resumen de hoy */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Tu día de hoy</Text>
        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumPts}>{misStatsHoy.puntos}</Text>
            <Text style={styles.statsLabel}>Puntos</Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statsItem}>
            <Text style={styles.statsNumTareas}>{misStatsHoy.tareas}</Text>
            <Text style={styles.statsLabel}>Tareas</Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statsItem}>
            <Text style={styles.statsNumCiclo}>{diasRest}d</Text>
            <Text style={styles.statsLabel}>Quedan</Text>
          </View>
        </View>
        {grupo && (
          <Text style={styles.grupoActual}>
            {grupo.icono} {grupo.nombre} — Día {diaActual}/5
          </Text>
        )}
      </View>

      {/* Ranking global */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Ranking</Text>
        {ranking.map((u, i) => (
          <View
            key={u.id}
            style={[styles.item, u.id === user.id && styles.itemYo]}
          >
            <Text style={styles.pos}>
              {i < 3 ? MEDALLAS[i] : `${i + 1}.`}
            </Text>
            <View style={styles.rankInfo}>
              <Text style={styles.nombre}>
                {u.nombre}
                {u.id === user.id && <Text style={styles.tu}> (tú)</Text>}
              </Text>
              <Text style={styles.rankSub}>
                {u.tareasTotal} tareas
              </Text>
            </View>
            <Text style={styles.pts}>{u.puntosTotal} pts</Text>
          </View>
        ))}
      </View>

      {/* Puntos totales acumulados */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Puntos acumulados (canjeables)</Text>
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

  // Stats card
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.green,
  },
  statsTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsItem: { alignItems: 'center', flex: 1 },
  statsNumPts: { color: COLORS.blue, fontSize: 28, fontWeight: '700' },
  statsNumTareas: { color: COLORS.yellow, fontSize: 28, fontWeight: '700' },
  statsNumCiclo: { color: COLORS.green, fontSize: 28, fontWeight: '700' },
  statsLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },
  statsDivider: { width: 1, height: 36, backgroundColor: COLORS.border },
  grupoActual: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },

  // Ranking
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
  rankInfo: { flex: 1 },
  nombre: { color: COLORS.textPrimary, fontSize: 16 },
  rankSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  pts: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
  tu: { color: COLORS.textSecondary, fontSize: 12 },

  // Puntos totales
  puntosItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});
