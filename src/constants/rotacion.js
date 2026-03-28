// ─────────────────────────────────────────────────────────
// SISTEMA DE ROTACIÓN DE GRUPOS
// Ciclo de 5 días: cada usuario hace su grupo asignado
// Al finalizar, se reasigna aleatoriamente (diferente al anterior)
// Día 4: aviso para hacer las tareas ocasionales
// Reset automático cada 5 días a las 00:00
// ─────────────────────────────────────────────────────────

import { fechaLocalHoy } from '../utils/fecha';

export const DIAS_POR_BLOQUE = 5;
export const NUM_GRUPOS = 3;

export const GRUPOS = [
  {
    id: 'cocina',
    nombre: 'Cocina',
    icono: '🍳',
    seccionesKey: ['cocina_diaria', 'cocina_ocasional'],
  },
  {
    id: 'lavabos_robot',
    nombre: 'Lavabos + Robot',
    icono: '🚿',
    seccionesKey: ['lavabos_diaria', 'lavabos_ocasional', 'robot'],
  },
  {
    id: 'tapers_lavanderia',
    nombre: 'Tapers + Lavandería',
    icono: '🍱',
    seccionesKey: ['tapers', 'lavanderia'],
  },
];

// ── Calcular día dentro del bloque actual (1..5) ────────────────────────
// Se basa en la fecha de inicio del ciclo guardada en Firestore (hogar_config/rotacion)
export const getDiaEnBloque = (inicioCiclo) => {
  if (!inicioCiclo) return 1;
  const ahora = new Date();
  const inicio = new Date(inicioCiclo);
  inicio.setHours(0, 0, 0, 0);
  ahora.setHours(0, 0, 0, 0);
  const diff = Math.floor((ahora - inicio) / (1000 * 60 * 60 * 24));
  const dia = (diff % DIAS_POR_BLOQUE) + 1;
  return Math.max(1, Math.min(dia, DIAS_POR_BLOQUE));
};

// ── Comprobar si hay que rotar (día > 5) ────────────────────────────────
export const necesitaRotar = (inicioCiclo) => {
  if (!inicioCiclo) return true;
  const ahora = new Date();
  const inicio = new Date(inicioCiclo);
  inicio.setHours(0, 0, 0, 0);
  ahora.setHours(0, 0, 0, 0);
  const diff = Math.floor((ahora - inicio) / (1000 * 60 * 60 * 24));
  return diff >= DIAS_POR_BLOQUE;
};

// ── Es día 4 o 5 (aviso de tareas ocasionales) ─────────────────────────
export const esAvisoDiaOcasionales = (inicioCiclo) => {
  const dia = getDiaEnBloque(inicioCiclo);
  return dia >= 4;
};

// ── Días restantes del bloque ───────────────────────────────────────────
export const diasRestantesBloque = (inicioCiclo) => {
  return DIAS_POR_BLOQUE - getDiaEnBloque(inicioCiclo);
};

// ── Obtener grupo de un usuario por su grupoActual (id del grupo) ───────
export const getGrupoPorId = (grupoId) => {
  return GRUPOS.find(g => g.id === grupoId) || null;
};

// ── Info completa de rotación para un usuario ───────────────────────────
export const getInfoRotacion = (grupoId, inicioCiclo) => {
  const grupo = getGrupoPorId(grupoId);
  if (!grupo) return null;

  const diaBloque = getDiaEnBloque(inicioCiclo);
  const avisarOcasionales = esAvisoDiaOcasionales(inicioCiclo);
  const diasRest = diasRestantesBloque(inicioCiclo);

  return {
    grupo,
    diaBloque,
    avisarOcasionales,
    diasRestantes: diasRest,
    mensaje: diaBloque === DIAS_POR_BLOQUE
      ? `¡Último día de ${grupo.nombre}! Completa las ocasionales`
      : diaBloque === 4
        ? `Día ${diaBloque}/5 de ${grupo.nombre} — ¡Mañana se acaba!`
        : `Día ${diaBloque}/5 de ${grupo.nombre}`,
  };
};
