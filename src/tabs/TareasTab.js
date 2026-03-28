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
  TAREAS_EXTRAS,
} from '../constants/tareas';
import { TAREAS_CON_TIMER } from '../constants/timers';
import {
  getInfoRotacion,
  diasRestantesBloque,
  getGrupoPorId,
} from '../constants/rotacion';
import { TareaCard } from '../components/TareaCard';
import { TimerTareaCard } from '../components/TimerTareaCard';
import { fechaLocalHoy } from '../utils/fecha';

// ── Enriquecer tarea con estado ──────────────────────────────────────────
const enriquecerTarea = (t, userId, historial, esPersonal) => {
  const fechaHoy = fechaLocalHoy();

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

// ── Tarjeta de info de rotación ─────────────────────────────────────────
const InfoRotacion = ({ user, configRotacion }) => {
  if (!user.grupoActual) {
    return (
      <View style={styles.rotacionCard}>
        <Text style={styles.rotacionIcon}>⚠️</Text>
        <Text style={styles.rotacionMsg}>
          Esperando asignación de grupo...
        </Text>
      </View>
    );
  }

  const inicioCiclo = configRotacion?.inicioCiclo || null;
  const info = getInfoRotacion(user.grupoActual, inicioCiclo);
  if (!info) return null;

  const esAviso = info.avisarOcasionales;

  return (
    <View style={[styles.rotacionCard, esAviso && styles.rotacionUltimoDia]}>
      <View style={styles.rotacionTop}>
        <Text style={styles.rotacionIcon}>{info.grupo.icono}</Text>
        <View style={styles.rotacionInfo}>
          <Text style={styles.rotacionGrupo}>{info.grupo.nombre}</Text>
          <Text style={styles.rotacionDia}>{info.mensaje}</Text>
        </View>
        <View style={styles.rotacionCiclo}>
          <Text style={styles.rotacionCicloNum}>{info.diasRestantes}d</Text>
          <Text style={styles.rotacionCicloLabel}>quedan</Text>
        </View>
      </View>
      {esAviso && (
        <View style={styles.rotacionAviso}>
          <Text style={styles.rotacionAvisoText}>
            ⚠️ ¡Haz las tareas ocasionales antes de que acabe el ciclo!
          </Text>
        </View>
      )}
    </View>
  );
};

// ── Sub-barra Casa / Personal / Extras ──────────────────────────────────
const ModoSelector = ({ modo, setModo, numPersonalesPendientes }) => (
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
        {numPersonalesPendientes > 0 && (
          <Text style={styles.badgeRed}> {numPersonalesPendientes}</Text>
        )}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.modoBtn, modo === 'extras' && styles.modoBtnActive]}
      onPress={() => setModo('extras')}
    >
      <Text style={[styles.modoText, modo === 'extras' && styles.modoTextActive]}>
        ⭐ Extras
      </Text>
    </TouchableOpacity>
  </View>
);

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

// ── Sección de verificar tareas de OTROS ─────────────────────────────────
const VerificarOtros = ({ pendientes, onVerificar, isAdmin }) => {
  if (pendientes.length === 0) return null;

  // Filtrar: hermanos solo ven tareas de casa, admin solo ve personales
  const filtradas = pendientes.filter(t => {
    if (isAdmin) return t.tipo === 'personal';
    return t.tipo !== 'personal';
  });

  if (filtradas.length === 0) return null;

  return (
    <View style={styles.verificarCard}>
      <Text style={styles.verificarTitle}>
        👀 Verificar tareas ({filtradas.length})
      </Text>
      {filtradas.map(t => (
        <View key={t.id} style={styles.verificarItem}>
          <View style={styles.verificarInfo}>
            <Text style={styles.verificarUsuario}>{t.usuarioNombre}</Text>
            <Text style={styles.verificarTarea}>{t.tareaNombre}</Text>
            <Text style={styles.verificarPts}>
              {t.tipo === 'personal' ? 'Personal' : `+${t.puntos} pts`}
            </Text>
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

// ── Puntos del ciclo ─────────────────────────────────────────────────────
const PuntosCiclo = ({ user }) => (
  <View style={styles.puntosCard}>
    <Text style={styles.puntosTitle}>💰 Tus puntos</Text>
    <Text style={styles.puntosNum}>{user.puntos || 0} pts</Text>
    <Text style={styles.puntosHint}>
      Canjéalos en la tienda
    </Text>
  </View>
);

// ── Componente principal ─────────────────────────────────────────────────
export const TareasTab = ({
  user,
  historial,
  onCompletar,
  onDeshacer,
  onVerificar,
  pendientesVerificar,
  timerSegundos,
  timersActivos,
  formatearTiempo,
  onToggleTimer,
  onResetTimer,
  tareasCustom = [],
  tareasOcultas = [],
  configRotacion = null,
}) => {
  const [subTab, setSubTab] = useState('pendientes');
  const [modo, setModo]     = useState('casa');

  // Personales enriquecidas (para el badge)
  const personales = TAREAS_PERSONALES
    .filter(t => !tareasOcultas.includes(t.id))
    .map(t => enriquecerTarea(t, user.id, historial, true));
  const numPersonalesPendientes = personales.filter(t => !t.completada).length;

  let todasTareas = [];
  let secciones = [];

  if (modo === 'casa') {
    // Solo mostrar secciones del grupo asignado
    const grupo = user.grupoActual ? getGrupoPorId(user.grupoActual) : null;
    const seccionesPermitidas = grupo ? grupo.seccionesKey : [];

    // Casa diaria y ocasional son comunes a todos
    const seccionesCasa = SECCIONES_TAREAS.filter(sec =>
      sec.key === 'casa_diaria' || sec.key === 'casa_ocasional' || seccionesPermitidas.includes(sec.key)
    );

    seccionesCasa.forEach(sec => {
      const tareasEnriquecidas = sec.tareas
        .filter(t => !tareasOcultas.includes(t.id))
        .map(t => enriquecerTarea(t, user.id, historial, false));
      if (tareasEnriquecidas.length > 0) {
        secciones.push({ ...sec, tareas: tareasEnriquecidas });
        todasTareas.push(...tareasEnriquecidas);
      }
    });

    // Tareas custom del admin
    if (tareasCustom.length > 0) {
      const customEnriquecidas = tareasCustom.map(t =>
        enriquecerTarea(t, user.id, historial, false)
      );
      secciones.push({ key: 'custom', titulo: '⭐ Personalizadas', tareas: customEnriquecidas });
      todasTareas.push(...customEnriquecidas);
    }
  } else if (modo === 'personal') {
    secciones = [{ key: 'personal', titulo: '🧑 Mis tareas personales', tareas: personales }];
    todasTareas = personales;
  } else if (modo === 'extras') {
    const extras = TAREAS_EXTRAS
      .filter(t => !tareasOcultas.includes(t.id))
      .map(t => enriquecerTarea(t, user.id, historial, false));
    secciones = [{ key: 'extras', titulo: '⭐ Tareas extras', tareas: extras }];
    todasTareas = extras;
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
        esPersonal={modo === 'personal'}
      />
    );
  };

  return (
    <View style={styles.tabContent}>
      {/* Info de rotación */}
      <InfoRotacion user={user} configRotacion={configRotacion} />

      {/* Puntos del ciclo */}
      <PuntosCiclo user={user} />

      {/* Verificar tareas de otros */}
      <VerificarOtros
        pendientes={pendientesVerificar}
        onVerificar={onVerificar}
        isAdmin={user.isAdmin}
      />

      {/* Selector Casa / Personal / Extras */}
      <ModoSelector modo={modo} setModo={setModo} numPersonalesPendientes={numPersonalesPendientes} />

      {/* Sub-barra */}
      <SubTabBar
        subTab={subTab}
        setSubTab={setSubTab}
        numPendientes={pendientes.length}
        numHechas={hechas.length}
      />

      {/* Aviso personales */}
      {modo === 'personal' && (
        <View style={styles.personalAviso}>
          <Text style={styles.personalAvisoText}>
            Las tareas personales no dan puntos. Son obligatorias.
            {'\n'}Si marcas una como hecha sin hacerla: -puntos doble.
          </Text>
        </View>
      )}

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
                <Text style={styles.tareaHechaPts}>
                  {modo === 'personal' ? '✓' : `+${t.puntos} pts`}
                </Text>
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

  // Rotación
  rotacionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.blue,
  },
  rotacionUltimoDia: { borderColor: COLORS.red },
  rotacionTop: { flexDirection: 'row', alignItems: 'center' },
  rotacionIcon: { fontSize: 36, marginRight: 12 },
  rotacionInfo: { flex: 1 },
  rotacionGrupo: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  rotacionDia: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  rotacionMsg: { color: COLORS.yellow, fontSize: 14, textAlign: 'center' },
  rotacionCiclo: { alignItems: 'center' },
  rotacionCicloNum: { color: COLORS.blue, fontSize: 20, fontWeight: '700' },
  rotacionCicloLabel: { color: COLORS.textSecondary, fontSize: 10 },
  rotacionAviso: {
    backgroundColor: `${COLORS.red}20`,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  rotacionAvisoText: { color: COLORS.red, fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // Puntos ciclo
  puntosCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.green,
  },
  puntosTitle: { color: COLORS.textSecondary, fontSize: 13 },
  puntosNum: { color: COLORS.green, fontSize: 32, fontWeight: '900', marginVertical: 2 },
  puntosHint: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center' },

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
  modoText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  modoTextActive: { color: COLORS.blue },
  badgeRed: { color: COLORS.red, fontWeight: '700' },

  // Sub-barra
  subTabRow: { flexDirection: 'row', backgroundColor: COLORS.bgDark, borderRadius: 12, padding: 4 },
  subTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  subTabActive: { backgroundColor: COLORS.card },
  subTabText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  subTabTextActive: { color: COLORS.blue },
  badge: { color: COLORS.blue, fontWeight: '700' },
  badgeDone: { color: COLORS.green, fontWeight: '700' },

  // Aviso personal
  personalAviso: {
    backgroundColor: `${COLORS.yellow}15`,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.yellow,
  },
  personalAvisoText: {
    color: COLORS.yellow,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

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
