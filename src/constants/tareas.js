// ─────────────────────────────────────────────────────────
// SISTEMA DE PUNTOS:
// 1 pt = micro (30 seg)  |  2 pts = rápida (1-3 min)
// 3 pts = media (5 min)  |  5 pts = larga (10-15 min)
// 8 pts = pesada (20+ min) | +1/+2 si es desagradable
//
// TAREAS LIBRES: quien la hace primero se lleva los puntos
// ─────────────────────────────────────────────────────────

// ── COCINA — CADA DÍA ───────────────────────────────────
export const COCINA_DIARIA = [
  { id: 'poner_mesa',           nombre: 'Poner mesa cocina',                puntos: 2, frecuencia: 'diaria', maxVeces: 3, categoria: 'cocina' },
  { id: 'recoger_mesa',         nombre: 'Recoger mesa cocina',              puntos: 2, frecuencia: 'diaria', maxVeces: 3, categoria: 'cocina' },
  { id: 'llenar_botellas',      nombre: 'Llenar todas las botellas de agua',puntos: 3, frecuencia: 'diaria', categoria: 'cocina' },
  { id: 'cafetera',             nombre: 'Cafetera (llenar/vaciar)',         puntos: 2, frecuencia: 'diaria', categoria: 'cocina' },
  { id: 'recoger_basuras',      nombre: 'Recoger basuras',                  puntos: 2, frecuencia: 'diaria', categoria: 'cocina' },
  { id: 'poner_lavavajillas',   nombre: 'Poner el lavavajillas',            puntos: 3, frecuencia: 'diaria', categoria: 'cocina' },
  { id: 'quitar_lavavajillas',  nombre: 'Quitar lavavajillas',              puntos: 3, frecuencia: 'diaria', categoria: 'cocina' },
  { id: 'limpiar_marmol',       nombre: 'Limpiar mármol',                   puntos: 3, frecuencia: 'diaria', categoria: 'cocina' },
  { id: 'limpiar_fogones',      nombre: 'Limpiar fogones',                  puntos: 3, frecuencia: 'diaria', categoria: 'cocina' },
  { id: 'limpiar_fregadero',    nombre: 'Limpiar fregadero',                puntos: 3, frecuencia: 'diaria', categoria: 'cocina' },
  { id: 'subir_sillas',         nombre: 'Subir sillas cocina',              puntos: 2, frecuencia: 'diaria', categoria: 'cocina' },
];

// ── COCINA — NO CADA DÍA ────────────────────────────────
export const COCINA_OCASIONAL = [
  { id: 'tirar_basura',            nombre: 'Tirar basura al contenedor',    puntos: 3, frecuencia: 'segun_necesidad', categoria: 'cocina' },
  { id: 'ordenar_armario_puerta',  nombre: 'Ordenar armario detrás puerta', puntos: 5, frecuencia: 'segun_necesidad', categoria: 'cocina' },
  { id: 'limpiar_cajones_cocina',  nombre: 'Limpiar cajones de la cocina',  puntos: 5, frecuencia: 'segun_necesidad', categoria: 'cocina' },
  { id: 'limpiar_armarios_cocina', nombre: 'Limpiar armarios de la cocina', puntos: 8, frecuencia: 'segun_necesidad', categoria: 'cocina' },
  { id: 'limpiar_armario_botes',   nombre: 'Limpiar armario botes',         puntos: 5, frecuencia: 'segun_necesidad', categoria: 'cocina' },
  { id: 'colocar_compra',          nombre: 'Colocar comida de la compra',   puntos: 5, frecuencia: 'segun_necesidad', categoria: 'cocina' },
  { id: 'colgar_carro',            nombre: 'Colgar el carro de la compra',  puntos: 2, frecuencia: 'segun_necesidad', categoria: 'cocina' },
  { id: 'limpiar_tv_cocina',       nombre: 'Limpiar TV cocina',             puntos: 2, frecuencia: 'segun_necesidad', categoria: 'cocina' },
  { id: 'limpiar_microondas',      nombre: 'Limpiar microondas',            puntos: 3, frecuencia: 'segun_necesidad', categoria: 'cocina' },
  { id: 'limpiar_nevera',          nombre: 'Limpiar nevera',                puntos: 5, frecuencia: 'segun_necesidad', categoria: 'cocina' },
];

// ── CASA GENERAL — CADA DÍA ─────────────────────────────
export const CASA_DIARIA = [
  { id: 'hacer_cama_matrim', nombre: 'Hacer cama matrimonio',       puntos: 3, frecuencia: 'diaria', maxVeces: 2, categoria: 'casa' },
  { id: 'echar_llave',      nombre: 'Echar la llave por la noche', puntos: 1, frecuencia: 'diaria', categoria: 'casa' },
  { id: 'subir_persianas',  nombre: 'Subir persianas',             puntos: 2, frecuencia: 'diaria', categoria: 'casa' },
  { id: 'cerrar_persianas', nombre: 'Cerrar persianas',            puntos: 2, frecuencia: 'diaria', categoria: 'casa' },
];

// ── CASA GENERAL — NO CADA DÍA ──────────────────────────
export const CASA_OCASIONAL = [
  { id: 'ordenar_armario_daniel',  nombre: 'Ordenar armario Daniel',      puntos: 8, frecuencia: 'segun_necesidad', categoria: 'casa' },
  { id: 'ordenar_armario_ds',      nombre: 'Ordenar armario Diego/Sergio',puntos: 8, frecuencia: 'segun_necesidad', categoria: 'casa' },
  { id: 'ordenar_armario_matrim',  nombre: 'Ordenar armario matrimonio',  puntos: 8, frecuencia: 'segun_necesidad', categoria: 'casa' },
  { id: 'ordenar_armario_mochilas',nombre: 'Ordenar armario mochilas',    puntos: 5, frecuencia: 'segun_necesidad', categoria: 'casa' },
  { id: 'cambiar_sabanas',        nombre: 'Cambiar sábanas cama',        puntos: 5, frecuencia: 'segun_necesidad', categoria: 'casa' },
  { id: 'regar_plantas',          nombre: 'Regar plantas',               puntos: 3, frecuencia: 'segun_necesidad', categoria: 'casa' },
  { id: 'limpiar_cristales_vent', nombre: 'Limpiar cristales/ventanas',  puntos: 8, frecuencia: 'segun_necesidad', categoria: 'casa' },
];

// ── LAVABOS — CADA DÍA (x2 baños) ──────────────────────
export const LAVABOS_DIARIA = [
  { id: 'tirar_cadena',          nombre: 'Tirar de las cadenas del wáter', puntos: 1, frecuencia: 'diaria', maxVeces: 2, categoria: 'lavabos' },
  { id: 'limpiar_water',         nombre: 'Limpiar wáter',                  puntos: 4, frecuencia: 'diaria', maxVeces: 2, categoria: 'lavabos' },
  { id: 'limpiar_bide',          nombre: 'Limpiar bidé',                   puntos: 4, frecuencia: 'diaria', maxVeces: 2, categoria: 'lavabos' },
  { id: 'revisar_toallas',       nombre: 'Revisar/cambiar toallas',        puntos: 2, frecuencia: 'diaria', maxVeces: 2, categoria: 'lavabos' },
];

// ── LAVABOS — NO CADA DÍA ───────────────────────────────
export const LAVABOS_OCASIONAL = [
  { id: 'limpiar_espejo_lav',   nombre: 'Limpiar espejo lavabo',      puntos: 3, frecuencia: 'segun_necesidad', categoria: 'lavabos' },
  { id: 'limpiar_suelo_lav',    nombre: 'Limpiar suelo lavabo',       puntos: 3, frecuencia: 'segun_necesidad', categoria: 'lavabos' },
  { id: 'reponer_papel',        nombre: 'Reponer papel higiénico',    puntos: 1, frecuencia: 'segun_necesidad', categoria: 'lavabos' },
  { id: 'reponer_jabon',        nombre: 'Reponer jabón/gel',          puntos: 1, frecuencia: 'segun_necesidad', categoria: 'lavabos' },
  { id: 'revision_bat_basuras', nombre: 'Revisión batería basuras',   puntos: 2, frecuencia: 'segun_necesidad', categoria: 'lavabos' },
  { id: 'revision_bat_luces',   nombre: 'Revisión baterías de luces', puntos: 2, frecuencia: 'segun_necesidad', categoria: 'lavabos' },
  { id: 'ordenar_cajones_lav',  nombre: 'Ordenar cajones lavabos',    puntos: 5, frecuencia: 'segun_necesidad', categoria: 'lavabos' },
];

// ── LAVANDERÍA ───────────────────────────────────────────
export const LAVANDERIA = [
  { id: 'separar_ropa',         nombre: 'Separar la ropa',                puntos: 3, frecuencia: 'segun_necesidad', categoria: 'lavanderia' },
  { id: 'poner_lavadora',       nombre: 'Poner la lavadora',              puntos: 2, frecuencia: 'segun_necesidad', categoria: 'lavanderia' },
  { id: 'quitar_lavadora',      nombre: 'Quitar la lavadora',             puntos: 2, frecuencia: 'segun_necesidad', categoria: 'lavanderia' },
  { id: 'poner_secadora',       nombre: 'Poner la secadora',              puntos: 2, frecuencia: 'segun_necesidad', categoria: 'lavanderia' },
  { id: 'quitar_secadora',      nombre: 'Quitar la secadora',             puntos: 2, frecuencia: 'segun_necesidad', categoria: 'lavanderia' },
  { id: 'tender_ropa',          nombre: 'Tender la ropa',                 puntos: 5, frecuencia: 'segun_necesidad', categoria: 'lavanderia' },
  { id: 'quitar_ropa_tender',   nombre: 'Quitar la ropa de tender',       puntos: 3, frecuencia: 'segun_necesidad', categoria: 'lavanderia' },
  { id: 'doblar_ropa',          nombre: 'Doblar la ropa',                 puntos: 5, frecuencia: 'segun_necesidad', categoria: 'lavanderia' },
  { id: 'llevar_ordenar_ropa',  nombre: 'Llevar y ordenar ropa en armarios', puntos: 5, frecuencia: 'segun_necesidad', categoria: 'lavanderia' },
];

// ── ROBOT SUELO ──────────────────────────────────────────
export const ROBOT_SUELO = [
  { id: 'subir_sillas_comedor',  nombre: 'Subir sillas comedor',              puntos: 2, frecuencia: 'diaria', categoria: 'robot' },
  { id: 'subir_cosas_suelo',     nombre: 'Subir cosas del suelo',             puntos: 2, frecuencia: 'diaria', categoria: 'robot' },
  { id: 'rellenar_vaciar_robot', nombre: 'Rellenar/vaciar agua del robot',    puntos: 3, frecuencia: 'segun_necesidad', categoria: 'robot' },
  { id: 'limpiar_robot',         nombre: 'Limpiar robot del suelo',           puntos: 3, frecuencia: 'segun_necesidad', categoria: 'robot' },
  { id: 'vaciar_deposito_robot', nombre: 'Vaciar depósito de polvo del robot',puntos: 2, frecuencia: 'segun_necesidad', categoria: 'robot' },
  { id: 'cambiar_repuestos_robot', nombre: 'Cambiar repuestos del robot',     puntos: 5, frecuencia: 'segun_necesidad', categoria: 'robot' },
];

// ── TAPERS ───────────────────────────────────────────────
export const TAPERS = [
  { id: 'recoger_tapers_mama',  nombre: 'Recoger tapers mamá',          puntos: 2, frecuencia: 'diaria', categoria: 'tapers' },
  { id: 'lavar_tapers_mama',    nombre: 'Lavar tapers mamá',            puntos: 3, frecuencia: 'diaria', categoria: 'tapers' },
  { id: 'preparar_tapers_yaya', nombre: 'Preparar tapers yaya',         puntos: 3, frecuencia: 'diaria', categoria: 'tapers' },
  { id: 'llevar_tapers_yaya',   nombre: 'Ir a llevar tapers a la yaya', puntos: 5, frecuencia: 'diaria', categoria: 'tapers' },
];

// ── PERSONALES ───────────────────────────────────────────
export const TAREAS_PERSONALES = [
  // Diarias
  { id: 'hacer_mi_cama',      nombre: 'Hacer mi cama',                puntos: 2, frecuencia: 'diaria', categoria: 'personal' },
  { id: 'colocar_pijama',     nombre: 'Colocar pijama',               puntos: 1, frecuencia: 'diaria', categoria: 'personal' },
  { id: 'recoger_ropa_suelo', nombre: 'Recoger ropa del suelo',       puntos: 2, frecuencia: 'diaria', categoria: 'personal' },
  { id: 'ordenar_mochilas',   nombre: 'Ordenar mi mochila',           puntos: 2, frecuencia: 'diaria', categoria: 'personal' },
  { id: 'preparar_cole',      nombre: 'Preparar material/ropa para el cole', puntos: 2, frecuencia: 'diaria', categoria: 'personal' },
  { id: 'lavarse_dientes',    nombre: 'Lavarse los dientes',          puntos: 2, frecuencia: 'diaria', maxVeces: 3, categoria: 'personal' },
  { id: 'ducha',              nombre: 'Ducha + limpiar ducha',        puntos: 5, frecuencia: 'diaria', categoria: 'personal' },
  { id: 'hacer_deberes',      nombre: 'Hacer deberes',                puntos: 5, frecuencia: 'diaria', categoria: 'personal' },
  { id: 'estudiar',           nombre: 'Estudiar',                     puntos: 5, frecuencia: 'diaria', categoria: 'personal' },
  { id: 'ejercicio',          nombre: 'Ejercicio 30 minutos',         puntos: 5, frecuencia: 'diaria', categoria: 'personal' },
  { id: 'leer_30min',         nombre: 'Leer 30 minutos',              puntos: 5, frecuencia: 'diaria', categoria: 'personal' },
  // Ocasionales
  { id: 'limpiar_escritorio', nombre: 'Limpiar escritorio',            puntos: 3, frecuencia: 'segun_necesidad', categoria: 'personal' },
  { id: 'cortar_pelo',        nombre: 'Cortarse el pelo',             puntos: 8, frecuencia: 'segun_necesidad', categoria: 'personal' },
  { id: 'cortar_unas',        nombre: 'Cortarse las uñas',            puntos: 4, frecuencia: 'segun_necesidad', categoria: 'personal' },
  { id: 'preparar_excursion', nombre: 'Preparar mochila para excursión', puntos: 5, frecuencia: 'segun_necesidad', categoria: 'personal' },
];

// ── EXTRAS (voluntarias, puntos bonus) ───────────────────
export const TAREAS_EXTRAS = [
  { id: 'ordenar_cajones_comedor', nombre: 'Ordenar cajones comedor',      puntos: 10, categoria: 'extra' },
  { id: 'ordenar_zapatos',         nombre: 'Ordenar zapatos recibidor',    puntos: 5,  categoria: 'extra' },
  { id: 'limpiar_zapatos',         nombre: 'Limpiar zapatos y botas',      puntos: 5,  categoria: 'extra' },
  { id: 'ayudar_mover_muebles',    nombre: 'Ayudar a mover muebles',      puntos: 10, categoria: 'extra' },
  { id: 'limpieza_fondo',          nombre: 'Ayudar en limpieza a fondo',   puntos: 15, categoria: 'extra' },
  { id: 'organizar_trastero',      nombre: 'Organizar trastero',           puntos: 15, categoria: 'extra' },
];

// ── AGRUPACIONES ─────────────────────────────────────────
export const TODAS_TAREAS_CASA = [
  ...COCINA_DIARIA, ...COCINA_OCASIONAL,
  ...CASA_DIARIA, ...CASA_OCASIONAL,
  ...LAVABOS_DIARIA, ...LAVABOS_OCASIONAL,
  ...LAVANDERIA, ...ROBOT_SUELO, ...TAPERS,
];

export const SECCIONES_TAREAS = [
  { key: 'cocina_diaria',     titulo: '🍳 Cocina — Cada día',       tareas: COCINA_DIARIA },
  { key: 'cocina_ocasional',  titulo: '🍳 Cocina — Cuando toque',   tareas: COCINA_OCASIONAL },
  { key: 'casa_diaria',       titulo: '🏠 Casa — Cada día',         tareas: CASA_DIARIA },
  { key: 'casa_ocasional',    titulo: '🏠 Casa — Cuando toque',     tareas: CASA_OCASIONAL },
  { key: 'lavabos_diaria',    titulo: '🚿 Lavabos — Cada día (x2)', tareas: LAVABOS_DIARIA },
  { key: 'lavabos_ocasional', titulo: '🚿 Lavabos — Cuando toque',  tareas: LAVABOS_OCASIONAL },
  { key: 'lavanderia',        titulo: '👕 Lavandería',               tareas: LAVANDERIA },
  { key: 'robot',             titulo: '🤖 Robot suelo',              tareas: ROBOT_SUELO },
  { key: 'tapers',            titulo: '🍱 Tapers',                   tareas: TAPERS },
];

export const CATEGORIAS = {
  cocina:     { nombre: 'Cocina',      icono: '🍳' },
  casa:       { nombre: 'Casa',        icono: '🏠' },
  lavabos:    { nombre: 'Lavabos',     icono: '🚿' },
  lavanderia: { nombre: 'Lavandería',  icono: '👕' },
  robot:      { nombre: 'Robot suelo', icono: '🤖' },
  tapers:     { nombre: 'Tapers',      icono: '🍱' },
  personal:   { nombre: 'Personal',    icono: '🧑' },
  extra:      { nombre: 'Extras',      icono: '⭐' },
};

// Hora a la que salta el aviso de personales pendientes (24h format)
export const HORA_AVISO = 20; // 20:00
