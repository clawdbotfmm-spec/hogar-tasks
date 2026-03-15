import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { PUNTOS_POR_HORA } from '../constants/tareas';

const MEDALLAS = ['🥇', '🥈', '🥉'];

const getRankingSemanal = (usuarios, historial) => {
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  // Lunes como inicio de semana
  inicioSemana.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  inicioSemana.setHours(0, 0, 0, 0);

  return usuarios
    .filter(u => !u.isAdmin)
    .map(u => {
      const tareasVerificadas = historial.filter(h =>
        h.usuarioId === u.id &&
        new Date(h.fecha) >= inicioSemana &&
        h.estado === 'verificada' &&
        h.puntos > 0
      );
      const pts = tareasVerificadas.reduce((sum, h) => sum + (h.puntos || 0), 0);
      const tareas = tareasVerificadas.length;
      const horas = (pts / PUNTOS_POR_HORA).toFixed(1);
      return { ...u, puntosSemana: pts, tareasSemana: tareas, horasSemana: horas };
    })
    .sort((a, b) => b.puntosSemana - a.puntosSemana);
};

const getStatsHoy = (usuarioId, historial) => {
  const fechaHoy = new Date().toISOString().split('T')[0];
  const tareasHoy = historial.filter(h =>
    h.usuarioId === usuarioId &&
    h.fechaDia === fechaHoy &&
    h.estado === 'verificada' &&
    h.puntos > 0
  );
  const pts = tareasHoy.reduce((sum, h) => sum + (h.puntos || 0), 0);
  return {
    puntos: pts,
    tareas: tareasHoy.length,
    horas: (pts / PUNTOS_POR_HORA).toFixed(1),
  };
};

export const RankingTab = ({ user, usuarios, historial }) => {
  const ranking = getRankingSemanal(usuarios, historial);
  const misStatsHoy = getStatsHoy(user.id, historial);

  return (
    <View style={styles.tabContent}>

      {/* Mi resumen de hoy */}
      <View style={styles.horasCard}>
        <Text style={styles.horasTitle}>📱 Tu día de hoy</Text>
        <View style={styles.horasRow}>
          <View style={styles.horasItem}>
            <Text style={styles.horasNum}>{misStatsHoy.horas}h</Text>
            <Text style={styles.horasLabel}>Pantalla ganada</Text>
          </View>
          <View style={styles.horasDivider} />
          <View style={styles.horasItem}>
            <Text style={styles.horasNumPts}>{misStatsHoy.puntos}</Text>
            <Text style={styles.horasLabel}>Puntos</Text>
          </View>
          <View style={styles.horasDivider} />
          <View style={styles.horasItem}>
            <Text style={styles.horasNumTareas}>{misStatsHoy.tareas}</Text>
            <Text style={styles.horasLabel}>Tareas</Text>
          </View>
        </View>
      </View>

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
            <View style={styles.rankInfo}>
              <Text style={styles.nombre}>
                {u.nombre}
                {u.id === user.id && <Text style={styles.tu}> (tú)</Text>}
              </Text>
              <Text style={styles.rankSub}>
                {u.tareasSemana} tareas · 📱 {u.horasSemana}h ganadas
              </Text>
            </View>
            <Text style={styles.pts}>{u.puntosSemana} pts</Text>
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

      {/* Puntos totales acumulados */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Puntos totales acumulados</Text>
        {usuarios
          .filter(u => !u.isAdmin)
          .sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
          .map(u => (
            <View key={u.id} style={styles.puntosItem}>
              <Text style={styles.nombre}>{u.nombre}</Text>
              <View style={styles.puntosRight}>
                <Text style={styles.pts}>{u.puntos || 0} pts</Text>
                <Text style={styles.puntosHoras}>
                  = {((u.puntos || 0) / PUNTOS_POR_HORA).toFixed(1)}h
                </Text>
              </View>
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

  // Horas card
  horasCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.green,
  },
  horasTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  horasRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horasItem: { alignItems: 'center', flex: 1 },
  horasNum: { color: COLORS.green, fontSize: 28, fontWeight: '700' },
  horasNumPts: { color: COLORS.blue, fontSize: 28, fontWeight: '700' },
  horasNumTareas: { color: COLORS.yellow, fontSize: 28, fontWeight: '700' },
  horasLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },
  horasDivider: { width: 1, height: 36, backgroundColor: COLORS.border },

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

  // Racha
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

  // Puntos totales
  puntosItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  puntosRight: { alignItems: 'flex-end' },
  puntosHoras: { color: COLORS.blue, fontSize: 11, marginTop: 2 },
});
