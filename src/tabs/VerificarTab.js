import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { USER_ICONS } from '../constants/ui_constants';

export const VerificarTab = ({ user, usuarios, historial, onVerificar }) => {
  // Tareas pendientes de verificación de OTROS usuarios
  const pendientes = historial.filter(
    h => h.estado === 'pendiente_verificacion' && h.usuarioId !== user.id
  );

  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          🔍 Revisar tareas
          {pendientes.length > 0 && (
            <Text style={styles.badge}> ({pendientes.length})</Text>
          )}
        </Text>
        <Text style={styles.hint}>
          Revisa las tareas que han completado tus compañeros y valídalas.
        </Text>

        {pendientes.length === 0 ? (
          <Text style={styles.empty}>No hay tareas pendientes de revisión</Text>
        ) : (
          pendientes.map(t => {
            const icono = USER_ICONS[t.usuarioNombre] || '👤';
            return (
              <View key={t.id} style={styles.verificarCard}>
                <View style={styles.verificarInfo}>
                  <Text style={styles.verificarUsuario}>
                    {icono} {t.usuarioNombre}
                  </Text>
                  <Text style={styles.verificarTarea}>{t.tareaNombre}</Text>
                  <Text style={styles.verificarPuntos}>+{t.puntos} pts</Text>
                </View>
                <View style={styles.btns}>
                  <TouchableOpacity
                    style={styles.btnOk}
                    onPress={() => onVerificar(t, true)}
                  >
                    <Text style={styles.btnOkText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnNo}
                    onPress={() => onVerificar(t, false)}
                  >
                    <Text style={styles.btnNoText}>✗</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
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
    marginBottom: 6,
  },
  badge: { color: COLORS.yellow },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 14,
  },
  empty: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  verificarCard: {
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
  verificarInfo: { flex: 1 },
  verificarUsuario: { color: COLORS.blue, fontSize: 14, fontWeight: '600' },
  verificarTarea: { color: COLORS.textPrimary, fontSize: 16, marginTop: 2 },
  verificarPuntos: { color: COLORS.green, fontSize: 14, marginTop: 4 },
  btns: { flexDirection: 'row', gap: 8 },
  btnOk: {
    backgroundColor: COLORS.green,
    width: 40, height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnOkText: { color: '#fff', fontSize: 20 },
  btnNo: {
    backgroundColor: COLORS.red,
    width: 40, height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnNoText: { color: '#fff', fontSize: 20 },
});
