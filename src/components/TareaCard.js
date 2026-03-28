import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const TareaCard = ({ tarea, onCompletar, onDeshacer, esPersonal }) => {
  const esRepetible     = (tarea.maxVeces || 1) > 1;
  const puedeDeshacer   = (tarea.vecesCompletadas || 0) > 0 && !!tarea.ultimaHistorialId;
  const mostrarContador = esRepetible && (tarea.vecesCompletadas || 0) > 0;

  return (
    <View style={[styles.card, tarea.completada && styles.completada]}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => !tarea.completada && onCompletar()}
        disabled={tarea.completada}
        activeOpacity={0.7}
      >
        <View style={styles.info}>
          <Text style={[styles.nombre, tarea.completada && styles.nombreDone]}>
            {tarea.nombre}
          </Text>
          {esRepetible && (
            <Text style={styles.repetible}>{tarea.vecesCompletadas || 0}/{tarea.maxVeces} veces</Text>
          )}
        </View>
        <View style={styles.derecha}>
          <Text style={[styles.puntos, esPersonal && styles.puntosPersonal]}>
            {esPersonal ? 'Obligatoria' : `+${tarea.puntos}`}
          </Text>
          {tarea.completada ? (
            <View style={styles.checkBox}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          ) : (
            <View style={styles.hacerBox}>
              <Text style={styles.hacerText}>
                {mostrarContador ? `${tarea.vecesCompletadas}/${tarea.maxVeces}` : 'Hacer'}
              </Text>
            </View>
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
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
    minHeight: 44,
  },
  info: { flex: 1, paddingRight: 12 },
  nombre: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  nombreDone: { color: COLORS.textSecondary },
  repetible: { color: COLORS.blue, fontSize: 12, fontWeight: '600', marginTop: 2 },
  derecha: { alignItems: 'flex-end', gap: 4 },
  puntos: { color: COLORS.green, fontSize: 15, fontWeight: '700' },
  puntosPersonal: { color: COLORS.yellow, fontSize: 11 },
  hacerBox: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  hacerText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  checkBox: {
    backgroundColor: COLORS.green,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  deshacerBtn: {
    backgroundColor: COLORS.red,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deshacerText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
