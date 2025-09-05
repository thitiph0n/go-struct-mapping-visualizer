import React, { useRef, useState, useEffect } from 'react';
import { Plus, FolderOpen, Save, ChevronDown, Moon, Sun, Code, Trash2, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAppState } from '../store/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { StorageService } from '../utils/storage';
import { ExportService } from '../utils/exportUtils';
import { GoCodeGenerator } from '../utils/codeGenerator';
import { CodeDisplayModal } from './CodeDisplayModal';
import type { FlowConfig } from '../types';

export const Header: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedFileName, setGeneratedFileName] = useState('');
  const [savedConfigs, setSavedConfigs] = useState<FlowConfig[]>([]);

  useEffect(() => {
    setSavedConfigs(StorageService.getAllConfigs());
  }, [state.flowConfig]);

  const handleNew = () => {
    const newConfig = {
      id: `config_${Date.now()}`,
      name: 'New Mapping',
      structs: [],
      nodes: [],
      edges: [],
      transformers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'SET_FLOW_CONFIG', payload: newConfig });
  };

  const handleSave = () => {
    const success = StorageService.saveConfig(state.flowConfig);
    if (success) {
      setSavedConfigs(StorageService.getAllConfigs());
      // Could show a success toast here
      console.log('Configuration saved successfully');
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save configuration' });
    }
  };

  const handleOpen = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const config = await ExportService.importJSON(file);
      if (config) {
        dispatch({ type: 'SET_FLOW_CONFIG', payload: config });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to import configuration' });
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadConfig = (configId: string) => {
    const config = StorageService.loadConfig(configId);
    if (config) {
      dispatch({ type: 'SET_FLOW_CONFIG', payload: config });
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load configuration' });
    }
  };

  const handleDeleteConfig = (configId: string) => {
    if (window.confirm('Are you sure you want to delete this saved mapping?')) {
      const success = StorageService.deleteConfig(configId);
      if (success) {
        setSavedConfigs(StorageService.getAllConfigs());
        if (state.flowConfig.id === configId) {
          handleNew();
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete configuration' });
      }
    }
  };

  const handleGenerateCode = () => {
    try {
      const generated = GoCodeGenerator.generateMapping(state.flowConfig);
      if (generated.errors.length > 0) {
        dispatch({ type: 'SET_ERROR', payload: `Code generation failed: ${generated.errors.join(', ')}` });
        return;
      }
      const completeCode = GoCodeGenerator.formatCompleteFile(generated);
      setGeneratedCode(completeCode);
      setGeneratedFileName(`${generated.functionName.toLowerCase()}.go`);
      setIsCodeModalOpen(true);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector('.react-flow__viewport');
    if (canvas instanceof HTMLElement) {
      ExportService.exportPNG(canvas).catch(error => {
        dispatch({ type: 'SET_ERROR', payload: `Export failed: ${error.message}` });
      });
    }
  };

  const handleExportSVG = () => {
    try {
      ExportService.exportSVG(state.flowConfig);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const handleExportJSON = () => {
    try {
      ExportService.exportJSON(state.flowConfig);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const handleUndo = () => dispatch({ type: 'UNDO' });
  const handleRedo = () => dispatch({ type: 'REDO' });

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-background border-b border-border">
        <h1 className="text-xl font-bold text-foreground">
          Go Struct Mapping Visualizer
        </h1>
        
        <span className="text-sm text-muted-foreground">
          {state.flowConfig.name}
        </span>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          <Button variant="outline" size="sm" onClick={handleUndo}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo}>
            <Redo className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleNew}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="w-4 h-4 mr-1" />
                Open
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleOpen}>
                Open from File...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {savedConfigs.length > 0 ? (
                savedConfigs.map(config => (
                  <DropdownMenuItem key={config.id} className="flex justify-between items-center" onSelect={() => handleLoadConfig(config.id)}>
                    <span>{config.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDeleteConfig(config.id); }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No saved mappings</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>

          <Button variant="default" size="sm" onClick={handleGenerateCode}>
            <Code className="w-4 h-4 mr-1" />
            Generate Code
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Export
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportPNG}>
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportSVG}>
                Export as SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                Export JSON Config
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Hidden file input for importing */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelect}
        />
      </header>
      <CodeDisplayModal
        open={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        code={generatedCode}
        fileName={generatedFileName}
      />
    </>
  );
};