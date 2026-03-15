// Lógica de boosters y cálculo de puntos con bonus

export const getBoosterActivo = (user) => {
  if (!user?.boosters) return null;
  const ahora = new Date();
  return user.boosters.find(b => new Date(b.fechaFin) >= ahora) || null;
};

export const getExtraMasterActivo = (user) => {
  if (!user?.boostersEspeciales) return null;
  const ahora = new Date();
  return user.boostersEspeciales.find(b =>
    b.tipo === 'extras' && new Date(b.fechaFin) >= ahora
  ) || null;
};

export const calcularPuntosConBonus = (puntosBase, tipoTarea = 'base', user = null) => {
  let puntos = puntosBase;

  // Multiplicador de booster activo
  const boosterActivo = getBoosterActivo(user);
  if (boosterActivo) {
    puntos = Math.floor(puntos * boosterActivo.multiplicador);
  }

  // Extra Master: x3 para tareas extra
  const extraMaster = getExtraMasterActivo(user);
  if (extraMaster && tipoTarea === 'extra') {
    puntos = Math.floor(puntos * 3);
  }

  // Bonus racha (max +50% con racha 10+)
  if (user?.racha > 0) {
    puntos += Math.floor(puntosBase * 0.05 * Math.min(user.racha, 10));
  }

  // Bonus fin de semana +20%
  const dia = new Date().getDay();
  if (dia === 0 || dia === 6) {
    puntos += Math.floor(puntosBase * 0.2);
  }

  return puntos;
};
