import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { TAREAS_PERSONALES, TAREAS_CASA_POOL } from '../constants/tareas';
import { TAREAS_CON_TIMER } from '../constants/timers';
import { TareaCard } from '../components/TareaCard';
import { TimerTareaCard } from '../components/TimerTareaCard';

/**
 * Construye la lista de tareas de un usuario para hoy.
 * Combina tareas personales + tareas de casa asignadas.
 * Para cada tarea, añade { vecesCompletadas, completada, ultimaHistorialId }
 * basándose en el historial del día.
 */
const buildMisTareas = (user, tareasAsignadas, historial) => {
  const fechaHoy = new Date().toISOString().split('T')[0];

  const enriquecer = (t) => {
    const completadasHoy = historial.filter(
      h =>
        h.usuarioId === user.id &&
        h.tareaId === t.id &&
        h.fechaDia === fechaHoy &&
        h.estado !== 'rechazada'
    );
    const ultima = completadasHoy[completadasHoy.length - 1];
    const maxVeces = t.maxVeces || 1;
    const veces = completadasHoy.length;
    return {
      ...t,
      maxVeces,
      vecesCompletadas: veces,
      completada: veces >= maxVeces,
      ultimaHistorialId: ultima?.id,
    };
  };

  const personales = TAREAS_PERSONALES.map(enriquecer);
  const asignadas = tareasAsignadas
    .map(id => TAREAS_CASA_POOL.find(t => t.id === id))
    .filter(Boolean)
    .map(enriquecer);

  return [...personales, ...asignadas];
};

// ── Componente principal ──────────────────────────────────────────────────
export const TareasTab = ({
  user,
  tareasAsignadas,
  historial,
  cargandoAsignaciones,
  onCompletar,
  onDeshacer,
  timerSegundos,
  timersActivos,
  formatearTiempo,
  onToggleTimer,
  onResetTimer,
}) => {
  const [realizadasExpanded, setRealizadasExpanded] = useState(true);

  if (cargandoAsignaciones) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.blue} />
        <Text style={styles.hint}>Cargando tareas del día...</Text>
      </View>
    );
  }

  const misTareas = buildMisTareas(user, tareasAsignadas, historial);
  const pendientes = misTareas.filter(t => !t.completada);
  const hechas     = misTareas.filter(t => t.completada);

  return (
    <View style={styles.tabContent}>

      {/* ── Sección: Por hacer ─────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📋 Por hacer</Text>
        {pendientes.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendientes.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        {pendientes.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>¡Todo listo!</Text>
            <Text style={styles.emptyHint}>Has completado todas las tareas del día.</Text>
          </View>
        ) : (
          pendientes.map(t => {
            if (TAREAS_CON_TIMER[t.id]) {
              return (
                <TimerTareaCard
                  key={t.id}
                  tarea={t}
                  timerSegundos={timerSegundos}
                  timersActivos={timersActivos}
                  formatearTiempo={formatearTiempo}
                  onToggle={onToggleTimer}
                  onReset={onResetTimer}
                  onCompletar={onCompletar}
                />
              );
            }
            return (
              <TareaCard
                key={t.id}
                tarea={t}
                onCompletar={() => onCompletar(t)}
                onDeshacer={() => onDeshacer(t.ultimaHistorialId)}
              />
            );
          })
        )}
      </View>

      {/* ── Sección: Realizadas (pendientes de verificación) ── */}
      {hechas.length > 0 && (
        <View>
          <TouchableOpacity
            style={styles.realizadasHeader}
            onPress={() => setRealizadasExpanded(v => !v)}
            activeOpacity={0.7}
          >
            <View style={styles.realizadasLeft}>
              <Text style={styles.realizadasTitle}>✅ Realizadas</Text>
              <View style={styles.badgeDone}>
                <Text style={styles.badgeDoneText}>{hechas.length}</Text>
              </View>
              <Text style={styles.realizadasSub}>esperando aprobación del adulto</Text>
            </View>
            <Text style={styles.chevron}>{realizadasExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {realizadasExpanded && (
            <View style={[styles.card, styles.cardRealizadas]}>
              {hechas.map(t => (
                <TareaCard
                  key={t.id}
                  tarea={t}
                  onCompletar={() => {}}
                  onDeshacer={() => onDeshacer(t.ultimaHistorialId)}
                />
              ))}
            </View>
          )}
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    padding: 16,
    gap: 12,
  },

  // ── Cabecera de sección ─────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: COLORS.blue,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Tarjeta contenedor ─────────────────────────────────
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  cardRealizadas: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  // ── Cabecera colapsable de Realizadas ──────────────────
  realizadasHeader: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  realizadasLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  realizadasTitle: {
    color: COLORS.green,
    fontSize: 15,
    fontWeight: '700',
  },
  badgeDone: {
    backgroundColor: COLORS.green,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeDoneText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  realizadasSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  chevron: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  // ── Estado vacío ───────────────────────────────────────
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyHint: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },

  // ── Loader ─────────────────────────────────────────────
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
