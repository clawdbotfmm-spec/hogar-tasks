import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

/**
 * Card de tarea normal (con soporte para repetibles y botón deshacer).
 *
 * Props:
 *  tarea        — objeto con { nombre, puntos, frecuencia, maxVeces, vecesCompletadas,
 *                              completada, ultimaHistorialId }
 *  onCompletar  — fn()
 *  onDeshacer   — fn()
 */
export const TareaCard = ({ tarea, onCompletar, onDeshacer }) => {
  const esRepetible     = (tarea.maxVeces || 1) > 1;
  // Undo disponible siempre que haya al menos una entrada en historial hoy
  const puedeDeshacer   = (tarea.vecesCompletadas || 0) > 0 && !!tarea.ultimaHistorialId;
  const mostrarContador = esRepetible && (tarea.vecesCompletadas || 0) > 0;

  return (
    <View style={[styles.card, tarea.completada && styles.completada]}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => !tarea.completada && onCompletar()}
        disabled={tarea.completada}
      >
        <View style={styles.info}>
          <Text style={styles.nombre}>{tarea.nombre}</Text>
          <Text style={styles.frecuencia}>
            {tarea.frecuencia}
            {esRepetible && (
              <Text style={styles.repetible}> · {tarea.maxVeces}x/día</Text>
            )}
          </Text>
        </View>
        <View style={styles.derecha}>
          <Text style={styles.puntos}>+{tarea.puntos} pts</Text>
          {tarea.completada ? (
            <Text style={styles.check}>
              {esRepetible
                ? `${tarea.vecesCompletadas}/${tarea.maxVeces}`
                : '✓'}
            </Text>
          ) : mostrarContador ? (
            <Text style={styles.boton}>
              {tarea.vecesCompletadas}/{tarea.maxVeces}
            </Text>
          ) : (
            <Text style={styles.boton}>Hacer</Text>
          )}
        </View>
      </TouchableOpacity>

      {puedeDeshacer && onDeshacer && (
        <TouchableOpacity style={styles.deshacerBtn} onPress={onDeshacer}>
          <Text style={styles.deshacerText}>↩</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardInner,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  completada: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.green,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: { flex: 1 },
  nombre: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  frecuencia: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  repetible: { color: COLORS.blue, fontWeight: '600' },
  derecha: { alignItems: 'flex-end' },
  puntos: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
  boton: {
    backgroundColor: COLORS.blue,
    color: COLORS.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
    fontSize: 13,
    overflow: 'hidden',
  },
  check: { color: COLORS.green, fontSize: 12, marginTop: 4 },
  deshacerBtn: {
    backgroundColor: COLORS.red,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deshacerText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
