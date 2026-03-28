import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import {
  LOGROS_GLOBALES,
  LOGROS_CATEGORIA,
  LOGROS_CONSTANCIA,
} from '../constants/logros';
import { useLogros, getLogrosConEstado } from '../hooks/useLogros';

const FILTROS = [
  { key: 'todos',       label: 'Todos' },
  { key: 'global',      label: 'Global' },
  { key: 'categoria',   label: 'Categoría' },
  { key: 'constancia',  label: 'Constancia' },
];

const LogroCard = ({ logro }) => {
  const desbloqueado = logro.desbloqueado;
  return (
    <View style={[styles.logroCard, desbloqueado && styles.logroDesbloqueado]}>
      <Text style={styles.logroIcono}>{desbloqueado ? logro.icono : '🔒'}</Text>
      <View style={styles.logroInfo}>
        <Text style={[styles.logroNombre, !desbloqueado && styles.logroBloqueado]}>
          {logro.nombre}
        </Text>
        <Text style={styles.logroDesc}>{logro.descripcion}</Text>
      </View>
      {desbloqueado && <Text style={styles.logroCheck}>✅</Text>}
    </View>
  );
};

const ProgressBar = ({ valor, max, label }) => {
  const pct = Math.min((valor / max) * 100, 100);
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{valor} / {max}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
};

export const LogrosTab = ({ user, historial }) => {
  const [filtro, setFiltro] = useState('todos');
  const { lpTotal, lpPorCategoria, diasSeguidos, logrosDesbloqueados } =
    useLogros(user.id, historial);

  const todosConEstado = getLogrosConEstado(logrosDesbloqueados);
  const totalLogros = todosConEstado.length;
  const totalDesbloqueados = logrosDesbloqueados.length;

  // Filtrar según tab seleccionado
  let logrosFiltrados;
  if (filtro === 'global') {
    logrosFiltrados = todosConEstado.filter(l => LOGROS_GLOBALES.some(g => g.id === l.id));
  } else if (filtro === 'categoria') {
    logrosFiltrados = todosConEstado.filter(l => LOGROS_CATEGORIA.some(g => g.id === l.id));
  } else if (filtro === 'constancia') {
    logrosFiltrados = todosConEstado.filter(l => LOGROS_CONSTANCIA.some(g => g.id === l.id));
  } else {
    logrosFiltrados = todosConEstado;
  }

  // Siguiente logro global por desbloquear
  const siguienteGlobal = LOGROS_GLOBALES.find(l => lpTotal < l.lp);

  // Siguiente logro de constancia
  const siguienteConst = LOGROS_CONSTANCIA.find(l => diasSeguidos < l.dias);

  return (
    <View style={styles.tabContent}>

      {/* Resumen */}
      <View style={styles.resumenCard}>
        <View style={styles.resumenRow}>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenNum}>{lpTotal}</Text>
            <Text style={styles.resumenLabel}>LP totales</Text>
          </View>
          <View style={styles.resumenDivider} />
          <View style={styles.resumenItem}>
            <Text style={styles.resumenNumDias}>{diasSeguidos}</Text>
            <Text style={styles.resumenLabel}>Días seguidos</Text>
          </View>
          <View style={styles.resumenDivider} />
          <View style={styles.resumenItem}>
            <Text style={styles.resumenNumLogros}>{totalDesbloqueados}/{totalLogros}</Text>
            <Text style={styles.resumenLabel}>Logros</Text>
          </View>
        </View>
      </View>

      {/* Siguiente objetivo */}
      {siguienteGlobal && (
        <ProgressBar
          valor={lpTotal}
          max={siguienteGlobal.lp}
          label={`${siguienteGlobal.icono} ${siguienteGlobal.nombre}`}
        />
      )}
      {siguienteConst && (
        <ProgressBar
          valor={diasSeguidos}
          max={siguienteConst.dias}
          label={`${siguienteConst.icono} ${siguienteConst.nombre}`}
        />
      )}

      {/* Filtros */}
      <View style={styles.filtroRow}>
        {FILTROS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtroBtn, filtro === f.key && styles.filtroBtnActive]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[styles.filtroText, filtro === f.key && styles.filtroTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de logros */}
      <View style={styles.card}>
        {logrosFiltrados.map(l => (
          <LogroCard key={l.id} logro={l} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: { padding: 16, gap: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },

  // Resumen
  resumenCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.purple,
  },
  resumenRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resumenItem: { alignItems: 'center', flex: 1 },
  resumenNum: { color: COLORS.purple, fontSize: 28, fontWeight: '700' },
  resumenNumDias: { color: COLORS.yellow, fontSize: 28, fontWeight: '700' },
  resumenNumLogros: { color: COLORS.green, fontSize: 28, fontWeight: '700' },
  resumenLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },
  resumenDivider: { width: 1, height: 36, backgroundColor: COLORS.border },

  // Progress
  progressWrap: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  progressValue: { color: COLORS.textSecondary, fontSize: 13 },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.cardInner,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: 4,
  },

  // Filtros
  filtroRow: { flexDirection: 'row', gap: 8 },
  filtroBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  filtroBtnActive: { backgroundColor: COLORS.purple },
  filtroText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  filtroTextActive: { color: '#fff' },

  // Logro card
  logroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logroDesbloqueado: {},
  logroIcono: { fontSize: 28, width: 40, textAlign: 'center' },
  logroInfo: { flex: 1, marginLeft: 8 },
  logroNombre: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  logroBloqueado: { color: COLORS.textMuted },
  logroDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  logroCheck: { fontSize: 18 },
});
