import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';

import { COLORS } from './src/constants/colors';
import { PUNTOS_MINIMOS_DIA, HORA_AVISO } from './src/constants/tareas';
import { useFirestore } from './src/hooks/useFirestore';
import { useTimers } from './src/hooks/useTimers';
import { calcularPuntosConBonus } from './src/hooks/useBoosters';
import { confirmar, alerta } from './src/utils/confirmar';

import { LoginScreen } from './src/screens/LoginScreen';
import { Header } from './src/components/Header';
import { ProgressBar } from './src/components/ProgressBar';
import { TabBar } from './src/components/TabBar';
import { AvisoMinimo } from './src/components/AvisoMinimo';

import { TareasTab } from './src/tabs/TareasTab';
import { ListaCompraTab } from './src/tabs/ListaCompraTab';
import { RankingTab } from './src/tabs/RankingTab';
import { TiendaTab } from './src/tabs/TiendaTab';
import { AdminTab } from './src/tabs/AdminTab';

export default function App() {
  const [user, setUser]                 = useState(null);
  const [tab, setTab]                   = useState('tareas');
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [avisoCerrado, setAvisoCerrado] = useState(false);
  const penalizacionChecked             = useRef(false);

  const firestore = useFirestore();
  const { usuarios, historial, listaCompra, loading } = firestore;

  const { timerSegundos, timersActivos, formatearTiempo, toggleTimer, resetearTimer } =
    useTimers();

  // Comprobar penalización de ayer al cargar
  useEffect(() => {
    if (!loading && usuarios.length > 0 && !penalizacionChecked.current) {
      penalizacionChecked.current = true;
      firestore.comprobarPenalizacionAyer();
    }
  }, [loading, usuarios.length]);

  // Timer para el aviso de las 20:00
  useEffect(() => {
    if (!user || user.isAdmin) return;
    const checkAviso = () => {
      const hora = new Date().getHours();
      if (hora >= HORA_AVISO && !avisoCerrado) {
        const ptsHoy = firestore.getPuntosHoy(user.id);
        if (ptsHoy < PUNTOS_MINIMOS_DIA) {
          setMostrarAviso(true);
        }
      }
    };
    checkAviso();
    const interval = setInterval(checkAviso, 60000);
    return () => clearInterval(interval);
  }, [user, avisoCerrado, historial]);

  // Reset aviso al cambiar de día
  useEffect(() => {
    const checkDia = () => {
      if (new Date().getHours() < HORA_AVISO) {
        setAvisoCerrado(false);
        setMostrarAviso(false);
      }
    };
    const interval = setInterval(checkDia, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Handlers ───────────────────────────────────────────

  const handleCompletar = async (tarea) => {
    if (!user) return;
    const pts = calcularPuntosConBonus(tarea.puntos, tarea.tipo || tarea.categoria || 'base', user);
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
      alerta('Error', 'No tienes suficientes puntos');
      return;
    }
    confirmar(
      `${premio.icono || '🎁'} ${premio.nombre}`,
      `¿Canjear por ${premio.puntos} puntos?\n\n${premio.descripcion}`,
      () => firestore.canjearPremio(user, premio)
    );
  };

  const handleComprarBooster = (booster, precio) => {
    if ((user?.puntos || 0) < precio) {
      alerta('Error', `Necesitas ${precio} pts.`);
      return;
    }
    confirmar(
      `${booster.icono} ${booster.nombre}`,
      `${booster.descripcion}\n\nCoste: ${precio} pts\nDuración: ${booster.duracionTexto}`,
      () => firestore.comprarBooster(user, booster, precio)
    );
  };

  const handleComprarBoosterEspecial = (booster) => {
    if ((user?.puntos || 0) < booster.puntos) {
      alerta('Error', `Necesitas ${booster.puntos} pts.`);
      return;
    }
    confirmar(
      `${booster.icono} ${booster.nombre}`,
      `${booster.descripcion}\n\nCoste: ${booster.puntos} pts`,
      () => firestore.comprarBoosterEspecial(user, booster)
    );
  };

  const handleCerrarAviso = () => {
    setMostrarAviso(false);
    setAvisoCerrado(true);
  };

  // ── Render ─────────────────────────────────────────────

  if (loading) return null;

  if (!user) {
    return (
      <LoginScreen
        usuarios={usuarios}
        onSelect={(u) => {
          setUser(u);
          setTab(u.isAdmin ? 'admin' : 'tareas');
          setAvisoCerrado(false);
        }}
      />
    );
  }

  const userActual      = usuarios.find(u => u.id === user.id) || user;
  const horasHoy        = firestore.getHorasHoy(userActual.id);
  const horasSemana     = firestore.getHorasSemana(userActual.id);
  const puntosHoy       = firestore.getPuntosHoy(userActual.id);
  const pendientesVerif = firestore.getPendientesDeOtros(userActual.id);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} translucent={false} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header user={userActual} horasHoy={horasHoy} onLogout={() => setUser(null)} />
        <ProgressBar puntos={userActual.puntos || 0} />
        <TabBar tab={tab} setTab={setTab} isAdmin={userActual.isAdmin} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'tareas' && !userActual.isAdmin && (
            <TareasTab
              user={userActual}
              historial={historial}
              onCompletar={handleCompletar}
              onDeshacer={handleDeshacer}
              onVerificar={handleVerificar}
              pendientesVerificar={pendientesVerif}
              puntosHoy={puntosHoy}
              horasHoy={horasHoy}
              horasSemana={horasSemana}
              timerSegundos={timerSegundos}
              timersActivos={timersActivos}
              formatearTiempo={formatearTiempo}
              onToggleTimer={toggleTimer}
              onResetTimer={resetearTimer}
            />
          )}

          {tab === 'lista' && (
            <ListaCompraTab
              user={userActual}
              listaCompra={listaCompra}
              onAgregar={firestore.agregarProducto}
              onMarcarComprado={firestore.marcarComprado}
              onEliminar={firestore.eliminarProducto}
              onLimpiarComprados={firestore.limpiarComprados}
            />
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
              onVerificar={handleVerificar}
              onRecalcular={firestore.recalcularPuntos}
              onResetearHoy={firestore.resetearTareasHoy}
              onAjustarPuntos={firestore.ajustarPuntos}
              onResetearPuntosUsuario={firestore.resetearPuntosUsuario}
              onResetearTodos={firestore.resetearTodosPuntos}
              onBorrarHistorial={firestore.borrarTodoHistorial}
              getHorasHoy={firestore.getHorasHoy}
              getHorasSemana={firestore.getHorasSemana}
            />
          )}
        </ScrollView>

        {!userActual.isAdmin && (
          <AvisoMinimo
            visible={mostrarAviso}
            puntosHoy={puntosHoy}
            onCerrar={handleCerrarAviso}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 50;

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bgDark, paddingTop: STATUSBAR_HEIGHT },
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll:    { flex: 1 },
});
