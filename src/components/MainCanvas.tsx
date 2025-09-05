import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@xyflow/react';
import { AlertTriangle, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '../store/AppStateContext';
import { StructNode } from './nodes/StructNode';
import { TransformerNode } from './nodes/TransformerNode';
import { EditTransformerModal } from './EditTransformerModal';
import type { TransformerNode as Transformer } from '../types';

const nodeTypes = {
  struct: StructNode,
  transformer: TransformerNode,
};

// Helper function to check if a point is on a line segment
function isPointOnLine(line: { x1: number; y1: number; x2: number; y2: number }, point: { x: number; y: number }, tolerance = 5) {
  const { x1, y1, x2, y2 } = line;
  const { x, y } = point;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return false; // It's a point, not a line

  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
  if (t < 0 || t > 1) return false; // Point is outside the segment

  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;
  const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

  return distance <= tolerance;
}

export const MainCanvas: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { getNode } = useReactFlow();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransformer, setSelectedTransformer] = useState<Transformer | null>(null);
  
  // Memoize nodes and edges to prevent unnecessary re-renders during dragging
  const reactFlowNodes: Node[] = useMemo(() => 
    state.flowConfig.nodes.map(node => ({
      ...node,
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

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      dispatch({ type: 'APPLY_NODE_CHANGES', payload: changes });
    },
    [dispatch]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      dispatch({ type: 'APPLY_EDGE_CHANGES', payload: changes });
    },
    [dispatch]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const appNode = state.flowConfig.nodes.find(n => n.id === node.id);
    if (appNode) {
      dispatch({ type: 'SELECT_NODE', payload: appNode });
    }
  }, [state.flowConfig.nodes, dispatch]);

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'transformer') {
      const transformer = state.flowConfig.transformers.find(t => t.id === node.data.transformerId);
      if (transformer) {
        setSelectedTransformer(transformer);
        setIsEditModalOpen(true);
      }
    }
  }, [state.flowConfig.transformers]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const appEdge = state.flowConfig.edges.find(e => e.id === edge.id);
    if (appEdge) {
      dispatch({ type: 'SELECT_EDGE', payload: appEdge });
    }
  }, [state.flowConfig.edges, dispatch]);

  const onPaneClick = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, [dispatch]);

  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type !== 'transformer') return;

    const transformerNode = node;
    const transformerCenter = {
      x: transformerNode.position.x + (transformerNode.width! / 2),
      y: transformerNode.position.y + (transformerNode.height! / 2),
    };

    const targetEdge = state.flowConfig.edges.find(edge => {
      const sourceNode = getNode(edge.source);
      const targetNode = getNode(edge.target);
      if (!sourceNode || !targetNode) return false;

      const sourceHandlePos = sourceNode.position;
      const targetHandlePos = targetNode.position;

      return isPointOnLine(
        { x1: sourceHandlePos.x, y1: sourceHandlePos.y, x2: targetHandlePos.x, y2: targetHandlePos.y },
        transformerCenter
      );
    });

    if (targetEdge) {
      // Remove the original edge
      dispatch({ type: 'REMOVE_EDGE', payload: targetEdge.id });

      // Create new edges
      const edge1 = {
        id: `edge_${Date.now()}_a`,
        source: targetEdge.source,
        target: transformerNode.id,
        sourceHandle: targetEdge.sourceHandle,
        targetHandle: 'transformer-in',
      };
      const edge2 = {
        id: `edge_${Date.now()}_b`,
        source: transformerNode.id,
        target: targetEdge.target,
        sourceHandle: 'transformer-out',
        targetHandle: targetEdge.targetHandle,
      };

      dispatch({ type: 'ADD_EDGE', payload: edge1 });
      dispatch({ type: 'ADD_EDGE', payload: edge2 });
    }
  }, [state.flowConfig.edges, getNode, dispatch]);

  return (
    <div className="flex-1 bg-background relative">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
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
      
      {/* Edit Transformer Modal */}
      <EditTransformerModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transformer={selectedTransformer}
      />
      
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
