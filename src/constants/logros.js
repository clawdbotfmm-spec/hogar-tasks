// ─────────────────────────────────────────────────────────
// SISTEMA DE LOGROS
//
// Puntos de logro (LP):
//   - Tarea diaria completada = 1 LP
//   - Tarea ocasional/extra completada = 5 LP
//
// Ritmo estimado por usuario:
//   ~185 LP por ciclo (5 días) → ~1.110 LP/mes
// ─────────────────────────────────────────────────────────

// ── Logros globales (por LP totales acumulados) ─────────
export const LOGROS_GLOBALES = [
  { id: 'global_10',    nombre: 'Primeros pasos',     icono: '👶', lp: 10,    descripcion: 'Acumula 10 LP' },
  { id: 'global_50',    nombre: 'Aprendiz del hogar',icono: '🌱', lp: 50,    descripcion: 'Acumula 50 LP' },
  { id: 'global_100',   nombre: 'Buen comienzo',     icono: '💪', lp: 100,   descripcion: 'Acumula 100 LP' },
  { id: 'global_250',   nombre: 'Primer ciclo',      icono: '🔄', lp: 250,   descripcion: 'Acumula 250 LP' },
  { id: 'global_500',   nombre: 'Medio millar',      icono: '⭐', lp: 500,   descripcion: 'Acumula 500 LP' },
  { id: 'global_1000',  nombre: 'Veterano',          icono: '🏅', lp: 1000,  descripcion: 'Acumula 1.000 LP' },
  { id: 'global_2500',  nombre: 'Imparable',         icono: '🚀', lp: 2500,  descripcion: 'Acumula 2.500 LP' },
  { id: 'global_5000',  nombre: 'Leyenda del hogar', icono: '👑', lp: 5000,  descripcion: 'Acumula 5.000 LP' },
  { id: 'global_10000', nombre: 'Mítico',            icono: '💎', lp: 10000, descripcion: 'Acumula 10.000 LP' },
];

// ── Logros por categoría ────────────────────────────────
// Se generan automáticamente para cada categoría
const UMBRALES_CATEGORIA = [
  { sufijo: 'novato',   lp: 25,  nombre: 'Novato',  icono: '🌱' },
  { sufijo: 'experto',  lp: 100, nombre: 'Experto',  icono: '⭐' },
  { sufijo: 'maestro',  lp: 250, nombre: 'Maestro',  icono: '🏆' },
  { sufijo: 'leyenda',  lp: 500, nombre: 'Leyenda',  icono: '👑' },
];

const CATEGORIAS_LOGROS = [
  { key: 'cocina',     nombre: 'Cocina',     icono: '🍳' },
  { key: 'lavabos',    nombre: 'Lavabos',    icono: '🚿' },
  { key: 'lavanderia', nombre: 'Lavandería', icono: '👕' },
  { key: 'robot',      nombre: 'Robot',      icono: '🤖' },
  { key: 'tapers',     nombre: 'Tapers',     icono: '🍱' },
  { key: 'casa',       nombre: 'Casa',       icono: '🏠' },
  { key: 'personal',   nombre: 'Personal',   icono: '🧑' },
  { key: 'extra',      nombre: 'Extras',     icono: '⭐' },
];

export const LOGROS_CATEGORIA = [];
CATEGORIAS_LOGROS.forEach(cat => {
  UMBRALES_CATEGORIA.forEach(u => {
    LOGROS_CATEGORIA.push({
      id: `cat_${cat.key}_${u.sufijo}`,
      nombre: `${u.nombre} de ${cat.nombre}`,
      icono: cat.icono,
      lp: u.lp,
      categoria: cat.key,
      descripcion: `${u.lp} LP en ${cat.nombre}`,
    });
  });
});

// ── Logros por constancia (días seguidos con al menos 1 tarea) ──
export const LOGROS_CONSTANCIA = [
  { id: 'dias_3',  nombre: 'Tres al hilo',       icono: '🔥', dias: 3,  descripcion: '3 días seguidos' },
  { id: 'dias_5',  nombre: 'Ciclo perfecto',     icono: '🔥', dias: 5,  descripcion: '5 días seguidos (1 ciclo)' },
  { id: 'dias_10', nombre: 'Doble ciclo',        icono: '🔥', dias: 10, descripcion: '10 días seguidos' },
  { id: 'dias_20', nombre: 'Mes casi perfecto',  icono: '🔥', dias: 20, descripcion: '20 días seguidos' },
  { id: 'dias_30', nombre: 'Mes perfecto',       icono: '💯', dias: 30, descripcion: '30 días seguidos' },
  { id: 'dias_60', nombre: 'Inquebrantable',     icono: '💎', dias: 60, descripcion: '60 días seguidos' },
];

// ── Todos los logros en un array ────────────────────────
export const TODOS_LOGROS = [
  ...LOGROS_GLOBALES,
  ...LOGROS_CATEGORIA,
  ...LOGROS_CONSTANCIA,
];

// ── Calcular LP de una tarea completada ─────────────────
export const calcularLP = (tarea) => {
  if (tarea.frecuencia === 'segun_necesidad' || tarea.categoria === 'extra') {
    return 5;
  }
  return 1;
};
