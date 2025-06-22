export interface ImageSettings {
  // Qualidade da imagem (0-100)
  imageQuality: number;
  // Tamanho máximo da imagem em pixels
  maxImageSize: number;
  // Salvar automaticamente na galeria
  autoSaveToGallery: boolean;
  // Comprimir imagens automaticamente
  autoCompress: boolean;
  // Cache de imagens
  enableImageCache: boolean;
  // Limpeza automática de imagens órfãs
  autoCleanupOrphanedImages: boolean;
  // Intervalo de limpeza em dias
  cleanupIntervalDays: number;
}

export interface AppSettings {
  image: ImageSettings;
  // Outras configurações podem ser adicionadas aqui
  notifications: {
    enabled: boolean;
    reminderTime: string;
  };
  theme: {
    darkMode: boolean;
    autoTheme: boolean;
  };
}

export const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
  imageQuality: 80,
  maxImageSize: 1024,
  autoSaveToGallery: false,
  autoCompress: true,
  enableImageCache: true,
  autoCleanupOrphanedImages: true,
  cleanupIntervalDays: 30,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  image: DEFAULT_IMAGE_SETTINGS,
  notifications: {
    enabled: true,
    reminderTime: '20:00',
  },
  theme: {
    darkMode: false,
    autoTheme: true,
  },
}; 