import { useMemo } from 'react';
import {
  LOGROS_GLOBALES,
  LOGROS_CATEGORIA,
  LOGROS_CONSTANCIA,
  TODOS_LOGROS,
} from '../constants/logros';

/**
 * Calcula los LP (logro-puntos) a partir del historial verificado de un usuario.
 *
 * @param {string} userId
 * @param {Array} historial - todo el historial de Firestore
 * @returns {{ lpTotal, lpPorCategoria, diasSeguidos, logrosDesbloqueados }}
 */
export const useLogros = (userId, historial) => {
  return useMemo(() => {
    if (!userId || !historial) {
      return { lpTotal: 0, lpPorCategoria: {}, diasSeguidos: 0, logrosDesbloqueados: [] };
    }

    // Solo tareas verificadas de este usuario (no premios, no rechazadas)
    const verificadas = historial.filter(h =>
      h.usuarioId === userId &&
      h.estado === 'verificada' &&
      h.tareaId // excluir premios canjeados
    );

    // ── LP totales y por categoría ──────────────────────
    let lpTotal = 0;
    const lpPorCategoria = {};

    verificadas.forEach(h => {
      const esOcasional = h.categoria === 'extra' ||
        h.frecuencia === 'segun_necesidad';
      const lp = esOcasional ? 5 : 1;

      lpTotal += lp;

      const cat = h.categoria || 'casa';
      lpPorCategoria[cat] = (lpPorCategoria[cat] || 0) + lp;
    });

    // ── Días seguidos ───────────────────────────────────
    // Obtener todas las fechas únicas con al menos 1 tarea verificada
    const fechasSet = new Set();
    verificadas.forEach(h => {
      if (h.fechaDia) fechasSet.add(h.fechaDia);
    });

    const fechas = [...fechasSet].sort().reverse(); // más reciente primero
    let diasSeguidos = 0;

    if (fechas.length > 0) {
      // Empezar desde hoy o ayer (si hoy aún no ha hecho nada, mantener la racha de ayer)
      const hoy = new Date();
      const ayer = new Date(hoy);
      ayer.setDate(ayer.getDate() - 1);

      const hoyStr = formatFecha(hoy);
      const ayerStr = formatFecha(ayer);

      // Si la fecha más reciente no es hoy ni ayer, la racha está rota
      if (fechas[0] !== hoyStr && fechas[0] !== ayerStr) {
        diasSeguidos = 0;
      } else {
        // Contar hacia atrás desde la fecha más reciente
        let current = new Date(fechas[0] + 'T12:00:00'); // mediodía para evitar DST
        diasSeguidos = 1;

        for (let i = 1; i < fechas.length; i++) {
          const expected = new Date(current);
          expected.setDate(expected.getDate() - 1);
          const expectedStr = formatFecha(expected);

          if (fechas[i] === expectedStr) {
            diasSeguidos++;
            current = expected;
          } else {
            break;
          }
        }
      }
    }

    // ── Evaluar logros desbloqueados ────────────────────
    const logrosDesbloqueados = [];

    LOGROS_GLOBALES.forEach(l => {
      if (lpTotal >= l.lp) logrosDesbloqueados.push(l.id);
    });

    LOGROS_CATEGORIA.forEach(l => {
      if ((lpPorCategoria[l.categoria] || 0) >= l.lp) logrosDesbloqueados.push(l.id);
    });

    LOGROS_CONSTANCIA.forEach(l => {
      if (diasSeguidos >= l.dias) logrosDesbloqueados.push(l.id);
    });

    return { lpTotal, lpPorCategoria, diasSeguidos, logrosDesbloqueados };
  }, [userId, historial]);
};

function formatFecha(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Dado el array de IDs desbloqueados, devuelve los logros con su estado.
 */
export const getLogrosConEstado = (logrosDesbloqueados) => {
  return TODOS_LOGROS.map(l => ({
    ...l,
    desbloqueado: logrosDesbloqueados.includes(l.id),
  }));
};
