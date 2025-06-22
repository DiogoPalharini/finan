import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DEFAULT_APP_SETTINGS, ImageSettings, DEFAULT_IMAGE_SETTINGS } from '../types/settings';

const SETTINGS_KEY = '@finan_settings';

class SettingsService {
  private static instance: SettingsService;
  private settings: AppSettings = DEFAULT_APP_SETTINGS;
  private listeners: ((settings: AppSettings) => void)[] = [];

  private constructor() {}

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  // Carregar configurações do AsyncStorage
  async loadSettings(): Promise<AppSettings> {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        this.settings = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(storedSettings) };
      } else {
        this.settings = DEFAULT_APP_SETTINGS;
        await this.saveSettings();
      }
      return this.settings;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return DEFAULT_APP_SETTINGS;
    }
  }

  // Salvar configurações no AsyncStorage
  async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  // Obter configurações atuais
  getSettings(): AppSettings {
    return this.settings;
  }

  // Obter configurações de imagem
  getImageSettings(): ImageSettings {
    return this.settings.image;
  }

  // Atualizar configurações de imagem
  async updateImageSettings(imageSettings: Partial<ImageSettings>): Promise<void> {
    this.settings.image = { ...this.settings.image, ...imageSettings };
    await this.saveSettings();
  }

  // Atualizar configurações gerais
  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    await this.saveSettings();
  }

  // Resetar configurações para padrão
  async resetSettings(): Promise<void> {
    this.settings = DEFAULT_APP_SETTINGS;
    await this.saveSettings();
  }

  // Sistema de listeners para notificar mudanças
  addListener(listener: (settings: AppSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }
}

export default SettingsService.getInstance(); 