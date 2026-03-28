import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

/**
 * Aviso que aparece a las 20:00 recordando completar tareas pendientes.
 */
export const AvisoMinimo = ({ visible, onCerrar }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.iconoGrande}>⚠️</Text>
          <Text style={styles.titulo}>¡ATENCIÓN!</Text>
          <Text style={styles.mensaje}>
            Revisa que tienes todas tus tareas completadas antes de irte a dormir.
          </Text>

          <View style={styles.advertencia}>
            <Text style={styles.advertenciaTexto}>
              Las tareas personales son obligatorias.{'\n'}
              Si marcas algo como hecho sin hacerlo,{'\n'}
              perderás el doble de puntos.
            </Text>
          </View>

          <TouchableOpacity style={styles.botonCerrar} onPress={onCerrar}>
            <Text style={styles.botonCerrarTexto}>Entendido, voy a revisarlo</Text>
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
    borderColor: COLORS.yellow,
  },
  iconoGrande: { fontSize: 64, marginBottom: 12 },
  titulo: {
    color: COLORS.yellow,
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
    lineHeight: 24,
  },
  advertencia: {
    backgroundColor: `${COLORS.red}20`,
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 20,
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
  botonCerrar: {
    backgroundColor: COLORS.blue,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  botonCerrarTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
