import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Editor from '@monaco-editor/react';
import { X, Code2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GoStructParser } from '../utils/goParser';
import { useAppState } from '../store/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';

interface AddStructModalProps {
  open: boolean;
  onClose: () => void;
}

const EXAMPLE_SINGLE_STRUCT = `type User struct {\n\tID   int64  \`json:\"id\"\`\n\tName string \`json:\"name\"\`\n}`;

export const AddStructModal: React.FC<AddStructModalProps> = ({
  open,
  onClose,
}) => {
  const { dispatch } = useAppState();
  const { theme } = useTheme();
  const [code, setCode] = useState(EXAMPLE_SINGLE_STRUCT);
  const [parseAttempted, setParseAttempted] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReturnType<
    typeof GoStructParser.parseStruct
  > | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset state when closed
      setParseAttempted(false);
      setError(null);
      setPreview(null);
      return;
    }
  }, [open]);

  if (!open) return null;

  const handleParse = () => {
    setIsParsing(true);
    setError(null);
    setParseAttempted(true);
    try {
      const struct = GoStructParser.parseStruct(code);
      setPreview(struct);
      if (!struct.isValid) {
        setError(struct.errors[0] || 'Struct invalid');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse struct');
    } finally {
      setIsParsing(false);
    }
  };

  const handleAdd = () => {
    if (!preview) {
      handleParse();
      return;
    }
    if (!preview.isValid) return;

    // Dispatch struct
    dispatch({ type: 'ADD_STRUCT', payload: preview });
    // Create accompanying node
    const node = {
      id: `node_${preview.id}`,
      type: 'struct' as const,
      position: { x: Math.random() * 500, y: Math.random() * 400 },
      data: { structId: preview.id, label: preview.name },
    };
    dispatch({ type: 'ADD_NODE', payload: node });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative bg-background border border-border rounded-lg shadow-xl w-[720px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            <h2 className="text-sm font-semibold">Add New Struct Node</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">
              Go Struct Code
            </label>
            <div className="border border-border rounded-md overflow-hidden h-48">
              <Editor
                height="100%"
                defaultLanguage="go"
                value={code}
                onChange={(v) => setCode(v || '')}
                theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleParse}
                disabled={isParsing || !code.trim()}
              >
                {isParsing ? 'Parsing...' : 'Parse'}
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!!error || !code.trim()}
              >
                Add Node
              </Button>
            </div>
          </div>
          {parseAttempted && preview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Preview</span>
                {preview.isValid ? (
                  <Badge className="text-xs flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" /> Invalid
                  </Badge>
                )}
              </div>
              <div className="bg-muted rounded p-3 text-xs space-y-2 max-h-48 overflow-y-auto">
                <div className="font-mono font-medium">
                  {preview.name || '<unnamed>'}
                </div>
                {preview.fields.length > 0 ? (
                  <ul className="space-y-1">
                    {preview.fields.map((f) => (
                      <li
                        key={f.name}
                        className="flex items-center justify-between bg-background/60 p-2 rounded border border-border"
                      >
                        <span className="font-mono truncate" title={f.name}>
                          {f.name}
                        </span>
                        <span
                          className="text-muted-foreground ml-4 truncate"
                          title={f.type}
                        >
                          {f.type}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground">No fields parsed</div>
                )}
                {preview.errors.length > 0 && (
                  <div className="space-y-1">
                    {preview.errors.map((e, i) => (
                      <div
                        key={i}
                        className="text-destructive bg-destructive/10 p-2 rounded"
                      >
                        {e}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {error && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
        </div>
        <div className="p-3 border-t border-border flex justify-end gap-2 bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!preview || !preview.isValid}
          >
            Add Node
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddStructModal;