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
import { PUNTOS_POR_HORA, PUNTOS_MINIMOS_DIA } from '../constants/tareas';

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

// ─── Crear usuarios iniciales si no existen ──────────────────────────────
export const crearUsuariosIniciales = async () => {
  const base = [
    { id: 'usuario_daniel', nombre: 'Daniel', puntos: 0, horasAcumuladas: 0, racha: 0, nivel: 1, isAdmin: false },
    { id: 'usuario_sergio', nombre: 'Sergio', puntos: 0, horasAcumuladas: 0, racha: 0, nivel: 1, isAdmin: false },
    { id: 'usuario_diego',  nombre: 'Diego',  puntos: 0, horasAcumuladas: 0, racha: 0, nivel: 1, isAdmin: false },
    { id: 'usuario_adulto', nombre: 'Adulto', puntos: 0, horasAcumuladas: 0, racha: 0, nivel: 1, isAdmin: true  },
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

// ─── Hook principal ──────────────────────────────────────────────────────
export const useFirestore = () => {
  const [usuarios, setUsuarios]       = useState([]);
  const [historial, setHistorial]     = useState([]);
  const [listaCompra, setListaCompra] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    // Usuarios
    const unsubUsuarios = onSnapshot(
      collection(db, 'hogar_usuarios'),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsuarios(data);
        setLoading(false);
        if (data.length === 0 && !snap.metadata.fromCache) {
          crearUsuariosIniciales();
        }
      }
    );

    // Historial
    const unsubHistorial = onSnapshot(
      query(collection(db, 'hogar_historial'), orderBy('fecha', 'desc')),
      (snap) => setHistorial(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    // Lista de la compra (tiempo real)
    const unsubLista = onSnapshot(
      query(collection(db, 'hogar_lista_compra'), orderBy('creado', 'asc')),
      (snap) => setListaCompra(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubUsuarios();
      unsubHistorial();
      unsubLista();
    };
  }, []);

  // ── Completar tarea ────────────────────────────────────────────────────
  const completarTarea = async (user, tarea, puntosConBonus) => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    await addDoc(collection(db, 'hogar_historial'), {
      usuarioId: user.id,
      usuarioNombre: user.nombre,
      tareaId: tarea.id,
      tareaNombre: tarea.nombre,
      puntos: puntosConBonus,
      tipo: tarea.tipo || tarea.categoria || 'base',
      categoria: tarea.categoria || 'casa',
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

  // ── Verificar/rechazar tarea (admin) ───────────────────────────────────
  const verificarTarea = async (tarea, aprobada) => {
    const usuario = usuarios.find(u => u.id === tarea.usuarioId);
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
      racha: 0,
      horasAcumuladas: 0,
    });
  };

  // ── Resetear puntos de TODOS los usuarios ──────────────────────────────
  const resetearTodosPuntos = async () => {
    const batch = writeBatch(db);
    usuarios.filter(u => !u.isAdmin).forEach(u => {
      batch.update(doc(db, 'hogar_usuarios', u.id), {
        puntos: 0,
        racha: 0,
        horasAcumuladas: 0,
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

  // ── Canjear premio ─────────────────────────────────────────────────────
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

  // ── Comprar booster ────────────────────────────────────────────────────
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

  // ── Comprar booster especial ───────────────────────────────────────────
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

  // ── Resetear tareas de hoy ─────────────────────────────────────────────
  const resetearTareasHoy = async () => {
    const fechaHoy = new Date().toISOString().split('T')[0];
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

  // ── Calcular horas ganadas esta semana ─────────────────────────────────
  const getHorasSemana = (usuarioId) => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7)); // Lunes
    inicioSemana.setHours(0, 0, 0, 0);

    const ptsSemana = historial
      .filter(h =>
        h.usuarioId === usuarioId &&
        new Date(h.fecha) >= inicioSemana &&
        h.estado === 'verificada' &&
        h.puntos > 0
      )
      .reduce((sum, h) => sum + (h.puntos || 0), 0);

    return (ptsSemana / PUNTOS_POR_HORA).toFixed(1);
  };

  const getHorasHoy = (usuarioId) => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const ptsHoy = historial
      .filter(h =>
        h.usuarioId === usuarioId &&
        h.fechaDia === fechaHoy &&
        h.estado === 'verificada' &&
        h.puntos > 0
      )
      .reduce((sum, h) => sum + (h.puntos || 0), 0);

    return (ptsHoy / PUNTOS_POR_HORA).toFixed(1);
  };

  // ── Puntos verificados de un día concreto ──────────────────────────────
  const getPuntosVerificadosDia = (usuarioId, fecha) => {
    return historial
      .filter(h =>
        h.usuarioId === usuarioId &&
        h.fechaDia === fecha &&
        h.estado === 'verificada' &&
        h.puntos > 0
      )
      .reduce((sum, h) => sum + (h.puntos || 0), 0);
  };

  const getPuntosHoy = (usuarioId) => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    return getPuntosVerificadosDia(usuarioId, fechaHoy);
  };

  // ── Comprobar y aplicar penalización de ayer ───────────────────────────
  // Si ayer no llegaron al mínimo → pierden PUNTOS_MINIMOS_DIA puntos
  const comprobarPenalizacionAyer = async () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const fechaAyer = ayer.toISOString().split('T')[0];

    // Solo penalizar días de semana y sábado (no domingo por si no hubo tareas)
    // En realidad penalizamos todos los días — si hay tareas disponibles, hay que hacerlas

    for (const u of usuarios.filter(x => !x.isAdmin)) {
      // Comprobar si ya se aplicó penalización para ayer
      if (u.ultimaPenalizacion === fechaAyer) continue;

      const ptsAyer = getPuntosVerificadosDia(u.id, fechaAyer);

      if (ptsAyer < PUNTOS_MINIMOS_DIA) {
        // Comprobar escudo anti-penalización
        const escudo = (u.boostersEspeciales || []).find(
          b => b.tipo === 'anti_penalizacion' && !b.usado
        );

        if (escudo) {
          // Usar el escudo en vez de penalizar
          const nuevosEspeciales = (u.boostersEspeciales || []).map(b =>
            b === escudo ? { ...b, usado: true } : b
          );
          await updateDoc(doc(db, 'hogar_usuarios', u.id), {
            boostersEspeciales: nuevosEspeciales,
            ultimaPenalizacion: fechaAyer,
          });
        } else {
          // Penalización: restar puntos de un día completo
          const nuevos = Math.max(0, (u.puntos || 0) - PUNTOS_MINIMOS_DIA);
          await updateDoc(doc(db, 'hogar_usuarios', u.id), {
            puntos: nuevos,
            racha: 0, // Se pierde la racha también
            ultimaPenalizacion: fechaAyer,
          });

          // Registrar en historial
          await addDoc(collection(db, 'hogar_historial'), {
            usuarioId: u.id,
            usuarioNombre: u.nombre,
            tipo: 'penalizacion',
            tareaNombre: `Penalización: no llegaste a ${PUNTOS_MINIMOS_DIA} pts ayer (hiciste ${ptsAyer})`,
            puntos: -PUNTOS_MINIMOS_DIA,
            fecha: new Date().toISOString(),
            fechaDia: new Date().toISOString().split('T')[0],
            estado: 'verificada',
          });
        }
      }
    }
  };

  // ── Obtener pendientes de verificar (de OTROS usuarios) ────────────────
  const getPendientesDeOtros = (miUsuarioId) => {
    return historial.filter(
      h => h.estado === 'pendiente_verificacion' && h.usuarioId !== miUsuarioId
    );
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
    getHorasSemana,
    getHorasHoy,
    getPuntosHoy,
    getPuntosVerificadosDia,
    comprobarPenalizacionAyer,
    getPendientesDeOtros,
  };
};
