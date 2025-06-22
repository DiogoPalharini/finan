import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { ImageSettings } from '../types/settings';
import settingsService from './settingsService';

interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
}

class ImageProcessingService {
  private static instance: ImageProcessingService;
  private cache: Map<string, string> = new Map();
  private cacheDir: string;

  private constructor() {
    this.cacheDir = `${FileSystem.cacheDirectory}image_cache/`;
    this.initializeCache();
  }

  static getInstance(): ImageProcessingService {
    if (!ImageProcessingService.instance) {
      ImageProcessingService.instance = new ImageProcessingService();
    }
    return ImageProcessingService.instance;
  }

  // Inicializar diretório de cache
  private async initializeCache(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Erro ao inicializar cache:', error);
    }
  }

  // Processar imagem (versão simplificada sem ImageManipulator)
  async processImage(imageUri: string): Promise<ProcessedImage> {
    try {
      console.log('Processando imagem (versão simplificada):', imageUri);
      
      // Por enquanto, retornar a imagem original sem processamento
      // Isso evita o erro do ImageManipulator
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      
      return {
        uri: imageUri,
        width: 0,
        height: 0,
        size: fileInfo.exists ? (fileInfo as any).size || 0 : 0,
      };
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      // Em caso de erro, retornar a imagem original
      return {
        uri: imageUri,
        width: 0,
        height: 0,
        size: 0,
      };
    }
  }

  // Salvar imagem na galeria
  async saveToGallery(imageUri: string): Promise<void> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Permissão negada para acessar galeria');
      }

      await MediaLibrary.saveToLibraryAsync(imageUri);
      console.log('Imagem salva na galeria:', imageUri);
    } catch (error) {
      console.error('Erro ao salvar na galeria:', error);
      throw error;
    }
  }

  // Verificar se imagem existe
  async imageExists(imageUri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      return fileInfo.exists;
    } catch (error) {
      console.error('Erro ao verificar se imagem existe:', error);
      return false;
    }
  }

  // Limpar cache
  async clearCache(): Promise<void> {
    try {
      this.cache.clear();
      await FileSystem.deleteAsync(this.cacheDir, { idempotent: true });
      await this.initializeCache();
      console.log('Cache limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  // Obter tamanho do cache
  async getCacheSize(): Promise<number> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(this.cacheDir);
        let totalSize = 0;
        
        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(`${this.cacheDir}${file}`);
          if (fileInfo.exists) {
            totalSize += (fileInfo as any).size || 0;
          }
        }
        
        return totalSize;
      }
      return 0;
    } catch (error) {
      console.error('Erro ao obter tamanho do cache:', error);
      return 0;
    }
  }
}

export default ImageProcessingService.getInstance(); 