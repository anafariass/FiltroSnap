import axios from 'axios';
import API_URL from '../config';
import { getFilterConfig } from '../utils/filterConfig';

// conexão padrão com o endereço do meu servidor
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Pega todas as fotos do servidor
export const getFotos = async () => {
  try {
    const response = await api.get('/fotos');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    throw error;
  }
};

// Pega uma foto específica pelo ID
export const getFotoById = async (id) => {
  try {
    const response = await api.get(`/fotos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar foto:', error);
    throw error;
  }
};

// Cria uma nova foto
export const createFoto = async (nome, caminho) => {
  try {
    const response = await api.post('/fotos', {
      nome,
      caminho,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar foto:', error);
    throw error;
  }
};

// Marca ou desmarca como favorita
export const updateFoto = async (id, favorita) => {
  try {
    const response = await api.put(`/fotos/${id}`, {
      favorita,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar foto:', error);
    throw error;
  }
};

// Deleta uma foto do servidor
export const deleteFoto = async (id) => {
  try {
    const response = await api.delete(`/fotos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    throw error;
  }
};

// Envia a foto com o filtro pro servidor em base64
export const uploadFoto = async (photoUri, nome, filtro) => {
  try {
    console.log('Iniciando upload...');
    console.log('URI:', photoUri);
    console.log('Nome:', nome);
    console.log('Filtro:', filtro);

// app vai no endereço da foto dentro do celular e lê os dados dela
    const response = await fetch(photoUri);

    const blob = await response.blob(); //"pacotinho" binário com os dados da foto
    const reader = new FileReader();
    

    return new Promise((resolve, reject) => {
      //"reader" transforma a foto em um TEXTO gigante
      reader.onload = async () => {
        try {
          const base64 = reader.result;
          
          
          //pega o tamanho e posição do filtro q usamos
          const filterConfig = getFilterConfig(filtro);

          // faz um post para o servidor com tudo dentro
          console.log('Enviando para:', `${API_URL}/fotos/upload-base64`);

          console.log('FilterConfig obtido:', filterConfig);
          console.log('Filtro enviado:', filtro);
          
          // Manda a foto pra o backend com a config do filtro
          const uploadResponse = await fetch(`${API_URL}/fotos/upload-base64`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              nome: nome,
              filtro: filtro,
              filterConfig: filterConfig, // Envia a config junto
              imagem: base64,
            }),
          });

          console.log('Status:', uploadResponse.status);
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.text();
            throw new Error(`Erro ${uploadResponse.status}: ${errorData}`);
          }

          const data = await uploadResponse.json();
          console.log('Upload bem-sucedido:', data);
          resolve(data); // devolve a resposta pro app

        } catch (error) {
          console.error('Erro no upload:', error);
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error('Erro ao ler arquivo:', error);
        reject(error);
      };

      reader.readAsDataURL(blob);// iniciar a conversão da foto
    });
  } catch (error) {
    console.error('Erro ao processar upload:', error);
    throw error;
  }
};

export default api;
