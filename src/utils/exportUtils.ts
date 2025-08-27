import { GoCodeGenerator } from './codeGenerator';
import { StorageService } from './storage';
import type { FlowConfig } from '../types';

export class ExportService {
  /**
   * Export diagram as PNG
   */
  static async exportPNG(canvasElement: HTMLElement): Promise<void> {
    try {
      // Create canvas from the React Flow element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Set canvas dimensions based on the element
      const rect = canvasElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // For MVP, create a simple screenshot using html2canvas-like approach
      // This is a simplified version - in production you'd use a proper library
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.fillText('Struct Mapping Diagram', 20, 30);
      
      // Download the canvas as PNG
      const link = document.createElement('a');
      link.download = 'struct-mapping-diagram.png';
      link.href = canvas.toDataURL();
      link.click();
      
    } catch (error) {
      console.error('Failed to export PNG:', error);
      throw error;
    }
  }

  /**
   * Export diagram as SVG
   */
  static exportSVG(flowConfig: FlowConfig): void {
    try {
      // Create a simple SVG representation
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="20" y="30" font-family="Arial" font-size="16" fill="#000000">Struct Mapping Diagram: ${flowConfig.name}</text>`;

      // Add struct nodes as rectangles
      let yOffset = 80;
      for (const struct of flowConfig.structs) {
        svg += `
  <rect x="50" y="${yOffset}" width="200" height="120" fill="#f0f0f0" stroke="#cccccc"/>
  <text x="60" y="${yOffset + 20}" font-family="Arial" font-size="14" font-weight="bold" fill="#000000">${struct.name}</text>`;
        
        let fieldY = yOffset + 40;
        for (const field of struct.fields.slice(0, 4)) { // Show first 4 fields
          svg += `
  <text x="60" y="${fieldY}" font-family="Arial" font-size="10" fill="#333333">${field.name}: ${field.type}</text>`;
          fieldY += 15;
        }
        
        if (struct.fields.length > 4) {
          svg += `
  <text x="60" y="${fieldY}" font-family="Arial" font-size="10" fill="#666666">... ${struct.fields.length - 4} more fields</text>`;
        }
        
        yOffset += 150;
      }

      svg += '\n</svg>';

      // Download the SVG
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'struct-mapping-diagram.svg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export SVG:', error);
      throw error;
    }
  }

  /**
   * Export generated Go code
   */
  static exportGoCode(flowConfig: FlowConfig, packageName = 'main'): void {
    try {
      const generated = GoCodeGenerator.generateMapping(flowConfig);
      
      if (generated.errors.length > 0) {
        throw new Error(`Code generation failed: ${generated.errors.join(', ')}`);
      }

      const completeCode = GoCodeGenerator.formatCompleteFile(generated, packageName);
      
      // Download the Go code
      const blob = new Blob([completeCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${generated.functionName.toLowerCase()}.go`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export Go code:', error);
      throw error;
    }
  }

  /**
   * Export configuration as JSON
   */
  static exportJSON(flowConfig: FlowConfig): void {
    try {
      const jsonString = StorageService.exportConfig(flowConfig);
      
      // Download the JSON
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${flowConfig.name.toLowerCase().replace(/\s+/g, '-')}-config.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export JSON:', error);
      throw error;
    }
  }

  /**
   * Import configuration from file
   */
  static async importJSON(file: File): Promise<FlowConfig | null> {
    try {
      const text = await file.text();
      return StorageService.importConfig(text);
    } catch (error) {
      console.error('Failed to import JSON:', error);
      return null;
    }
  }
}