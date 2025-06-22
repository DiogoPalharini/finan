import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Text,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';

export default function TestImagePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      addLog('Solicitando permissões...');
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      
      addLog(`Permissão câmera: ${cameraPermission.status}`);
      addLog(`Permissão galeria: ${mediaPermission.status}`);
      
      if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar a câmera e galeria');
        return false;
      }
      return true;
    } catch (error) {
      addLog(`Erro ao solicitar permissões: ${error}`);
      return false;
    }
  };

  const pickImage = async () => {
    try {
      addLog('Iniciando seleção de imagem da galeria');
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      addLog(`Resultado da seleção: ${JSON.stringify(result)}`);

      if (!result.canceled && result.assets[0]) {
        addLog(`Imagem selecionada: ${result.assets[0].uri}`);
        setSelectedImage(result.assets[0].uri);
      } else {
        addLog('Seleção cancelada ou nenhuma imagem selecionada');
      }
    } catch (error) {
      addLog(`Erro ao selecionar imagem: ${error}`);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const takePhoto = async () => {
    try {
      addLog('Iniciando captura de foto');
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      addLog(`Resultado da captura: ${JSON.stringify(result)}`);

      if (!result.canceled && result.assets[0]) {
        addLog(`Foto capturada: ${result.assets[0].uri}`);
        setSelectedImage(result.assets[0].uri);
      } else {
        addLog('Captura cancelada ou nenhuma foto tirada');
      }
    } catch (error) {
      addLog(`Erro ao tirar foto: ${error}`);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Teste de Seleção de Imagem</Text>
      
      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          <Text style={styles.imageText}>URI: {selectedImage}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.removeButtonText}>Remover</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Ionicons name="images-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Escolher da Galeria</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.buttonText}>Tirar Foto</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.logsContainer}>
        <View style={styles.logsHeader}>
          <Text style={styles.logsTitle}>Logs de Debug</Text>
          <TouchableOpacity onPress={clearLogs}>
            <Text style={styles.clearButton}>Limpar</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.logs} nestedScrollEnabled>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  imageText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  logsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    color: '#007AFF',
    fontSize: 14,
  },
  logs: {
    maxHeight: 200,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 2,
  },
}); 