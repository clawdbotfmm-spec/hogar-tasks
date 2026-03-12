import { useState, useEffect } from 'react';
import { TAREAS_CASA_POOL, USUARIOS_NOMBRES } from '../constants/tareas';

// - Helpers
const hoyISO = () => new Date().toISOString().split('T')[0];
const ayerISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const generarAsignaciones = (ayerAsignaciones, tareasCompletadasAyer, usuariosN) => {
  const diarias        = TAREAS_CASA_POOL.filter(t => t.frecuencia === 'diaria');
  const segunNecesidad = TAREAS_CASA_POOL.filter(t => t.frecuencia !== 'diaria');

  // BUGFIX: construir objeto dinamicamente, no con indices hardcodeados
  const asignaciones = {};
  usuariosN.forEach(u => { asignaciones[u] = []; });

  const shuffled = shuffle(diarias);
  shuffled.forEach((t, i) => {
    asignaciones[usuariosN[i % usuariosN.length]].push(t.id);
  });

  const carryoverIds = new Set();
  segunNecesidad.forEach(t => {
    const usuarioAyer = ayerAsignaciones
      ? Object.entries(ayerAsignaciones).find(([, ids]) => ids.includes(t.id))?.[0]
      : null;
    if (usuarioAyer && usuariosN.includes(usuarioAyer) && !tareasCompletadasAyer.includes(t.id)) {
      asignaciones[usuarioAyer].push(t.id);
      carryoverIds.add(t.id);
    }
  });

  const nuevasSN = shuffle(segunNecesidad.filter(t => !carryoverIds.has(t.id)));
  nuevasSN.forEach(t => {
    const minUser = usuariosN.reduce(
      (min, u) => (asignaciones[u].length < asignaciones[min].length ? u : min),
      usuariosN[0]
    );
    asignaciones[minUser].push(t.id);
  });

  return asignaciones;
};

export const useAsignaciones = (firestoreHook, usuarios, historial) => {
  const { getAsignaciones, guardarAsignaciones } = firestoreHook;
  const [asignaciones, setAsignaciones] = useState(null);
  const [cargando,     setCargando]     = useState(true);

  const usuariosN = usuarios
    .filter(u => !u.isAdmin)
    .map(u => u.id);

  useEffect(() => {
    // BUGFIX: no bloquear con !== 3, solo esperar a tener al menos 1 usuario
    if (usuariosN.length === 0) return;
    cargarOGenerarAsignaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuariosN.join(',')]);

  const cargarOGenerarAsignaciones = async () => {
    const hoy = hoyISO();
    const existentes = await getAsignaciones(hoy);

    if (existentes) {
      // BUGFIX: validar que los usuarios guardados coincidan exactamente con los actuales
      const usuariosGuardados = Object.keys(existentes);
      const todosPresentes = usuariosN.every(u => usuariosGuardados.includes(u));
      const sinExtras      = usuariosGuardados.every(u => usuariosN.includes(u));

      if (todosPresentes && sinExtras) {
        setAsignaciones(existentes);
        setCargando(false);
        return;
      }
    }

    const ayer     = ayerISO();
    const ayerData = await getAsignaciones(ayer);

    const completadasAyer = historial
      .filter(h => h.fechaDia === ayer && h.estado !== 'rechazada')
      .map(h => h.tareaId);

    const nuevas = generarAsignaciones(ayerData, completadasAyer, usuariosN);
    await guardarAsignaciones(hoy, nuevas);
    setAsignaciones(nuevas);
    setCargando(false);
  };

  const repartirAhora = async () => {
    const hoy    = hoyISO();
    const nuevas = generarAsignaciones(null, [], usuariosN);
    await guardarAsignaciones(hoy, nuevas);
    setAsignaciones(nuevas);
  };

  const getAsignacionesUsuario = (userId) => {
    if (!asignaciones) return [];
    return asignaciones[userId] || [];
  };

  return { asignaciones, cargando, repartirAhora, getAsignacionesUsuario };
};
