import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction } from '../types';

interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

interface AppStateProviderProps {
  children: ReactNode;
  value: AppStateContextType;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children, value }) => {
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};