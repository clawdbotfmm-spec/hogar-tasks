import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import { COLORS } from './src/constants/colors';
import { HORA_AVISO } from './src/constants/tareas';
import { necesitaRotar } from './src/constants/rotacion';
import { auth, crearUsuarioFirestore } from './src/hooks/useFirestore';
import { useFirestore } from './src/hooks/useFirestore';
import { useTimers } from './src/hooks/useTimers';
import { calcularPuntosConBonus } from './src/hooks/useBoosters';
import { confirmar, alerta } from './src/utils/confirmar';
import { useMemos } from './src/hooks/useMemos';

import { LoginScreen } from './src/screens/LoginScreen';
import { Header } from './src/components/Header';
import { TabBar } from './src/components/TabBar';
import { AvisoMinimo } from './src/components/AvisoMinimo';

import { TareasTab } from './src/tabs/TareasTab';
import { ListaCompraTab } from './src/tabs/ListaCompraTab';
import { RankingTab } from './src/tabs/RankingTab';
import { TiendaTab } from './src/tabs/TiendaTab';
import { AdminTab } from './src/tabs/AdminTab';
import { LogrosTab } from './src/tabs/LogrosTab';

export default function App() {
  const [authUser, setAuthUser]           = useState(undefined); // undefined = cargando, null = no auth
  const [tab, setTab]                     = useState('tareas');
  const [mostrarAviso, setMostrarAviso]   = useState(false);
  const [avisoCerrado, setAvisoCerrado]   = useState(false);
  const firestore = useFirestore();
  const { usuarios, historial, tareasCustom, tareasOcultas, configRotacion, loading } = firestore;
  const memos = useMemos();

  const { timerSegundos, timersActivos, formatearTiempo, toggleTimer, resetearTimer } =
    useTimers();

  // Escuchar estado de autenticación
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setAuthUser(fbUser || null);
    });
    return unsub;
  }, []);

  // Usuario actual de Firestore (vinculado por UID de Firebase Auth)
  const user = authUser && usuarios.find(u => u.id === authUser.uid) || null;


  // Limpiar boosters expirados al cargar
  useEffect(() => {
    if (user && !user.isAdmin) {
      firestore.limpiarBoostersExpirados(user);
    }
  }, [user?.id]);

  // Auto-rotar grupos si el ciclo de 5 días ha terminado (solo admin)
  const [rotacionPendiente, setRotacionPendiente] = useState(true);
  useEffect(() => {
    if (!loading && usuarios.length > 0 && rotacionPendiente && user?.isAdmin) {
      const inicio = configRotacion?.inicioCiclo || null;
      if (necesitaRotar(inicio)) {
        firestore.rotarGrupos();
      }
      setRotacionPendiente(false);
    }
  }, [loading, usuarios.length, configRotacion?.inicioCiclo, user?.isAdmin]);

  // Timer para el aviso de las 20:00 — personales pendientes
  useEffect(() => {
    if (!user || user.isAdmin) return;
    const checkAviso = () => {
      const hora = new Date().getHours();
      if (hora >= HORA_AVISO && !avisoCerrado) {
        setMostrarAviso(true);
      }
    };
    checkAviso();
    const interval = setInterval(checkAviso, 60000);
    return () => clearInterval(interval);
  }, [user, avisoCerrado]);

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

  const handleLogin = (fbUser) => {
    setAuthUser(fbUser);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAuthUser(null);
    setTab('tareas');
    setAvisoCerrado(false);
  };

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

  // Cargando auth
  if (authUser === undefined) return null;

  // No autenticado → pantalla de login/registro
  if (!authUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Autenticado pero Firestore aún carga
  if (loading) return null;

  // Autenticado pero aún no tiene documento en Firestore (recién registrado, esperando sync)
  if (!user) {
    crearUsuarioFirestore(authUser.uid, authUser.email, authUser.email.split('@')[0]);
    return null;
  }

  const userActual      = user;
  const pendientesVerif = firestore.getPendientesDeOtros(userActual.id);

  // Ajustar tab inicial según rol
  if (userActual.isAdmin && tab === 'tareas') {
    setTab('admin');
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} translucent={false} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header user={userActual} onLogout={handleLogout} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'tareas' && !userActual.isAdmin && (
            <TareasTab
              user={userActual}
              historial={historial}
              tareasCustom={tareasCustom}
              tareasOcultas={tareasOcultas}
              configRotacion={configRotacion}
              onCompletar={handleCompletar}
              onDeshacer={handleDeshacer}
              onVerificar={handleVerificar}
              pendientesVerificar={pendientesVerif}
              timerSegundos={timerSegundos}
              timersActivos={timersActivos}
              formatearTiempo={formatearTiempo}
              onToggleTimer={toggleTimer}
              onResetTimer={resetearTimer}
            />
          )}

          {tab === 'logros' && !userActual.isAdmin && (
            <LogrosTab user={userActual} historial={historial} />
          )}

          {tab === 'lista' && (
            <ListaCompraTab
              user={userActual}
              listaCompra={memos.listaCompra}
              onAgregar={memos.agregarProducto}
              onMarcarComprado={memos.marcarComprado}
              onEliminar={memos.eliminarProducto}
              onLimpiarComprados={memos.limpiarComprados}
            />
          )}

          {tab === 'ranking' && (
            <RankingTab user={userActual} usuarios={usuarios} historial={historial} configRotacion={configRotacion} />
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
              tareasCustom={tareasCustom}
              onAgregarTareaCustom={firestore.agregarTareaCustom}
              onBorrarTareaCustom={firestore.borrarTareaCustom}
              tareasOcultas={tareasOcultas}
              onOcultarTarea={firestore.ocultarTarea}
              onRestaurarTarea={firestore.restaurarTarea}
              configRotacion={configRotacion}
              onRotarGrupos={firestore.rotarGrupos}
            />
          )}
        </ScrollView>

        <TabBar tab={tab} setTab={setTab} isAdmin={userActual.isAdmin} />

        {!userActual.isAdmin && (
          <AvisoMinimo
            visible={mostrarAviso}
            onCerrar={handleCerrarAviso}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'web' ? 0 : Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 50;

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bgDark, paddingTop: STATUSBAR_HEIGHT },
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll:    { flex: 1 },
});
