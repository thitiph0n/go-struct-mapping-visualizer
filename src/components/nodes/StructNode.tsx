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
    <Card className={`w-64 shadow-lg ${selected ? 'ring-2 ring-primary' : ''}`}>
      {/* Node handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-primary border-2 border-primary hover:w-5 hover:h-5 transition-all duration-200"
        style={{ left: -8, borderRadius: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-primary border-2 border-primary hover:w-5 hover:h-5 transition-all duration-200"
        style={{ right: -8, borderRadius: '50%' }}
      />
      
      <CardHeader className="p-4 pb-2">
        {/* Header */}
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
      
      <CardContent className="p-4 pt-0">
        {/* Fields list */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {struct.fields.map((field, index) => (
            <div key={index} className="relative group">
              {/* Field handles */}
              <Handle
                type="source"
                position={Position.Right}
                id={`field-${field.name}-out`}
                className="w-4 h-4 bg-green-500 border-2 border-green-500 hover:w-5 hover:h-5 transition-all duration-200 opacity-60 hover:opacity-100"
                style={{ 
                  right: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '50%'
                }}
              />
              <Handle
                type="target"
                position={Position.Left}
                id={`field-${field.name}-in`}
                className="w-4 h-4 bg-blue-500 border-2 border-blue-500 hover:w-5 hover:h-5 transition-all duration-200 opacity-60 hover:opacity-100"
                style={{ 
                  left: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '50%'
                }}
              />
              
              <div className="bg-muted p-3 rounded text-xs hover:bg-muted/80 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground truncate">
                    {field.name}
                  </span>
                  <span className="text-muted-foreground text-xs ml-2 shrink-0">
                    {field.type}
                  </span>
                </div>
                
                {field.jsonTag && (
                  <div className="text-muted-foreground text-xs mt-1">
                    json:"{field.jsonTag}"
                  </div>
                )}
                
                {/* Field type indicators */}
                <div className="flex gap-1 mt-1">
                  {field.isPointer && (
                    <Badge variant="outline" className="text-xs h-4">*</Badge>
                  )}
                  {field.isSlice && (
                    <Badge variant="outline" className="text-xs h-4">[]</Badge>
                  )}
                  {field.isMap && (
                    <Badge variant="outline" className="text-xs h-4">map</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {struct.fields.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-2">
              No fields
            </div>
          )}
        </div>
        
        {/* Error display */}
        {!struct.isValid && struct.errors.length > 0 && (
          <div className="mt-2 space-y-1">
            {struct.errors.slice(0, 2).map((error, index) => (
              <div key={index} className="text-xs text-destructive bg-destructive/10 p-1 rounded">
                {error}
              </div>
            ))}
            {struct.errors.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{struct.errors.length - 2} more error{struct.errors.length - 2 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};