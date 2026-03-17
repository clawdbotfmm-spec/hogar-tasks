import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { getNivel } from '../constants/niveles';
import { PUNTOS_POR_HORA } from '../constants/tareas';
import { confirmar } from '../utils/confirmar';

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
  tareasCustom = [],
  onAgregarTareaCustom,
  onBorrarTareaCustom,
}) => {
  const [modalUsuario, setModalUsuario] = useState(null);
  const [inputPuntos, setInputPuntos]   = useState('');
  const [modalTarea, setModalTarea]     = useState(false);
  const [nuevaTareaNombre, setNuevaTareaNombre] = useState('');
  const [nuevaTareaPuntos, setNuevaTareaPuntos] = useState('');
  const [nuevaTareaMaxVeces, setNuevaTareaMaxVeces] = useState('1');
  const [nuevaTareaFrecuencia, setNuevaTareaFrecuencia] = useState('diaria');

  const pendientes = historial.filter(h => h.estado === 'pendiente_verificacion');
  const usuariosActivos = usuarios.filter(u => !u.isAdmin);

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
                <TouchableOpacity style={styles.btnOk} onPress={() => onVerificar(t, true)}>
                  <Text style={styles.btnOkText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnNo} onPress={() => onVerificar(t, false)}>
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
        <Text style={styles.conversionHint}>{PUNTOS_POR_HORA} puntos = 1 hora de pantalla</Text>
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
                  <Text style={styles.usuarioNivel}>Nv{nivel.nivel} · 🔥 {u.racha || 0} días</Text>
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
                  onPress={() => confirmar(
                    'Resetear',
                    `¿Poner puntos, racha y horas de ${u.nombre} a 0?`,
                    () => onResetearPuntosUsuario(u.id)
                  )}
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
            <Text style={styles.modalTitle}>Ajustar puntos de {modalUsuario?.nombre}</Text>
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
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalUsuario(null)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gestionar tareas custom */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🛠️ Tareas personalizadas</Text>
          <TouchableOpacity style={styles.btnAddTarea} onPress={() => setModalTarea(true)}>
            <Text style={styles.btnAddTareaText}>+ Añadir</Text>
          </TouchableOpacity>
        </View>
        {tareasCustom.length === 0 ? (
          <Text style={styles.empty}>No hay tareas personalizadas. Pulsa "+ Añadir" para crear una.</Text>
        ) : (
          tareasCustom.map(t => (
            <View key={t.id} style={styles.tareaCustomCard}>
              <View style={styles.tareaCustomInfo}>
                <Text style={styles.tareaCustomNombre}>{t.nombre}</Text>
                <Text style={styles.tareaCustomMeta}>
                  {t.puntos} pts · máx {t.maxVeces}x · {t.frecuencia}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.btnBorrarTarea}
                onPress={() => confirmar(
                  'Borrar tarea',
                  `¿Eliminar "${t.nombre}"?`,
                  () => onBorrarTareaCustom(t.id)
                )}
              >
                <Text style={styles.btnBorrarTareaText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Modal añadir tarea custom */}
      <Modal
        visible={modalTarea}
        transparent
        animationType="fade"
        onRequestClose={() => setModalTarea(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>➕ Nueva tarea</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre de la tarea"
              placeholderTextColor={COLORS.textMuted}
              value={nuevaTareaNombre}
              onChangeText={setNuevaTareaNombre}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Puntos (ej: 5)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={nuevaTareaPuntos}
              onChangeText={setNuevaTareaPuntos}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Máx veces por día (ej: 1)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={nuevaTareaMaxVeces}
              onChangeText={setNuevaTareaMaxVeces}
            />

            <View style={styles.frecuenciaRow}>
              {['diaria', 'ocasional'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.frecuenciaBtn, nuevaTareaFrecuencia === f && styles.frecuenciaBtnActive]}
                  onPress={() => setNuevaTareaFrecuencia(f)}
                >
                  <Text style={[styles.frecuenciaBtnText, nuevaTareaFrecuencia === f && styles.frecuenciaBtnTextActive]}>
                    {f === 'diaria' ? '📅 Diaria' : '📆 Ocasional'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnOk}
                onPress={() => {
                  const pts = parseInt(nuevaTareaPuntos, 10);
                  const max = parseInt(nuevaTareaMaxVeces, 10) || 1;
                  if (!nuevaTareaNombre.trim() || isNaN(pts) || pts <= 0) return;
                  onAgregarTareaCustom({
                    nombre: nuevaTareaNombre,
                    puntos: pts,
                    maxVeces: max,
                    frecuencia: nuevaTareaFrecuencia,
                  });
                  setNuevaTareaNombre('');
                  setNuevaTareaPuntos('');
                  setNuevaTareaMaxVeces('1');
                  setNuevaTareaFrecuencia('diaria');
                  setModalTarea(false);
                }}
              >
                <Text style={styles.modalBtnText}>Crear tarea</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalTarea(false)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mantenimiento */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔧 Mantenimiento</Text>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={() => confirmar(
            'Resetear tareas de hoy',
            'Se eliminarán TODOS los registros de hoy. Las tareas vuelven a pendientes.',
            onResetearHoy
          )}
        >
          <Text style={styles.actionBtnText}>🗑️ Resetear tareas de hoy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSecondary]}
          onPress={() => confirmar(
            'Recalcular puntos',
            'Recalcula puntos desde el historial verificado.',
            onRecalcular
          )}
        >
          <Text style={styles.actionBtnText}>🔄 Recalcular puntos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={() => confirmar(
            'RESET TOTAL',
            'Se pondrán TODOS los puntos, rachas, horas y boosters a 0 para todos los usuarios.',
            onResetearTodos
          )}
        >
          <Text style={styles.actionBtnText}>⚠️ Reset total de puntos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={() => confirmar(
            'BORRAR TODO EL HISTORIAL',
            'Se borrará TODO el historial de tareas. Esta acción no se puede deshacer.',
            onBorrarHistorial
          )}
        >
          <Text style={styles.actionBtnText}>⚠️ Borrar todo el historial</Text>
        </TouchableOpacity>
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
  actionBtn: { backgroundColor: COLORS.blue, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
  actionBtnSecondary: { backgroundColor: COLORS.textMuted },
  actionBtnDanger: { backgroundColor: COLORS.red },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Tareas custom
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  btnAddTarea: { backgroundColor: COLORS.blue, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  btnAddTareaText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tareaCustomCard: {
    backgroundColor: COLORS.cardInner, borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  tareaCustomInfo: { flex: 1 },
  tareaCustomNombre: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  tareaCustomMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  btnBorrarTarea: { padding: 6 },
  btnBorrarTareaText: { fontSize: 20 },
  frecuenciaRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  frecuenciaBtn: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 10, alignItems: 'center' },
  frecuenciaBtnActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  frecuenciaBtnText: { color: COLORS.textSecondary, fontSize: 13 },
  frecuenciaBtnTextActive: { color: '#fff', fontWeight: '700' },
});
