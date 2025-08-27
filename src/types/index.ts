// Core data models for the Go Struct Mapping Visualizer

export interface StructField {
  name: string;
  type: string;
  jsonTag?: string;
  isPointer: boolean;
  isSlice: boolean;
  isMap: boolean;
}

export interface StructDefinition {
  id: string;
  name: string;
  fields: StructField[];
  rawCode: string;
  isValid: boolean;
  errors: string[];
}

export interface TransformerNode {
  id: string;
  name: string;
  code: string;
  inputType: string;
  outputType: string;
  isValid: boolean;
}

export interface FlowNode {
  id: string;
  type: 'struct' | 'transformer';
  position: { x: number; y: number };
  data: {
    structId?: string;
    transformerId?: string;
    label: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: {
    transformerId?: string;
  };
}

export interface FlowConfig {
  id: string;
  name: string;
  structs: StructDefinition[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  transformers: TransformerNode[];
  createdAt: Date;
  updatedAt: Date;
}

// UI State types
export interface AppState {
  flowConfig: FlowConfig;
  selectedNode?: FlowNode;
  selectedEdge?: FlowEdge;
  isLoading: boolean;
  error?: string;
}

// Actions for state management
export type AppAction =
  | { type: 'SET_FLOW_CONFIG'; payload: FlowConfig }
  | { type: 'ADD_STRUCT'; payload: StructDefinition }
  | { type: 'UPDATE_STRUCT'; payload: StructDefinition }
  | { type: 'REMOVE_STRUCT'; payload: string }
  | { type: 'ADD_NODE'; payload: FlowNode }
  | { type: 'UPDATE_NODE'; payload: FlowNode }
  | { type: 'REMOVE_NODE'; payload: string }
  | { type: 'ADD_EDGE'; payload: FlowEdge }
  | { type: 'UPDATE_EDGE'; payload: FlowEdge }
  | { type: 'REMOVE_EDGE'; payload: string }
  | { type: 'ADD_TRANSFORMER'; payload: TransformerNode }
  | { type: 'UPDATE_TRANSFORMER'; payload: TransformerNode }
  | { type: 'REMOVE_TRANSFORMER'; payload: string }
  | { type: 'SELECT_NODE'; payload: FlowNode }
  | { type: 'SELECT_EDGE'; payload: FlowEdge }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Go code generation types
export interface GeneratedCode {
  functionName: string;
  code: string;
  imports: string[];
  errors: string[];
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}