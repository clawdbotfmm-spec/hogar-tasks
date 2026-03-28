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

  // Extra Master: x3 para tareas extra (sobre la base, no sobre el booster)
  const extraMaster = getExtraMasterActivo(user);
  if (extraMaster && tipoTarea === 'extra') {
    puntos += Math.floor(puntosBase * 2); // +2x base = total 3x base (sumado, no multiplicado)
  }

  // Bonus fin de semana +20%
  const dia = new Date().getDay();
  if (dia === 0 || dia === 6) {
    puntos += Math.floor(puntosBase * 0.2);
  }

  return puntos;
};
