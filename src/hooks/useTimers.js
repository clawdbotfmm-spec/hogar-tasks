import { useState, useCallback } from 'react';
import { TAREAS_CON_TIMER } from '../constants/timers';

export const useTimers = () => {
  const [timers,        setTimers]        = useState({});
  const [timerSegundos, setTimerSegundos] = useState({});
  const [timersActivos, setTimersActivos] = useState({});

  const formatearTiempo = (segundos) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleTimer = useCallback((tareaId) => {
    const config = TAREAS_CON_TIMER[tareaId];
    if (!config) return;

    if (timersActivos[tareaId]) {
      clearInterval(timers[tareaId]);
      setTimersActivos(prev => ({ ...prev, [tareaId]: false }));
    } else {
      const interval = setInterval(() => {
        setTimerSegundos(prev => {
          const nuevo = (prev[tareaId] || 0) + 1;
          if (nuevo >= config.duracion) {
            clearInterval(interval);
            setTimersActivos(prevAct => ({ ...prevAct, [tareaId]: false }));
          }
          return { ...prev, [tareaId]: nuevo };
        });
      }, 1000);
      setTimers(prev => ({ ...prev, [tareaId]: interval }));
      setTimersActivos(prev => ({ ...prev, [tareaId]: true }));
    }
  }, [timers, timersActivos]);

  const resetearTimer = useCallback((tareaId) => {
    if (timers[tareaId]) clearInterval(timers[tareaId]);
    setTimers(prev => { const n = { ...prev }; delete n[tareaId]; return n; });
    setTimerSegundos(prev => { const n = { ...prev }; delete n[tareaId]; return n; });
    setTimersActivos(prev => { const n = { ...prev }; delete n[tareaId]; return n; });
  }, [timers]);

  return {
    timerSegundos,
    timersActivos,
    formatearTiempo,
    toggleTimer,
    resetearTimer,
  };
};
