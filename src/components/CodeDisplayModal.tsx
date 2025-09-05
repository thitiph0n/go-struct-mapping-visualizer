import React from 'react';
import { createPortal } from 'react-dom';
import Editor from '@monaco-editor/react';
import { X, Clipboard, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../contexts/ThemeContext';

interface CodeDisplayModalProps {
  open: boolean;
  onClose: () => void;
  code: string;
  fileName: string;
}

export const CodeDisplayModal: React.FC<CodeDisplayModalProps> = ({
  open,
  onClose,
  code,
  fileName,
}) => {
  const { theme } = useTheme();

  if (!open) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here to confirm the copy
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-background border border-border rounded-lg shadow-xl w-[80vw] max-w-[960px] h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold">Generated Go Code</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Clipboard className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="border border-border rounded-md overflow-hidden h-full">
            <Editor
              height="100%"
              defaultLanguage="go"
              value={code}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                wordWrap: 'on',
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
