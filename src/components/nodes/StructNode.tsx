import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppState } from '../../store/AppStateContext';

interface StructNodeProps {
  id: string;
  data: {
    structId?: string;
    label: string;
  };
  selected?: boolean;
}

export const StructNode: React.FC<StructNodeProps> = ({ data, selected }) => {
  const { state } = useAppState();
  const struct = state.flowConfig.structs.find(s => s.id === data.structId);

  if (!struct) {
    return (
      <Card className={`w-64 bg-destructive text-destructive-foreground shadow-lg ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm">Error: Struct not found</h3>
          <p className="text-xs">Struct ID: {data.structId}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-64 shadow-lg bg-background ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="p-3 pb-1 drag-handle cursor-move">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{struct.name}</CardTitle>
          <div className="flex gap-1">
            {struct.isValid ? (
              <Badge variant="default" className="text-xs">✓</Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">!</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 pb-3 pt-0">
        <div className="space-y-1">
          {struct.fields.map((field) => (
            <div 
              key={field.name} 
              className="relative group bg-muted p-2 rounded text-xs hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <Handle
                type="source"
                position={Position.Right}
                id={`field-${field.name}-out`}
                className="w-3 h-3 !bg-green-500"
                style={{ top: '50%', right: -6, transform: 'translateY(-50%)' }}
              />
              <Handle
                type="target"
                position={Position.Left}
                id={`field-${field.name}-in`}
                className="w-3 h-3 !bg-blue-500"
                style={{ top: '50%', left: -6, transform: 'translateY(-50%)' }}
              />
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground truncate">
                  {field.name}
                </span>
                <span className="text-muted-foreground text-xs ml-2 shrink-0">
                  {field.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};