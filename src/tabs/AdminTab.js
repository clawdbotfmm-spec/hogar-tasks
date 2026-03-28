import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { SECCIONES_TAREAS, TAREAS_PERSONALES, TAREAS_EXTRAS } from '../constants/tareas';
import { getNivel } from '../constants/niveles';
import { GRUPOS, getGrupoPorId, getDiaEnBloque, diasRestantesBloque } from '../constants/rotacion';
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
  tareasCustom = [],
  onAgregarTareaCustom,
  onBorrarTareaCustom,
  tareasOcultas = [],
  onOcultarTarea,
  onRestaurarTarea,
  configRotacion = null,
  onRotarGrupos,
}) => {
  const [modalUsuario, setModalUsuario] = useState(null);
  const [inputPuntos, setInputPuntos]   = useState('');
  const [modalTarea, setModalTarea]     = useState(false);
  const [nuevaTareaNombre, setNuevaTareaNombre] = useState('');
  const [nuevaTareaEsfuerzo, setNuevaTareaEsfuerzo] = useState(null);
  const [nuevaTareaMaxVeces, setNuevaTareaMaxVeces] = useState('1');
  const [nuevaTareaFrecuencia, setNuevaTareaFrecuencia] = useState('diaria');
  const [nuevaTareaCategoria, setNuevaTareaCategoria] = useState('cocina');
  const [busquedaTarea, setBusquedaTarea] = useState('');

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

      {/* Rotación de grupos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔄 Rotación de grupos</Text>
        <Text style={styles.rotacionInfo}>
          Día {getDiaEnBloque(configRotacion?.inicioCiclo)}/5 · Quedan {diasRestantesBloque(configRotacion?.inicioCiclo)} días
        </Text>
        {usuariosActivos.map(u => {
          const grupo = u.grupoActual ? getGrupoPorId(u.grupoActual) : null;
          return (
            <View key={u.id} style={styles.rotacionCard}>
              <Text style={styles.rotacionNombre}>{u.nombre}</Text>
              {grupo ? (
                <Text style={styles.rotacionGrupo}>
                  {grupo.icono} {grupo.nombre}
                </Text>
              ) : (
                <Text style={styles.rotacionSinAsignar}>Sin asignar</Text>
              )}
            </View>
          );
        })}
        <TouchableOpacity
          style={[styles.actionBtn, { marginTop: 12 }]}
          onPress={() => confirmar(
            'Rotar grupos',
            'Se reasignarán los grupos aleatoriamente. ¿Continuar?',
            onRotarGrupos
          )}
        >
          <Text style={styles.actionBtnText}>🔀 Rotar grupos ahora</Text>
        </TouchableOpacity>
      </View>

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
            'Se pondrán TODOS los puntos y boosters a 0 para todos los usuarios.',
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

      {/* Resumen usuarios + horas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Usuarios</Text>
        {usuariosActivos.map(u => {
          const nivel = getNivel(u.puntos || 0);
          return (
            <View key={u.id} style={styles.usuarioCard}>
              <View style={styles.usuarioTop}>
                <Text style={styles.usuarioIcon}>{nivel.icono}</Text>
                <View style={styles.usuarioInfo}>
                  <Text style={styles.usuarioNombre}>{u.nombre}</Text>
                  <Text style={styles.usuarioNivel}>Nv{nivel.nivel}</Text>
                </View>
                <Text style={styles.usuarioPts}>{u.puntos || 0} pts</Text>
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
                    `¿Poner puntos de ${u.nombre} a 0?`,
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

      {/* Gestionar TODAS las tareas */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🛠️ Gestionar tareas</Text>
          <TouchableOpacity style={styles.btnAddTarea} onPress={() => setModalTarea(true)}>
            <Text style={styles.btnAddTareaText}>+ Nueva</Text>
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar tarea..."
          placeholderTextColor={COLORS.textMuted}
          value={busquedaTarea}
          onChangeText={setBusquedaTarea}
        />

        {/* Tareas estáticas por sección */}
        {[
          ...SECCIONES_TAREAS,
          { key: 'personal', titulo: '🧑 Personales', tareas: TAREAS_PERSONALES },
          { key: 'extras', titulo: '⚡ Extras', tareas: TAREAS_EXTRAS },
        ].map(sec => {
          const tareasFiltradas = sec.tareas.filter(t =>
            !busquedaTarea || t.nombre.toLowerCase().includes(busquedaTarea.toLowerCase())
          );
          if (tareasFiltradas.length === 0) return null;
          return (
            <View key={sec.key} style={styles.seccionTareas}>
              <Text style={styles.seccionTitulo}>{sec.titulo}</Text>
              {tareasFiltradas.map(t => {
                const oculta = tareasOcultas.includes(t.id);
                return (
                  <View key={t.id} style={[styles.tareaCustomCard, oculta && styles.tareaOculta]}>
                    <View style={styles.tareaCustomInfo}>
                      <Text style={[styles.tareaCustomNombre, oculta && styles.tareaOcultaText]}>{t.nombre}</Text>
                      <Text style={styles.tareaCustomMeta}>{t.puntos} pts</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.btnToggleTarea, oculta ? styles.btnRestaurar : styles.btnOcultar]}
                      onPress={() => oculta ? onRestaurarTarea(t.id) : confirmar(
                        'Ocultar tarea',
                        `¿Ocultar "${t.nombre}" para todos?`,
                        () => onOcultarTarea(t.id)
                      )}
                    >
                      <Text style={styles.btnToggleTareaText}>{oculta ? '👁️' : '🙈'}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Tareas custom añadidas */}
        {tareasCustom.filter(t =>
          !busquedaTarea || t.nombre.toLowerCase().includes(busquedaTarea.toLowerCase())
        ).length > 0 && (
          <View style={styles.seccionTareas}>
            <Text style={styles.seccionTitulo}>⭐ Personalizadas</Text>
            {tareasCustom.filter(t =>
              !busquedaTarea || t.nombre.toLowerCase().includes(busquedaTarea.toLowerCase())
            ).map(t => (
              <View key={t.id} style={styles.tareaCustomCard}>
                <View style={styles.tareaCustomInfo}>
                  <Text style={styles.tareaCustomNombre}>{t.nombre}</Text>
                  <Text style={styles.tareaCustomMeta}>{t.puntos} pts · máx {t.maxVeces}x · {t.frecuencia}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.btnToggleTarea, styles.btnOcultar]}
                  onPress={() => confirmar(
                    'Borrar tarea',
                    `¿Eliminar "${t.nombre}"?`,
                    () => onBorrarTareaCustom(t.id)
                  )}
                >
                  <Text style={styles.btnToggleTareaText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
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

            {/* Sección / Categoría */}
            <Text style={styles.modalLabel}>Sección</Text>
            <View style={styles.categoriaGrid}>
              {[
                { key: 'cocina', label: '🍳 Cocina' },
                { key: 'lavabos', label: '🚿 Lavabos' },
                { key: 'robot', label: '🤖 Robot' },
                { key: 'lavanderia', label: '👕 Lavandería' },
                { key: 'tapers', label: '🍱 Tapers' },
                { key: 'casa', label: '🏠 Casa' },
                { key: 'personal', label: '🧑 Personal' },
                { key: 'extra', label: '⭐ Extra' },
              ].map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.categoriaBtn, nuevaTareaCategoria === c.key && styles.categoriaBtnActive]}
                  onPress={() => setNuevaTareaCategoria(c.key)}
                >
                  <Text style={[styles.categoriaBtnText, nuevaTareaCategoria === c.key && styles.categoriaBtnTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Esfuerzo = puntos automáticos */}
            <Text style={styles.modalLabel}>Esfuerzo</Text>
            <View style={styles.esfuerzoRow}>
              {[
                { pts: 1, label: 'Micro', sub: '30 seg' },
                { pts: 2, label: 'Rápida', sub: '1-3 min' },
                { pts: 3, label: 'Media', sub: '5 min' },
                { pts: 5, label: 'Larga', sub: '10-15 min' },
                { pts: 8, label: 'Pesada', sub: '20+ min' },
              ].map(e => (
                <TouchableOpacity
                  key={e.pts}
                  style={[styles.esfuerzoBtn, nuevaTareaEsfuerzo === e.pts && styles.esfuerzoBtnActive]}
                  onPress={() => setNuevaTareaEsfuerzo(e.pts)}
                >
                  <Text style={[styles.esfuerzoPts, nuevaTareaEsfuerzo === e.pts && styles.esfuerzoPtsActive]}>
                    {e.pts}
                  </Text>
                  <Text style={[styles.esfuerzoLabel, nuevaTareaEsfuerzo === e.pts && styles.esfuerzoLabelActive]}>
                    {e.label}
                  </Text>
                  <Text style={styles.esfuerzoSub}>{e.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Frecuencia */}
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

            {/* Max veces */}
            <TextInput
              style={styles.modalInput}
              placeholder="Máx veces por día (ej: 1)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={nuevaTareaMaxVeces}
              onChangeText={setNuevaTareaMaxVeces}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnOk}
                onPress={() => {
                  const max = parseInt(nuevaTareaMaxVeces, 10) || 1;
                  if (!nuevaTareaNombre.trim() || !nuevaTareaEsfuerzo) return;
                  onAgregarTareaCustom({
                    nombre: nuevaTareaNombre,
                    puntos: nuevaTareaEsfuerzo,
                    maxVeces: max,
                    frecuencia: nuevaTareaFrecuencia,
                    categoria: nuevaTareaCategoria,
                  });
                  setNuevaTareaNombre('');
                  setNuevaTareaEsfuerzo(null);
                  setNuevaTareaMaxVeces('1');
                  setNuevaTareaFrecuencia('diaria');
                  setNuevaTareaCategoria('cocina');
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

  // Gestión de tareas
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  btnAddTarea: { backgroundColor: COLORS.blue, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  btnAddTareaText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  searchInput: {
    backgroundColor: COLORS.cardInner, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.border, color: COLORS.textPrimary, fontSize: 14,
    padding: 10, marginBottom: 12,
  },
  seccionTareas: { marginBottom: 8 },
  seccionTitulo: { color: COLORS.yellow, fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 4 },
  tareaCustomCard: {
    backgroundColor: COLORS.cardInner, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  tareaOculta: { opacity: 0.4 },
  tareaCustomInfo: { flex: 1 },
  tareaCustomNombre: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },
  tareaOcultaText: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  tareaCustomMeta: { color: COLORS.textSecondary, fontSize: 11, marginTop: 1 },
  btnToggleTarea: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  btnOcultar: { backgroundColor: 'rgba(239,68,68,0.15)' },
  btnRestaurar: { backgroundColor: 'rgba(34,197,94,0.15)' },
  btnToggleTareaText: { fontSize: 16 },
  frecuenciaRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  frecuenciaBtn: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 10, alignItems: 'center' },
  frecuenciaBtnActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  frecuenciaBtnText: { color: COLORS.textSecondary, fontSize: 13 },
  frecuenciaBtnTextActive: { color: '#fff', fontWeight: '700' },

  // Modal nueva tarea
  modalLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  categoriaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  categoriaBtn: {
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardInner,
  },
  categoriaBtnActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  categoriaBtnText: { color: COLORS.textSecondary, fontSize: 12 },
  categoriaBtnTextActive: { color: '#fff', fontWeight: '600' },
  esfuerzoRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  esfuerzoBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardInner,
  },
  esfuerzoBtnActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  esfuerzoPts: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  esfuerzoPtsActive: { color: '#fff' },
  esfuerzoLabel: { color: COLORS.textSecondary, fontSize: 10, marginTop: 2 },
  esfuerzoLabelActive: { color: '#fff' },
  esfuerzoSub: { color: COLORS.textMuted, fontSize: 9 },

  // Rotación
  rotacionInfo: { color: COLORS.blue, fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  rotacionCard: {
    backgroundColor: COLORS.cardInner, borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  rotacionNombre: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  rotacionGrupo: { color: COLORS.green, fontSize: 13, marginTop: 2 },
  rotacionSinAsignar: { color: COLORS.yellow, fontSize: 13, marginTop: 2 },
});
