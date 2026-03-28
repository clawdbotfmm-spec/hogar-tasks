/**
 * Devuelve la fecha local en formato 'YYYY-MM-DD'.
 * Evita toISOString() que devuelve UTC y puede dar el día incorrecto
 * en zonas horarias positivas (como España, UTC+1/+2).
 */
export const fechaLocalHoy = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
