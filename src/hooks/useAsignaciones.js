import { useState, useEffect } from 'react';
import { TAREAS_CASA_POOL, USUARIOS_NOMBRES } from '../constants/tareas';

// ── Helpers ──────────────────────────────────────────────

const hoyISO = () => new Date().toISOString().split('T')[0];
const ayerISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Genera asignaciones nuevas para hoy.
 * - Tareas diarias → reparto aleatorio entre los 3 usuarios
 * - Tareas segun_necesidad → carryover si estaban asignadas ayer y no se completaron;
 *   si no tenían asignación previa o ya se completaron → usuario aleatorio
 *
 * @param {object|null} ayerAsignaciones  Asignaciones del día anterior (puede ser null)
 * @param {string[]} tareaCompletadasAyer IDs de tareas completadas ayer (estado !== 'rechazada')
 * @param {string[]} usuarios3            IDs de los 3 usuarios (no admin)
 */
export const generarAsignaciones = (ayerAsignaciones, tareasCompletadasAyer, usuarios3) => {
  const diarias        = TAREAS_CASA_POOL.filter(t => t.frecuencia === 'diaria');
  const segunNecesidad = TAREAS_CASA_POOL.filter(t => t.frecuencia !== 'diaria');

  // ── Distribuir tareas diarias (round-robin sobre shuffle) ──
  const shuffled = shuffle(diarias);
  const asignaciones = { [usuarios3[0]]: [], [usuarios3[1]]: [], [usuarios3[2]]: [] };

  shuffled.forEach((t, i) => {
    asignaciones[usuarios3[i % 3]].push(t.id);
  });

  // ── Distribuir tareas según necesidad ────────────────
  // Paso 1: carryover — mantener asignación ayer si no se completó
  const carryoverIds = new Set();
  segunNecesidad.forEach(t => {
    const usuarioAyer = ayerAsignaciones
      ? Object.entries(ayerAsignaciones).find(([, ids]) => ids.includes(t.id))?.[0]
      : null;
    if (usuarioAyer && usuarios3.includes(usuarioAyer) && !tareasCompletadasAyer.includes(t.id)) {
      asignaciones[usuarioAyer].push(t.id);
      carryoverIds.add(t.id);
    }
  });

  // Paso 2: nuevas asignaciones → al usuario con menos tareas (distribución equilibrada)
  const nuevasSN = shuffle(segunNecesidad.filter(t => !carryoverIds.has(t.id)));
  nuevasSN.forEach(t => {
    // Elige al usuario con menos tareas asignadas en este momento
    const minUser = usuarios3.reduce(
      (min, u) => (asignaciones[u].length < asignaciones[min].length ? u : min),
      usuarios3[0]
    );
    asignaciones[minUser].push(t.id);
  });

  return asignaciones;
};

/**
 * Hook que gestiona las asignaciones del día.
 * - Carga de Firestore al montar
 * - Genera nuevas si no existen para hoy
 * - Expone getAsignacionesUsuario(userId)
 *
 * @param {object}   firestoreHook  resultado de useFirestore()
 * @param {object[]} usuarios       lista de usuarios (incluye admin)
 * @param {object[]} historial      historial completo
 */
export const useAsignaciones = (firestoreHook, usuarios, historial) => {
  const { getAsignaciones, guardarAsignaciones } = firestoreHook;
  const [asignaciones, setAsignaciones] = useState(null); // { userId: [taskId, ...] }
  const [cargando,     setCargando]     = useState(true);

  const usuarios3 = usuarios
    .filter(u => !u.isAdmin)
    .map(u => u.id);

  useEffect(() => {
    if (usuarios3.length !== 3) return;
    cargarOGenerarAsignaciones();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarios3.join(',')]);

  const cargarOGenerarAsignaciones = async () => {
    const hoy = hoyISO();
    const existentes = await getAsignaciones(hoy);

    if (existentes) {
      setAsignaciones(existentes);
      setCargando(false);
      return;
    }

    // Generar nuevas
    const ayer = ayerISO();
    const ayerData = await getAsignaciones(ayer);

    // Tareas de ayer que SÍ se completaron (estado no rechazada)
    const completadasAyer = historial
      .filter(h => h.fechaDia === ayer && h.estado !== 'rechazada')
      .map(h => h.tareaId);

    const nuevas = generarAsignaciones(ayerData, completadasAyer, usuarios3);
    await guardarAsignaciones(hoy, nuevas);
    setAsignaciones(nuevas);
    setCargando(false);
  };

  // Admin puede forzar un re-reparto
  const repartirAhora = async () => {
    const hoy = hoyISO();
    const nuevas = generarAsignaciones(null, [], usuarios3);
    await guardarAsignaciones(hoy, nuevas);
    setAsignaciones(nuevas);
  };

  // Devuelve los IDs de tareas asignadas a un usuario hoy
  const getAsignacionesUsuario = (userId) => {
    if (!asignaciones) return [];
    return asignaciones[userId] || [];
  };

  return { asignaciones, cargando, repartirAhora, getAsignacionesUsuario };
};
