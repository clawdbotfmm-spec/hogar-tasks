import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { TAREAS_EXTRAS, PROYECTOS_CASA } from '../constants/tareas';
import { calcularPuntosConBonus } from '../hooks/useBoosters';

export const ExtrasTab = ({ user, onCompletar }) => {
  return (
    <View style={styles.tabContent}>
      {/* Tareas extras voluntarias */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⭐ Tareas extras voluntarias</Text>
        <Text style={styles.hint}>Hazlas cuando quieras para ganar puntos extra</Text>
        {TAREAS_EXTRAS.map(t => {
          const ptsReales = calcularPuntosConBonus(t.puntos, 'extra', user);
          return (
            <TouchableOpacity
              key={t.id}
              style={styles.tareaCard}
              onPress={() => onCompletar({ ...t, tipo: 'extra' })}
            >
              <View style={styles.info}>
                <Text style={styles.nombre}>{t.nombre}</Text>
                <Text style={styles.etiqueta}>Voluntaria</Text>
              </View>
              <Text style={styles.puntos}>+{ptsReales} pts</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Proyectos de casa */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔨 Proyectos de casa</Text>
        <Text style={styles.hint}>Grandes tareas que dan muchos puntos</Text>
        {PROYECTOS_CASA.map(p => (
          <TouchableOpacity
            key={p.id}
            style={styles.tareaCard}
            onPress={() => onCompletar({ ...p, tipo: 'proyecto' })}
          >
            <View style={styles.info}>
              <Text style={styles.nombre}>{p.nombre}</Text>
              <Text style={styles.etiquetaProyecto}>Colaborativo</Text>
            </View>
            <Text style={styles.puntosProyecto}>+{p.puntos} pts</Text>
          </TouchableOpacity>
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
    marginBottom: 4,
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  tareaCard: {
    backgroundColor: COLORS.cardInner,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  info: { flex: 1 },
  nombre: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  etiqueta: { color: COLORS.yellow, fontSize: 12, marginTop: 2 },
  etiquetaProyecto: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  puntos: { color: COLORS.yellow, fontSize: 16, fontWeight: '700' },
  puntosProyecto: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
});
