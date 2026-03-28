import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import {
  PREMIOS,
  CATEGORIAS_PREMIOS,
  BOOSTERS,
  BOOSTERS_ESPECIALES,
} from '../constants/tienda';
import { getBoosterActivo } from '../hooks/useBoosters';

export const TiendaTab = ({
  user,
  onCanjearPremio,
  onComprarBooster,
  onComprarBoosterEspecial,
}) => {
  const boosterActivo = getBoosterActivo(user);

  return (
    <View style={styles.tabContent}>

      {/* Puntos disponibles */}
      <View style={styles.puntosCard}>
        <Text style={styles.puntosTitle}>💰 Tus puntos</Text>
        <Text style={styles.puntosNum}>{user.puntos || 0}</Text>
        <Text style={styles.puntosHint}>
          Los puntos por encima del mínimo diario se acumulan aquí
        </Text>
      </View>

      {/* Booster activo */}
      {boosterActivo && (
        <View style={styles.boosterActivoCard}>
          <Text style={styles.boosterActivoIcon}>
            {BOOSTERS.find(b => b.id === boosterActivo.id)?.icono || '⚡'}
          </Text>
          <View style={styles.boosterActivoInfo}>
            <Text style={styles.boosterActivoNombre}>{boosterActivo.nombre} ACTIVO</Text>
            <Text style={styles.boosterActivoMult}>x{boosterActivo.multiplicador} multiplicador</Text>
          </View>
        </View>
      )}

      {/* Premios por categoría */}
      {CATEGORIAS_PREMIOS.map(cat => {
        const premiosCat = PREMIOS.filter(p => p.categoria === cat.key);
        if (premiosCat.length === 0) return null;

        return (
          <View key={cat.key} style={styles.card}>
            <Text style={styles.cardTitle}>{cat.titulo}</Text>
            {premiosCat.map(p => {
              const puedeComprar = (user.puntos || 0) >= p.puntos;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.premioCard, !puedeComprar && styles.bloqueado]}
                  onPress={() => onCanjearPremio(p)}
                >
                  <View style={styles.premioLeft}>
                    <Text style={styles.premioIcon}>{p.icono}</Text>
                    <View style={styles.premioInfo}>
                      <Text style={styles.premioNombre}>{p.nombre}</Text>
                      <Text style={styles.premioDesc}>{p.descripcion}</Text>
                    </View>
                  </View>
                  <View style={styles.premioRight}>
                    <Text style={[styles.premioPts, puedeComprar && styles.premioPtsOk]}>
                      {p.puntos} pts
                    </Text>
                    {!puedeComprar && (
                      <Text style={styles.faltanPts}>
                        Faltan {p.puntos - (user.puntos || 0)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}

      {/* Boosters de puntos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Boosters de Puntos</Text>
        {BOOSTERS.map(b => {
          const puedeComprar = (user.puntos || 0) >= b.puntos;

          return (
            <TouchableOpacity
              key={b.id}
              style={[styles.boosterCard, !puedeComprar && styles.bloqueado]}
              onPress={() => onComprarBooster(b, b.puntos)}
            >
              <View style={styles.boosterLeft}>
                <Text style={styles.boosterIcon}>{b.icono}</Text>
                <View style={styles.boosterInfo}>
                  <Text style={styles.boosterNombre}>{b.nombre}</Text>
                  <Text style={styles.boosterDesc}>{b.descripcion}</Text>
                  <Text style={styles.boosterDuracion}>⏱ {b.duracionTexto}</Text>
                </View>
              </View>
              <View style={styles.boosterRight}>
                <Text style={styles.boosterMult}>x{b.multiplicador}</Text>
                <Text style={styles.boosterPrecio}>
                  {b.puntos} pts
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Boosters especiales */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚡ Boosters Especiales</Text>
        {BOOSTERS_ESPECIALES.map(b => (
          <TouchableOpacity
            key={b.id}
            style={[styles.boosterCard, (user.puntos || 0) < b.puntos && styles.bloqueado]}
            onPress={() => onComprarBoosterEspecial(b)}
          >
            <View style={styles.boosterLeft}>
              <Text style={styles.boosterIcon}>{b.icono}</Text>
              <View style={styles.boosterInfo}>
                <Text style={styles.boosterNombre}>{b.nombre}</Text>
                <Text style={styles.boosterDesc}>{b.descripcion}</Text>
              </View>
            </View>
            <Text style={styles.boosterPrecio}>{b.puntos} pts</Text>
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: { padding: 16, gap: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 12 },

  // Puntos header
  puntosCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 2, borderColor: COLORS.green,
  },
  puntosTitle: { color: COLORS.textSecondary, fontSize: 14 },
  puntosNum: { color: COLORS.green, fontSize: 48, fontWeight: '900', marginVertical: 4 },
  puntosHint: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center' },

  // Booster activo
  boosterActivoCard: {
    backgroundColor: `${COLORS.green}20`, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: COLORS.green,
  },
  boosterActivoIcon: { fontSize: 32, marginRight: 12 },
  boosterActivoInfo: { flex: 1 },
  boosterActivoNombre: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
  boosterActivoMult: { color: COLORS.textPrimary, fontSize: 14, marginTop: 2 },

  // Premios
  premioCard: {
    backgroundColor: COLORS.cardInner, borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  premioLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  premioIcon: { fontSize: 28, marginRight: 12 },
  premioInfo: { flex: 1 },
  premioNombre: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  premioDesc: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  premioRight: { alignItems: 'flex-end' },
  premioPts: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '700' },
  premioPtsOk: { color: COLORS.green },
  faltanPts: { color: COLORS.red, fontSize: 10, marginTop: 2 },
  bloqueado: { opacity: 0.5 },

  // Boosters
  boosterCard: {
    backgroundColor: COLORS.cardInner, borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  boosterLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  boosterIcon: { fontSize: 28, marginRight: 12 },
  boosterInfo: { flex: 1 },
  boosterNombre: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  boosterDesc: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  boosterDuracion: { color: COLORS.blue, fontSize: 11, marginTop: 2 },
  boosterRight: { alignItems: 'flex-end' },
  boosterMult: { color: COLORS.yellow, fontSize: 20, fontWeight: '700' },
  boosterPrecio: { color: COLORS.textPrimary, fontSize: 14, marginTop: 2 },
  bloqueadoText: { color: COLORS.textSecondary },
});
