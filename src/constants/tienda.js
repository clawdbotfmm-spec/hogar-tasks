export const PREMIOS = [
  { id: 'cena',         nombre: 'Elegir cena',       puntos: 300,  descripcion: 'Una vez por semana' },
  { id: 'sin_tarea',    nombre: 'Día sin una tarea', puntos: 500,  descripcion: 'Selecciona cuál' },
  { id: 'salida',       nombre: 'Salida especial',   puntos: 800,  descripcion: 'Cine, parque, etc.' },
  { id: 'invitar_amigo',nombre: 'Invitar amigo',     puntos: 1200, descripcion: 'Con permiso' },
  { id: 'sin_nada',     nombre: 'Día libre total',   puntos: 5000, descripcion: 'Solo 1 vez al mes' },
];

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
    id: 'escudo_racha',
    nombre: 'Escudo Racha',
    puntos: 40,
    icono: '🛡️',
    descripcion: 'Protege tu racha durante 1 día si fallas',
    tipo: 'proteccion',
  },
  {
    id: 'dia_perfecto',
    nombre: 'Día Perfecto',
    puntos: 30,
    icono: '💎',
    descripcion: 'Bonus doble si completas TODAS las tareas del día',
    tipo: 'bonus',
  },
];

// Descuentos en boosters por racha acumulada
export const RECOMPENSAS_RACHA = [
  { racha: 7,  booster: 'boost_normal', descuento: 40, precioOriginal: 120, precioFinal: 80 },
  { racha: 14, booster: 'mega_boost',   descuento: 50, precioOriginal: 250, precioFinal: 125 },
  { racha: 30, booster: 'mega_boost',   descuento: 100, precioOriginal: 250, precioFinal: 0 },
];
