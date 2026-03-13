import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { getNivel, getProgresoNivel } from '../constants/niveles';

export const ProgressBar = ({ puntos }) => {
  const nivel   = getNivel(puntos || 0);
  const progreso = getProgresoNivel(puntos || 0);

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${progreso}%` }]} />
      </View>
      <Text style={styles.text}>
        {progreso.toFixed(0)}% para Nivel {nivel.nivel + 1}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.bgDark,
  },
  bar: {
    height: 8,
    backgroundColor: COLORS.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: COLORS.green },
  text: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
