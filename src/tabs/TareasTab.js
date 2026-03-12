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

// ── Sub-barra de pestañas interna ─────────────────────────────────────────
const SubTabBar = ({ subTab, setSubTab, numPendientes, numHechas }) => (
  <View style={styles.subTabRow}>
    <TouchableOpacity
      style={[styles.subTab, subTab === 'pendientes' && styles.subTabActive]}
      onPress={() => setSubTab('pendientes')}
    >
      <Text style={[styles.subTabText, subTab === 'pendientes' && styles.subTabTextActive]}>
        📋 Por hacer
        {numPendientes > 0 && (
          <Text style={styles.badge}> {numPendientes}</Text>
        )}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.subTab, subTab === 'realizadas' && styles.subTabActive]}
      onPress={() => setSubTab('realizadas')}
    >
      <Text style={[styles.subTabText, subTab === 'realizadas' && styles.subTabTextActive]}>
        ✅ Realizadas
        {numHechas > 0 && (
          <Text style={styles.badgeDone}> {numHechas}</Text>
        )}
      </Text>
    </TouchableOpacity>
  </View>
);

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
  const [subTab, setSubTab] = useState('pendientes');

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
  const hechas = misTareas.filter(t => t.completada);

  return (
    <View style={styles.tabContent}>
      {/* Sub-barra Por hacer / Realizadas */}
      <SubTabBar
        subTab={subTab}
        setSubTab={setSubTab}
        numPendientes={pendientes.length}
        numHechas={hechas.length}
      />

      {/* ── Pestaña: Por hacer ─────────────────────────────── */}
      {subTab === 'pendientes' && (
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
      )}

      {/* ── Pestaña: Realizadas ────────────────────────────── */}
      {subTab === 'realizadas' && (
        <View style={styles.card}>
          {hechas.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Aún no has completado nada</Text>
              <Text style={styles.emptyHint}>Las tareas completadas aparecerán aquí.</Text>
            </View>
          ) : (
            hechas.map(t => (
              <TareaCard
                key={t.id}
                tarea={t}
                onCompletar={() => {}}
                onDeshacer={() => onDeshacer(t.ultimaHistorialId)}
              />
            ))
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

  // ── Sub-barra ──────────────────────────────────────────
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgDark,
    borderRadius: 12,
    padding: 4,
    marginBottom: 4,
  },
  subTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  subTabActive: {
    backgroundColor: COLORS.card,
  },
  subTabText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: COLORS.blue,
  },
  badge: {
    color: COLORS.blue,
    fontWeight: '700',
  },
  badgeDone: {
    color: COLORS.green,
    fontWeight: '700',
  },

  // ── Tarjeta contenedor ─────────────────────────────────
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
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
