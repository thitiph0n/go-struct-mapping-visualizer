import { useReducer } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainCanvas } from './components/MainCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Footer } from './components/Footer';
import { appReducer, initialState } from './store/appReducer';
import { AppStateProvider } from './store/AppStateContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <ThemeProvider>
      <AppStateProvider value={{ state, dispatch }}>
        <ReactFlowProvider>
          <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <Header />

            {/* Main content area */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <Sidebar />

              {/* Main canvas area */}
              <div className="flex-1 flex flex-col">
                <MainCanvas />
              </div>

              {/* Properties panel */}
              <PropertiesPanel />
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </ReactFlowProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

export default App;