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

import { FIREBASE_CONFIG } from '../constants/config';
import { Alert } from 'react-native';

// Evitar duplicados en hot-reload
const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
export const db = getFirestore(app);

// ─── Crear usuarios iniciales si no existen ────────────────────────────────
// BUGFIX: Usa setDoc con IDs fijos + comprueba existencia antes de crear.
// El bug anterior usaba addDoc (ID aleatorio) dentro de un listener que
// se disparaba con data.length === 0 durante la latencia inicial de Firestore,
// lo que duplicaba los 4 usuarios cada vez que la app arrancaba tras medianoche.
export const crearUsuariosIniciales = async () => {
  const base = [
    { id: 'usuario_daniel', nombre: 'Daniel', puntos: 0, racha: 0, nivel: 1, isAdmin: false },
    { id: 'usuario_sergio', nombre: 'Sergio', puntos: 0, racha: 0, nivel: 1, isAdmin: false },
    { id: 'usuario_diego',  nombre: 'Diego',  puntos: 0, racha: 0, nivel: 1, isAdmin: false },
    { id: 'usuario_adulto', nombre: 'Adulto', puntos: 0, racha: 0, nivel: 1, isAdmin: true  },
  ];

  for (const u of base) {
    const ref = doc(db, 'hogar_usuarios', u.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const { id, ...datos } = u;
      await setDoc(ref, { ...datos, creado: new Date().toISOString() });
    }
  }
};

// ─── Hook principal ────────────────────────────────────────────────────────
export const useFirestore = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  // Flag para evitar llamar a crearUsuariosIniciales mientras Firestore
  // todavía está cargando (la latencia inicial devuelve length === 0 brevemente)
  const [iniciado, setIniciado] = useState(false);

  useEffect(() => {
    const unsubUsuarios = onSnapshot(
      collection(db, 'hogar_usuarios'),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsuarios(data);
        setLoading(false);

        // Solo crear usuarios si ya tenemos la respuesta real de Firestore
        // (snap.metadata.fromCache === false significa que llegó del servidor)
        // y la colección está vacía de verdad.
        if (data.length === 0 && !snap.metadata.fromCache) {
          crearUsuariosIniciales();
        }
        setIniciado(true);
      }
    );

    const unsubHistorial = onSnapshot(
      query(collection(db, 'hogar_historial'), orderBy('fecha', 'desc')),
      (snap) => setHistorial(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubUsuarios();
      unsubHistorial();
    };
  }, []);

  // ── Completar tarea ──────────────────────────────────────────────────────
  const completarTarea = async (user, tarea, puntosConBonus) => {
    try {
      const fechaHoy = new Date().toISOString().split('T')[0];
      await addDoc(collection(db, 'hogar_historial'), {
        usuarioId: user.id,
        usuarioNombre: user.nombre,
        tareaId: tarea.id,
        tareaNombre: tarea.nombre,
        puntos: puntosConBonus,
        tipo: tarea.tipo || 'base',
        fecha: new Date().toISOString(),
        fechaDia: fechaHoy,
        estado: 'pendiente_verificacion',
      });
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'No se pudo completar la tarea. Inténtalo de nuevo.');
    }
  };

  // ── Deshacer tarea (usuario) ─────────────────────────────────────────────
  const deshacerTarea = async (historialId) => {
    try {
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
    } catch (error) {
      console.error('Error undoing task:', error);
      Alert.alert('Error', 'No se pudo deshacer la acción.');
    }
  };

  // ── Verificar/rechazar tarea (admin) ─────────────────────────────────────
  const verificarTarea = async (tarea, aprobada) => {
    try {
      const usuario =
        usuarios.find(u => u.id === tarea.usuarioId) ||
        usuarios.find(u => u.nombre === tarea.usuarioNombre);
      if (!usuario) return;

      if (aprobada) {
        const fechaHoy = new Date().toISOString().split('T')[0];
        const tareasHoyVerificadas = historial.filter(h =>
          h.usuarioId === usuario.id &&
          h.fechaDia === fechaHoy &&
          h.estado === 'verificada'
        );
        const nuevaRacha =
          tareasHoyVerificadas.length === 0
            ? (usuario.racha || 0) + 1
            : usuario.racha;

        await updateDoc(doc(db, 'hogar_usuarios', usuario.id), {
          puntos: (usuario.puntos || 0) + tarea.puntos,
          racha: nuevaRacha,
        });
        await updateDoc(doc(db, 'hogar_historial', tarea.id), { estado: 'verificada' });
      } else {
        await updateDoc(doc(db, 'hogar_historial', tarea.id), { estado: 'rechazada' });
      }
    } catch (error) {
      console.error('Error verifying task:', error);
      Alert.alert('Error', 'No se pudo verificar la tarea.');
    }
  };

  // ── Verificar tarea entre usuarios (peer review) ─────────────────────────
  const verificarTareaUsuario = async (tarea, aprobada, verificador) => {
    try {
      const usuario =
        usuarios.find(u => u.id === tarea.usuarioId) ||
        usuarios.find(u => u.nombre === tarea.usuarioNombre);
      if (!usuario) return;

      if (aprobada) {
        const fechaHoy = new Date().toISOString().split('T')[0];
        const tareasHoyVerificadas = historial.filter(h =>
          h.usuarioId === usuario.id &&
          h.fechaDia === fechaHoy &&
          h.estado === 'verificada'
        );
        const nuevaRacha =
          tareasHoyVerificadas.length === 0
            ? (usuario.racha || 0) + 1
            : usuario.racha;

        await updateDoc(doc(db, 'hogar_usuarios', usuario.id), {
          puntos: (usuario.puntos || 0) + tarea.puntos,
          racha: nuevaRacha,
        });
        await updateDoc(doc(db, 'hogar_historial', tarea.id), {
          estado: 'verificada',
          verificadoPor: verificador?.nombre || 'usuario',
        });
      } else {
        await updateDoc(doc(db, 'hogar_historial', tarea.id), {
          estado: 'rechazada',
          verificadoPor: verificador?.nombre || 'usuario',
        });
      }
    } catch (error) {
      console.error('Error verifying task (peer):', error);
      Alert.alert('Error', 'No se pudo verificar la tarea.');
    }
  };

  // ── Ajustar puntos manualmente (admin) ───────────────────────────────────
  const ajustarPuntos = async (usuarioId, cantidad) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    if (!usuario) return;
    const nuevos = Math.max(0, (usuario.puntos || 0) + cantidad);
    await updateDoc(doc(db, 'hogar_usuarios', usuarioId), { puntos: nuevos });
  };

  // ── Resetear puntos y racha de un usuario ────────────────────────────────
  const resetearPuntosUsuario = async (usuarioId) => {
    await updateDoc(doc(db, 'hogar_usuarios', usuarioId), { puntos: 0, racha: 0 });
  };

  // ── Recalcular puntos desde historial (herramienta admin) ────────────────
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

  // ── Canjear premio ───────────────────────────────────────────────────────
  const canjearPremio = async (user, premio) => {
    await updateDoc(doc(db, 'hogar_usuarios', user.id), {
      puntos: user.puntos - premio.puntos,
    });
    await addDoc(collection(db, 'hogar_historial'), {
      usuarioId: user.id,
      usuarioNombre: user.nombre,
      tipo: 'premio',
      premioNombre: premio.nombre,
      puntos: -premio.puntos,
      fecha: new Date().toISOString(),
    });
  };

  // ── Comprar booster ──────────────────────────────────────────────────────
  const comprarBooster = async (user, booster, precioFinal) => {
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + booster.duracion);
    const nuevo = {
      id: booster.id,
      nombre: booster.nombre,
      multiplicador: booster.multiplicador,
      fechaInicio: new Date().toISOString(),
      fechaFin: fechaFin.toISOString(),
    };
    await updateDoc(doc(db, 'hogar_usuarios', user.id), {
      puntos: user.puntos - precioFinal,
      boosters: [...(user.boosters || []), nuevo],
    });
  };

  // ── Comprar booster especial ─────────────────────────────────────────────
  const comprarBoosterEspecial = async (user, booster) => {
    const nuevo = {
      id: booster.id,
      nombre: booster.nombre,
      tipo: booster.tipo,
      fechaCompra: new Date().toISOString(),
    };
    if (booster.tipo === 'extras') {
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + booster.duracion);
      nuevo.fechaFin = fechaFin.toISOString();
    }
    await updateDoc(doc(db, 'hogar_usuarios', user.id), {
      puntos: user.puntos - booster.puntos,
      boostersEspeciales: [...(user.boostersEspeciales || []), nuevo],
    });
  };

  // ── Resetear todas las tareas de hoy (admin) ─────────────────────────────
  const resetearTareasHoy = async () => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const entradasHoy = historial.filter(h => h.fechaDia === fechaHoy);
    if (entradasHoy.length === 0) return;
    const batch = writeBatch(db);
    entradasHoy.forEach(h => batch.delete(doc(db, 'hogar_historial', h.id)));
    await batch.commit();
  };

  // ── Limpiar usuarios con IDs no reconocidos (duplicados por addDoc) ──────
  const IDS_VALIDOS = new Set(['usuario_daniel', 'usuario_sergio', 'usuario_diego', 'usuario_adulto']);

  const limpiarUsuariosExternos = async () => {
    const externos = usuarios.filter(u => !IDS_VALIDOS.has(u.id));
    if (externos.length === 0) return 0;
    const batch = writeBatch(db);
    externos.forEach(u => batch.delete(doc(db, 'hogar_usuarios', u.id)));
    await batch.commit();
    return externos.length;
  };

  // ── Leer asignaciones de una fecha ───────────────────────────────────────
  const getAsignaciones = async (fecha) => {
    const ref = doc(db, 'hogar_asignaciones', fecha);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  };

  // ── Guardar asignaciones ─────────────────────────────────────────────────
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
    verificarTareaUsuario,
    ajustarPuntos,
    resetearPuntosUsuario,
    recalcularPuntos,
    resetearTareasHoy,
    canjearPremio,
    comprarBooster,
    comprarBoosterEspecial,
    getAsignaciones,
    guardarAsignaciones,
    limpiarUsuariosExternos,
  };
};
