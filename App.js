import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { COLORS } from './src/constants/colors';
import { useFirestore } from './src/hooks/useFirestore';
import { useAsignaciones } from './src/hooks/useAsignaciones';
import { useTimers } from './src/hooks/useTimers';
import { calcularPuntosConBonus } from './src/hooks/useBoosters';

import { LoginScreen } from './src/screens/LoginScreen';
import { Header } from './src/components/Header';
import { ProgressBar } from './src/components/ProgressBar';
import { TabBar } from './src/components/TabBar';

import { TareasTab } from './src/tabs/TareasTab';
import { ExtrasTab } from './src/tabs/ExtrasTab';
import { RankingTab } from './src/tabs/RankingTab';
import { TiendaTab } from './src/tabs/TiendaTab';
import { AdminTab } from './src/tabs/AdminTab';

export default function App() {
  const [user, setUser] = useState(null);
  const [tab,  setTab]  = useState('tareas');
  const [modalError,   setModalError]   = useState({ visible: false, mensaje: '' });
  const [modalConfirm, setModalConfirm] = useState({ visible: false, title: '', mensaje: '', onConfirm: null });

  const firestore = useFirestore();
  const { usuarios, historial, loading } = firestore;

  const { asignaciones, cargando: cargandoAsig, repartirAhora, getAsignacionesUsuario } =
    useAsignaciones(firestore, usuarios, historial);

  const { timerSegundos, timersActivos, formatearTiempo, toggleTimer, resetearTimer } =
    useTimers();

  // ── Handlers ───────────────────────────────────────────

  const handleCompletar = async (tarea) => {
    if (!user) return;
    const pts = calcularPuntosConBonus(tarea.puntos, tarea.tipo || 'base', user);
    await firestore.completarTarea(user, tarea, pts);
  };

  const handleDeshacer = async (historialId) => {
    if (!historialId) return;
    await firestore.deshacerTarea(historialId);
  };

  const handleVerificar = async (tarea, aprobada) => {
    await firestore.verificarTarea(tarea, aprobada);
  };

  const handleCanjearPremio = (premio) => {
    if ((user?.puntos || 0) < premio.puntos) {
      setModalError({ visible: true, mensaje: 'No tienes suficientes puntos' });
      return;
    }
    setModalConfirm({
      visible: true,
      title: 'Canjear premio',
      mensaje: `¿Canjear "${premio.nombre}" por ${premio.puntos} puntos?`,
      onConfirm: () => firestore.canjearPremio(user, premio),
    });
  };

  const handleComprarBooster = (booster, precio) => {
    if ((user?.puntos || 0) < precio) {
      setModalError({ visible: true, mensaje: `Necesitas ${precio} pts.` });
      return;
    }
    setModalConfirm({
      visible: true,
      title: `${booster.icono} ${booster.nombre}`,
      mensaje: `${booster.descripcion}\n\nCoste: ${precio} pts\nDuración: ${booster.duracionTexto}`,
      onConfirm: () => firestore.comprarBooster(user, booster, precio),
    });
  };

  const handleComprarBoosterEspecial = (booster) => {
    if ((user?.puntos || 0) < booster.puntos) {
      setModalError({ visible: true, mensaje: `Necesitas ${booster.puntos} pts.` });
      return;
    }
    let msg = `${booster.descripcion}\n\nCoste: ${booster.puntos} pts`;
    if (booster.tipo === 'proteccion') msg += '\n\n⚠️ Se usará automáticamente si pierdes la racha.';
    if (booster.tipo === 'bonus')      msg += '\n\n⚠️ Solo funciona si completas TODAS las tareas del día.';
    setModalConfirm({
      visible: true,
      title: `${booster.icono} ${booster.nombre}`,
      mensaje: msg,
      onConfirm: () => firestore.comprarBoosterEspecial(user, booster),
    });
  };

  // ── Render ─────────────────────────────────────────────

  if (loading) return null;

  if (!user) {
    return (
      <LoginScreen
        usuarios={usuarios}
        onSelect={(u) => {
          setUser(u);
          // Admin va directo a su panel; el resto a tareas
          setTab(u.isAdmin ? 'admin' : 'tareas');
        }}
      />
    );
  }

  // Mantener el usuario sincronizado con Firestore (puntos en tiempo real)
  const userActual = usuarios.find(u => u.id === user.id) || user;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header user={userActual} onLogout={() => setUser(null)} />
        <ProgressBar puntos={userActual.puntos || 0} />
        <TabBar tab={tab} setTab={setTab} isAdmin={userActual.isAdmin} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'tareas' && !userActual.isAdmin && (
            <TareasTab
              user={userActual}
              tareasAsignadas={getAsignacionesUsuario(userActual.id)}
              historial={historial}
              cargandoAsignaciones={cargandoAsig}
              onCompletar={handleCompletar}
              onDeshacer={handleDeshacer}
              timerSegundos={timerSegundos}
              timersActivos={timersActivos}
              formatearTiempo={formatearTiempo}
              onToggleTimer={toggleTimer}
              onResetTimer={resetearTimer}
            />
          )}

          {tab === 'extras' && !userActual.isAdmin && (
            <ExtrasTab user={userActual} onCompletar={handleCompletar} />
          )}

          {tab === 'ranking' && (
            <RankingTab user={userActual} usuarios={usuarios} historial={historial} />
          )}

          {tab === 'tienda' && !userActual.isAdmin && (
            <TiendaTab
              user={userActual}
              onCanjearPremio={handleCanjearPremio}
              onComprarBooster={handleComprarBooster}
              onComprarBoosterEspecial={handleComprarBoosterEspecial}
            />
          )}

          {tab === 'admin' && userActual.isAdmin && (
            <AdminTab
              usuarios={usuarios}
              historial={historial}
              asignaciones={asignaciones}
              onVerificar={handleVerificar}
              onRecalcular={firestore.recalcularPuntos}
              onRepartirAhora={repartirAhora}
              onResetearHoy={firestore.resetearTareasHoy}
              onAjustarPuntos={firestore.ajustarPuntos}
              onResetearPuntosUsuario={firestore.resetearPuntosUsuario}
              onLimpiarUsuarios={firestore.limpiarUsuariosExternos}
            />
          )}
        </ScrollView>

        {/* Modal de error (sin puntos suficientes) */}
        <Modal
          visible={modalError.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalError(m => ({ ...m, visible: false }))}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>⚠️ Error</Text>
              <Text style={styles.modalSub}>{modalError.mensaje}</Text>
              <TouchableOpacity
                style={styles.modalBtnOk}
                onPress={() => setModalError(m => ({ ...m, visible: false }))}
              >
                <Text style={styles.modalBtnText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de confirmación (comprar / canjear) */}
        <Modal
          visible={modalConfirm.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalConfirm(m => ({ ...m, visible: false }))}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{modalConfirm.title}</Text>
              <Text style={styles.modalSub}>{modalConfirm.mensaje}</Text>
              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={styles.modalBtnOk}
                  onPress={() => {
                    setModalConfirm(m => ({ ...m, visible: false }));
                    modalConfirm.onConfirm?.();
                  }}
                >
                  <Text style={styles.modalBtnText}>Confirmar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtnCancel}
                  onPress={() => setModalConfirm(m => ({ ...m, visible: false }))}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll:    { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: COLORS.card, borderRadius: 14, padding: 24, width: 320, alignItems: 'center' },
  modalTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  modalSub: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtnOk: { backgroundColor: COLORS.green, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  modalBtnCancel: { backgroundColor: COLORS.border, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  modalBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
