// ─────────────────────────────────────────────────────────
// TAREAS PERSONALES
// Cada usuario las tiene siempre en su lista, no se reparten.
// ─────────────────────────────────────────────────────────
export const TAREAS_PERSONALES = [
  // Hábitos diarios (con cronómetro)
  { id: 'lavarse_dientes', nombre: 'Lavarse los dientes',    puntos: 3,  frecuencia: 'diaria',          maxVeces: 3 },
  { id: 'ducha',           nombre: 'Ducha',                  puntos: 4,  frecuencia: 'diaria' },
  { id: 'ejercicio',       nombre: 'Ejercicio 30 minutos',   puntos: 6,  frecuencia: 'diaria' },
  { id: 'leer_30min',      nombre: 'Leer 30 minutos',        puntos: 5,  frecuencia: 'diaria' },
  // Higiene periódica (según necesidad, persiste hasta que se marca)
  { id: 'cortar_pelo',         nombre: 'Cortarse el pelo',            puntos: 15, frecuencia: 'segun_necesidad' },
  { id: 'cortar_uñas_manos',   nombre: 'Cortarse uñas de las manos', puntos: 5,  frecuencia: 'segun_necesidad' },
  { id: 'cortar_uñas_pies',    nombre: 'Cortarse uñas de los pies',  puntos: 5,  frecuencia: 'segun_necesidad' },
];

// ─────────────────────────────────────────────────────────
// POOL DE TAREAS DE CASA
// Se reparten aleatoriamente entre los 3 usuarios cada día.
// 39 tareas diarias (13 por usuario) + 3 segun_necesidad
// ─────────────────────────────────────────────────────────
export const TAREAS_CASA_POOL = [
  // — HABITACIONES ——————————————————————————————————
  { id: 'ropa_suelo',        nombre: 'Recoger ropa del suelo',              puntos: 10, frecuencia: 'diaria' },
  { id: 'hacer_cama_matrim', nombre: 'Hacer cama matrimonio',               puntos: 14, frecuencia: 'diaria' },
  { id: 'hacer_cama',        nombre: 'Hacer la cama',                       puntos: 3,  frecuencia: 'diaria' },
  { id: 'hacer_sofa',        nombre: 'Hacer el sofá',                       puntos: 10, frecuencia: 'diaria' },

  // — COCINA / COMEDOR ———————————————————————————————
  { id: 'poner_mesa',         nombre: 'Poner mesa',                         puntos: 3,  frecuencia: 'diaria', maxVeces: 3 },
  { id: 'quitar_mesa',        nombre: 'Quitar mesa',                        puntos: 3,  frecuencia: 'diaria', maxVeces: 3 },
  { id: 'cargar_lavavajillas',nombre: 'Cargar lavavajillas',                puntos: 3,  frecuencia: 'diaria' },
  { id: 'vaciar_lavavajillas',nombre: 'Vaciar lavavajillas',                puntos: 3,  frecuencia: 'diaria' },
  { id: 'limpiar_marmol',     nombre: 'Limpiar mármol',                     puntos: 4,  frecuencia: 'diaria' },
  { id: 'limpiar_tv',         nombre: 'Limpiar TV cocina',                  puntos: 2,  frecuencia: 'diaria' },
  { id: 'limpiar_fogones',    nombre: 'Limpiar fogones',                    puntos: 4,  frecuencia: 'diaria' },
  { id: 'limpiar_picas',      nombre: 'Limpiar picas',                      puntos: 4,  frecuencia: 'diaria' },
  { id: 'cargar_agua_cafe',   nombre: 'Cargar agua cafetera',               puntos: 2,  frecuencia: 'diaria' },
  { id: 'quitar_capsulas',    nombre: 'Quitar cápsulas cafetera',           puntos: 2,  frecuencia: 'diaria' },
  { id: 'tapers_mama',        nombre: 'Recoger tapers mamá y lavarlos',     puntos: 6,  frecuencia: 'diaria' },
  { id: 'tapers_yaya',        nombre: 'Lavar tapers yaya y prepararlos',    puntos: 6,  frecuencia: 'diaria' },
  { id: 'lista_compra',       nombre: 'Hacer lista de la compra',           puntos: 8,  frecuencia: 'diaria' },

  // — LAVABOS / BAÑOS ————————————————————————————————
  { id: 'mampara_cristal',         nombre: 'Limpiar cristal mampara ducha',        puntos: 3, frecuencia: 'diaria' },
  { id: 'recoger_alfombra',        nombre: 'Recoger alfombra lavabo grande',       puntos: 2, frecuencia: 'diaria' },
  { id: 'limpiar_suelo_grande',    nombre: 'Limpiar suelo lavabo grande',          puntos: 3, frecuencia: 'diaria' },
  { id: 'pica_pies',               nombre: 'Limpiar pica de los pies',             puntos: 2, frecuencia: 'diaria' },
  { id: 'pica_manos_grande',       nombre: 'Limpiar pica de manos lavabo grande',  puntos: 2, frecuencia: 'diaria' },
  { id: 'cristales_lavabo_grande', nombre: 'Limpiar cristales lavabo grande',      puntos: 2, frecuencia: 'diaria' },
  { id: 'cajones_lavabo_grande',   nombre: 'Ordenar cajones lavabo grande',        puntos: 2, frecuencia: 'diaria' },
  { id: 'limpiar_suelo_peque',     nombre: 'Limpiar suelo lavabo pequeño',         puntos: 3, frecuencia: 'diaria' },
  { id: 'pica_manos_peque',        nombre: 'Limpiar pica de manos lavabo pequeño', puntos: 2, frecuencia: 'diaria' },
  { id: 'cristales_lavabo_peque',  nombre: 'Limpiar cristales lavabo pequeño',     puntos: 2, frecuencia: 'diaria' },
  { id: 'cajones_lavabo_peque',    nombre: 'Ordenar cajones lavabo pequeño',       puntos: 2, frecuencia: 'diaria' },
  { id: 'rellenar_papel',          nombre: 'Rellenar papel higiénico',             puntos: 2, frecuencia: 'diaria' },
  { id: 'rellenar_jabon',          nombre: 'Rellenar jabón de manos',              puntos: 2, frecuencia: 'diaria' },

  // — CASA GENERAL ———————————————————————————————————
  { id: 'recoger_basuras',     nombre: 'Recoger basuras de toda la casa', puntos: 3,  frecuencia: 'diaria' },
  { id: 'tirar_basuras',       nombre: 'Tirar basuras al contenedor',     puntos: 3,  frecuencia: 'diaria' },
  { id: 'subir_persianas',     nombre: 'Subir persianas por la mañana',   puntos: 2,  frecuencia: 'diaria' },
  { id: 'bajar_persianas',     nombre: 'Bajar persianas por la noche',    puntos: 2,  frecuencia: 'diaria' },
  { id: 'echar_llave',         nombre: 'Echar la llave',                  puntos: 2,  frecuencia: 'diaria' },
  { id: 'rellenar_botellas',   nombre: 'Rellenar todas las botellas',     puntos: 5,  frecuencia: 'diaria' },
  { id: 'subir_sillas_cocina', nombre: 'Subir sillas cocina',             puntos: 3,  frecuencia: 'diaria' },
  { id: 'ordenar_mesa_trabajo',nombre: 'Ordenar mesa de trabajo propia',  puntos: 5,  frecuencia: 'diaria' },
  { id: 'ordenar_casa',        nombre: 'Ordenar casa',                    puntos: 8,  frecuencia: 'diaria' },

  // — SEGÚN NECESIDAD (pasan a otro usuario al completar) ——————
  { id: 'compra_descarga',  nombre: 'Descargar compra, colgar carro y ordenar bolsas',                              puntos: 15, frecuencia: 'segun_necesidad' },
  { id: 'ciclo_lavadora',   nombre: 'Poner lavadora, quitar lavadora y poner secadora',                             puntos: 25, frecuencia: 'segun_necesidad' },
  { id: 'colada_completa',  nombre: 'Separar ropa, revisar toallas, doblar ropa, colocar en armario y quitar secadora', puntos: 35, frecuencia: 'segun_necesidad' },
];

// ─────────────────────────────────────────────────────────
// TAREAS EXTRAS
// Voluntarias. Cualquiera puede hacerlas para obtener puntos extra.
// ─────────────────────────────────────────────────────────
export const TAREAS_EXTRAS = [
  { id: 'ordenar_cajones',      nombre: 'Ordenar cajones del comedor',  puntos: 15 },
  { id: 'regar_plantas',        nombre: 'Regar plantas',                puntos: 10 },
  { id: 'limpiar_cristales',    nombre: 'Limpiar cristales (ventanas)', puntos: 25 },
  { id: 'ordenar_zapatos',      nombre: 'Ordenar zapatos recibidor',    puntos: 10 },
  { id: 'ordenar_habitacion',   nombre: 'Ordenar habitación',           puntos: 20 },
  { id: 'limpiar_zapatos_botas',nombre: 'Limpiar zapatos y botas',      puntos: 10 },
];

export const PROYECTOS_CASA = [
  { id: 'pintar',              nombre: 'Pintar pared/habitación',   puntos: 150 },
  { id: 'mover_muebles',       nombre: 'Mover muebles grandes',     puntos: 80 },
  { id: 'montar_muebles',      nombre: 'Montar muebles',            puntos: 100 },
  { id: 'limpiar_fondo',       nombre: 'Limpieza a fondo',          puntos: 100 },
  { id: 'reparaciones',        nombre: 'Pequeñas reparaciones',     puntos: 50 },
  { id: 'organizar_trastero',  nombre: 'Organizar trastero',        puntos: 80 },
];

// Lista de nombres de usuario (lowercase) usados en Firestore
export const USUARIOS_NOMBRES = ['daniel', 'sergio', 'diego'];
