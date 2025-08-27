import type { FlowConfig, StructDefinition, TransformerNode, GeneratedCode } from '../types';

export class GoCodeGenerator {
  /**
   * Generate Go mapping code from flow configuration
   */
  static generateMapping(flowConfig: FlowConfig): GeneratedCode {
    const result: GeneratedCode = {
      functionName: 'MapStructs',
      code: '',
      imports: ['fmt'],
      errors: []
    };

    try {
      // Analyze the flow to determine mapping relationships
      const mappings = this.analyzeMappings(flowConfig);
      
      if (mappings.length === 0) {
        result.errors.push('No mappings found. Connect struct fields to generate code.');
        return result;
      }

      // Generate the mapping function
      const { sourceStruct, targetStruct } = mappings[0];
      
      if (!sourceStruct || !targetStruct) {
        result.errors.push('Source or target struct not found.');
        return result;
      }

      result.functionName = `Map${sourceStruct.name}To${targetStruct.name}`;
      
      // Generate function signature
      const functionSignature = `func ${result.functionName}(src ${sourceStruct.name}) ${targetStruct.name}`;
      
      // Generate function body
      const functionBody = this.generateMappingBody(mappings[0]);
      
      result.code = `${functionSignature} {
${functionBody}
}`;

      // Add required imports
      this.addRequiredImports(result, flowConfig.transformers);
      
    } catch (error) {
      result.errors.push(`Code generation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Analyze flow configuration to extract mapping relationships
   */
  private static analyzeMappings(flowConfig: FlowConfig) {
    const mappings: Array<{
      sourceStruct?: StructDefinition;
      targetStruct?: StructDefinition;
      fieldMappings: Array<{
        sourceField: string;
        targetField: string;
        transformer?: TransformerNode;
      }>;
    }> = [];

    // For MVP, create a simple mapping between first two structs
    if (flowConfig.structs.length >= 2) {
      const [sourceStruct, targetStruct] = flowConfig.structs;
      
      const fieldMappings = flowConfig.edges.map(edge => {
        const sourceHandle = edge.sourceHandle?.replace('field-', '').replace('-out', '');
        const targetHandle = edge.targetHandle?.replace('field-', '').replace('-in', '');
        
        const transformer = edge.data?.transformerId 
          ? flowConfig.transformers.find(t => t.id === edge.data?.transformerId)
          : undefined;

        return {
          sourceField: sourceHandle || 'unknown',
          targetField: targetHandle || 'unknown',
          transformer
        };
      });

      mappings.push({
        sourceStruct,
        targetStruct,
        fieldMappings
      });
    }

    return mappings;
  }

  /**
   * Generate the mapping function body
   */
  private static generateMappingBody(mapping: {
    sourceStruct?: StructDefinition;
    targetStruct?: StructDefinition;
    fieldMappings: Array<{
      sourceField: string;
      targetField: string;
      transformer?: TransformerNode;
    }>;
  }): string {
    
    if (!mapping.targetStruct) return '    return target\n';

    let body = `    var target ${mapping.targetStruct.name}\n\n`;

    // Generate field mappings
    if (mapping.fieldMappings.length > 0) {
      body += '    // Field mappings\n';
      
      for (const fieldMapping of mapping.fieldMappings) {
        if (fieldMapping.transformer) {
          // Use transformer
          body += `    target.${fieldMapping.targetField} = ${fieldMapping.transformer.name}(src.${fieldMapping.sourceField})\n`;
        } else {
          // Direct assignment
          body += `    target.${fieldMapping.targetField} = src.${fieldMapping.sourceField}\n`;
        }
      }
    } else {
      // Generate simple field-by-field mapping for fields with same names
      const targetFields = mapping.targetStruct.fields.map(f => f.name);
      const sourceFields = mapping.sourceStruct?.fields.map(f => f.name) || [];
      
      const commonFields = targetFields.filter(field => sourceFields.includes(field));
      
      if (commonFields.length > 0) {
        body += '    // Auto-mapped fields with matching names\n';
        for (const field of commonFields) {
          body += `    target.${field} = src.${field}\n`;
        }
      }
    }

    body += '\n    return target';
    
    return body;
  }

  /**
   * Add required imports based on transformers used
   */
  private static addRequiredImports(result: GeneratedCode, transformers: TransformerNode[]) {
    const imports = new Set(result.imports);
    
    // Check transformer code for common imports
    for (const transformer of transformers) {
      if (transformer.code.includes('strconv.')) {
        imports.add('strconv');
      }
      if (transformer.code.includes('time.')) {
        imports.add('time');
      }
      if (transformer.code.includes('strings.')) {
        imports.add('strings');
      }
      if (transformer.code.includes('errors.')) {
        imports.add('errors');
      }
    }

    result.imports = Array.from(imports);
  }

  /**
   * Format complete Go file with imports and function
   */
  static formatCompleteFile(generated: GeneratedCode, packageName = 'main'): string {
    let code = `package ${packageName}\n\n`;
    
    // Add imports
    if (generated.imports.length > 0) {
      if (generated.imports.length === 1) {
        code += `import "${generated.imports[0]}"\n\n`;
      } else {
        code += 'import (\n';
        for (const imp of generated.imports) {
          code += `    "${imp}"\n`;
        }
        code += ')\n\n';
      }
    }

    // Add the generated function
    code += generated.code;

    return code;
  }

  /**
   * Generate a simple mapping function for demonstration
   */
  static generateSimpleMapping(sourceStruct: StructDefinition, targetStruct: StructDefinition): GeneratedCode {
    const result: GeneratedCode = {
      functionName: `Map${sourceStruct.name}To${targetStruct.name}`,
      code: '',
      imports: [],
      errors: []
    };

    // Find common fields
    const targetFieldNames = targetStruct.fields.map(f => f.name);
    const commonFields = sourceStruct.fields.filter(f => targetFieldNames.includes(f.name));

    const functionSignature = `func ${result.functionName}(src ${sourceStruct.name}) ${targetStruct.name}`;
    
    let body = `    var target ${targetStruct.name}\n\n`;
    
    if (commonFields.length > 0) {
      body += '    // Map common fields\n';
      for (const field of commonFields) {
        body += `    target.${field.name} = src.${field.name}\n`;
      }
    }

    body += '\n    return target';

    result.code = `${functionSignature} {
${body}
}`;

    return result;
  }
}