import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Modal, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { getNivel } from '../constants/niveles';
import { TAREAS_CASA_POOL, TAREAS_PERSONALES } from '../constants/tareas';

const ICONOS_USUARIO = { Daniel: '👕', Sergio: '🍳', Diego: '🚿' };

// Devuelve el estado de una tarea para un usuario hoy
const getEstadoTarea = (usuarioId, tareaId, historial) => {
  const fechaHoy = new Date().toISOString().split('T')[0];
  const entradas = historial.filter(
    h => h.usuarioId === usuarioId && h.tareaId === tareaId && h.fechaDia === fechaHoy
  );
  if (entradas.length === 0) return 'pendiente';
  if (entradas.some(h => h.estado === 'verificada'))        return 'verificada';
  if (entradas.some(h => h.estado === 'pendiente_verificacion')) return 'enviada';
  if (entradas.every(h => h.estado === 'rechazada'))        return 'rechazada';
  return 'pendiente';
};

const ESTADO_ICONO  = { verificada: '✅', enviada: '⏳', rechazada: '❌', pendiente: '○' };
const ESTADO_COLOR  = { verificada: COLORS.green, enviada: COLORS.yellow, rechazada: COLORS.red, pendiente: COLORS.textMuted };

export const AdminTab = ({
  usuarios,
  historial,
  asignaciones,
  onVerificar,
  onRecalcular,
  onRepartirAhora,
  onResetearHoy,
  onAjustarPuntos,
  onResetearPuntosUsuario,
}) => {
  const [expandido,    setExpandido]    = useState(null);
  const [modalUsuario, setModalUsuario] = useState(null); // usuario seleccionado para modal
  const [inputPuntos,  setInputPuntos]  = useState('');

  const pendientes = historial.filter(h => h.estado === 'pendiente_verificacion');

  const confirmarRecalcular = () => {
    Alert.alert(
      '🔄 Recalcular puntos',
      'Recalcula los puntos de todos los usuarios desde el historial verificado.\n\n¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Recalcular', onPress: onRecalcular },
      ]
    );
  };

  const confirmarRepartir = () => {
    Alert.alert(
      '🎲 Repartir tareas ahora',
      'Se repartirán aleatoriamente TODAS las tareas de casa entre los 3 usuarios para hoy, reemplazando el reparto actual.\n\n¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Repartir', onPress: onRepartirAhora },
      ]
    );
  };

  const confirmarResetearHoy = () => {
    Alert.alert(
      '🗑️ Resetear tareas de hoy',
      'Se eliminarán TODOS los registros de hoy del historial. Las tareas quedarán como pendientes.\n\n¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resetear', style: 'destructive', onPress: onResetearHoy },
      ]
    );
  };

  const usuariosActivos = usuarios.filter(u => !u.isAdmin);

  return (
    <View style={styles.tabContent}>

      {/* Tareas de hoy por usuario */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Tareas de hoy</Text>

        {!asignaciones ? (
          <Text style={styles.empty}>Cargando asignaciones...</Text>
        ) : (
          usuariosActivos.map(u => {
            const tareaIds  = asignaciones[u.id] || [];
            const abierto   = expandido === u.id;
            const tareasHoy = [
              ...TAREAS_PERSONALES,
              ...tareaIds.map(id => TAREAS_CASA_POOL.find(t => t.id === id)).filter(Boolean),
            ];

            // Contadores rápidos
            const nVerif  = tareasHoy.filter(t => getEstadoTarea(u.id, t.id, historial) === 'verificada').length;
            const nEnv    = tareasHoy.filter(t => getEstadoTarea(u.id, t.id, historial) === 'enviada').length;
            const nTotal  = tareasHoy.length;

            return (
              <View key={u.id} style={styles.usuarioBloque}>
                {/* Cabecera del usuario (tap para expandir) */}
                <TouchableOpacity
                  style={styles.usuarioHeader}
                  onPress={() => setExpandido(abierto ? null : u.id)}
                >
                  <Text style={styles.usuarioHeaderIcon}>
                    {ICONOS_USUARIO[u.nombre] || '👤'}
                  </Text>
                  <View style={styles.usuarioHeaderInfo}>
                    <Text style={styles.usuarioHeaderNombre}>{u.nombre}</Text>
                    <Text style={styles.usuarioHeaderSub}>
                      ✅ {nVerif}/{nTotal} verificadas
                      {nEnv > 0 && <Text style={styles.enviadas}>  ⏳ {nEnv} por revisar</Text>}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>{abierto ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {/* Lista de tareas (expandible) */}
                {abierto && (
                  <View style={styles.tareaLista}>
                    {/* Personales */}
                    <Text style={styles.seccionLabel}>— Personales</Text>
                    {TAREAS_PERSONALES.map(t => {
                      const estado = getEstadoTarea(u.id, t.id, historial);
                      return (
                        <View key={t.id} style={styles.tareaFila}>
                          <Text style={[styles.tareaEstado, { color: ESTADO_COLOR[estado] }]}>
                            {ESTADO_ICONO[estado]}
                          </Text>
                          <Text style={[
                            styles.tareaNombreAdmin,
                            estado === 'verificada' && styles.tareaHecha,
                          ]}>
                            {t.nombre}
                          </Text>
                          <Text style={styles.tareaPtsAdmin}>+{t.puntos}</Text>
                        </View>
                      );
                    })}

                    {/* Asignadas de casa */}
                    <Text style={styles.seccionLabel}>— Casa (asignadas hoy)</Text>
                    {tareaIds.length === 0 ? (
                      <Text style={styles.sinTareas}>Sin tareas de casa asignadas</Text>
                    ) : (
                      tareaIds
                        .map(id => TAREAS_CASA_POOL.find(t => t.id === id))
                        .filter(Boolean)
                        .map(t => {
                          const estado = getEstadoTarea(u.id, t.id, historial);
                          return (
                            <View key={t.id} style={styles.tareaFila}>
                              <Text style={[styles.tareaEstado, { color: ESTADO_COLOR[estado] }]}>
                                {ESTADO_ICONO[estado]}
                              </Text>
                              <Text style={[
                                styles.tareaNombreAdmin,
                                estado === 'verificada' && styles.tareaHecha,
                              ]}>
                                {t.nombre}
                              </Text>
                              <Text style={styles.tareaPtsAdmin}>+{t.puntos}</Text>
                            </View>
                          );
                        })
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

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

      {/* Modal para ajustar puntos */}
      <Modal
        visible={!!modalUsuario}
        transparent
        animationType="fade"
        onRequestClose={() => setModalUsuario(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              ✏️ Ajustar puntos — {modalUsuario?.nombre}
            </Text>
            <Text style={styles.modalSub}>
              Puntos actuales: <Text style={styles.modalPts}>{modalUsuario?.puntos || 0}</Text>
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Ej: -50  o  +20"
              placeholderTextColor={COLORS.textMuted}
              value={inputPuntos}
              onChangeText={setInputPuntos}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnOk}
                onPress={() => {
                  const n = parseInt(inputPuntos, 10);
                  if (isNaN(n)) { Alert.alert('Error', 'Introduce un número válido'); return; }
                  onAjustarPuntos(modalUsuario.id, n);
                  setModalUsuario(null);
                  setInputPuntos('');
                }}
              >
                <Text style={styles.modalBtnText}>Aplicar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => { setModalUsuario(null); setInputPuntos(''); }}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Puntos por usuario */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👥 Puntos actuales</Text>
        {usuarios.filter(u => !u.isAdmin).map(u => {
          const nivel = getNivel(u.puntos || 0);
          return (
            <View key={u.id} style={styles.usuarioRow}>
              <Text style={styles.usuarioNombre}>{nivel.icono} {u.nombre}</Text>
              <View style={styles.usuarioRight}>
                <Text style={styles.usuarioPts}>{u.puntos || 0} pts</Text>
                <Text style={styles.usuarioRacha}>🔥 {u.racha || 0}d</Text>
                {/* Botón editar puntos */}
                <TouchableOpacity
                  style={styles.btnEditar}
                  onPress={() => { setModalUsuario(u); setInputPuntos(''); }}
                >
                  <Text style={styles.btnEditarText}>✏️</Text>
                </TouchableOpacity>
                {/* Botón resetear a 0 */}
                <TouchableOpacity
                  style={styles.btnReset}
                  onPress={() =>
                    Alert.alert(
                      '🔄 Resetear puntos',
                      `¿Poner puntos y racha de ${u.nombre} a 0?`,
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

      {/* Mantenimiento */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔧 Mantenimiento</Text>

        <TouchableOpacity style={styles.actionBtn} onPress={confirmarRepartir}>
          <Text style={styles.actionBtnText}>🎲 Repartir tareas ahora</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          Redistribuye aleatoriamente las tareas de casa entre los 3 usuarios para hoy.
        </Text>

        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={confirmarResetearHoy}>
          <Text style={styles.actionBtnText}>🗑️ Resetear tareas de hoy</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          Elimina todos los registros de hoy del historial. Las tareas vuelven a pendientes.
        </Text>

        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={confirmarRecalcular}>
          <Text style={styles.actionBtnText}>🔄 Recalcular puntos</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          Recalcula los puntos basándose solo en tareas verificadas del historial.
        </Text>
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
    marginBottom: 12,
  },
  badge: { color: COLORS.yellow },
  empty: { color: COLORS.textSecondary, textAlign: 'center', padding: 20 },

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

  usuarioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  usuarioNombre: { color: COLORS.textPrimary, fontSize: 16 },
  usuarioRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  usuarioPts: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
  usuarioRacha: { color: COLORS.yellow, fontSize: 13 },
  btnEditar: {
    backgroundColor: COLORS.blue,
    width: 30, height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnEditarText: { fontSize: 14 },
  btnReset: {
    backgroundColor: COLORS.red,
    width: 30, height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnResetText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Modal ajuste de puntos
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    gap: 12,
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  modalSub:   { color: COLORS.textSecondary, fontSize: 13 },
  modalPts:   { color: COLORS.green, fontWeight: '700' },
  modalInput: {
    backgroundColor: COLORS.cardInner,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 18,
    padding: 12,
    textAlign: 'center',
  },
  modalBtns:      { flexDirection: 'row', gap: 10 },
  modalBtnOk:     { flex: 1, backgroundColor: COLORS.blue, borderRadius: 10, padding: 12, alignItems: 'center' },
  modalBtnCancel: { flex: 1, backgroundColor: COLORS.textMuted, borderRadius: 10, padding: 12, alignItems: 'center' },
  modalBtnText:   { color: '#fff', fontWeight: '700' },

  actionBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  actionBtnSecondary: { backgroundColor: COLORS.textMuted, marginTop: 16 },
  actionBtnDanger:    { backgroundColor: COLORS.red, marginTop: 16 },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },

  // Tareas de hoy
  usuarioBloque: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  usuarioHeader: {
    backgroundColor: COLORS.cardInner,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  usuarioHeaderIcon: { fontSize: 24 },
  usuarioHeaderInfo: { flex: 1 },
  usuarioHeaderNombre: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  usuarioHeaderSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  enviadas: { color: COLORS.yellow },
  chevron: { color: COLORS.textSecondary, fontSize: 14 },

  tareaLista: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  seccionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tareaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tareaEstado: { fontSize: 14, width: 18, textAlign: 'center' },
  tareaNombreAdmin: { flex: 1, color: COLORS.textPrimary, fontSize: 13 },
  tareaHecha: { color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  tareaPtsAdmin: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  sinTareas: { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic', paddingVertical: 6 },
});
