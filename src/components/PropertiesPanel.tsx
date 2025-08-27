import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppState } from '../store/AppStateContext';

export const PropertiesPanel: React.FC = () => {
  const { state, dispatch } = useAppState();
  
  const selectedStruct = state.selectedNode?.data.structId 
    ? state.flowConfig.structs.find(s => s.id === state.selectedNode?.data.structId)
    : undefined;

  const selectedTransformer = state.selectedNode?.data.transformerId
    ? state.flowConfig.transformers.find(t => t.id === state.selectedNode?.data.transformerId)
    : undefined;

  const handleClosePanel = () => {
    dispatch({ type: 'CLEAR_SELECTION' });
  };

  const handleDeleteNode = () => {
    if (state.selectedNode) {
      dispatch({ type: 'REMOVE_NODE', payload: state.selectedNode.id });
      dispatch({ type: 'CLEAR_SELECTION' });
    }
  };

  const handleDeleteEdge = () => {
    if (state.selectedEdge) {
      dispatch({ type: 'REMOVE_EDGE', payload: state.selectedEdge.id });
      dispatch({ type: 'CLEAR_SELECTION' });
    }
  };

  // Don't show panel if nothing is selected
  if (!state.selectedNode && !state.selectedEdge) {
    return null;
  }

  return (
    <div className="w-80 bg-background border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {state.selectedNode ? 'Node Properties' : 'Edge Properties'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClosePanel}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Node Properties */}
        {state.selectedNode && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Node ID
              </label>
              <Input
                type="text"
                value={state.selectedNode.id}
                readOnly
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Type
              </label>
              <Badge variant="outline">{state.selectedNode.type}</Badge>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={Math.round(state.selectedNode.position.x)}
                  readOnly
                  placeholder="X"
                />
                <Input
                  type="number"
                  value={Math.round(state.selectedNode.position.y)}
                  readOnly
                  placeholder="Y"
                />
              </div>
            </div>

            {/* Struct-specific properties */}
            {selectedStruct && (
              <div className="space-y-4">
                <Separator />
                <h3 className="text-sm font-medium text-foreground">Struct Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={selectedStruct.name}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Status
                  </label>
                  <Badge variant={selectedStruct.isValid ? 'default' : 'destructive'}>
                    {selectedStruct.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>

                {!selectedStruct.isValid && selectedStruct.errors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Errors
                    </label>
                    <div className="space-y-1">
                      {selectedStruct.errors.map((error, index) => (
                        <div key={index} className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Fields ({selectedStruct.fields.length})
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedStruct.fields.map((field, index) => (
                      <div key={index} className="bg-muted p-3 rounded">
                        <div className="font-medium text-sm">{field.name}</div>
                        <div className="text-xs text-muted-foreground">{field.type}</div>
                        {field.jsonTag && (
                          <div className="text-xs text-muted-foreground mt-1">
                            json:"{field.jsonTag}"
                          </div>
                        )}
                        <div className="flex gap-1 mt-2">
                          {field.isPointer && (
                            <Badge variant="outline" className="text-xs">pointer</Badge>
                          )}
                          {field.isSlice && (
                            <Badge variant="outline" className="text-xs">slice</Badge>
                          )}
                          {field.isMap && (
                            <Badge variant="outline" className="text-xs">map</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Transformer-specific properties */}
            {selectedTransformer && (
              <div className="space-y-4">
                <Separator />
                <h3 className="text-sm font-medium text-foreground">Transformer Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={selectedTransformer.name}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Type Conversion
                  </label>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{selectedTransformer.inputType}</Badge>
                    <span>→</span>
                    <Badge variant="outline">{selectedTransformer.outputType}</Badge>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Code
                  </label>
                  <div className="bg-muted p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
                    <pre>{selectedTransformer.code}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Actions</h3>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleDeleteNode}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Node
              </Button>
            </div>
          </div>
        )}

        {/* Edge Properties */}
        {state.selectedEdge && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Edge ID
              </label>
              <Input
                type="text"
                value={state.selectedEdge.id}
                readOnly
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Connection
              </label>
              <div className="text-sm text-muted-foreground">
                <div>From: {state.selectedEdge.source}</div>
                <div>To: {state.selectedEdge.target}</div>
              </div>
            </div>

            {state.selectedEdge.sourceHandle && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Source Handle
                </label>
                <Badge variant="outline">
                  {state.selectedEdge.sourceHandle}
                </Badge>
              </div>
            )}

            {state.selectedEdge.targetHandle && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Target Handle
                </label>
                <Badge variant="outline">
                  {state.selectedEdge.targetHandle}
                </Badge>
              </div>
            )}

            {/* Actions */}
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Actions</h3>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleDeleteEdge}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Connection
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};