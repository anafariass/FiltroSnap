import { View, StyleSheet, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function EspelhoDigital() {
  const [permission] = useCameraPermissions();

  if (!permission) {
    return (
      <View style={styles.center} />
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center} />
    );
  }

  return (
    <View style={styles.container}>
      {/* CÂMERA FRONTAL */}
      <CameraView style={styles.camera} facing="front" />

      {/* IMAGEM DO GATO */}
      <Image
        source={require('../../assets/images/gato.png')}
        style={styles.cat}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cat: {
    position: 'absolute',
    width: 800,
    height: 820,
    alignSelf: 'center',
    top: 220,
  },
  center: {
    flex: 1,
  },
});
