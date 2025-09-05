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
        result.errors.push('No complete mappings found. A mapping requires at least one source and one target struct connected by fields.');
        return result;
      }

      let allCode = '';
      for (const mapping of mappings) {
        const { sourceStruct, targetStruct } = mapping;
        
        if (!sourceStruct || !targetStruct) {
          result.errors.push('Source or target struct not found for a mapping.');
          continue;
        }

        const functionName = `Map${sourceStruct.name}To${targetStruct.name}`;
        const functionSignature = `func ${functionName}(src ${sourceStruct.name}) ${targetStruct.name}`;
        const functionBody = this.generateMappingBody(mapping);
        
        allCode += `${functionSignature} {
${functionBody}
}

`;
      }

      result.code = allCode.trim();
      result.functionName = mappings.length > 1 ? 'MultipleMappings' : `Map${mappings[0].sourceStruct?.name}To${mappings[0].targetStruct?.name}`;

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
    const structNodeIds = new Set(flowConfig.nodes.filter(n => n.type === 'struct').map(n => n.id));
    const structMap = new Map(flowConfig.structs.map(s => [s.id, s]));
    const nodeToStructIdMap = new Map(flowConfig.nodes.map(n => [n.id, n.data.structId]));

    const outgoingEdges = new Map<string, any[]>();
    const incomingEdges = new Map<string, any[]>();

    for (const edge of flowConfig.edges) {
      if (!outgoingEdges.has(edge.source)) outgoingEdges.set(edge.source, []);
      outgoingEdges.get(edge.source)!.push(edge);

      if (!incomingEdges.has(edge.target)) incomingEdges.set(edge.target, []);
      incomingEdges.get(edge.target)!.push(edge);
    }

    const sourceNodes = Array.from(structNodeIds).filter(nodeId => 
      outgoingEdges.has(nodeId) && !incomingEdges.has(nodeId)
    );

    const targetNodes = Array.from(structNodeIds).filter(nodeId =>
      incomingEdges.has(nodeId) && !outgoingEdges.has(nodeId)
    );

    if (sourceNodes.length === 0 || targetNodes.length === 0) {
      return [];
    }

    // For now, we'll assume a single mapping from the first source to the first target.
    // A more advanced implementation would trace paths from each source.
    const sourceStructId = nodeToStructIdMap.get(sourceNodes[0]);
    const targetStructId = nodeToStructIdMap.get(targetNodes[0]);

    if (!sourceStructId || !targetStructId) return [];

    const sourceStruct = structMap.get(sourceStructId);
    const targetStruct = structMap.get(targetStructId);

    if (!sourceStruct || !targetStruct) return [];

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

    return [{
      sourceStruct,
      targetStruct,
      fieldMappings
    }];
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
  }, indent: string = '    '): string {
    
    if (!mapping.targetStruct) return `${indent}return target\n`;

    let body = `${indent}var target ${mapping.targetStruct.name}\n\n`;

    // Generate field mappings
    if (mapping.fieldMappings.length > 0) {
      body += `${indent}// Field mappings\n`;
      
      for (const fieldMapping of mapping.fieldMappings) {
        const sourceFieldPath = `src.${fieldMapping.sourceField}`;
        const targetFieldPath = `target.${fieldMapping.targetField}`;

        if (fieldMapping.transformer) {
          // Use transformer
          body += `${indent}${targetFieldPath} = ${fieldMapping.transformer.name}(${sourceFieldPath})\n`;
        } else {
          // Direct assignment, check for nested structs
          const sourceField = mapping.sourceStruct?.fields.find(f => f.name === fieldMapping.sourceField);
          const targetField = mapping.targetStruct?.fields.find(f => f.name === fieldMapping.targetField);

          if (sourceField?.type.startsWith('struct') && targetField?.type.startsWith('struct')) {
            // This is a nested struct. We'd need a more complex system to resolve the
            // mapping function for the nested type. For now, we'll assume a function exists.
            const nestedMapFuncName = `Map${sourceField.type}To${targetField.type}`;
            body += `${indent}${targetFieldPath} = ${nestedMapFuncName}(${sourceFieldPath})\n`;
          } else {
            body += `${indent}${targetFieldPath} = ${sourceFieldPath}\n`;
          }
        }
      }
    } else {
      // Generate simple field-by-field mapping for fields with same names
      const targetFields = mapping.targetStruct.fields.map(f => f.name);
      const sourceFields = mapping.sourceStruct?.fields.map(f => f.name) || [];
      
      const commonFields = targetFields.filter(field => sourceFields.includes(field));
      
      if (commonFields.length > 0) {
        body += `${indent}// Auto-mapped fields with matching names\n`;
        for (const field of commonFields) {
          body += `${indent}target.${field} = src.${field}\n`;
        }
      }
    }

    body += `\n${indent}return target`;
    
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