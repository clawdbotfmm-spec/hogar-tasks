import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Modal, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { getNivel } from '../constants/niveles';
import { PUNTOS_POR_HORA } from '../constants/tareas';

export const AdminTab = ({
  usuarios,
  historial,
  onVerificar,
  onRecalcular,
  onResetearHoy,
  onAjustarPuntos,
  onResetearPuntosUsuario,
  onResetearTodos,
  onBorrarHistorial,
  getHorasHoy,
  getHorasSemana,
}) => {
  const [modalUsuario, setModalUsuario] = useState(null);
  const [inputPuntos,  setInputPuntos]  = useState('');

  const pendientes = historial.filter(h => h.estado === 'pendiente_verificacion');
  const usuariosActivos = usuarios.filter(u => !u.isAdmin);

  const confirmarResetearHoy = () => {
    Alert.alert(
      '🗑️ Resetear tareas de hoy',
      'Se eliminarán TODOS los registros de hoy. Las tareas vuelven a pendientes.\n\n¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resetear', style: 'destructive', onPress: onResetearHoy },
      ]
    );
  };

  const confirmarRecalcular = () => {
    Alert.alert(
      '🔄 Recalcular puntos',
      'Recalcula puntos desde el historial verificado.\n\n¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Recalcular', onPress: onRecalcular },
      ]
    );
  };

  const confirmarResetTodos = () => {
    Alert.alert(
      '⚠️ RESET TOTAL',
      'Se pondrán TODOS los puntos, rachas, horas y boosters a 0 para todos los usuarios.\n\n¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'RESETEAR TODO', style: 'destructive', onPress: onResetearTodos },
      ]
    );
  };

  const confirmarBorrarHistorial = () => {
    Alert.alert(
      '⚠️ BORRAR TODO EL HISTORIAL',
      'Se borrará TODO el historial de tareas completadas. Esta acción no se puede deshacer.\n\n¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'BORRAR TODO', style: 'destructive', onPress: onBorrarHistorial },
      ]
    );
  };

  return (
    <View style={styles.tabContent}>

      {/* Verificar tareas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          👑 Verificar tareas
          {pendientes.length > 0 && (
            <Text style={styles.badge}> ({pendientes.length})</Text>
          )}
        </Text>
        {pendientes.length === 0 ? (
          <Text style={styles.empty}>No hay tareas pendientes de verificación</Text>
        ) : (
          pendientes.map(t => (
            <View key={t.id} style={styles.verificarCard}>
              <View style={styles.verificarInfo}>
                <Text style={styles.verificarUsuario}>{t.usuarioNombre}</Text>
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
          ))
        )}
      </View>

      {/* Resumen usuarios + horas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Usuarios y horas</Text>
        <Text style={styles.conversionHint}>
          {PUNTOS_POR_HORA} puntos = 1 hora de pantalla
        </Text>
        {usuariosActivos.map(u => {
          const nivel = getNivel(u.puntos || 0);
          const horasHoy = getHorasHoy(u.id);
          const horasSemana = getHorasSemana(u.id);
          return (
            <View key={u.id} style={styles.usuarioCard}>
              <View style={styles.usuarioTop}>
                <Text style={styles.usuarioIcon}>{nivel.icono}</Text>
                <View style={styles.usuarioInfo}>
                  <Text style={styles.usuarioNombre}>{u.nombre}</Text>
                  <Text style={styles.usuarioNivel}>
                    Nv{nivel.nivel} · 🔥 {u.racha || 0} días
                  </Text>
                </View>
                <Text style={styles.usuarioPts}>{u.puntos || 0} pts</Text>
              </View>
              <View style={styles.horasRow}>
                <Text style={styles.horasTexto}>📱 Hoy: {horasHoy}h</Text>
                <Text style={styles.horasTexto}>📅 Semana: {horasSemana}h</Text>
              </View>
              <View style={styles.usuarioActions}>
                <TouchableOpacity
                  style={styles.btnEditar}
                  onPress={() => { setModalUsuario(u); setInputPuntos(''); }}
                >
                  <Text style={styles.btnEditarText}>±</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnReset}
                  onPress={() =>
                    Alert.alert(
                      '🔄 Resetear',
                      `¿Poner puntos, racha y horas de ${u.nombre} a 0?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Resetear', style: 'destructive', onPress: () => onResetearPuntosUsuario(u.id) },
                      ]
                    )
                  }
                >
                  <Text style={styles.btnResetText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Modal ajuste puntos */}
      <Modal
        visible={!!modalUsuario}
        transparent
        animationType="fade"
        onRequestClose={() => setModalUsuario(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Ajustar puntos de {modalUsuario?.nombre}
            </Text>
            <Text style={styles.modalSub}>
              Actual: <Text style={styles.modalPts}>{modalUsuario?.puntos || 0} pts</Text>
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: 50 o -20"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={inputPuntos}
              onChangeText={setInputPuntos}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnOk}
                onPress={() => {
                  const n = parseInt(inputPuntos, 10);
                  if (isNaN(n)) return;
                  onAjustarPuntos(modalUsuario.id, n);
                  setModalUsuario(null);
                }}
              >
                <Text style={styles.modalBtnText}>Aplicar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setModalUsuario(null)}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mantenimiento */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔧 Mantenimiento</Text>

        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={confirmarResetearHoy}>
          <Text style={styles.actionBtnText}>🗑️ Resetear tareas de hoy</Text>
        </TouchableOpacity>
        <Text style={styles.hintAction}>
          Elimina todos los registros de hoy.
        </Text>

        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={confirmarRecalcular}>
          <Text style={styles.actionBtnText}>🔄 Recalcular puntos</Text>
        </TouchableOpacity>
        <Text style={styles.hintAction}>
          Recalcula puntos basándose en tareas verificadas.
        </Text>

        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={confirmarResetTodos}>
          <Text style={styles.actionBtnText}>⚠️ Reset total de puntos</Text>
        </TouchableOpacity>
        <Text style={styles.hintAction}>
          Pone puntos, rachas, horas y boosters a 0 para todos.
        </Text>

        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={confirmarBorrarHistorial}>
          <Text style={styles.actionBtnText}>⚠️ Borrar todo el historial</Text>
        </TouchableOpacity>
        <Text style={styles.hintAction}>
          Elimina TODO el historial. Irreversible.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: { padding: 16, gap: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  badge: { color: COLORS.yellow },
  empty: { color: COLORS.textSecondary, textAlign: 'center', padding: 20 },
  conversionHint: { color: COLORS.textMuted, fontSize: 12, marginBottom: 12, textAlign: 'center' },

  verificarCard: {
    backgroundColor: COLORS.cardInner, borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  verificarInfo: { flex: 1 },
  verificarUsuario: { color: COLORS.blue, fontSize: 14, fontWeight: '600' },
  verificarTarea: { color: COLORS.textPrimary, fontSize: 16, marginTop: 2 },
  verificarPuntos: { color: COLORS.green, fontSize: 14, marginTop: 4 },
  btns: { flexDirection: 'row', gap: 8 },
  btnOk: { backgroundColor: COLORS.green, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  btnOkText: { color: '#fff', fontSize: 20 },
  btnNo: { backgroundColor: COLORS.red, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  btnNoText: { color: '#fff', fontSize: 20 },

  // Usuario card
  usuarioCard: {
    backgroundColor: COLORS.cardInner, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  usuarioTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  usuarioIcon: { fontSize: 28 },
  usuarioInfo: { flex: 1 },
  usuarioNombre: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  usuarioNivel: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  usuarioPts: { color: COLORS.green, fontSize: 18, fontWeight: '700' },
  horasRow: { flexDirection: 'row', gap: 16, marginTop: 8, paddingLeft: 38 },
  horasTexto: { color: COLORS.blue, fontSize: 13, fontWeight: '600' },
  usuarioActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 8 },
  btnEditar: { backgroundColor: COLORS.blue, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnEditarText: { color: '#fff', fontSize: 14 },
  btnReset: { backgroundColor: COLORS.red, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnResetText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: COLORS.card, borderRadius: 16, padding: 24, width: '85%', gap: 12 },
  modalTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  modalSub: { color: COLORS.textSecondary, fontSize: 13 },
  modalPts: { color: COLORS.green, fontWeight: '700' },
  modalInput: {
    backgroundColor: COLORS.cardInner, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.border, color: COLORS.textPrimary, fontSize: 18, padding: 12, textAlign: 'center',
  },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtnOk: { flex: 1, backgroundColor: COLORS.blue, borderRadius: 10, padding: 12, alignItems: 'center' },
  modalBtnCancel: { flex: 1, backgroundColor: COLORS.textMuted, borderRadius: 10, padding: 12, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '700' },

  // Actions
  actionBtn: { backgroundColor: COLORS.blue, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  actionBtnSecondary: { backgroundColor: COLORS.textMuted, marginTop: 16 },
  actionBtnDanger: { backgroundColor: COLORS.red, marginTop: 16 },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  hintAction: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4, textAlign: 'center' },
});
