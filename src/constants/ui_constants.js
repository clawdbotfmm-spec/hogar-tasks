import { COLORS } from './colors';

export const USER_ICONS = {
  Daniel: '👕',
  Sergio: '🍳',
  Diego: '🚿',
  Adulto: '👤',
};

export const TASK_STATUS_CONFIG = {
  verificada: { icono: '✅', color: COLORS.green, etiqueta: 'Verificada' },
  enviada:    { icono: '⏳', color: COLORS.yellow, etiqueta: 'Por revisar' },
  rechazada:  { icono: '❌', color: COLORS.red,    etiqueta: 'Rechazada' },
  pendiente:  { icono: '○', color: COLORS.textMuted, etiqueta: 'Pendiente' },
};
