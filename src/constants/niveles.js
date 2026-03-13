export const NIVELES = [
  { nivel: 1, nombre: 'Novato',   minPts: 0,     icono: '🌱' },
  { nivel: 2, nombre: 'Aprendiz', minPts: 500,   icono: '📚' },
  { nivel: 3, nombre: 'Experto',  minPts: 1500,  icono: '⭐' },
  { nivel: 4, nombre: 'Maestro',  minPts: 3000,  icono: '🏆' },
  { nivel: 5, nombre: 'Leyenda',  minPts: 5000,  icono: '👑' },
  { nivel: 6, nombre: 'Héroe',    minPts: 10000, icono: '🔥' },
  { nivel: 7, nombre: 'Mítico',   minPts: 20000, icono: '💎' },
];

export const getNivel = (puntos) => {
  for (let i = NIVELES.length - 1; i >= 0; i--) {
    if (puntos >= NIVELES[i].minPts) return NIVELES[i];
  }
  return NIVELES[0];
};

export const getProgresoNivel = (puntos) => {
  const nivel = getNivel(puntos);
  const next = NIVELES.find(n => n.nivel === nivel.nivel + 1);
  if (!next) return 100;
  const p = ((puntos - nivel.minPts) / (next.minPts - nivel.minPts)) * 100;
  return Math.min(p, 100);
};
