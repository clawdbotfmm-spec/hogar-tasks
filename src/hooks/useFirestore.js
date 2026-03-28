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
  runTransaction,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { TAREAS_PERSONALES } from '../constants/tareas';
import { fechaLocalHoy } from '../utils/fecha';

const firebaseConfig = {
  apiKey: 'AIzaSyBT76DLdmAj423rYXKS2wm2sfD1YgNKg90',
  authDomain: 'hogar-tasks.firebaseapp.com',
  projectId: 'hogar-tasks',
  storageBucket: 'hogar-tasks.firebasestorage.app',
  messagingSenderId: '180454454918',
  appId: '1:180454454918:web:662f77f9d40c627e8d4307',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);

// Emails de administradores
const ADMIN_EMAILS = [
  'clawdbotfmm@gmail.com',
  'saramarrupe@gmail.com',
];

// ─── Crear documento de usuario en Firestore al registrarse ──────────────
export const crearUsuarioFirestore = async (uid, email, nombre) => {
  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  const ref = doc(db, 'hogar_usuarios', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      nombre,
      email: email.toLowerCase(),
      puntos: 0,
      nivel: 1,
      isAdmin,
      creado: new Date().toISOString(),
    });
  }
  return isAdmin;
};

// ─── Hook principal ──────────────────────────────────────────────────────
export const useFirestore = () => {
  const [usuarios, setUsuarios]       = useState([]);
  const [historial, setHistorial]     = useState([]);
  const [listaCompra, setListaCompra] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tareasCustom, setTareasCustom] = useState([]);
  const [tareasOcultas, setTareasOcultas] = useState([]);
  const [configRotacion, setConfigRotacion] = useState(null);

  useEffect(() => {
    const onErr = (e) => console.error('Firestore listener error:', e);

    // Usuarios
    const unsubUsuarios = onSnapshot(
      collection(db, 'hogar_usuarios'),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsuarios(data);
        setLoading(false);
      },
      onErr
    );

    // Historial
    const unsubHistorial = onSnapshot(
      query(collection(db, 'hogar_historial'), orderBy('fecha', 'desc')),
      (snap) => setHistorial(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      onErr
    );

    // Lista de la compra (tiempo real)
    const unsubLista = onSnapshot(
      query(collection(db, 'hogar_lista_compra'), orderBy('creado', 'asc')),
      (snap) => setListaCompra(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      onErr
    );

    // Tareas custom del admin
    const unsubTareasCustom = onSnapshot(
      collection(db, 'hogar_tareas_custom'),
      (snap) => setTareasCustom(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      onErr
    );

    // Config de rotación (inicio ciclo actual)
    const unsubRotacion = onSnapshot(
      doc(db, 'hogar_config', 'rotacion'),
      (snap) => {
        setConfigRotacion(snap.exists() ? snap.data() : null);
      },
      () => setConfigRotacion(null)
    );

    // Tareas ocultas (IDs de tareas estáticas desactivadas)
    const unsubTareasOcultas = onSnapshot(
      doc(db, 'hogar_config', 'tareas_ocultas'),
      (snap) => {
        try {
          setTareasOcultas(snap.exists() ? (snap.data().ids || []) : []);
        } catch (e) {
          setTareasOcultas([]);
        }
      },
      () => setTareasOcultas([])
    );

    return () => {
      unsubUsuarios();
      unsubHistorial();
      unsubLista();
      unsubTareasCustom();
      unsubRotacion();
      unsubTareasOcultas();
    };
  }, []);

  // ── Limpiar boosters expirados ──────────────────────────────────────────
  const limpiarBoostersExpirados = async (user) => {
    const ahora = new Date();
    const boostersActivos = (user.boosters || []).filter(b => new Date(b.fechaFin) >= ahora);
    const especialesActivos = (user.boostersEspeciales || []).filter(b =>
      !b.fechaFin || new Date(b.fechaFin) >= ahora
    );
    const cambio = boostersActivos.length !== (user.boosters || []).length ||
                   especialesActivos.length !== (user.boostersEspeciales || []).length;
    if (cambio) {
      await updateDoc(doc(db, 'hogar_usuarios', user.id), {
        boosters: boostersActivos,
        boostersEspeciales: especialesActivos,
      });
    }
  };

  // ── Completar tarea ────────────────────────────────────────────────────
  const completarTarea = async (user, tarea, puntosConBonus) => {
    const fechaHoy = fechaLocalHoy();
    const esPersonal = tarea.categoria === 'personal';
    await addDoc(collection(db, 'hogar_historial'), {
      usuarioId: user.id,
      usuarioNombre: user.nombre,
      tareaId: tarea.id,
      tareaNombre: tarea.nombre,
      puntos: esPersonal ? 0 : puntosConBonus,
      tipo: esPersonal ? 'personal' : (tarea.tipo || tarea.categoria || 'base'),
      categoria: tarea.categoria || 'casa',
      frecuencia: tarea.frecuencia || 'diaria',
      fecha: new Date().toISOString(),
      fechaDia: fechaHoy,
      estado: 'pendiente_verificacion',
    });
  };

  // ── Deshacer tarea ─────────────────────────────────────────────────────
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

  // ── Verificar/rechazar tarea (transacción atómica) ──────────────────────
  const verificarTarea = async (tarea, aprobada) => {
    const usuario = usuarios.find(u => u.id === tarea.usuarioId);
    if (!usuario) return;

    const esPersonal = tarea.tipo === 'personal';
    const ref = doc(db, 'hogar_usuarios', usuario.id);

    if (aprobada) {
      if (!esPersonal) {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(ref);
          const datos = snap.data();
          tx.update(ref, { puntos: (datos.puntos || 0) + tarea.puntos });
        });
      }
      await updateDoc(doc(db, 'hogar_historial', tarea.id), { estado: 'verificada' });
    } else {
      if (esPersonal) {
        const tareaOriginal = TAREAS_PERSONALES.find(t => t.id === tarea.tareaId);
        const penalizacion = (tareaOriginal?.puntos || 3) * 2;
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(ref);
          const datos = snap.data();
          tx.update(ref, { puntos: Math.max(0, (datos.puntos || 0) - penalizacion) });
        });
      }
      await updateDoc(doc(db, 'hogar_historial', tarea.id), { estado: 'rechazada' });
    }
  };

  // ── Ajustar puntos manualmente (admin) ─────────────────────────────────
  const ajustarPuntos = async (usuarioId, cantidad) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    if (!usuario) return;
    const nuevos = Math.max(0, (usuario.puntos || 0) + cantidad);
    await updateDoc(doc(db, 'hogar_usuarios', usuarioId), { puntos: nuevos });
  };

  // ── Resetear puntos de un usuario ──────────────────────────────────────
  const resetearPuntosUsuario = async (usuarioId) => {
    await updateDoc(doc(db, 'hogar_usuarios', usuarioId), {
      puntos: 0,
      boosters: [],
      boostersEspeciales: [],
    });
  };

  // ── Resetear puntos de TODOS los usuarios ──────────────────────────────
  const resetearTodosPuntos = async () => {
    const batch = writeBatch(db);
    usuarios.filter(u => !u.isAdmin).forEach(u => {
      batch.update(doc(db, 'hogar_usuarios', u.id), {
        puntos: 0,
        boosters: [],
        boostersEspeciales: [],
      });
    });
    await batch.commit();
  };

  // ── Recalcular puntos desde historial ──────────────────────────────────
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

  // ── Canjear premio (transacción atómica) ────────────────────────────────
  const canjearPremio = async (user, premio) => {
    const ref = doc(db, 'hogar_usuarios', user.id);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const datos = snap.data();
      if ((datos.puntos || 0) < premio.puntos) throw new Error('Puntos insuficientes');
      tx.update(ref, { puntos: datos.puntos - premio.puntos });
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

  // ── Comprar booster (transacción atómica) ─────────────────────────────
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
    const ref = doc(db, 'hogar_usuarios', user.id);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const datos = snap.data();
      if ((datos.puntos || 0) < precioFinal) throw new Error('Puntos insuficientes');
      tx.update(ref, {
        puntos: datos.puntos - precioFinal,
        boosters: [...(datos.boosters || []), nuevo],
      });
    });
  };

  // ── Comprar booster especial (transacción atómica) ─────────────────────
  const comprarBoosterEspecial = async (user, booster) => {
    const nuevo = {
      id: booster.id,
      nombre: booster.nombre,
      tipo: booster.tipo,
      fechaCompra: new Date().toISOString(),
    };
    if (booster.duracion) {
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + booster.duracion);
      nuevo.fechaFin = fechaFin.toISOString();
    }
    const ref = doc(db, 'hogar_usuarios', user.id);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const datos = snap.data();
      if ((datos.puntos || 0) < booster.puntos) throw new Error('Puntos insuficientes');
      tx.update(ref, {
        puntos: datos.puntos - booster.puntos,
        boostersEspeciales: [...(datos.boostersEspeciales || []), nuevo],
      });
    });
  };

  // ── Resetear tareas de hoy ─────────────────────────────────────────────
  const resetearTareasHoy = async () => {
    const fechaHoy = fechaLocalHoy();
    const entradasHoy = historial.filter(h => h.fechaDia === fechaHoy);
    if (entradasHoy.length === 0) return;
    const batch = writeBatch(db);
    entradasHoy.forEach(h => batch.delete(doc(db, 'hogar_historial', h.id)));
    await batch.commit();
  };

  // ── Borrar todo el historial ───────────────────────────────────────────
  const borrarTodoHistorial = async () => {
    if (historial.length === 0) return;
    // Firestore batch max 500
    for (let i = 0; i < historial.length; i += 500) {
      const batch = writeBatch(db);
      historial.slice(i, i + 500).forEach(h =>
        batch.delete(doc(db, 'hogar_historial', h.id))
      );
      await batch.commit();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // LISTA DE LA COMPRA (tiempo real, compartida)
  // ═══════════════════════════════════════════════════════════════════════

  const agregarProducto = async (nombre, usuario) => {
    await addDoc(collection(db, 'hogar_lista_compra'), {
      nombre: nombre.trim(),
      comprado: false,
      agregadoPor: usuario.nombre,
      creado: new Date().toISOString(),
    });
  };

  const marcarComprado = async (productoId, comprado) => {
    await updateDoc(doc(db, 'hogar_lista_compra', productoId), {
      comprado,
      fechaComprado: comprado ? new Date().toISOString() : null,
    });
  };

  const eliminarProducto = async (productoId) => {
    await deleteDoc(doc(db, 'hogar_lista_compra', productoId));
  };

  const limpiarComprados = async () => {
    const comprados = listaCompra.filter(p => p.comprado);
    if (comprados.length === 0) return;
    const batch = writeBatch(db);
    comprados.forEach(p => batch.delete(doc(db, 'hogar_lista_compra', p.id)));
    await batch.commit();
  };

  // ── Obtener pendientes de verificar (de OTROS usuarios) ────────────────
  const getPendientesDeOtros = (miUsuarioId) => {
    return historial.filter(
      h => h.estado === 'pendiente_verificacion' && h.usuarioId !== miUsuarioId
    );
  };

  // ── Rotar grupos aleatoriamente ─────────────────────────────────────────
  const rotarGrupos = async () => {
    const activos = usuarios.filter(u => !u.isAdmin);
    if (activos.length === 0) return;

    const grupoIds = ['cocina', 'lavabos_robot', 'tapers_lavanderia'];
    const disponibles = [...grupoIds];

    // Mezclar aleatoriamente
    for (let i = disponibles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]];
    }

    // Intentar que nadie repita su grupo anterior
    const asignaciones = [];
    const usados = new Set();

    activos.forEach(u => {
      let elegido = disponibles.find(g => !usados.has(g) && g !== u.grupoActual);
      if (!elegido) elegido = disponibles.find(g => !usados.has(g));
      if (elegido) {
        asignaciones.push({ userId: u.id, grupo: elegido });
        usados.add(elegido);
      }
    });

    const batch = writeBatch(db);
    asignaciones.forEach(a => {
      batch.update(doc(db, 'hogar_usuarios', a.userId), { grupoActual: a.grupo });
    });

    // Guardar fecha de inicio del nuevo ciclo
    batch.set(doc(db, 'hogar_config', 'rotacion'), {
      inicioCiclo: fechaLocalHoy(),
      ultimaRotacion: new Date().toISOString(),
    });

    await batch.commit();
  };

  // ── Tareas ocultas (admin) ────────────────────────────────────────────
  const ocultarTarea = async (tareaId) => {
    const ref = doc(db, 'hogar_config', 'tareas_ocultas');
    const nuevas = [...new Set([...tareasOcultas, tareaId])];
    await setDoc(ref, { ids: nuevas });
  };

  const restaurarTarea = async (tareaId) => {
    const ref = doc(db, 'hogar_config', 'tareas_ocultas');
    const nuevas = tareasOcultas.filter(id => id !== tareaId);
    await setDoc(ref, { ids: nuevas });
  };

  // ── Tareas custom (admin) ─────────────────────────────────────────────
  const agregarTareaCustom = async (tarea) => {
    await addDoc(collection(db, 'hogar_tareas_custom'), {
      nombre: tarea.nombre.trim(),
      puntos: tarea.puntos,
      categoria: tarea.categoria || 'extra',
      frecuencia: tarea.frecuencia || 'diaria',
      maxVeces: tarea.maxVeces || 1,
      creado: new Date().toISOString(),
    });
  };

  const borrarTareaCustom = async (tareaId) => {
    await deleteDoc(doc(db, 'hogar_tareas_custom', tareaId));
  };

  return {
    usuarios,
    historial,
    listaCompra,
    loading,
    completarTarea,
    deshacerTarea,
    verificarTarea,
    ajustarPuntos,
    resetearPuntosUsuario,
    resetearTodosPuntos,
    recalcularPuntos,
    resetearTareasHoy,
    borrarTodoHistorial,
    canjearPremio,
    comprarBooster,
    comprarBoosterEspecial,
    agregarProducto,
    marcarComprado,
    eliminarProducto,
    limpiarComprados,
    getPendientesDeOtros,
    tareasCustom,
    agregarTareaCustom,
    borrarTareaCustom,
    tareasOcultas,
    ocultarTarea,
    restaurarTarea,
    configRotacion,
    rotarGrupos,
    limpiarBoostersExpirados,
  };
};
