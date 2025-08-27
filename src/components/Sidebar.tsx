import React, { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { FileText, Settings, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppState } from '../store/AppStateContext';
import { GoStructParser } from '../utils/goParser';
import { TransformerLibrary } from './TransformerLibrary';

const EXAMPLE_STRUCT = `type User struct {
	ID       int64     \`json:"id"\`
	Name     string    \`json:"name"\`
	Email    string    \`json:"email"\`
	Age      int       \`json:"age"\`
	Active   bool      \`json:"active"\`
	Tags     []string  \`json:"tags"\`
	Profile  *Profile  \`json:"profile,omitempty"\`
}

type Profile struct {
	Bio       string    \`json:"bio"\`
	Avatar    string    \`json:"avatar"\`
	Location  string    \`json:"location"\`
}`;

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [code, setCode] = useState(EXAMPLE_STRUCT);
  const [sidebarWidth, setSidebarWidth] = useState(384); // 24rem in pixels
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

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

  const handleParseStructs = () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const structs = GoStructParser.parseMultipleStructs(code);
      
      structs.forEach(struct => {
        dispatch({ type: 'ADD_STRUCT', payload: struct });
        
        const node = {
          id: `node_${struct.id}`,
          type: 'struct' as const,
          position: { x: Math.random() * 300, y: Math.random() * 300 },
          data: {
            structId: struct.id,
            label: struct.name
          }
        };
        
        dispatch({ type: 'ADD_NODE', payload: node });
      });
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to parse structs' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleClearStructs = () => {
    state.flowConfig.structs.forEach(struct => {
      dispatch({ type: 'REMOVE_STRUCT', payload: struct.id });
    });
    
    dispatch({ type: 'CLEAR_SELECTION' });
  };

  return (
    <div className="bg-background border-r border-border flex flex-col relative" style={{ width: sidebarWidth }}>
      {/* Resize handle */}
      <div 
        className="absolute top-0 right-0 w-1 h-full bg-border hover:bg-primary cursor-col-resize flex items-center justify-center group"
        onMouseDown={handleMouseDown}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
      </div>
      
      <Tabs defaultValue="structs" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 m-2">
          <TabsTrigger value="structs" className="text-sm gap-2">
            <FileText className="w-4 h-4" />
            Structs
          </TabsTrigger>
          <TabsTrigger value="transformers" className="text-sm gap-2">
            <Settings className="w-4 h-4" />
            Transformers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structs" className="flex-1 flex flex-col m-0">
          <Tabs defaultValue="input" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="input" className="text-sm">
                Input Structs
              </TabsTrigger>
              <TabsTrigger value="output" className="text-sm">
                Output Structs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="flex-1 flex flex-col p-4 gap-4 m-0 overflow-hidden">
              {/* Code Editor */}
              <div className="flex-shrink-0">
                <div className="text-sm font-medium mb-2 text-foreground">
                  Go Struct Definitions:
                </div>
                <div className="border border-border rounded-lg overflow-hidden bg-background h-64">
                  <Editor
                    height="100%"
                    defaultLanguage="go"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      insertSpaces: false,
                      wordWrap: 'on'
                    }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  className="flex-1"
                  onClick={handleParseStructs}
                  disabled={!code.trim() || state.isLoading}
                >
                  {state.isLoading ? (
                    "Loading..."
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Parse & Add Structs
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearStructs}
                  disabled={state.flowConfig.structs.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>

              {/* Parsed structs list */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="text-sm font-medium mb-2 text-foreground">
                  Parsed Structs ({state.flowConfig.structs.length}):
                </div>
                
                <div className="space-y-2 pr-1">
                  {state.flowConfig.structs.map((struct) => (
                    <Card key={struct.id} className="shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm text-foreground truncate">{struct.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {struct.fields.length} field{struct.fields.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          
                          <div className="flex gap-1 ml-2">
                            {struct.isValid ? (
                              <Badge variant="default" className="text-xs">Valid</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">Invalid</Badge>
                            )}
                          </div>
                        </div>
                        
                        {!struct.isValid && struct.errors.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {struct.errors.map((error, index) => (
                              <div key={index} className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                                {error}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                            Show fields ({struct.fields.length})
                          </summary>
                          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {struct.fields.map((field, index) => (
                              <div key={index} className="text-xs bg-muted p-2 rounded">
                                <div className="font-mono text-xs truncate" title={field.name}>{field.name}</div>
                                <div className="text-muted-foreground text-xs truncate" title={field.type}>{field.type}</div>
                                {field.jsonTag && (
                                  <div className="text-muted-foreground text-xs truncate" title={`json:"${field.jsonTag}"`}>
                                    json:"{field.jsonTag}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {state.flowConfig.structs.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      No structs parsed yet. Add Go struct definitions above and click "Parse & Add Structs".
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="flex-1 flex flex-col p-4 gap-4 m-0">
              {/* Output structs content - placeholder for now */}
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
    </div>
  );
};