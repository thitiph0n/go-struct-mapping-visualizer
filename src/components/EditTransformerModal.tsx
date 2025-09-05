import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Editor from '@monaco-editor/react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '../store/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import type { TransformerNode as Transformer } from '../types';

interface EditTransformerModalProps {
  open: boolean;
  onClose: () => void;
  transformer: Transformer | null;
}

export const EditTransformerModal: React.FC<EditTransformerModalProps> = ({
  open,
  onClose,
  transformer,
}) => {
  const { dispatch } = useAppState();
  const { theme } = useTheme();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (transformer) {
      setCode(transformer.code);
      setName(transformer.name);
    }
  }, [transformer]);

  if (!open || !transformer) return null;

  const handleSave = () => {
    const updatedTransformer = {
      ...transformer,
      name,
      code,
      // A more advanced implementation would re-validate the transformer
      isValid: true, 
    };
    dispatch({ type: 'UPDATE_TRANSFORMER', payload: updatedTransformer });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-background border border-border rounded-lg shadow-xl w-[720px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold">Edit Transformer</h2>
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
            <label className="text-xs font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Go Code</label>
            <div className="border border-border rounded-md overflow-hidden h-64">
              <Editor
                height="100%"
                defaultLanguage="go"
                value={code}
                onChange={(v) => setCode(v || '')}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                }}
              />
            </div>
          </div>
        </div>
        <div className="p-3 border-t border-border flex justify-end gap-2 bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
