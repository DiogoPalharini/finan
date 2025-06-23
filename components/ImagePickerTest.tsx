import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';

const ImagePickerTest: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    try {
      console.log('Solicitando permissões...');
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      
      console.log('Permissão câmera:', cameraPermission.status);
      console.log('Permissão mídia:', mediaPermission.status);
      
      if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar a câmera e galeria'
        );
        return false;
      }
      console.log('Permissões concedidas');
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return false;
    }
  };

  const takePhoto = async () => {
    try {
      setIsLoading(true);
      console.log('Tentando tirar foto...');
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log('Resultado da câmera:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('Foto tirada:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
        Alert.alert('Sucesso', 'Foto tirada com sucesso!');
      } else {
        console.log('Usuário cancelou ou não selecionou foto');
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async () => {
    try {
      setIsLoading(true);
      console.log('Tentando selecionar da galeria...');
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log('Resultado da galeria:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('Imagem selecionada:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
        Alert.alert('Sucesso', 'Imagem selecionada com sucesso!');
      } else {
        console.log('Usuário cancelou ou não selecionou imagem');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste do ImagePicker</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={takePhoto}
          disabled={isLoading}
        >
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.buttonText}>
            {isLoading ? 'Carregando...' : 'Tirar Foto'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={selectFromGallery}
          disabled={isLoading}
        >
          <Ionicons name="images" size={24} color="white" />
          <Text style={styles.buttonText}>
            {isLoading ? 'Carregando...' : 'Escolher da Galeria'}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedImage && (
        <View style={styles.imageContainer}>
          <Text style={styles.imageTitle}>Imagem Selecionada:</Text>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          <Text style={styles.imageUri}>{selectedImage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageUri: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});

export default ImagePickerTest; 