import html2canvas from 'html2canvas';
import { GoCodeGenerator } from './codeGenerator';
import { StorageService } from './storage';
import type { FlowConfig } from '../types';

export class ExportService {
  /**
   * Export diagram as PNG
   */
  static async exportPNG(canvasElement: HTMLElement): Promise<void> {
    try {
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: null, // Use the element's background
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = 'struct-mapping-diagram.png';
      link.href = canvas.toDataURL('image/png');
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
      const { nodes, edges } = flowConfig;
      const PADDING = 50;
      
      // Calculate bounding box
      let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
      nodes.forEach(node => {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + (node.width || 256)); // default width
        maxY = Math.max(maxY, node.position.y + (node.height || 150)); // default height
      });

      const width = maxX - minX + 2 * PADDING;
      const height = maxY - minY + 2 * PADDING;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<style>
  .struct-node { fill: #f9fafb; stroke: #e5e7eb; stroke-width: 1; font-family: sans-serif; }
  .struct-title { font-size: 14px; font-weight: bold; }
  .struct-field { font-size: 12px; }
  .edge-path { fill: none; stroke: #9ca3af; stroke-width: 2; }
</style>
<rect width="100%" height="100%" fill="#ffffff"/>`;

      // Render edges
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
          const sourceX = sourceNode.position.x - minX + PADDING + (sourceNode.width || 256);
          const sourceY = sourceNode.position.y - minY + PADDING + 70; // Approximate handle position
          const targetX = targetNode.position.x - minX + PADDING;
          const targetY = targetNode.position.y - minY + PADDING + 70;
          svg += `\n  <path d="M ${sourceX} ${sourceY} C ${sourceX + 50} ${sourceY}, ${targetX - 50} ${targetY}, ${targetX} ${targetY}" class="edge-path" />`;
        }
      });

      // Render nodes
      nodes.forEach(node => {
        const x = node.position.x - minX + PADDING;
        const y = node.position.y - minY + PADDING;
        const struct = flowConfig.structs.find(s => s.id === node.data.structId);
        if (struct) {
          svg += `\n  <g transform="translate(${x}, ${y})">
    <rect class="struct-node" width="${node.width || 256}" height="${node.height || 150}" rx="8" />
    <text x="10" y="25" class="struct-title">${struct.name}</text>`;
          
          let fieldY = 45;
          struct.fields.slice(0, 5).forEach(field => {
            svg += `\n    <text x="10" y="${fieldY}" class="struct-field">${field.name}: ${field.type}</text>`;
            fieldY += 18;
          });
          if (struct.fields.length > 5) {
            svg += `\n    <text x="10" y="${fieldY}" class="struct-field">...</text>`;
          }
          svg += `\n  </g>`;
        }
      });

      svg += '\n</svg>';

      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${flowConfig.name.toLowerCase().replace(/\s+/g, '-')}-diagram.svg`;
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
