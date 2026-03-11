import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { BOOSTERS, BOOSTERS_ESPECIALES, PREMIOS, RECOMPENSAS_RACHA } from '../constants/tienda';
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

      {/* Boosters de puntos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Boosters de Puntos</Text>
        <Text style={styles.tusPuntos}>Tienes {user.puntos || 0} puntos</Text>

        {BOOSTERS.map(b => {
          const recompensa = RECOMPENSAS_RACHA.find(
            r => r.booster === b.id && (user.racha || 0) >= r.racha
          );
          const precio      = recompensa ? recompensa.precioFinal : b.puntos;
          const puedeComprar = (user.puntos || 0) >= precio;

          return (
            <TouchableOpacity
              key={b.id}
              style={[styles.boosterCard, !puedeComprar && styles.bloqueado]}
              onPress={() => onComprarBooster(b, precio)}
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
                <Text style={[styles.boosterPrecio, recompensa && styles.precioDescuento]}>
                  {precio} pts
                </Text>
                {recompensa && (
                  <Text style={styles.descuento}>
                    {recompensa.descuento}% OFF (racha {recompensa.racha}d)
                  </Text>
                )}
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

      {/* Recompensas por racha */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎁 Recompensas por Racha</Text>
        <Text style={styles.rachaActual}>Tu racha actual: {user.racha || 0} días 🔥</Text>
        {RECOMPENSAS_RACHA.map(r => {
          const booster      = BOOSTERS.find(b => b.id === r.booster);
          const desbloqueado = (user.racha || 0) >= r.racha;
          const usado        = user.boostersUsados?.includes(`${r.booster}_${r.racha}`);
          return (
            <View
              key={`${r.booster}_${r.racha}`}
              style={[styles.recompensaCard, desbloqueado && !usado && styles.recompensaDesbloqueda]}
            >
              <View style={styles.recompensaInfo}>
                <Text style={styles.boosterIcon}>{booster?.icono}</Text>
                <View>
                  <Text style={styles.boosterNombre}>{booster?.nombre}</Text>
                  <Text style={styles.rachaReq}>Racha {r.racha} días</Text>
                </View>
              </View>
              <View>
                {usado ? (
                  <Text style={styles.usado}>✓ USADO</Text>
                ) : desbloqueado ? (
                  <Text style={styles.gratis}>
                    {r.precioFinal === 0 ? '¡GRATIS!' : `${r.precioFinal} pts`}
                  </Text>
                ) : (
                  <Text style={styles.bloqueadoText}>🔒 {r.racha}d</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Premios */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎁 Premios</Text>
        {PREMIOS.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[styles.premioCard, (user.puntos || 0) < p.puntos && styles.bloqueado]}
            onPress={() => onCanjearPremio(p)}
          >
            <View style={styles.premioInfo}>
              <Text style={styles.premioNombre}>{p.nombre}</Text>
              <Text style={styles.premioDesc}>{p.descripcion}</Text>
            </View>
            <Text style={styles.premioPts}>{p.puntos} pts</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: { padding: 16, gap: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  tusPuntos: { color: COLORS.green, fontSize: 14, marginBottom: 12 },

  boosterActivoCard: {
    backgroundColor: `${COLORS.green}20`,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.green,
  },
  boosterActivoIcon: { fontSize: 32, marginRight: 12 },
  boosterActivoInfo: { flex: 1 },
  boosterActivoNombre: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
  boosterActivoMult: { color: COLORS.textPrimary, fontSize: 14, marginTop: 2 },

  boosterCard: {
    backgroundColor: COLORS.cardInner,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bloqueado: { opacity: 0.5 },
  boosterLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  boosterIcon: { fontSize: 28, marginRight: 12 },
  boosterInfo: { flex: 1 },
  boosterNombre: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  boosterDesc: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  boosterDuracion: { color: COLORS.blue, fontSize: 11, marginTop: 2 },
  boosterRight: { alignItems: 'flex-end' },
  boosterMult: { color: COLORS.yellow, fontSize: 20, fontWeight: '700' },
  boosterPrecio: { color: COLORS.textPrimary, fontSize: 14, marginTop: 2 },
  precioDescuento: { color: COLORS.green, fontWeight: '600' },
  descuento: { color: COLORS.green, fontSize: 10, marginTop: 2 },

  recompensaCard: {
    backgroundColor: COLORS.cardInner,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recompensaDesbloqueda: { borderColor: COLORS.yellow },
  recompensaInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rachaReq: { color: COLORS.textSecondary, fontSize: 11 },
  rachaActual: { color: COLORS.yellow, fontSize: 14, marginBottom: 12, textAlign: 'center' },
  usado: { color: COLORS.green, fontWeight: '700' },
  gratis: { color: COLORS.yellow, fontWeight: '700' },
  bloqueadoText: { color: COLORS.textSecondary },

  premioCard: {
    backgroundColor: COLORS.cardInner,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  premioInfo: { flex: 1 },
  premioNombre: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  premioDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  premioPts: { color: COLORS.yellow, fontSize: 16, fontWeight: '700' },
});
