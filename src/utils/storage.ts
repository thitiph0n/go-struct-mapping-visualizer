import type { FlowConfig } from '../types';

const STORAGE_KEY = 'go-struct-mapping-visualizer';
const STORAGE_VERSION = '1.0';

export interface StoredData {
  version: string;
  configs: FlowConfig[];
  currentConfigId?: string;
  lastSaved: string;
}

export class StorageService {
  /**
   * Save flow configuration to localStorage
   */
  static saveConfig(config: FlowConfig): boolean {
    try {
      const stored = this.getStoredData();
      
      // Update existing config or add new one
      const existingIndex = stored.configs.findIndex(c => c.id === config.id);
      if (existingIndex >= 0) {
        stored.configs[existingIndex] = { ...config, updatedAt: new Date() };
      } else {
        stored.configs.push({ ...config, updatedAt: new Date() });
      }
      
      stored.currentConfigId = config.id;
      stored.lastSaved = new Date().toISOString();
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      return true;
    } catch (error) {
      console.error('Failed to save config:', error);
      return false;
    }
  }

  /**
   * Load flow configuration from localStorage
   */
  static loadConfig(configId: string): FlowConfig | null {
    try {
      const stored = this.getStoredData();
      const config = stored.configs.find(c => c.id === configId);
      
      if (config) {
        // Convert date strings back to Date objects
        return {
          ...config,
          createdAt: new Date(config.createdAt),
          updatedAt: new Date(config.updatedAt)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load config:', error);
      return null;
    }
  }

  /**
   * Get all saved configurations
   */
  static getAllConfigs(): FlowConfig[] {
    try {
      const stored = this.getStoredData();
      return stored.configs.map(config => ({
        ...config,
        createdAt: new Date(config.createdAt),
        updatedAt: new Date(config.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load configs:', error);
      return [];
    }
  }

  /**
   * Delete a configuration
   */
  static deleteConfig(configId: string): boolean {
    try {
      const stored = this.getStoredData();
      stored.configs = stored.configs.filter(c => c.id !== configId);
      
      if (stored.currentConfigId === configId) {
        stored.currentConfigId = undefined;
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      return true;
    } catch (error) {
      console.error('Failed to delete config:', error);
      return false;
    }
  }

  /**
   * Auto-save current configuration
   */
  static autoSave(config: FlowConfig): void {
    // Only auto-save if there's actual content
    if (config.structs.length > 0 || config.nodes.length > 0) {
      this.saveConfig(config);
    }
  }

  /**
   * Export configuration as JSON
   */
  static exportConfig(config: FlowConfig): string {
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  static importConfig(jsonString: string): FlowConfig | null {
    try {
      const config = JSON.parse(jsonString) as FlowConfig;
      
      // Validate the imported config
      if (!config.id || !config.name || !Array.isArray(config.structs)) {
        throw new Error('Invalid configuration format');
      }
      
      // Convert date strings to Date objects if needed
      return {
        ...config,
        createdAt: new Date(config.createdAt),
        updatedAt: new Date(config.updatedAt)
      };
    } catch (error) {
      console.error('Failed to import config:', error);
      return null;
    }
  }

  /**
   * Get stored data or create default structure
   */
  private static getStoredData(): StoredData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as StoredData;
        
        // Migrate old versions if needed
        if (parsed.version !== STORAGE_VERSION) {
          return this.migrateData();
        }
        
        return parsed;
      }
    } catch (error) {
      console.error('Failed to parse stored data:', error);
    }

    // Return default structure
    return {
      version: STORAGE_VERSION,
      configs: [],
      lastSaved: new Date().toISOString()
    };
  }

  /**
   * Migrate data from older versions
   */
  private static migrateData(): StoredData {
    // For now, just reset to empty if version doesn't match
    return {
      version: STORAGE_VERSION,
      configs: [],
      lastSaved: new Date().toISOString()
    };
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const data = localStorage.getItem(STORAGE_KEY) || '';
      const used = new Blob([data]).size;
      const available = 5 * 1024 * 1024; // Assume 5MB limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Clear all stored data
   */
  static clearAll(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }
}