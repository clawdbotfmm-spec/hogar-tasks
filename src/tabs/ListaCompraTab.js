import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/colors';

export const ListaCompraTab = ({
  user,
  listaCompra,
  onAgregar,
  onMarcarComprado,
  onEliminar,
  onLimpiarComprados,
}) => {
  const [texto, setTexto] = useState('');

  const pendientes = listaCompra.filter(p => !p.comprado);
  const comprados  = listaCompra.filter(p => p.comprado);

  const handleAgregar = () => {
    const limpio = texto.trim();
    if (!limpio) return;
    onAgregar(limpio, user);
    setTexto('');
  };

  const handleLimpiar = () => {
    if (comprados.length === 0) return;
    Alert.alert(
      '🗑️ Limpiar comprados',
      `¿Borrar los ${comprados.length} productos ya comprados?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: onLimpiarComprados },
      ]
    );
  };

  return (
    <View style={styles.tabContent}>
      {/* Campo para añadir */}
      <View style={styles.inputCard}>
        <Text style={styles.cardTitle}>🛒 Lista de la compra</Text>
        <Text style={styles.hint}>
          Compartida en tiempo real. Todos ven lo mismo.
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Añadir producto..."
            placeholderTextColor={COLORS.textMuted}
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={handleAgregar}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAgregar}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Productos pendientes */}
      <View style={styles.card}>
        <Text style={styles.seccionTitulo}>
          📋 Por comprar ({pendientes.length})
        </Text>
        {pendientes.length === 0 ? (
          <Text style={styles.empty}>La lista está vacía</Text>
        ) : (
          pendientes.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.productoRow}
              onPress={() => onMarcarComprado(p.id, true)}
            >
              <View style={styles.checkbox} />
              <View style={styles.productoInfo}>
                <Text style={styles.productoNombre}>{p.nombre}</Text>
                <Text style={styles.productoMeta}>
                  Añadido por {p.agregadoPor}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onEliminar(p.id)}
              >
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Productos comprados */}
      {comprados.length > 0 && (
        <View style={styles.card}>
          <View style={styles.compradosHeader}>
            <Text style={styles.seccionTitulo}>
              ✅ Comprado ({comprados.length})
            </Text>
            <TouchableOpacity style={styles.limpiarBtn} onPress={handleLimpiar}>
              <Text style={styles.limpiarBtnText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
          {comprados.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.productoRow}
              onPress={() => onMarcarComprado(p.id, false)}
            >
              <View style={styles.checkboxDone}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
              <View style={styles.productoInfo}>
                <Text style={styles.productoNombreDone}>{p.nombre}</Text>
                <Text style={styles.productoMeta}>
                  Añadido por {p.agregadoPor}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onEliminar(p.id)}
              >
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: { padding: 16, gap: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },
  inputCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.cardInner,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addBtn: {
    backgroundColor: COLORS.green,
    width: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  seccionTitulo: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  empty: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },

  // Producto
  productoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
  },
  checkboxDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  productoInfo: { flex: 1 },
  productoNombre: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  productoNombreDone: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textDecorationLine: 'line-through',
  },
  productoMeta: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.cardInner,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { color: COLORS.textSecondary, fontSize: 12 },

  // Comprados header
  compradosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limpiarBtn: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  limpiarBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
