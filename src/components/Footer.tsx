import React from 'react';
import { useAppState } from '../store/AppStateContext';

export const Footer: React.FC = () => {
  const { state } = useAppState();

  const stats = {
    structs: state.flowConfig.structs.length,
    nodes: state.flowConfig.nodes.length,
    edges: state.flowConfig.edges.length,
    transformers: state.flowConfig.transformers.length,
    validStructs: state.flowConfig.structs.filter(s => s.isValid).length
  };

  return (
    <footer className="bg-background border-t border-border px-4 py-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {/* Left side - Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              state.error ? 'bg-destructive' : 
              state.isLoading ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}></div>
            <span>
              {state.error ? 'Error' : state.isLoading ? 'Loading...' : 'Ready'}
            </span>
          </div>
          
          {state.error && (
            <span className="text-destructive truncate max-w-md" title={state.error}>
              {state.error}
            </span>
          )}
        </div>

        {/* Center - Stats */}
        <div className="flex items-center gap-4">
          <span title="Structs (Valid/Total)">
            📄 {stats.validStructs}/{stats.structs}
          </span>
          <span title="Nodes">
            🔹 {stats.nodes}
          </span>
          <span title="Connections">
            🔗 {stats.edges}
          </span>
          <span title="Transformers">
            ⚙️ {stats.transformers}
          </span>
        </div>

        {/* Right side - Last updated */}
        <div className="text-right">
          <div>Last updated</div>
          <div className="text-muted-foreground">
            {state.flowConfig.updatedAt.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </footer>
  );
};