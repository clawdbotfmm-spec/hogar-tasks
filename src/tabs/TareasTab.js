import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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
    const completadasHoy = historial.filter(h =>
      h.usuarioId  === user.id &&
      h.tareaId    === t.id &&
      h.fechaDia   === fechaHoy &&
      h.estado     !== 'rechazada'
    );
    const ultima    = completadasHoy[completadasHoy.length - 1];
    const maxVeces  = t.maxVeces || 1;
    const veces     = completadasHoy.length;
    return {
      ...t,
      maxVeces,
      vecesCompletadas:  veces,
      completada:        veces >= maxVeces,
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

export const TareasTab = ({
  user,
  tareasAsignadas,
  historial,
  cargandoAsignaciones,
  onCompletar,
  onDeshacer,
  // timer props
  timerSegundos,
  timersActivos,
  formatearTiempo,
  onToggleTimer,
  onResetTimer,
}) => {
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
  const hechas     = misTareas.filter(t =>  t.completada);

  return (
    <View style={styles.tabContent}>
      {/* Tareas pendientes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          📋 Mis tareas de hoy
          <Text style={styles.counter}> ({pendientes.length} pendientes)</Text>
        </Text>

        {pendientes.length === 0 ? (
          <Text style={styles.empty}>¡Todas las tareas del día completadas! 🎉</Text>
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

      {/* Tareas ya completadas hoy */}
      {hechas.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ Completadas hoy ({hechas.length})</Text>
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
  );
};

const styles = StyleSheet.create({
  tabContent: { padding: 16, gap: 12 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  counter: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '400' },
  empty: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
  hint: { color: COLORS.textSecondary, fontSize: 14 },
});
