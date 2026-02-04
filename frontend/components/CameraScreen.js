import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import { FILTERS, getFilterName } from '../utils/filters';

const CameraScreen = ({ onPhotoTaken }) => {
  // é como uma "âncora" p o app conseguir controlar a câmera
  const cameraRef = useRef(null);

  // permite tirar fotinhas?
  const [permission, requestPermission] = useCameraPermissions();

  // guarda qual filtro está na tela agr
  const [currentFilter, setCurrentFilter] = useState(FILTERS.ORIGINAL);

  // guarda a foto p voce confirmar ou descartare
  const [photoUri, setPhotoUri] = useState(null);

  // Isso aqui tira a foto
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          base64: false,
        });
        setPhotoUri(photo.uri);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível tirar a foto');
        console.error('Erro ao tirar foto:', error);
      }
    }
  };

  // Confirma e envia a foto pro App
  const confirmPhoto = async () => {
    console.log('Botão Confirmar pressionado');
    if (photoUri) {
      onPhotoTaken({
        uri: photoUri,
        filter: currentFilter,
      });
      setPhotoUri(null);
      setCurrentFilter(FILTERS.ORIGINAL);
    }
  };

  // Descarta a foto e volta pra câmera
  const discardPhoto = () => {
    console.log('Botão Descartar pressionado');
    setPhotoUri(null);
    setCurrentFilter(FILTERS.ORIGINAL);
  };

  // Troca pro próximo filtro
  const cycleFilter = () => {
    const filterKeys = Object.values(FILTERS);
    const currentIndex = filterKeys.indexOf(currentFilter);
    const nextIndex = (currentIndex + 1) % filterKeys.length;
    const newFilter = filterKeys[nextIndex];
    console.log('Trocando filtro:', currentFilter, '->', newFilter);
    setCurrentFilter(newFilter);
  };

  if (!permission) {
    return <View />;
  }
// se eu negar, mostra botão pedindo dnv
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Precisamos de permissão para acessar a câmera
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }
//tela de previw da foto tirada
  if (photoUri) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photoUri }}
            style={styles.previewImage}
          />
          {currentFilter === FILTERS.GATO && (
            <Image
              source={require('../assets/gato.png')}
              style={styles.filterImage}
              resizeMode="contain"
            />
          )}
          {currentFilter === FILTERS.ORELHA && (
            <Image
              source={require('../assets/orelha.png')}
              style={styles.filterImage}
              resizeMode="contain"
            />
          )}
          {currentFilter === FILTERS.OCULOS && (
            <Image
              source={require('../assets/oculos.png')}
              style={styles.filterImage}
              resizeMode="contain"
            />
          )}
          {currentFilter === FILTERS.BIGODE && (
            <Image
              source={require('../assets/bigode.png')}
              style={styles.filterImage}
              resizeMode="contain"
            />
          )}
          {currentFilter === FILTERS.CHAPEU && (
            <Image
              source={require('../assets/chapeu.png')}
              style={styles.filterImage}
              resizeMode="contain"
            />
          )}
          {currentFilter === FILTERS.COROA && (
            <Image
              source={require('../assets/coroa.png')}
              style={styles.filterImage}
              resizeMode="contain"
            />
          )}
          {currentFilter === FILTERS.CORACOES && (
            <Image
              source={require('../assets/coracoes.png')}
              style={styles.filterImage}
              resizeMode="contain"
            />
          )}
        </View>
        <View style={styles.bottomControls}>
          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={discardPhoto}
            >
              <FontAwesome name="times" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButtonPreview}
              onPress={confirmPhoto}
            >
              <FontAwesome name="check" size={30} color="#fff" />
            </TouchableOpacity>
            <View style={styles.spacer} />
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/*componente q liga o sensor da camera*/}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      />
      {currentFilter === FILTERS.GATO && (
        <Image
          source={require('../assets/gato.png')}
          style={styles.filterGato}
          resizeMode="contain"
        />
      )}
      {currentFilter === FILTERS.ORELHA && (
        <Image
          source={require('../assets/orelha.png')}
          style={styles.filterOrelha}
          resizeMode="contain"
        />
      )}
      {currentFilter === FILTERS.OCULOS && (
        <Image
          source={require('../assets/oculos.png')}
          style={styles.filterOculos}
          resizeMode="contain"
        />
      )}
      {currentFilter === FILTERS.BIGODE && (
        <Image
          source={require('../assets/bigode.png')}
          style={styles.filterBigode}
          resizeMode="contain"
        />
      )}
      {currentFilter === FILTERS.CHAPEU && (
        <Image
          source={require('../assets/chapeu.png')}
          style={styles.filterChapeu}
          resizeMode="contain"
        />
      )}
      {currentFilter === FILTERS.COROA && (
        <Image
          source={require('../assets/coroa.png')}
          style={styles.filterCoroa}
          resizeMode="contain"
        />
      )}
      {currentFilter === FILTERS.CORACOES && (
        <Image
          source={require('../assets/coracoes.png')}
          style={styles.filterCoracoes}
          resizeMode="contain"
        />
      )}
      <View style={styles.overlay}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => {
              const filterKeys = Object.values(FILTERS);
              const currentIndex = filterKeys.indexOf(currentFilter);
              const prevIndex = (currentIndex - 1 + filterKeys.length) % filterKeys.length;
              setCurrentFilter(filterKeys[prevIndex]);
            }}
          >
            <FontAwesome name="chevron-left" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
          />
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={cycleFilter}
          >
            <FontAwesome name="chevron-right" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 50,
    paddingHorizontal: 20,
    zIndex: 100,
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  filterNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  arrowButton: {
    padding: 15,
  },
  filterLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  filterLabelSmall: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 80,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonPreview: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    width: 50,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  filterImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 50,
  },
  filterImageCamera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 50,
  },
  filterGato: {
    position: 'absolute',
    top: '-5%',
    left: '-5%',
    right: '-5%',
    bottom: '-5%',
    width: '110%',
    height: '110%',
    zIndex: 50,
  },
  filterOrelha: {
    position: 'absolute',
    top: '10%',
    left: '0%',
    width: '100%',
    height: '60%',
    zIndex: 50,
  },
  filterOculos: {
    position: 'absolute',
    top: '35%',
    left: '5%',
    width: '90%',
    height: '35%',
    zIndex: 50,
  },
  filterBigode: {
    position: 'absolute',
    top: '52%',
    left: '10%',
    width: '80%',
    height: '20%',
    zIndex: 50,
  },
  filterChapeu: {
    position: 'absolute',
    top: '0%',
    left: '7.5%',
    width: '85%',
    height: '48%',
    zIndex: 50,
  },
  filterCoroa: {
    position: 'absolute',
    top: '8%',
    left: '12.5%',
    width: '45%',
    height: '28%',
    zIndex: 50,
  },
  filterCoracoes: {
    position: 'absolute',
    top: '6%',
    left: '15%',
    width: '70%',
    height: '40%',
    zIndex: 50,
  },
  filterEmoji: {
    position: 'absolute',
    fontSize: 120,
    top: '20%',
    alignSelf: 'center',
    zIndex: 100,
  },
  grayscaleOverlay: {
    backgroundColor: 'rgba(128, 128, 128, 0.7)',
  },
  sepiaOverlay: {
    backgroundColor: 'rgba(112, 66, 20, 0.6)',
  },
  brightnessOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  contrastOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  blurOverlay: {
    backgroundColor: 'rgba(180, 180, 180, 0.5)',
  },
});

export default CameraScreen;
