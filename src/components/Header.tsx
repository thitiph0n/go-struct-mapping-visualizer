import React, { useRef } from 'react';
import { Plus, FolderOpen, Save, ChevronDown, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppState } from '../store/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { StorageService } from '../utils/storage';
import { ExportService } from '../utils/exportUtils';

export const Header: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportGoCode = () => {
    try {
      ExportService.exportGoCode(state.flowConfig);
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

  return (
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
        
        <Button variant="outline" size="sm" onClick={handleNew}>
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleOpen}>
          <FolderOpen className="w-4 h-4 mr-1" />
          Open
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleSave}>
          <Save className="w-4 h-4 mr-1" />
          Save
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
            <DropdownMenuItem onClick={handleExportGoCode}>
              Export Go Code
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
  );
};