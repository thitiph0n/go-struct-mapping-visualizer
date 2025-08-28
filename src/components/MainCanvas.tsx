import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant
} from '@xyflow/react';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@xyflow/react';
import { AlertTriangle, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '../store/AppStateContext';
import { StructNode } from './nodes/StructNode';

const nodeTypes = {
  struct: StructNode,
};

export const MainCanvas: React.FC = () => {
  const { state, dispatch } = useAppState();
  
  // Memoize nodes and edges to prevent unnecessary re-renders during dragging
  const reactFlowNodes: Node[] = useMemo(() => 
    state.flowConfig.nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      dragHandle: '.drag-handle', // Optimize dragging performance
    })), [state.flowConfig.nodes]);
  
  const reactFlowEdges: Edge[] = useMemo(() => 
    state.flowConfig.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      animated: false, // Disable animation for better performance
    })), [state.flowConfig.edges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const newEdge = {
          id: `edge_${Date.now()}`,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle || undefined,
          targetHandle: connection.targetHandle || undefined
        };
        
        dispatch({ type: 'ADD_EDGE', payload: newEdge });
      }
    },
    [dispatch]
  );

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Handle different types of node changes
    changes.forEach(change => {
      if (change.type === 'position' && change.position && change.dragging === false) {
        // Only update app state when dragging stops to reduce re-renders
        const node = state.flowConfig.nodes.find(n => n.id === change.id);
        if (node) {
          const updatedNode = {
            ...node,
            position: change.position
          };
          dispatch({ type: 'UPDATE_NODE', payload: updatedNode });
        }
      } else if (change.type === 'remove') {
        // Handle node deletion
        dispatch({ type: 'REMOVE_NODE', payload: change.id });
      } else if (change.type === 'select') {
        // Handle node selection
        const node = state.flowConfig.nodes.find(n => n.id === change.id);
        if (node && change.selected) {
          dispatch({ type: 'SELECT_NODE', payload: node });
        } else if (!change.selected) {
          dispatch({ type: 'CLEAR_SELECTION' });
        }
      }
    });
  }, [state.flowConfig.nodes, dispatch]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Handle edge changes
    changes.forEach(change => {
      if (change.type === 'remove') {
        dispatch({ type: 'REMOVE_EDGE', payload: change.id });
      } else if (change.type === 'select') {
        // Handle edge selection
        const edge = state.flowConfig.edges.find(e => e.id === change.id);
        if (edge && change.selected) {
          dispatch({ type: 'SELECT_EDGE', payload: edge });
        } else if (!change.selected) {
          dispatch({ type: 'CLEAR_SELECTION' });
        }
      }
    });
  }, [state.flowConfig.edges, dispatch]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const appNode = state.flowConfig.nodes.find(n => n.id === node.id);
    if (appNode) {
      dispatch({ type: 'SELECT_NODE', payload: appNode });
    }
  }, [state.flowConfig.nodes, dispatch]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const appEdge = state.flowConfig.edges.find(e => e.id === edge.id);
    if (appEdge) {
      dispatch({ type: 'SELECT_EDGE', payload: appEdge });
    }
  }, [state.flowConfig.edges, dispatch]);

  const onPaneClick = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, [dispatch]);

  return (
    <div className="flex-1 bg-background relative">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
      >
        <Controls className="bg-background border border-border" />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} className="opacity-30" />
      </ReactFlow>
      
      {/* Loading overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Processing...</span>
          </div>
        </div>
      )}
      
      {/* Error display */}
      {state.error && (
        <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg max-w-md z-40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-sm">Error</h3>
            <div className="text-sm">{state.error}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
            className="text-destructive-foreground hover:bg-destructive-foreground/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {/* Empty state */}
      {reactFlowNodes.length === 0 && !state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">No structs added yet</h3>
            <p className="text-sm">Add Go struct definitions in the sidebar to get started</p>
          </div>
        </div>
      )}
    </div>
  );
};