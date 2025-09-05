import type { StructDefinition, StructField, ValidationResult } from '../types';

/**
 * Parses Go struct definitions from source code
 */
export class GoStructParser {
  /**
   * Parse a Go struct definition from source code
   */
  static parseStruct(code: string): StructDefinition {
    const id = generateId();
    const result: StructDefinition = {
      id,
      name: '',
      fields: [],
      rawCode: code.trim(),
      isValid: false,
      errors: []
    };

    try {
      // Remove comments and clean up the code
      const cleanCode = this.removeComments(code);
      
      // Extract struct name
      const structNameMatch = cleanCode.match(/type\s+(\w+)\s+struct/);
      if (!structNameMatch) {
        result.errors.push('No struct definition found. Expected: type StructName struct { ... }');
        return result;
      }
      
      result.name = structNameMatch[1];
      
      // Extract struct body
      const structBodyMatch = cleanCode.match(/struct\s*{([^}]*)}/s);
      if (!structBodyMatch) {
        result.errors.push('Invalid struct body. Expected: { field declarations }');
        return result;
      }
      
      const structBody = structBodyMatch[1];
      result.fields = this.parseFields(structBody);
      
      // Validate the parsed struct
      const validation = this.validateStruct(result);
      result.isValid = validation.isValid;
      result.errors = validation.errors;
      
    } catch (error) {
      result.errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return result;
  }

  /**
   * Parse struct fields from the struct body
   */
  private static parseFields(structBody: string): StructField[] {
    const fields: StructField[] = [];
    const lines = structBody.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();
      i++;

      if (!line || line.startsWith('//')) continue;

      if (line.includes('struct {')) {
        // Nested struct
        let fieldName = line.split(/\s+/)[0];
        let braceCount = 1;
        let nestedStructBody = '';
        
        while (i < lines.length && braceCount > 0) {
          const nestedLine = lines[i];
          if (nestedLine.includes('{')) braceCount++;
          if (nestedLine.includes('}')) braceCount--;
          if (braceCount > 0) nestedStructBody += nestedLine + '\n';
          i++;
        }
        
        const nestedFields = this.parseFields(nestedStructBody);
        // For now, we'll just represent the nested struct as a field.
        // A more advanced implementation could create a separate StructDefinition.
        fields.push({
          name: fieldName,
          type: 'struct {...}',
          isPointer: false,
          isSlice: false,
          isMap: false,
          jsonTag: this.extractJsonTag(line),
        });

      } else {
        const field = this.parseField(line);
        if (field) {
          fields.push(field);
        }
      }
    }
    
    return fields;
  }

  /**
   * Parse a single field declaration
   */
  private static parseField(line: string): StructField | null {
    // Regex to handle various field declarations, including embedded structs and complex types
    const fieldMatch = line.match(/^(\w+)?\s*(\*?\[?\]?[\w\.]+\s*`[^`]*`?)$/);
    if (!fieldMatch) return null;

    let [, name, rest] = fieldMatch;
    const tagString = (rest.match(/`[^`]*`/) || [''])[0];
    let type = rest.replace(tagString, '').trim();

    if (!name) {
      // Embedded struct
      name = type.replace('*', '').split('.').pop()!;
    }
    
    const isPointer = type.startsWith('*');
    const isSlice = type.startsWith('[]');
    const isMap = type.startsWith('map[');

    return {
      name,
      type,
      isPointer,
      isSlice,
      isMap,
      jsonTag: this.extractJsonTag(tagString)
    };
  }

  /**
   * Extract JSON tag from struct tag string
   */
  private static extractJsonTag(tagString: string): string | undefined {
    if (!tagString) return undefined;
    
    const jsonMatch = tagString.match(/json:"([^"]*)"/) || tagString.match(/json:`([^`]*)`/);
    return jsonMatch ? jsonMatch[1] : undefined;
  }

  /**
   * Remove comments from Go code
   */
  private static removeComments(code: string): string {
    // Remove single-line comments
    let result = code.replace(/\/\/.*$/gm, '');
    
    // Remove multi-line comments
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    
    return result;
  }

  /**
   * Validate a parsed struct definition
   */
  private static validateStruct(struct: StructDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate struct name
    if (!struct.name) {
      errors.push('Struct name is required');
    } else if (!/^[A-Z]\w*$/.test(struct.name)) {
      warnings.push('Struct name should start with uppercase letter for export');
    }

    // Validate fields
    if (struct.fields.length === 0) {
      warnings.push('Struct has no fields');
    }

    const fieldNames = new Set<string>();
    for (const field of struct.fields) {
      // Check for duplicate field names
      if (fieldNames.has(field.name)) {
        errors.push(`Duplicate field name: ${field.name}`);
      }
      fieldNames.add(field.name);

      // Validate field name
      if (!field.name) {
        errors.push('Field name is required');
      } else if (!/^\w+$/.test(field.name)) {
        errors.push(`Invalid field name: ${field.name}`);
      }

      // Validate field type
      if (!field.type) {
        errors.push(`Field ${field.name} is missing type`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Parse multiple struct definitions from source code
   */
  static parseMultipleStructs(code: string): StructDefinition[] {
    const structs: StructDefinition[] = [];
    
    // Find all struct definitions using regex
    const structMatches = code.match(/type\s+\w+\s+struct\s*{[^}]*}/g);
    
    if (structMatches) {
      for (const structCode of structMatches) {
        const struct = this.parseStruct(structCode);
        structs.push(struct);
      }
    }
    
    return structs;
  }
}

/**
 * Generate a unique ID for structs
 */
function generateId(): string {
  return `struct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}