import { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB_rld0G77nmfOw-FmfftDPdsWlblPZb24',
  authDomain: 'banco-bus.firebaseapp.com',
  projectId: 'banco-bus',
  storageBucket: 'banco-bus.appspot.com',
  messagingSenderId: '558242160979',
  appId: 'banco-bus',
};

// Evitar duplicados en hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// ─── Crear usuarios iniciales si no existen ──────────────
export const crearUsuariosIniciales = async () => {
  const base = [
    { nombre: 'Daniel', puntos: 0, racha: 0, nivel: 1, isAdmin: false },
    { nombre: 'Sergio', puntos: 0, racha: 0, nivel: 1, isAdmin: false },
    { nombre: 'Diego',  puntos: 0, racha: 0, nivel: 1, isAdmin: false },
    { nombre: 'Adulto', puntos: 0, racha: 0, nivel: 1, isAdmin: true  },
  ];
  for (const u of base) {
    await addDoc(collection(db, 'hogar_usuarios'), {
      ...u,
      creado: new Date().toISOString(),
    });
  }
};

// ─── Hook principal ───────────────────────────────────────
export const useFirestore = () => {
  const [usuarios,  setUsuarios]  = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const unsubUsuarios = onSnapshot(
      collection(db, 'hogar_usuarios'),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsuarios(data);
        setLoading(false);
        if (data.length === 0) crearUsuariosIniciales();
      }
    );

    const unsubHistorial = onSnapshot(
      query(collection(db, 'hogar_historial'), orderBy('fecha', 'desc')),
      (snap) => setHistorial(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => { unsubUsuarios(); unsubHistorial(); };
  }, []);

  // ── Completar tarea ─────────────────────────────────────
  const completarTarea = async (user, tarea, puntosConBonus) => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    await addDoc(collection(db, 'hogar_historial'), {
      usuarioId:     user.id,
      usuarioNombre: user.nombre,
      tareaId:       tarea.id,
      tareaNombre:   tarea.nombre,
      puntos:        puntosConBonus,
      tipo:          tarea.tipo || 'base',
      fecha:         new Date().toISOString(),
      fechaDia:      fechaHoy,
      estado:        'pendiente_verificacion',
    });
  };

  // ── Deshacer tarea (usuario) ────────────────────────────
  // Si la tarea ya estaba verificada (puntos sumados), los restamos también.
  const deshacerTarea = async (historialId) => {
    if (!historialId) return;
    const entrada = historial.find(h => h.id === historialId);
    if (!entrada) return;

    if (entrada.estado === 'verificada') {
      const usuario = usuarios.find(u => u.id === entrada.usuarioId);
      if (usuario) {
        await updateDoc(doc(db, 'hogar_usuarios', usuario.id), {
          puntos: Math.max(0, (usuario.puntos || 0) - (entrada.puntos || 0)),
        });
      }
    }

    await deleteDoc(doc(db, 'hogar_historial', historialId));
  };

  // ── Verificar/rechazar tarea (admin) ────────────────────
  const verificarTarea = async (tarea, aprobada) => {
    const usuario = usuarios.find(u => u.id === tarea.usuarioId);
    if (!usuario) return;

    if (aprobada) {
      const fechaHoy = new Date().toISOString().split('T')[0];
      // Bug fix: racha solo sube una vez por día
      const tareasHoyVerificadas = historial.filter(h =>
        h.usuarioId === usuario.id &&
        h.fechaDia  === fechaHoy &&
        h.estado    === 'verificada'
      );
      const nuevaRacha = tareasHoyVerificadas.length === 0
        ? (usuario.racha || 0) + 1
        : usuario.racha;

      await updateDoc(doc(db, 'hogar_usuarios', usuario.id), {
        puntos: (usuario.puntos || 0) + tarea.puntos,
        racha:  nuevaRacha,
      });
      await updateDoc(doc(db, 'hogar_historial', tarea.id), { estado: 'verificada' });
    } else {
      await updateDoc(doc(db, 'hogar_historial', tarea.id), { estado: 'rechazada' });
    }
  };

  // ── Ajustar puntos manualmente (admin) ─────────────────────
  // cantidad puede ser negativa (restar) o positiva (añadir)
  const ajustarPuntos = async (usuarioId, cantidad) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    if (!usuario) return;
    const nuevos = Math.max(0, (usuario.puntos || 0) + cantidad);
    await updateDoc(doc(db, 'hogar_usuarios', usuarioId), { puntos: nuevos });
  };

  // ── Resetear puntos y racha de un usuario ──────────────────
  const resetearPuntosUsuario = async (usuarioId) => {
    await updateDoc(doc(db, 'hogar_usuarios', usuarioId), { puntos: 0, racha: 0 });
  };

  // ── Recalcular puntos desde historial (herramienta admin) ─
  const recalcularPuntos = async () => {
    const verificadas = historial.filter(h => h.estado === 'verificada');
    const porUsuario = {};
    verificadas.forEach(h => {
      porUsuario[h.usuarioId] = (porUsuario[h.usuarioId] || 0) + (h.puntos || 0);
    });
    for (const u of usuarios) {
      if (u.isAdmin) continue;
      const correctos = porUsuario[u.id] || 0;
      if (u.puntos !== correctos) {
        await updateDoc(doc(db, 'hogar_usuarios', u.id), { puntos: correctos });
      }
    }
  };

  // ── Canjear premio ──────────────────────────────────────
  const canjearPremio = async (user, premio) => {
    await updateDoc(doc(db, 'hogar_usuarios', user.id), {
      puntos: user.puntos - premio.puntos,
    });
    await addDoc(collection(db, 'hogar_historial'), {
      usuarioId:     user.id,
      usuarioNombre: user.nombre,
      tipo:          'premio',
      premioNombre:  premio.nombre,
      puntos:        -premio.puntos,
      fecha:         new Date().toISOString(),
    });
  };

  // ── Comprar booster ─────────────────────────────────────
  const comprarBooster = async (user, booster, precioFinal) => {
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + booster.duracion);
    const nuevo = {
      id:            booster.id,
      nombre:        booster.nombre,
      multiplicador: booster.multiplicador,
      fechaInicio:   new Date().toISOString(),
      fechaFin:      fechaFin.toISOString(),
    };
    await updateDoc(doc(db, 'hogar_usuarios', user.id), {
      puntos:   user.puntos - precioFinal,
      boosters: [...(user.boosters || []), nuevo],
    });
  };

  // ── Comprar booster especial ────────────────────────────
  const comprarBoosterEspecial = async (user, booster) => {
    const nuevo = {
      id:          booster.id,
      nombre:      booster.nombre,
      tipo:        booster.tipo,
      fechaCompra: new Date().toISOString(),
    };
    if (booster.tipo === 'extras') {
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + booster.duracion);
      nuevo.fechaFin = fechaFin.toISOString();
    }
    await updateDoc(doc(db, 'hogar_usuarios', user.id), {
      puntos:            user.puntos - booster.puntos,
      boostersEspeciales: [...(user.boostersEspeciales || []), nuevo],
    });
  };

  // ── Resetear todas las tareas de hoy (admin) ──────────
  // Elimina del historial todos los registros de hoy → quedan como pendientes
  const resetearTareasHoy = async () => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const entradasHoy = historial.filter(h => h.fechaDia === fechaHoy);
    if (entradasHoy.length === 0) return;
    const batch = writeBatch(db);
    entradasHoy.forEach(h => batch.delete(doc(db, 'hogar_historial', h.id)));
    await batch.commit();
  };

  // ── Leer asignaciones de una fecha ─────────────────────
  const getAsignaciones = async (fecha) => {
    const ref = doc(db, 'hogar_asignaciones', fecha);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  };

  // ── Guardar asignaciones ────────────────────────────────
  const guardarAsignaciones = async (fecha, asignaciones) => {
    await setDoc(doc(db, 'hogar_asignaciones', fecha), asignaciones);
  };

  return {
    usuarios,
    historial,
    loading,
    completarTarea,
    deshacerTarea,
    verificarTarea,
    ajustarPuntos,
    resetearPuntosUsuario,
    recalcularPuntos,
    resetearTareasHoy,
    canjearPremio,
    comprarBooster,
    comprarBoosterEspecial,
    getAsignaciones,
    guardarAsignaciones,
  };
};
