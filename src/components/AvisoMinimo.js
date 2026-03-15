import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { PUNTOS_MINIMOS_DIA } from '../constants/tareas';

/**
 * Aviso en grande que aparece a las 20:00 si no has llegado al mínimo diario.
 *
 * Props:
 *  visible      — boolean
 *  puntosHoy    — puntos verificados hoy
 *  onCerrar     — fn() para cerrar el modal
 */
export const AvisoMinimo = ({ visible, puntosHoy, onCerrar }) => {
  const faltan = PUNTOS_MINIMOS_DIA - puntosHoy;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icono grande */}
          <Text style={styles.iconoGrande}>⚠️</Text>

          {/* Título */}
          <Text style={styles.titulo}>¡ATENCIÓN!</Text>

          {/* Mensaje */}
          <Text style={styles.mensaje}>
            No has llegado al mínimo de puntos de hoy
          </Text>

          {/* Puntos */}
          <View style={styles.puntosBox}>
            <View style={styles.puntosItem}>
              <Text style={styles.puntosNum}>{puntosHoy}</Text>
              <Text style={styles.puntosLabel}>Tus puntos hoy</Text>
            </View>
            <View style={styles.puntosDivider} />
            <View style={styles.puntosItem}>
              <Text style={styles.puntosMinNum}>{PUNTOS_MINIMOS_DIA}</Text>
              <Text style={styles.puntosLabel}>Mínimo necesario</Text>
            </View>
          </View>

          {/* Barra de progreso */}
          <View style={styles.barraContainer}>
            <View style={styles.barra}>
              <View
                style={[
                  styles.barraFill,
                  { width: `${Math.min((puntosHoy / PUNTOS_MINIMOS_DIA) * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.barraTexto}>
              {Math.round((puntosHoy / PUNTOS_MINIMOS_DIA) * 100)}%
            </Text>
          </View>

          {/* Advertencia */}
          <View style={styles.advertencia}>
            <Text style={styles.advertenciaTexto}>
              Si mañana no has llegado a {PUNTOS_MINIMOS_DIA} pts,{'\n'}
              perderás {PUNTOS_MINIMOS_DIA} puntos acumulados{'\n'}
              y se reseteará tu racha 🔥
            </Text>
          </View>

          {/* Te faltan */}
          <Text style={styles.faltanTexto}>
            ¡Te faltan solo <Text style={styles.faltanNum}>{faltan} pts</Text>!
            {'\n'}Todavía puedes conseguirlo 💪
          </Text>

          {/* Botón cerrar */}
          <TouchableOpacity style={styles.botonCerrar} onPress={onCerrar}>
            <Text style={styles.botonCerrarTexto}>Entendido, voy a por ello</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.red,
  },
  iconoGrande: {
    fontSize: 64,
    marginBottom: 12,
  },
  titulo: {
    color: COLORS.red,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  mensaje: {
    color: COLORS.textPrimary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Puntos comparación
  puntosBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardInner,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  puntosItem: { flex: 1, alignItems: 'center' },
  puntosNum: { color: COLORS.red, fontSize: 36, fontWeight: '900' },
  puntosMinNum: { color: COLORS.green, fontSize: 36, fontWeight: '900' },
  puntosLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },
  puntosDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 8 },

  // Barra progreso
  barraContainer: {
    width: '100%',
    marginBottom: 16,
  },
  barra: {
    height: 12,
    backgroundColor: COLORS.cardInner,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barraFill: {
    height: '100%',
    backgroundColor: COLORS.red,
    borderRadius: 6,
  },
  barraTexto: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },

  // Advertencia
  advertencia: {
    backgroundColor: `${COLORS.red}20`,
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  advertenciaTexto: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Faltan
  faltanTexto: {
    color: COLORS.textPrimary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  faltanNum: {
    color: COLORS.yellow,
    fontWeight: '900',
    fontSize: 18,
  },

  // Botón
  botonCerrar: {
    backgroundColor: COLORS.blue,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  botonCerrarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
