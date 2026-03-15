import { Alert, Platform } from 'react-native';

/**
 * Confirmación multiplataforma.
 * En web usa window.confirm (Alert.alert no funciona en web).
 * En móvil usa Alert.alert normal.
 */
export const confirmar = (titulo, mensaje, onOk) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${mensaje}`)) {
      onOk();
    }
  } else {
    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'OK', onPress: onOk },
    ]);
  }
};

export const alerta = (titulo, mensaje) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje || ''}`);
  } else {
    Alert.alert(titulo, mensaje);
  }
};
