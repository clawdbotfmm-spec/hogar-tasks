// ─────────────────────────────────────────────────────────
// PREMIOS — Se compran con puntos acumulados
// Los puntos extras (por encima del mínimo diario) se acumulan
// ─────────────────────────────────────────────────────────

export const PREMIOS = [
  // Premios básicos
  { id: 'cena',          nombre: 'Elegir cena',              puntos: 200,  descripcion: 'Tú eliges qué se cena',         icono: '🍕', categoria: 'basico' },
  { id: 'postre',        nombre: 'Postre especial',          puntos: 150,  descripcion: 'Elige tu postre favorito',       icono: '🍰', categoria: 'basico' },
  { id: 'peli',          nombre: 'Elegir película',          puntos: 100,  descripcion: 'Tú eliges la peli del finde',    icono: '🎬', categoria: 'basico' },
  { id: 'sin_tarea',     nombre: 'Día sin una tarea',        puntos: 300,  descripcion: 'Selecciona cuál te saltas',      icono: '😎', categoria: 'basico' },

  // Salidas y experiencias
  { id: 'salida',        nombre: 'Salida especial',          puntos: 600,  descripcion: 'Cine, bolos, escape room...',    icono: '🎳', categoria: 'experiencia' },
  { id: 'invitar_amigo', nombre: 'Invitar amigo a casa',     puntos: 400,  descripcion: 'Con permiso previo',             icono: '🎮', categoria: 'experiencia' },
  { id: 'dormir_amigo',  nombre: 'Amigo a dormir',           puntos: 800,  descripcion: 'Viernes o sábado',               icono: '🛏️', categoria: 'experiencia' },

  // 🖨️ Impresión 3D
  { id: '3d_pequeno',    nombre: 'Impresión 3D pequeña',     puntos: 300,  descripcion: 'Modelo pequeño (hasta 5cm)',     icono: '🖨️', categoria: '3d' },
  { id: '3d_mediano',    nombre: 'Impresión 3D mediana',     puntos: 600,  descripcion: 'Modelo mediano (hasta 12cm)',    icono: '🖨️', categoria: '3d' },
  { id: '3d_grande',     nombre: 'Impresión 3D grande',      puntos: 1000, descripcion: 'Modelo grande o complejo',       icono: '🖨️', categoria: '3d' },

  // 🛒 Compras AliExpress
  { id: 'ali_5',         nombre: 'Compra AliExpress 5€',     puntos: 500,  descripcion: 'Tú eliges qué comprar',         icono: '📦', categoria: 'aliexpress' },
  { id: 'ali_10',        nombre: 'Compra AliExpress 10€',    puntos: 900,  descripcion: 'Más opciones para elegir',       icono: '📦', categoria: 'aliexpress' },
  { id: 'ali_20',        nombre: 'Compra AliExpress 20€',    puntos: 1500, descripcion: 'El premio gordo',               icono: '🎁', categoria: 'aliexpress' },

  // Premium
  { id: 'sin_nada',      nombre: 'Día libre total',          puntos: 3000, descripcion: 'Sin tareas todo el día (1x/mes)',icono: '👑', categoria: 'premium' },
];

// Categorías de premios para la UI
export const CATEGORIAS_PREMIOS = [
  { key: 'basico',      titulo: '🏠 Premios básicos' },
  { key: 'experiencia', titulo: '🎉 Salidas y experiencias' },
  { key: '3d',          titulo: '🖨️ Impresión 3D' },
  { key: 'aliexpress',  titulo: '📦 Compras AliExpress' },
  { key: 'premium',     titulo: '👑 Premium' },
];

// ─────────────────────────────────────────────────────────
// BOOSTERS — Multiplicadores temporales
// ─────────────────────────────────────────────────────────
export const BOOSTERS = [
  {
    id: 'mini_boost',
    nombre: 'Mini Boost',
    multiplicador: 1.5,
    puntos: 50,
    duracion: 2,
    duracionTexto: 'Fin de semana',
    icono: '⚡',
    descripcion: 'Tus puntos valen x1.5 durante el fin de semana',
  },
  {
    id: 'boost_normal',
    nombre: 'Boost',
    multiplicador: 2,
    puntos: 120,
    duracion: 7,
    duracionTexto: '1 semana',
    icono: '🚀',
    descripcion: 'Tus puntos valen x2 durante toda la semana',
  },
  {
    id: 'mega_boost',
    nombre: 'Mega Boost',
    multiplicador: 3,
    puntos: 250,
    duracion: 7,
    duracionTexto: '1 semana',
    icono: '💥',
    descripcion: 'Tus puntos valen x3 durante toda la semana',
  },
];

export const BOOSTERS_ESPECIALES = [
  {
    id: 'extra_master',
    nombre: 'Extra Master',
    puntos: 80,
    duracion: 7,
    icono: '🎯',
    descripcion: 'Las tareas extras valen x3 durante 1 semana',
    tipo: 'extras',
  },
  {
    id: 'escudo_penalizacion',
    nombre: 'Escudo Penalización',
    puntos: 60,
    icono: '🛡️',
    descripcion: 'Te protege de 1 penalización por no llegar al mínimo',
    tipo: 'anti_penalizacion',
  },
];

