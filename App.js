import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal
} from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

// CONFIGURACIÓN FIREBASE (misma que Banco BUS)
const firebaseConfig = {
  apiKey: "AIzaSyB_rld0G77nmfOw-FmfftDPdsWlblPZb24",
  authDomain: "banco-bus.firebaseapp.com",
  projectId: "banco-bus",
  storageBucket: "banco-bus.appspot.com",
  messagingSenderId: "558242160979",
  appId: "banco-bus"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// NIVELES
const NIVELES = [
  { nivel: 1, nombre: 'Novato', minPts: 0, icono: '🌱' },
  { nivel: 2, nombre: 'Aprendiz', minPts: 500, icono: '📚' },
  { nivel: 3, nombre: 'Experto', minPts: 1500, icono: '⭐' },
  { nivel: 4, nombre: 'Maestro', minPts: 3000, icono: '🏆' },
  { nivel: 5, nombre: 'Leyenda', minPts: 5000, icono: '👑' },
  { nivel: 6, nombre: 'Héroe', minPts: 10000, icono: '🔥' },
  { nivel: 7, nombre: 'Mítico', minPts: 20000, icono: '💎' }
];

// TAREAS PREDEFINIDAS
const TAREAS_BASE = {
  daniel: [
    { id: 'ropa_suelo', nombre: 'Recoger ropa del suelo', puntos: 10, frecuencia: 'diaria' },
    { id: 'separar_colores', nombre: 'Separar ropa por colores', puntos: 5, frecuencia: 'diaria' },
    { id: 'poner_lavadora', nombre: 'Poner lavadora', puntos: 15, frecuencia: 'segun_necesidad' },
    { id: 'quitar_lavadora', nombre: 'Quitar lavadora', puntos: 10, frecuencia: 'segun_necesidad' },
    { id: 'poner_secadora', nombre: 'Poner secadora', puntos: 10, frecuencia: 'segun_necesidad' },
    { id: 'quitar_secadora', nombre: 'Quitar secadora', puntos: 10, frecuencia: 'segun_necesidad' },
    { id: 'doblar_ropa', nombre: 'Doblar ropa', puntos: 20, frecuencia: 'segun_necesidad' },
    { id: 'colocar_armario', nombre: 'Colocar ropa en armario', puntos: 15, frecuencia: 'segun_necesidad' },
    { id: 'hacer_cama', nombre: 'Hacer cama matrimonio', puntos: 10, frecuencia: 'diaria' }
  ],
  sergio: [
    { id: 'poner_mesa', nombre: 'Poner mesa', puntos: 10, frecuencia: 'diaria' },
    { id: 'quitar_mesa', nombre: 'Quitar mesa', puntos: 5, frecuencia: 'diaria' },
    { id: 'cargar_lavavajillas', nombre: 'Cargar lavavajillas', puntos: 10, frecuencia: 'diaria' },
    { id: 'vaciar_lavavajillas', nombre: 'Vaciar lavavajillas', puntos: 10, frecuencia: 'diaria' },
    { id: 'cocina_limpiar', nombre: 'Cocina limpia y ordenada', puntos: 20, frecuencia: 'diaria' },
    { id: 'lista_compra', nombre: 'Hacer lista de la compra', puntos: 20, frecuencia: 'semanal' }
  ],
  diego: [
    { id: 'limpiar_lavabo1', nombre: 'Limpiar lavabo principal', puntos: 15, frecuencia: 'diaria' },
    { id: 'limpiar_lavabo2', nombre: 'Limpiar lavabo secundario', puntos: 15, frecuencia: 'diaria' },
    { id: 'recoger_basuras', nombre: 'Recoger basuras de toda la casa', puntos: 15, frecuencia: 'diaria' },
    { id: 'tirar_basuras', nombre: 'Tirar basuras al contenedor', puntos: 15, frecuencia: 'diaria' },
    { id: 'papel_higienico', nombre: 'Comprobar papel higiénico', puntos: 5, frecuencia: 'diaria' }
  ]
};

const TAREAS_EXTRAS = [
  { id: 'regar_plantas', nombre: 'Regar plantas', puntos: 10 },
  { id: 'hacer_sofa', nombre: 'Hacer el sofá', puntos: 10 },
  { id: 'ordenar_cajones', nombre: 'Ordenar cajones del comedor', puntos: 15 },
  { id: 'ordenar_mesa', nombre: 'Ordenar mesa de trabajo propia', puntos: 10 },
  { id: 'ordenar_salon', nombre: 'Ordenar salón', puntos: 15 },
  { id: 'limpiar_cristales', nombre: 'Limpiar cristales', puntos: 25 },
  { id: 'ordenar_zapatos', nombre: 'Ordenar zapatos recibidor', puntos: 10 },
  { id: 'ordenar_habitacion', nombre: 'Ordenar habitación', puntos: 20 }
];

const PROYECTOS_CASA = [
  { id: 'pintar', nombre: 'Pintar pared/habitación', puntos: 150 },
  { id: 'mover_muebles', nombre: 'Mover muebles grandes', puntos: 80 },
  { id: 'montar_muebles', nombre: 'Montar muebles', puntos: 100 },
  { id: 'limpiar_fondo', nombre: 'Limpieza a fondo', puntos: 100 },
  { id: 'reparaciones', nombre: 'Pequeñas reparaciones', puntos: 50 },
  { id: 'organizar_trastero', nombre: 'Organizar trastero', puntos: 80 }
];

const PREMIOS = [
  { id: 'cena', nombre: 'Elegir cena', puntos: 300, descripcion: 'Una vez por semana' },
  { id: 'sin_tarea', nombre: 'Día sin una tarea', puntos: 500, descripcion: 'Selecciona cuál' },
  { id: 'salida', nombre: 'Salida especial', puntos: 800, descripcion: 'Cine, parque, etc.' },
  { id: 'invitar_amigo', nombre: 'Invitar amigo', puntos: 1200, descripcion: 'Con permiso' },
  { id: 'sin_nada', nombre: 'Día libre total', puntos: 5000, descripcion: 'Solo 1 vez al mes' }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [pin, setPin] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [tareasDelDia, setTareasDelDia] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [coberturas, setCoberturas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [tab, setTab] = useState('tareas');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [showProyecto, setShowProyecto] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: '', puntos: 100 });
  const [showPremios, setShowPremios] = useState(false);
  
  // Cargar datos en tiempo real
  useEffect(() => {
    const unsubUsuarios = onSnapshot(collection(db, 'hogar_usuarios'), (snapshot) => {
      setUsuarios(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const unsubTareas = onSnapshot(
      query(collection(db, 'hogar_tareas'), orderBy('fecha', 'desc')),
      (snapshot) => {
        setTareasDelDia(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubHistorial = onSnapshot(
      query(collection(db, 'hogar_historial'), orderBy('fecha', 'desc')),
      (snapshot) => {
        setHistorial(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubUsuarios();
      unsubTareas();
      unsubHistorial();
    };
  }, []);

  // Calcular nivel
  const getNivel = (puntos) => {
    for (let i = NIVELES.length - 1; i >= 0; i--) {
      if (puntos >= NIVELES[i].minPts) return NIVELES[i];
    }
    return NIVELES[0];
  };

  // Calcular progreso al siguiente nivel
  const getProgresoNivel = (puntos) => {
    const nivel = getNivel(puntos);
    const nextNivel = NIVELES.find(n => n.nivel === nivel.nivel + 1);
    if (!nextNivel) return 100;
    const progreso = ((puntos - nivel.minPts) / (nextNivel.minPts - nivel.minPts)) * 100;
    return Math.min(progreso, 100);
  };

  // Login con PIN
  const handleLogin = () => {
    const found = usuarios.find(u => u.pin === pin);
    if (found) {
      setUser(found);
      setPin('');
    } else {
      Alert.alert('Error', 'PIN incorrecto');
    }
  };

  // Crear usuario inicial
  const crearUsuarioInicial = async () => {
    const usuariosBase = [
      { nombre: 'Daniel', pin: '1234', puntos: 0, racha: 0, nivel: 1, responsabilidad: 'ropa', isAdmin: false },
      { nombre: 'Sergio', pin: '2345', puntos: 0, racha: 0, nivel: 1, responsabilidad: 'cocina', isAdmin: false },
      { nombre: 'Diego', pin: '3456', puntos: 0, racha: 0, nivel: 1, responsabilidad: 'lavabos', isAdmin: false },
      { nombre: 'Adulto', pin: '9999', puntos: 0, racha: 0, nivel: 1, responsabilidad: 'verificacion', isAdmin: true }
    ];
    
    for (const u of usuariosBase) {
      await addDoc(collection(db, 'hogar_usuarios'), {
        ...u,
        creado: new Date().toISOString()
      });
    }
    Alert.alert('✅', 'Usuarios creados');
  };

  // Marcar tarea completada
  const completarTarea = async (tarea) => {
    if (!user) return;
    
    const fechaHoy = new Date().toISOString().split('T')[0];
    const puntosConBonus = calcularPuntosConBonus(tarea.puntos);
    
    // Añadir al historial
    await addDoc(collection(db, 'hogar_historial'), {
      usuarioId: user.id,
      usuarioNombre: user.nombre,
      tareaId: tarea.id,
      tareaNombre: tarea.nombre,
      puntos: puntosConBonus,
      tipo: tarea.tipo || 'base',
      fecha: new Date().toISOString(),
      fechaDia: fechaHoy,
      estado: 'pendiente_verificacion'
    });
    
    Alert.alert('✅', `Tarea enviada a verificación (+${puntosConBonus} pts)`);
  };

  // Calcular puntos con bonus
  const calcularPuntosConBonus = (puntosBase) => {
    let puntos = puntosBase;
    
    // Bonus por racha
    if (user?.racha > 0) {
      puntos += Math.floor(puntosBase * 0.05 * Math.min(user.racha, 10));
    }
    
    // Bonus fin de semana
    const dia = new Date().getDay();
    if (dia === 0 || dia === 6) {
      puntos += Math.floor(puntosBase * 0.2);
    }
    
    return puntos;
  };

  // Verificar tarea (admin)
  const verificarTarea = async (tarea, aprobada) => {
    const usuario = usuarios.find(u => u.id === tarea.usuarioId);
    if (!usuario) return;
    
    if (aprobada) {
      // Sumar puntos
      await updateDoc(doc(db, 'hogar_usuarios', usuario.id), {
        puntos: usuario.puntos + tarea.puntos,
        racha: (usuario.racha || 0) + 1
      });
      
      // Actualizar estado
      await updateDoc(doc(db, 'hogar_historial', tarea.id), {
        estado: 'verificada'
      });
      
      Alert.alert('✅', `${tarea.puntos} puntos para ${usuario.nombre}`);
    } else {
      // Rechazar
      await updateDoc(doc(db, 'hogar_historial', tarea.id), {
        estado: 'rechazada'
      });
      Alert.alert('Rechazada', 'Tarea marcada como rechazada');
    }
  };

  // Canjear premio
  const canjearPremio = async (premio) => {
    if (!user) return;
    
    if (user.puntos < premio.puntos) {
      Alert.alert('Error', 'No tienes suficientes puntos');
      return;
    }
    
    Alert.alert(
      'Canjear premio',
      `¿Canjear "${premio.nombre}" por ${premio.puntos} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Canjear',
          onPress: async () => {
            await updateDoc(doc(db, 'hogar_usuarios', user.id), {
              puntos: user.puntos - premio.puntos
            });
            
            await addDoc(collection(db, 'hogar_historial'), {
              usuarioId: user.id,
              usuarioNombre: user.nombre,
              tipo: 'premio',
              premioNombre: premio.nombre,
              puntos: -premio.puntos,
              fecha: new Date().toISOString()
            });
            
            Alert.alert('🎉', `Premio canjeado: ${premio.nombre}`);
          }
        }
      ]
    );
  };

  // Obtener tareas del usuario actual
  const getMisTareas = () => {
    if (!user || user.isAdmin) return [];
    const fechaHoy = new Date().toISOString().split('T')[0];
    const misTareasBase = TAREAS_BASE[user.nombre.toLowerCase()] || [];
    
    return misTareasBase.map(t => {
      const completadaHoy = historial.find(h =>
        h.usuarioId === user.id &&
        h.tareaId === t.id &&
        h.fechaDia === fechaHoy &&
        h.estado !== 'rechazada'
      );
      return {
        ...t,
        completada: !!completadaHoy,
        estado: completadaHoy?.estado || 'pendiente'
      };
    });
  };

  // Obtener tareas pendientes de verificación
  const getTareasPendientes = () => {
    return historial.filter(h => h.estado === 'pendiente_verificacion');
  };

  // Ranking semanal
  const getRankingSemanal = () => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    
    return usuarios
      .filter(u => !u.isAdmin)
      .map(u => {
        const puntosSemana = historial
          .filter(h => h.usuarioId === u.id && new Date(h.fecha) >= inicioSemana && h.estado === 'verificada')
          .reduce((sum, h) => sum + (h.puntos || 0), 0);
        return { ...u, puntosSemana };
      })
      .sort((a, b) => b.puntosSemana - a.puntosSemana);
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
        <View style={styles.loadingContent}>
          <Text style={{ fontSize: 64 }}>🏠</Text>
          <Text style={styles.loadingText}>Cargando Hogar Tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla de login
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
        <KeyboardAvoidingView style={styles.container}>
          <View style={styles.loginContainer}>
            <Text style={styles.logoIcon}>🏠</Text>
            <Text style={styles.loginTitle}>Hogar Tasks</Text>
            <Text style={styles.loginSubtitle}>Introduce tu PIN</Text>
            
            <TextInput
              style={styles.pinInput}
              placeholder="PIN"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              value={pin}
              onChangeText={setPin}
            />
            
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
            
            {usuarios.length === 0 && (
              <TouchableOpacity style={styles.createButton} onPress={crearUsuarioInicial}>
                <Text style={styles.createButtonText}>Crear usuarios iniciales</Text>
              </TouchableOpacity>
            )}
            
            <Text style={styles.pinHint}>PINs: Daniel=1234, Sergio=2345, Diego=3456, Adulto=9999</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const misTareas = getMisTareas();
  const tareasPendientes = getTareasPendientes();
  const ranking = getRankingSemanal();
  const nivelActual = getNivel(user.puntos || 0);
  const progreso = getProgresoNivel(user.puntos || 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>{nivelActual.icono}</Text>
            <View>
              <Text style={styles.headerName}>{user.nombre}</Text>
              <Text style={styles.headerLevel}>Nivel {nivelActual.nivel}: {nivelActual.nombre}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerPoints}>{user.puntos || 0} pts</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => setUser(null)}
            >
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progreso}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {progreso.toFixed(0)}% para Nivel {nivelActual.nivel + 1}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'tareas' && styles.tabActive]}
            onPress={() => setTab('tareas')}
          >
            <Text style={[styles.tabText, tab === 'tareas' && styles.tabTextActive]}>📋 Tareas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'extras' && styles.tabActive]}
            onPress={() => setTab('extras')}
          >
            <Text style={[styles.tabText, tab === 'extras' && styles.tabTextActive]}>⭐ Extras</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'ranking' && styles.tabActive]}
            onPress={() => setTab('ranking')}
          >
            <Text style={[styles.tabText, tab === 'ranking' && styles.tabTextActive]}>🏆 Rank</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'tienda' && styles.tabActive]}
            onPress={() => setTab('tienda')}
          >
            <Text style={[styles.tabText, tab === 'tienda' && styles.tabTextActive]}>🎁 Tienda</Text>
          </TouchableOpacity>
          {user.isAdmin && (
            <TouchableOpacity
              style={[styles.tab, tab === 'admin' && styles.tabActive]}
              onPress={() => setTab('admin')}
            >
              <Text style={[styles.tabText, tab === 'admin' && styles.tabTextActive]}>👑 Admin</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Tab Tareas */}
          {tab === 'tareas' && !user.isAdmin && (
            <View style={styles.tabContent}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>📋 Mis tareas de hoy</Text>
                {misTareas.length === 0 ? (
                  <Text style={styles.emptyText}>No tienes tareas asignadas</Text>
                ) : (
                  misTareas.map(t => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.tareaCard, t.completada && styles.tareaCompletada]}
                      onPress={() => !t.completada && completarTarea(t)}
                      disabled={t.completada}
                    >
                      <View style={styles.tareaInfo}>
                        <Text style={styles.tareaNombre}>{t.nombre}</Text>
                        <Text style={styles.tareaFrecuencia}>{t.frecuencia}</Text>
                      </View>
                      <View style={styles.tareaDerecha}>
                        <Text style={styles.tareaPuntos}>+{t.puntos} pts</Text>
                        {t.completada ? (
                          <Text style={styles.tareaCheck}>✓ {t.estado}</Text>
                        ) : (
                          <Text style={styles.tareaBoton}>Hacer</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}

          {/* Tab Extras */}
          {tab === 'extras' && !user.isAdmin && (
            <View style={styles.tabContent}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>⭐ Tareas extras (+50% bonus)</Text>
                {TAREAS_EXTRAS.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.tareaCard}
                    onPress={() => completarTarea({ ...t, tipo: 'extra' })}
                  >
                    <View style={styles.tareaInfo}>
                      <Text style={styles.tareaNombre}>{t.nombre}</Text>
                      <Text style={styles.tareaExtra}>Voluntaria</Text>
                    </View>
                    <Text style={styles.tareaPuntosExtra}>+{Math.floor(t.puntos * 1.5)} pts</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🏠 Proyectos de casa</Text>
                {PROYECTOS_CASA.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.tareaCard}
                    onPress={() => completarTarea({ ...p, tipo: 'proyecto' })}
                  >
                    <View style={styles.tareaInfo}>
                      <Text style={styles.tareaNombre}>{p.nombre}</Text>
                      <Text style={styles.tareaFrecuencia}>Colaborativo</Text>
                    </View>
                    <Text style={styles.tareaPuntos}>+{p.puntos} pts</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Tab Ranking */}
          {tab === 'ranking' && (
            <View style={styles.tabContent}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🏆 Ranking semanal</Text>
                {ranking.map((u, i) => (
                  <View
                    key={u.id}
                    style={[styles.rankingItem, u.id === user.id && styles.rankingYo]}
                  >
                    <Text style={styles.rankingPos}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </Text>
                    <Text style={styles.rankingNombre}>{u.nombre}</Text>
                    <Text style={styles.rankingPuntos}>{u.puntosSemana} pts</Text>
                    {u.id === user.id && <Text style={styles.rankingTu}> (tú)</Text>}
                  </View>
                ))}
              </View>
              
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🔥 Tu racha</Text>
                <Text style={styles.rachaNum}>{user.racha || 0} días</Text>
                <Text style={styles.rachaBonus}>
                  Bonus: +{(Math.min(user.racha || 0, 10) * 5)}% por racha
                </Text>
              </View>
            </View>
          )}

          {/* Tab Tienda */}
          {tab === 'tienda' && !user.isAdmin && (
            <View style={styles.tabContent}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🎁 Tienda de puntos</Text>
                <Text style={styles.tusPuntos}>Tienes {user.puntos || 0} puntos</Text>
                
                {PREMIOS.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.premioCard, (user.puntos || 0) < p.puntos && styles.premioBloqueado]}
                    onPress={() => canjearPremio(p)}
                  >
                    <View style={styles.premioInfo}>
                      <Text style={styles.premioNombre}>{p.nombre}</Text>
                      <Text style={styles.premioDesc}>{p.descripcion}</Text>
                    </View>
                    <Text style={styles.premioPuntos}>{p.puntos} pts</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Tab Admin */}
          {tab === 'admin' && user.isAdmin && (
            <View style={styles.tabContent}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>👑 Verificar tareas</Text>
                {tareasPendientes.length === 0 ? (
                  <Text style={styles.emptyText}>No hay tareas pendientes</Text>
                ) : (
                  tareasPendientes.map(t => (
                    <View key={t.id} style={styles.verificarCard}>
                      <View style={styles.verificarInfo}>
                        <Text style={styles.verificarNombre}>{t.usuarioNombre}</Text>
                        <Text style={styles.verificarTarea}>{t.tareaNombre}</Text>
                        <Text style={styles.verificarPuntos}>+{t.puntos} pts</Text>
                      </View>
                      <View style={styles.verificarBotones}>
                        <TouchableOpacity
                          style={styles.btnVerificar}
                          onPress={() => verificarTarea(t, true)}
                        >
                          <Text style={styles.btnVerificarText}>✓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.btnRechazar}
                          onPress={() => verificarTarea(t, false)}
                        >
                          <Text style={styles.btnRechazarText}>✗</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
              
              <View style={styles.card}>
                <Text style={styles.cardTitle}>👥 Puntos de cada uno</Text>
                {usuarios.filter(u => !u.isAdmin).map(u => {
                  const nivel = getNivel(u.puntos || 0);
                  return (
                    <View key={u.id} style={styles.usuarioPuntos}>
                      <Text style={styles.usuarioNombrePuntos}>{nivel.icono} {u.nombre}</Text>
                      <Text style={styles.usuarioPuntosValor}>{u.puntos || 0} pts</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e293b'
  },
  container: {
    flex: 1,
    backgroundColor: '#1e293b'
  },
  loading: {
    flex: 1,
    backgroundColor: '#1e293b'
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#f1f5f9',
    fontSize: 18,
    marginTop: 16
  },
  
  // Login
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  loginTitle: {
    color: '#f1f5f9',
    fontSize: 32,
    fontWeight: '700'
  },
  loginSubtitle: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 32
  },
  pinInput: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    color: '#f1f5f9',
    fontSize: 24,
    textAlign: 'center',
    width: '100%',
    maxWidth: 200,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#475569'
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 16
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  createButton: {
    marginTop: 16
  },
  createButtonText: {
    color: '#64748b',
    fontSize: 14
  },
  pinHint: {
    color: '#475569',
    fontSize: 12,
    marginTop: 24
  },
  
  // Header
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerIcon: {
    fontSize: 36
  },
  headerName: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '600'
  },
  headerLevel: {
    color: '#64748b',
    fontSize: 12
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerPoints: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '700'
  },
  logoutButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  logoutText: {
    color: '#94a3b8',
    fontSize: 12
  },
  
  // Progress
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0f172a'
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981'
  },
  progressText: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center'
  },
  
  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center'
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#3b82f6'
  },
  tabText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#3b82f6'
  },
  
  // Content
  content: {
    flex: 1
  },
  tabContent: {
    padding: 16,
    gap: 12
  },
  
  // Card
  card: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 16
  },
  cardTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  
  // Tareas
  tareaCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569'
  },
  tareaCompletada: {
    backgroundColor: '#334155',
    borderColor: '#10b981'
  },
  tareaInfo: {
    flex: 1
  },
  tareaNombre: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '500'
  },
  tareaFrecuencia: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2
  },
  tareaDerecha: {
    alignItems: 'flex-end'
  },
  tareaPuntos: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700'
  },
  tareaPuntosExtra: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '700'
  },
  tareaBoton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4
  },
  tareaCheck: {
    color: '#10b981',
    fontSize: 12,
    marginTop: 4
  },
  tareaExtra: {
    color: '#fbbf24',
    fontSize: 12,
    marginTop: 2
  },
  
  // Ranking
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#475569'
  },
  rankingYo: {
    backgroundColor: '#3b82f620',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  rankingPos: {
    fontSize: 20,
    width: 40
  },
  rankingNombre: {
    color: '#f1f5f9',
    fontSize: 16,
    flex: 1
  },
  rankingPuntos: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700'
  },
  rankingTu: {
    color: '#64748b',
    fontSize: 12
  },
  rachaNum: {
    color: '#fbbf24',
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center'
  },
  rachaBonus: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center'
  },
  
  // Tienda
  tusPuntos: {
    color: '#10b981',
    fontSize: 14,
    marginBottom: 12
  },
  premioCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569'
  },
  premioBloqueado: {
    opacity: 0.5
  },
  premioInfo: {
    flex: 1
  },
  premioNombre: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '500'
  },
  premioDesc: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2
  },
  premioPuntos: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '700'
  },
  
  // Admin
  verificarCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569'
  },
  verificarInfo: {
    flex: 1
  },
  verificarNombre: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600'
  },
  verificarTarea: {
    color: '#f1f5f9',
    fontSize: 16,
    marginTop: 2
  },
  verificarPuntos: {
    color: '#10b981',
    fontSize: 14,
    marginTop: 4
  },
  verificarBotones: {
    flexDirection: 'row',
    gap: 8
  },
  btnVerificar: {
    backgroundColor: '#10b981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnVerificarText: {
    color: '#fff',
    fontSize: 20
  },
  btnRechazar: {
    backgroundColor: '#ef4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnRechazarText: {
    color: '#fff',
    fontSize: 20
  },
  usuarioPuntos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#475569'
  },
  usuarioNombrePuntos: {
    color: '#f1f5f9',
    fontSize: 16
  },
  usuarioPuntosValor: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700'
  },
  
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    padding: 20
  }
});