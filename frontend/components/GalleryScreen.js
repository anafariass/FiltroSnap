import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { getFotos, updateFoto, deleteFoto } from '../services/api';

const GalleryScreen = ({ refreshTrigger }) => {
  // Lista de fotos da galeria
  const [fotos, setFotos] = useState([]);
  // Mostra loading enquanto carrega as fotos
  const [loading, setLoading] = useState(true);
  // Foto selecionada pra ver em tela cheia
  const [selectedFoto, setSelectedFoto] = useState(null);

  // Recarrega as fotos quando refreshTrigger muda
  useEffect(() => {
    loadFotos();
  }, [refreshTrigger]);

  // Busca todas as fotos do servidor
  const loadFotos = async () => {
    try {
      setLoading(true);
      const data = await getFotos();
      setFotos(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as fotos');
      console.error('Erro ao carregar fotos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marca ou desmarca a foto como favorita
  const toggleFavorite = async (id, isFavorite) => {
    try {
      await updateFoto(id, !isFavorite);
      loadFotos();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a foto');
      console.error('Erro ao atualizar foto:', error);
    }
  };

  // Apaga a foto depois de confirmar
  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja deletar esta foto?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              await deleteFoto(id);
              loadFotos();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar a foto');
              console.error('Erro ao deletar foto:', error);
            }
          },
        },
      ]
    );
  };

  // Renderiza cada foto na galeria
  const renderFotoItem = ({ item }) => (
    <View style={styles.fotoCard}>
      <TouchableOpacity onPress={() => setSelectedFoto(item)}>
        <Image
          source={{ uri: item.caminhoUrl || item.caminho }}
          style={styles.fotoImage}
        />
      </TouchableOpacity>
      <View style={styles.fotoInfo}>
        <Text style={styles.fotoNome} numberOfLines={1}>
          {item.nome}
        </Text>
        <Text style={styles.fotoData}>
          {new Date(item.data_criacao).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View style={styles.fotoActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.favorita ? styles.favoriteActive : styles.favoriteInactive,
          ]}
          onPress={() => toggleFavorite(item.id, item.favorita)}
        >
          <Text style={styles.actionButtonText}>
            {item.favorita ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Mostra loading enquanto carrega
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  // Mostra mensagem quando não tem fotos
  if (fotos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Nenhuma foto ainda</Text>
        <Text style={styles.emptySubText}>
          Tire uma foto para começar!
        </Text>
      </View>
    );
  }

  // Mostra a galeria de fotos em grade (2 colunas)
  return (
    <View style={styles.container}>
      <FlatList
        data={fotos}
        renderItem={renderFotoItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
      
      {/* Modal pra ver a foto em tela cheia */}
      <Modal
        visible={selectedFoto !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedFoto(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setSelectedFoto(null)}
          >
            <Image
              source={{ uri: selectedFoto?.caminhoUrl || selectedFoto?.caminho }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedFoto(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 8,
  },
  fotoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 5,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
  },
  fotoImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  fotoInfo: {
    padding: 10,
    backgroundColor: '#fff',
  },
  fotoNome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  fotoData: {
    fontSize: 12,
    color: '#999',
  },
  fotoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteActive: {
    backgroundColor: '#FFE5E5',
  },
  favoriteInactive: {
    backgroundColor: '#F0F0F0',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  actionButtonText: {
    fontSize: 18,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GalleryScreen;
