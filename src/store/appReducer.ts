import { applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import type { AppState, AppAction } from '../types';

export const initialState: AppState = {
  flowConfig: {
    id: 'default',
    name: 'New Mapping',
    structs: [],
    nodes: [],
    edges: [],
    transformers: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  selectedNode: undefined,
  selectedEdge: undefined,
  isLoading: false,
  error: undefined
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FLOW_CONFIG':
      return {
        ...state,
        flowConfig: {
          ...action.payload,
          updatedAt: new Date()
        }
      };

    case 'ADD_STRUCT':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          structs: [...state.flowConfig.structs, action.payload],
          updatedAt: new Date()
        }
      };

    case 'UPDATE_STRUCT':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          structs: state.flowConfig.structs.map(struct =>
            struct.id === action.payload.id ? action.payload : struct
          ),
          updatedAt: new Date()
        }
      };

    case 'UPDATE_STRUCT_DETAILS':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          structs: state.flowConfig.structs.map(struct =>
            struct.id === action.payload.id
              ? { ...struct, ...action.payload.updates }
              : struct
          ),
          updatedAt: new Date(),
        },
      };

    case 'REMOVE_STRUCT':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          structs: state.flowConfig.structs.filter(struct => struct.id !== action.payload),
          nodes: state.flowConfig.nodes.filter(node => node.data.structId !== action.payload),
          updatedAt: new Date()
        }
      };

    case 'ADD_NODE':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          nodes: [...state.flowConfig.nodes, action.payload],
          updatedAt: new Date()
        }
      };

    case 'UPDATE_NODE':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          nodes: state.flowConfig.nodes.map(node =>
            node.id === action.payload.id ? action.payload : node
          ),
          updatedAt: new Date()
        }
      };

    case 'REMOVE_NODE':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          nodes: state.flowConfig.nodes.filter(node => node.id !== action.payload),
          edges: state.flowConfig.edges.filter(edge => 
            edge.source !== action.payload && edge.target !== action.payload
          ),
          updatedAt: new Date()
        }
      };
    
    case 'APPLY_NODE_CHANGES':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          nodes: applyNodeChanges(action.payload, state.flowConfig.nodes),
          updatedAt: new Date()
        }
      };

    case 'ADD_EDGE':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          edges: [...state.flowConfig.edges, action.payload],
          updatedAt: new Date()
        }
      };

    case 'UPDATE_EDGE':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          edges: state.flowConfig.edges.map(edge =>
            edge.id === action.payload.id ? action.payload : edge
          ),
          updatedAt: new Date()
        }
      };

    case 'REMOVE_EDGE':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          edges: state.flowConfig.edges.filter(edge => edge.id !== action.payload),
          updatedAt: new Date()
        }
      };

    case 'APPLY_EDGE_CHANGES':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          edges: applyEdgeChanges(action.payload, state.flowConfig.edges),
          updatedAt: new Date()
        }
      };

    case 'ADD_TRANSFORMER':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          transformers: [...state.flowConfig.transformers, action.payload],
          updatedAt: new Date()
        }
      };

    case 'UPDATE_TRANSFORMER':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          transformers: state.flowConfig.transformers.map(transformer =>
            transformer.id === action.payload.id ? action.payload : transformer
          ),
          updatedAt: new Date()
        }
      };

    case 'REMOVE_TRANSFORMER':
      return {
        ...state,
        flowConfig: {
          ...state.flowConfig,
          transformers: state.flowConfig.transformers.filter(
            transformer => transformer.id !== action.payload
          ),
          updatedAt: new Date()
        }
      };

    case 'SELECT_NODE':
      return {
        ...state,
        selectedNode: action.payload,
        selectedEdge: undefined
      };

    case 'SELECT_EDGE':
      return {
        ...state,
        selectedEdge: action.payload,
        selectedNode: undefined
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedNode: undefined,
        selectedEdge: undefined
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: undefined
      };

    default:
      return state;
  }
}