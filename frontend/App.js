import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import * as FileSystem from 'expo-file-system/legacy';
import CameraScreen from './components/CameraScreen';
import GalleryScreen from './components/GalleryScreen';
import { uploadFoto } from './services/api';
import API_URL from './config';

const App = () => {
  // saber se estamos na tela da 'camera' ou 'gallery'
  const [currentScreen, setCurrentScreen] = useState('gallery');

  // um "contador" que aumenta toda vez que salvamos uma foto, para a galeria saber que deve atualizar
  const [refreshGallery, setRefreshGallery] = useState(0);

  // variável que fica "verdadeira" enquanto a foto está viajando para o servidor
  const [isUploading, setIsUploading] = useState(false);

  // Isso aqui salva a foto no servidor quando você tira
  const handlePhotoTaken = async (photoData) => {
    try {
      setIsUploading(true);
      
      const fileName = `foto_${Date.now()}.jpg`; // nome unico com data e hora.
      
      console.log('Iniciando upload com Axios para:', `${API_URL}/fotos/upload`, 'com filtro:', photoData.filter); // chama api.js p levar a fota
      
      // envia a foto com o filtro pro backend
      const response = await uploadFoto(photoData.uri, fileName, photoData.filter);
      
      console.log('Resposta do upload:', response);

      Alert.alert('Sucesso', 'Foto salva com sucesso!');

      // Atualiza a galeria pra mostrar a nova foto
      setRefreshGallery(refreshGallery + 1);

      // Volta pra tela da galeria
      setCurrentScreen('gallery');
    } catch (error) {
      Alert.alert('Erro', `Erro ao salvar: ${error.message}`);
      console.error('Erro ao salvar foto:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho do app */}
      <View style={styles.header}>
        <Text style={styles.title}>FiltroSnap</Text>
      </View>

      {/* Tela de loading quando tá salvando */}
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Salvando foto...</Text>
        </View>
      )}

      {/* Conteúdo: mostra câmera ou galeria */}
      <View style={styles.content}>
        {currentScreen === 'camera' ? (
          <CameraScreen onPhotoTaken={handlePhotoTaken} />
        ) : (
          <GalleryScreen refreshTrigger={refreshGallery} />
        )}
      </View>

      {/* Barra de navegação de baixo */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentScreen === 'camera' && styles.tabButtonActive,
          ]}
          onPress={() => setCurrentScreen('camera')}
        >
          <FontAwesome
            name="camera"
            size={24}
            color={currentScreen === 'camera' ? '#555555' : '#888888'}
          />
          <Text style={[styles.tabButtonText, { color: currentScreen === 'camera' ? '#555555' : '#888888' }]}>Câmera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentScreen === 'gallery' && styles.tabButtonActive,
          ]}
          onPress={() => setCurrentScreen('gallery')}
        >
          <FontAwesome
            name="picture-o"
            size={24}
            color={currentScreen === 'gallery' ? '#555555' : '#888888'}
          />
          <Text style={[styles.tabButtonText, { color: currentScreen === 'gallery' ? '#555555' : '#888888' }]}>Galeria</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#555555',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
    color: '#333',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
});

export default App;
