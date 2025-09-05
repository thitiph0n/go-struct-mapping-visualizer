import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppState } from '../../store/AppStateContext';

interface TransformerNodeProps {
  id: string;
  data: {
    transformerId?: string;
    label: string;
  };
  selected?: boolean;
}

export const TransformerNode: React.FC<TransformerNodeProps> = ({ data, selected }) => {
  const { state } = useAppState();
  const transformer = state.flowConfig.transformers.find(t => t.id === data.transformerId);

  if (!transformer) {
    return (
      <Card className={`w-48 bg-destructive text-destructive-foreground shadow-lg ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm">Error: Transformer not found</h3>
          <p className="text-xs">ID: {data.transformerId}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-48 shadow-md bg-background ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="p-2 pb-1 drag-handle cursor-move bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <CardTitle className="text-sm">{transformer.name}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-2">
        <div className="relative bg-background p-2 rounded text-xs">
          <Handle
            type="target"
            position={Position.Left}
            id="transformer-in"
            className="w-3 h-3 !bg-blue-500"
            style={{ top: '50%', left: -6, transform: 'translateY(-50%)' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="transformer-out"
            className="w-3 h-3 !bg-green-500"
            style={{ top: '50%', right: -6, transform: 'translateY(-50%)' }}
          />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">in:</span>
            <span className="font-mono">{transformer.inputType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">out:</span>
            <span className="font-mono">{transformer.outputType}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
