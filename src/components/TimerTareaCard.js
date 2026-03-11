import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { TAREAS_CON_TIMER } from '../constants/timers';

/**
 * Card de tarea con cronómetro integrado.
 *
 * Props:
 *  tarea           — objeto de tarea
 *  timerSegundos   — { [tareaId]: number }
 *  timersActivos   — { [tareaId]: bool }
 *  formatearTiempo — fn(segundos) → string
 *  onToggle        — fn(tareaId)
 *  onReset         — fn(tareaId)
 *  onCompletar     — fn(tarea)  (ya gestiona la alerta si incompleto)
 */
export const TimerTareaCard = ({
  tarea,
  timerSegundos,
  timersActivos,
  formatearTiempo,
  onToggle,
  onReset,
  onCompletar,
}) => {
  const config    = TAREAS_CON_TIMER[tarea.id];
  const segundos  = timerSegundos[tarea.id] || 0;
  const activo    = timersActivos[tarea.id] || false;
  const completo  = segundos >= config.duracion;

  const handleCompletar = () => {
    if (!completo) {
      Alert.alert(
        `⏱️ ${tarea.nombre} incompleto`,
        `Solo has hecho ${formatearTiempo(segundos)} de ${config.etiqueta}.\n\n¿Completar de todos modos?`,
        [
          { text: 'Seguir', style: 'cancel' },
          { text: 'Completar', onPress: () => { onCompletar(tarea); onReset(tarea.id); } },
        ]
      );
    } else {
      onCompletar(tarea);
      onReset(tarea.id);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.nombre}>{config.icono} {tarea.nombre}</Text>
          <Text style={styles.frecuencia}>{tarea.frecuencia}</Text>
        </View>
        <Text style={styles.puntos}>+{tarea.puntos} pts</Text>
      </View>

      <View style={styles.timerRow}>
        <Text style={[styles.timerText, completo && styles.timerCompleto]}>
          {formatearTiempo(segundos)} / {config.etiqueta}
        </Text>
        <View style={styles.progress}>
          <View style={[
            styles.progressFill,
            { width: `${Math.min((segundos / config.duracion) * 100, 100)}%` },
            completo && styles.progressCompleto,
          ]} />
        </View>
      </View>

      <View style={styles.botones}>
        <TouchableOpacity
          style={[styles.btn, activo && styles.btnPausa]}
          onPress={() => onToggle(tarea.id)}
        >
          <Text style={styles.btnText}>{activo ? '⏸️ Pausar' : '▶️ Iniciar'}</Text>
        </TouchableOpacity>

        {segundos > 0 && (
          <TouchableOpacity style={styles.btnReset} onPress={() => onReset(tarea.id)}>
            <Text style={styles.btnResetText}>🔄 Reset</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btnCompletar, !completo && styles.btnCompletarIncompleto]}
          onPress={handleCompletar}
        >
          <Text style={styles.btnCompletarText}>
            {completo ? '✅ Completar' : '⏱️ Completar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardInner,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  info: { flex: 1 },
  nombre: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  frecuencia: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  puntos: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
  timerRow: { marginBottom: 10 },
  timerText: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  timerCompleto: { color: COLORS.green },
  progress: {
    height: 6,
    backgroundColor: COLORS.card,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.blue },
  progressCompleto: { backgroundColor: COLORS.green },
  botones: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  btn: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnPausa: { backgroundColor: COLORS.yellow },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  btnReset: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnResetText: { color: COLORS.textPrimary, fontSize: 13 },
  btnCompletar: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnCompletarIncompleto: { backgroundColor: COLORS.textMuted },
  btnCompletarText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
