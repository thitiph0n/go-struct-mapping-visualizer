import React, { useState, useRef, useCallback } from 'react';
import { FileText, Settings, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppState } from '../store/AppStateContext';
import { TransformerLibrary } from './TransformerLibrary';
import { AddStructModal } from './AddStructModal';

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [sidebarWidth, setSidebarWidth] = useState(384); // 24rem in pixels
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = sidebarWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [sidebarWidth]
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;

    const deltaX = e.clientX - startX.current;
    const newWidth = Math.max(280, Math.min(600, startWidth.current + deltaX));
    setSidebarWidth(newWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleRemoveStruct = (id: string) => {
    dispatch({ type: 'REMOVE_STRUCT', payload: id });
  };

  return (
    <div
      className="bg-background border-r border-border flex flex-col relative"
      style={{ width: sidebarWidth }}
    >
      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full bg-border hover:bg-primary cursor-col-resize flex items-center justify-center group"
        onMouseDown={handleMouseDown}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
      </div>

      <Tabs defaultValue="structs" className="h-full flex flex-col p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="structs" className="text-sm gap-2">
            <FileText className="w-4 h-4" />
            Structs
          </TabsTrigger>
          <TabsTrigger value="transformers" className="text-sm gap-2">
            <Settings className="w-4 h-4" />
            Transformers
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="structs"
          className="flex-1 flex flex-col m-0 px-4 pb-4"
        >
          <Tabs defaultValue="input" className="flex-1 flex flex-col gap-4">
            <TabsList className="grid w-full grid-cols-2 mt-2">
              <TabsTrigger value="input" className="text-sm">
                Input Structs
              </TabsTrigger>
              <TabsTrigger value="output" className="text-sm">
                Output Structs
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="input"
              className="flex-1 flex flex-col gap-4 m-0 overflow-hidden"
            >
              <div className="flex items-center justify-between pt-2">
                <h3 className="text-sm font-semibold">
                  Struct Nodes ({state.flowConfig.structs.length})
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add New Node
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto rounded-md border border-border bg-muted/30 p-2">
                {state.flowConfig.structs.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-8">
                    No structs yet. Click "Add New Node" to create one.
                  </div>
                )}
                <div className="space-y-2">
                  {state.flowConfig.structs.map((struct) => (
                    <Card key={struct.id} className="shadow-sm">
                      <CardContent className="p-2">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className="font-medium text-sm truncate"
                                title={struct.name}
                              >
                                {struct.name}
                              </h4>
                              {struct.isValid ? (
                                <Badge
                                  variant="default"
                                  className="text-[10px] px-1"
                                >
                                  Valid
                                </Badge>
                              ) : (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] px-1"
                                >
                                  Invalid
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {struct.fields.length} field
                              {struct.fields.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleRemoveStruct(struct.id)}
                          >
                            Remove
                          </Button>
                        </div>
                        {struct.fields.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {struct.fields.slice(0, 6).map((f) => (
                              <span
                                key={f.name}
                                className="text-[10px] px-1 py-0.5 bg-muted rounded font-mono"
                                title={`${f.name}: ${f.type}`}
                              >
                                {f.name}
                              </span>
                            ))}
                            {struct.fields.length > 6 && (
                              <span className="text-[10px] px-1 py-0.5 bg-muted rounded">
                                +{struct.fields.length - 6} more
                              </span>
                            )}
                          </div>
                        )}
                        {!struct.isValid && struct.errors.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {struct.errors.slice(0, 2).map((e, i) => (
                              <div
                                key={i}
                                className="text-[10px] text-destructive bg-destructive/10 px-2 py-1 rounded"
                              >
                                {e}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="output" className="flex-1 flex flex-col m-0">
              <div className="text-center text-sm text-muted-foreground py-8">
                Output struct configuration coming soon.
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="transformers" className="flex-1 m-0">
          <TransformerLibrary />
        </TabsContent>
      </Tabs>
      <AddStructModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
};
