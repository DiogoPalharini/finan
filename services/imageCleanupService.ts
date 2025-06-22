import * as FileSystem from 'expo-file-system';
import { getTransactions } from './transactionService';
import { ImageSettings } from '../types/settings';
import settingsService from './settingsService';
import imageProcessingService from './imageProcessingService';

interface CleanupResult {
  orphanedImages: string[];
  freedSpace: number;
  totalImages: number;
  processedImages: number;
}

class ImageCleanupService {
  private static instance: ImageCleanupService;
  private isRunning: boolean = false;

  private constructor() {}

  static getInstance(): ImageCleanupService {
    if (!ImageCleanupService.instance) {
      ImageCleanupService.instance = new ImageCleanupService();
    }
    return ImageCleanupService.instance;
  }

  // Executar limpeza de imagens órfãs
  async cleanupOrphanedImages(userId: string): Promise<CleanupResult> {
    if (this.isRunning) {
      throw new Error('Limpeza já está em execução');
    }

    this.isRunning = true;
    
    try {
      const settings = settingsService.getImageSettings();
      
      if (!settings.autoCleanupOrphanedImages) {
        return {
          orphanedImages: [],
          freedSpace: 0,
          totalImages: 0,
          processedImages: 0,
        };
      }

      // Obter todas as transações do usuário
      const transactions = await getTransactions(userId);
      
      // Extrair URIs de imagens das transações
      const validImageUris = new Set<string>();
      transactions.forEach(transaction => {
        if (transaction.receiptImageUri) {
          validImageUris.add(transaction.receiptImageUri);
        }
      });

      // Obter todas as imagens no diretório de documentos
      const documentDir = FileSystem.documentDirectory || '';
      const allFiles = await this.getAllImageFiles(documentDir);
      
      const orphanedImages: string[] = [];
      let freedSpace = 0;
      let processedImages = 0;

      // Verificar cada imagem
      for (const imagePath of allFiles) {
        processedImages++;
        
        // Verificar se a imagem está sendo usada por alguma transação
        if (!validImageUris.has(imagePath)) {
          // Verificar se a imagem existe
          const exists = await imageProcessingService.imageExists(imagePath);
          
          if (exists) {
            // Obter tamanho da imagem antes de deletar
            const fileInfo = await FileSystem.getInfoAsync(imagePath);
            const fileSize = fileInfo.exists ? (fileInfo as any).size || 0 : 0;
            
            // Deletar imagem órfã
            await FileSystem.deleteAsync(imagePath, { idempotent: true });
            
            orphanedImages.push(imagePath);
            freedSpace += fileSize;
          }
        }
      }

      // Limpar cache se necessário
      const cacheSize = await imageProcessingService.getCacheSize();
      if (cacheSize > 50 * 1024 * 1024) { // 50MB
        await imageProcessingService.clearCache();
      }

      return {
        orphanedImages,
        freedSpace,
        totalImages: allFiles.length,
        processedImages,
      };
    } catch (error) {
      console.error('Erro na limpeza de imagens órfãs:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  // Obter todos os arquivos de imagem em um diretório
  private async getAllImageFiles(dirPath: string): Promise<string[]> {
    try {
      const files: string[] = [];
      await this.scanDirectory(dirPath, files);
      return files.filter(file => this.isImageFile(file));
    } catch (error) {
      console.error('Erro ao obter arquivos de imagem:', error);
      return [];
    }
  }

  // Escanear diretório recursivamente
  private async scanDirectory(dirPath: string, files: string[]): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists || !dirInfo.isDirectory) {
        return;
      }

      const items = await FileSystem.readDirectoryAsync(dirPath);
      
      for (const item of items) {
        const itemPath = `${dirPath}${item}`;
        const itemInfo = await FileSystem.getInfoAsync(itemPath);
        
        if (itemInfo.isDirectory) {
          await this.scanDirectory(itemPath, files);
        } else {
          files.push(itemPath);
        }
      }
    } catch (error) {
      console.error('Erro ao escanear diretório:', error);
    }
  }

  // Verificar se é um arquivo de imagem
  private isImageFile(filePath: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }

  // Obter estatísticas de armazenamento
  async getStorageStats(userId: string): Promise<{
    totalImages: number;
    totalSize: number;
    orphanedImages: number;
    orphanedSize: number;
    cacheSize: number;
  }> {
    try {
      // Obter transações
      const transactions = await getTransactions(userId);
      const validImageUris = new Set<string>();
      transactions.forEach(transaction => {
        if (transaction.receiptImageUri) {
          validImageUris.add(transaction.receiptImageUri);
        }
      });

      // Obter todas as imagens
      const documentDir = FileSystem.documentDirectory || '';
      const allImageFiles = await this.getAllImageFiles(documentDir);
      
      let totalSize = 0;
      let orphanedSize = 0;
      let orphanedCount = 0;

      for (const imagePath of allImageFiles) {
        const fileInfo = await FileSystem.getInfoAsync(imagePath);
        const fileSize = fileInfo.exists ? (fileInfo as any).size || 0 : 0;
        totalSize += fileSize;

        if (!validImageUris.has(imagePath)) {
          orphanedSize += fileSize;
          orphanedCount++;
        }
      }

      const cacheSize = await imageProcessingService.getCacheSize();

      return {
        totalImages: allImageFiles.length,
        totalSize,
        orphanedImages: orphanedCount,
        orphanedSize,
        cacheSize,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de armazenamento:', error);
      return {
        totalImages: 0,
        totalSize: 0,
        orphanedImages: 0,
        orphanedSize: 0,
        cacheSize: 0,
      };
    }
  }

  // Formatar tamanho em bytes para legível
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Verificar se a limpeza está em execução
  isCleanupRunning(): boolean {
    return this.isRunning;
  }

  // Agendar limpeza automática
  async scheduleCleanup(userId: string): Promise<void> {
    const settings = settingsService.getImageSettings();
    
    if (!settings.autoCleanupOrphanedImages) {
      return;
    }

    // Verificar última limpeza
    const lastCleanupKey = `@finan_last_cleanup_${userId}`;
    const lastCleanup = await this.getLastCleanupDate(lastCleanupKey);
    const now = new Date();
    
    if (!lastCleanup || this.daysSince(lastCleanup) >= settings.cleanupIntervalDays) {
      // Executar limpeza em background
      this.cleanupOrphanedImages(userId).catch(error => {
        console.error('Erro na limpeza automática:', error);
      });
      
      // Salvar data da limpeza
      await this.saveLastCleanupDate(lastCleanupKey, now);
    }
  }

  // Obter data da última limpeza
  private async getLastCleanupDate(key: string): Promise<Date | null> {
    try {
      const value = await FileSystem.readAsStringAsync(key);
      return new Date(value);
    } catch (error) {
      return null;
    }
  }

  // Salvar data da limpeza
  private async saveLastCleanupDate(key: string, date: Date): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(key, date.toISOString());
    } catch (error) {
      console.error('Erro ao salvar data da limpeza:', error);
    }
  }

  // Calcular dias desde uma data
  private daysSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export default ImageCleanupService.getInstance(); 