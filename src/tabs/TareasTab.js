import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../constants/colors';
import {
  SECCIONES_TAREAS,
  TAREAS_PERSONALES,
  PUNTOS_POR_HORA,
  PUNTOS_MINIMOS_DIA,
} from '../constants/tareas';
import { TAREAS_CON_TIMER } from '../constants/timers';
import { TareaCard } from '../components/TareaCard';
import { TimerTareaCard } from '../components/TimerTareaCard';

// ── Enriquecer tarea con estado ──────────────────────────────────────────
const enriquecerTarea = (t, userId, historial, esPersonal) => {
  const fechaHoy = new Date().toISOString().split('T')[0];

  const completadasHoy = historial.filter(h =>
    h.usuarioId === userId && h.tareaId === t.id &&
    h.fechaDia === fechaHoy && h.estado !== 'rechazada'
  );

  const completadasTotalHoy = historial.filter(
    h => h.tareaId === t.id && h.fechaDia === fechaHoy && h.estado !== 'rechazada'
  );

  const maxVeces = t.maxVeces || 1;
  const vecesYo = completadasHoy.length;
  const vecesTotal = completadasTotalHoy.length;
  const ultima = completadasHoy[completadasHoy.length - 1];

  return {
    ...t,
    maxVeces,
    vecesCompletadas: vecesYo,
    vecesCompletadasTotal: vecesTotal,
    completada: esPersonal ? vecesYo >= maxVeces : vecesTotal >= maxVeces,
    completadaPorMi: vecesYo > 0,
    ultimaHistorialId: ultima?.id,
    quienLaHizo: completadasTotalHoy.length > 0
      ? completadasTotalHoy.map(h => h.usuarioNombre).join(', ')
      : null,
  };
};

// ── Sub-barra Por hacer / Realizadas ─────────────────────────────────────
const SubTabBar = ({ subTab, setSubTab, numPendientes, numHechas }) => (
  <View style={styles.subTabRow}>
    <TouchableOpacity
      style={[styles.subTab, subTab === 'pendientes' && styles.subTabActive]}
      onPress={() => setSubTab('pendientes')}
    >
      <Text style={[styles.subTabText, subTab === 'pendientes' && styles.subTabTextActive]}>
        📋 Por hacer
        {numPendientes > 0 && <Text style={styles.badge}> {numPendientes}</Text>}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.subTab, subTab === 'realizadas' && styles.subTabActive]}
      onPress={() => setSubTab('realizadas')}
    >
      <Text style={[styles.subTabText, subTab === 'realizadas' && styles.subTabTextActive]}>
        ✅ Realizadas
        {numHechas > 0 && <Text style={styles.badgeDone}> {numHechas}</Text>}
      </Text>
    </TouchableOpacity>
  </View>
);

// ── Selector Casa / Personal ─────────────────────────────────────────────
const ModoSelector = ({ modo, setModo }) => (
  <View style={styles.modoRow}>
    <TouchableOpacity
      style={[styles.modoBtn, modo === 'casa' && styles.modoBtnActive]}
      onPress={() => setModo('casa')}
    >
      <Text style={[styles.modoText, modo === 'casa' && styles.modoTextActive]}>
        🏠 Casa
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.modoBtn, modo === 'personal' && styles.modoBtnActive]}
      onPress={() => setModo('personal')}
    >
      <Text style={[styles.modoText, modo === 'personal' && styles.modoTextActive]}>
        🧑 Personal
      </Text>
    </TouchableOpacity>
  </View>
);

// ── Progreso del día (puntos vs mínimo) ──────────────────────────────────
const ProgresoDia = ({ puntosHoy, horasHoy, horasSemana }) => {
  const porcentaje = Math.min((puntosHoy / PUNTOS_MINIMOS_DIA) * 100, 100);
  const llegaMinimo = puntosHoy >= PUNTOS_MINIMOS_DIA;
  const barColor = llegaMinimo ? COLORS.green : porcentaje > 60 ? COLORS.yellow : COLORS.red;

  return (
    <View style={[styles.progresoCard, llegaMinimo && styles.progresoCardOk]}>
      <View style={styles.progresoTop}>
        <View style={styles.progresoHoras}>
          <Text style={styles.progresoHorasNum}>{horasHoy}h</Text>
          <Text style={styles.progresoLabel}>Hoy</Text>
        </View>
        <View style={styles.progresoCentro}>
          {llegaMinimo ? (
            <>
              <Text style={styles.progresoOkIcon}>✅</Text>
              <Text style={styles.progresoOkTexto}>¡Mínimo alcanzado!</Text>
            </>
          ) : (
            <>
              <Text style={styles.progresoPtsActual}>{puntosHoy}/{PUNTOS_MINIMOS_DIA}</Text>
              <Text style={styles.progresoLabel}>pts mínimo</Text>
            </>
          )}
        </View>
        <View style={styles.progresoHoras}>
          <Text style={styles.progresoSemanaNum}>{horasSemana}h</Text>
          <Text style={styles.progresoLabel}>Semana</Text>
        </View>
      </View>
      {!llegaMinimo && (
        <View style={styles.barraMinimoContainer}>
          <View style={styles.barraMinimo}>
            <View style={[styles.barraFill, { width: `${porcentaje}%`, backgroundColor: barColor }]} />
          </View>
          <Text style={[styles.barraTexto, { color: barColor }]}>
            Faltan {PUNTOS_MINIMOS_DIA - puntosHoy} pts
          </Text>
        </View>
      )}
    </View>
  );
};

// ── Sección de verificar tareas de OTROS ─────────────────────────────────
const VerificarOtros = ({ pendientes, onVerificar }) => {
  if (pendientes.length === 0) return null;

  return (
    <View style={styles.verificarCard}>
      <Text style={styles.verificarTitle}>
        👀 Verificar tareas de compañeros ({pendientes.length})
      </Text>
      {pendientes.map(t => (
        <View key={t.id} style={styles.verificarItem}>
          <View style={styles.verificarInfo}>
            <Text style={styles.verificarUsuario}>{t.usuarioNombre}</Text>
            <Text style={styles.verificarTarea}>{t.tareaNombre}</Text>
            <Text style={styles.verificarPts}>+{t.puntos} pts</Text>
          </View>
          <View style={styles.verificarBtns}>
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
      ))}
    </View>
  );
};

// ── Componente principal ─────────────────────────────────────────────────
export const TareasTab = ({
  user,
  historial,
  onCompletar,
  onDeshacer,
  onVerificar,
  pendientesVerificar,
  puntosHoy,
  horasHoy,
  horasSemana,
  timerSegundos,
  timersActivos,
  formatearTiempo,
  onToggleTimer,
  onResetTimer,
  tareasCustom = [],
  tareasOcultas = [],
}) => {
  const [subTab, setSubTab] = useState('pendientes');
  const [modo, setModo]     = useState('casa');

  let todasTareas = [];
  let secciones = [];

  if (modo === 'casa') {
    SECCIONES_TAREAS.forEach(sec => {
      const tareasEnriquecidas = sec.tareas
        .filter(t => !tareasOcultas.includes(t.id))
        .map(t => enriquecerTarea(t, user.id, historial, false));
      if (tareasEnriquecidas.length > 0) {
        secciones.push({ ...sec, tareas: tareasEnriquecidas });
        todasTareas.push(...tareasEnriquecidas);
      }
    });
    // Tareas personalizadas del admin
    if (tareasCustom.length > 0) {
      const customEnriquecidas = tareasCustom.map(t =>
        enriquecerTarea(t, user.id, historial, false)
      );
      secciones.push({ key: 'custom', titulo: '⭐ Extras', tareas: customEnriquecidas });
      todasTareas.push(...customEnriquecidas);
    }
  } else {
    const personales = TAREAS_PERSONALES
      .filter(t => !tareasOcultas.includes(t.id))
      .map(t => enriquecerTarea(t, user.id, historial, true));
    secciones = [{ key: 'personal', titulo: '🧑 Mis tareas personales', tareas: personales }];
    todasTareas = personales;
  }

  const pendientes = todasTareas.filter(t => !t.completada);
  const hechas     = todasTareas.filter(t => t.completada);

  const renderTarea = (t) => {
    if (TAREAS_CON_TIMER[t.id]) {
      return (
        <TimerTareaCard
          key={t.id}
          tarea={t}
          timerSegundos={timerSegundos}
          timersActivos={timersActivos}
          formatearTiempo={formatearTiempo}
          onToggle={onToggleTimer}
          onReset={onResetTimer}
          onCompletar={onCompletar}
        />
      );
    }
    return (
      <TareaCard
        key={t.id}
        tarea={t}
        onCompletar={() => onCompletar(t)}
        onDeshacer={() => onDeshacer(t.ultimaHistorialId)}
      />
    );
  };

  return (
    <View style={styles.tabContent}>
      {/* Progreso del día */}
      <ProgresoDia puntosHoy={puntosHoy} horasHoy={horasHoy} horasSemana={horasSemana} />

      {/* Verificar tareas de otros */}
      <VerificarOtros
        pendientes={pendientesVerificar}
        onVerificar={onVerificar}
      />

      {/* Selector Casa / Personal */}
      <ModoSelector modo={modo} setModo={setModo} />

      {/* Sub-barra */}
      <SubTabBar
        subTab={subTab}
        setSubTab={setSubTab}
        numPendientes={pendientes.length}
        numHechas={hechas.length}
      />

      {/* Por hacer */}
      {subTab === 'pendientes' && (
        <>
          {pendientes.length === 0 ? (
            <View style={styles.card}>
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>🎉</Text>
                <Text style={styles.emptyTitle}>¡Todo listo!</Text>
                <Text style={styles.emptyHint}>Has completado todas las tareas.</Text>
              </View>
            </View>
          ) : (
            secciones.map(sec => {
              const secPendientes = sec.tareas.filter(t => !t.completada);
              if (secPendientes.length === 0) return null;
              return (
                <View key={sec.key} style={styles.card}>
                  <Text style={styles.seccionTitulo}>{sec.titulo}</Text>
                  {secPendientes.map(renderTarea)}
                </View>
              );
            })
          )}
        </>
      )}

      {/* Realizadas */}
      {subTab === 'realizadas' && (
        <View style={styles.card}>
          {hechas.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Aún no has completado nada</Text>
              <Text style={styles.emptyHint}>Las tareas completadas aparecerán aquí.</Text>
            </View>
          ) : (
            hechas.map(t => (
              <View key={t.id} style={styles.tareaHechaRow}>
                <View style={styles.tareaHechaInfo}>
                  <Text style={styles.tareaHechaNombre}>✅ {t.nombre}</Text>
                  {t.quienLaHizo && (
                    <Text style={styles.tareaHechaQuien}>Hecha por: {t.quienLaHizo}</Text>
                  )}
                </View>
                <Text style={styles.tareaHechaPts}>+{t.puntos} pts</Text>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: { padding: 16, gap: 12 },

  // Progreso del día
  progresoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.yellow,
  },
  progresoCardOk: { borderColor: COLORS.green },
  progresoTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  progresoHoras: { flex: 1, alignItems: 'center' },
  progresoHorasNum: { color: COLORS.green, fontSize: 24, fontWeight: '700' },
  progresoSemanaNum: { color: COLORS.blue, fontSize: 24, fontWeight: '700' },
  progresoCentro: { flex: 2, alignItems: 'center' },
  progresoPtsActual: { color: COLORS.yellow, fontSize: 28, fontWeight: '900' },
  progresoLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  progresoOkIcon: { fontSize: 28 },
  progresoOkTexto: { color: COLORS.green, fontSize: 14, fontWeight: '700', marginTop: 4 },

  barraMinimoContainer: { marginTop: 4 },
  barraMinimo: { height: 10, backgroundColor: COLORS.cardInner, borderRadius: 5, overflow: 'hidden' },
  barraFill: { height: '100%', borderRadius: 5 },
  barraTexto: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 4 },

  // Verificar otros
  verificarCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.yellow,
  },
  verificarTitle: { color: COLORS.yellow, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  verificarItem: {
    backgroundColor: COLORS.cardInner,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verificarInfo: { flex: 1 },
  verificarUsuario: { color: COLORS.blue, fontSize: 13, fontWeight: '600' },
  verificarTarea: { color: COLORS.textPrimary, fontSize: 15, marginTop: 2 },
  verificarPts: { color: COLORS.green, fontSize: 12, marginTop: 2 },
  verificarBtns: { flexDirection: 'row', gap: 8 },
  btnOk: { backgroundColor: COLORS.green, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  btnOkText: { color: '#fff', fontSize: 18 },
  btnNo: { backgroundColor: COLORS.red, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  btnNoText: { color: '#fff', fontSize: 18 },

  // Modo selector
  modoRow: { flexDirection: 'row', backgroundColor: COLORS.bgDark, borderRadius: 12, padding: 4 },
  modoBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  modoBtnActive: { backgroundColor: COLORS.card },
  modoText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  modoTextActive: { color: COLORS.blue },

  // Sub-barra
  subTabRow: { flexDirection: 'row', backgroundColor: COLORS.bgDark, borderRadius: 12, padding: 4 },
  subTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  subTabActive: { backgroundColor: COLORS.card },
  subTabText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  subTabTextActive: { color: COLORS.blue },
  badge: { color: COLORS.blue, fontWeight: '700' },
  badgeDone: { color: COLORS.green, fontWeight: '700' },

  // Cards
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },
  seccionTitulo: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 10 },

  // Tareas hechas
  tareaHechaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  tareaHechaInfo: { flex: 1 },
  tareaHechaNombre: { color: COLORS.textSecondary, fontSize: 14, textDecorationLine: 'line-through' },
  tareaHechaQuien: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  tareaHechaPts: { color: COLORS.green, fontSize: 14, fontWeight: '700' },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  emptyHint: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
});
