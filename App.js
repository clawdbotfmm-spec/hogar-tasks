import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
      Alert.alert('Error', 'No tienes suficientes puntos');
      return;
    }
    Alert.alert(
      'Canjear premio',
      `¿Canjear "${premio.nombre}" por ${premio.puntos} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Canjear', onPress: () => firestore.canjearPremio(user, premio) },
      ]
    );
  };

  const handleComprarBooster = (booster, precio) => {
    if ((user?.puntos || 0) < precio) {
      Alert.alert('Error', `Necesitas ${precio} pts.`);
      return;
    }
    Alert.alert(
      `${booster.icono} ${booster.nombre}`,
      `${booster.descripcion}\n\nCoste: ${precio} pts\nDuración: ${booster.duracionTexto}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Comprar', onPress: () => firestore.comprarBooster(user, booster, precio) },
      ]
    );
  };

  const handleComprarBoosterEspecial = (booster) => {
    if ((user?.puntos || 0) < booster.puntos) {
      Alert.alert('Error', `Necesitas ${booster.puntos} pts.`);
      return;
    }
    let msg = `${booster.descripcion}\n\nCoste: ${booster.puntos} pts`;
    if (booster.tipo === 'proteccion') msg += '\n\n⚠️ Se usará automáticamente si pierdes la racha.';
    if (booster.tipo === 'bonus')      msg += '\n\n⚠️ Solo funciona si completas TODAS las tareas del día.';
    Alert.alert(
      `${booster.icono} ${booster.nombre}`,
      msg,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Comprar', onPress: () => firestore.comprarBoosterEspecial(user, booster) },
      ]
    );
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
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll:    { flex: 1 },
});
