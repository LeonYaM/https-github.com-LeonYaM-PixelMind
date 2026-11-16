import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { QueueProvider } from './context/QueueContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { ImageEnhancerView } from './components/views/ImageEnhancerView';
import { PhotoRestorerView } from './components/views/PhotoRestorerView';
import { TextToImageView } from './components/views/TextToImageView';
import { TextToVideoView } from './components/views/TextToVideoView';
import { ImageToVideoView } from './components/views/ImageToVideoView';
import { SmartEditorView } from './components/views/SmartEditorView';
import { ProjectsView } from './components/views/ProjectsView';
import { GenerationHistoryView } from './components/views/GenerationHistoryView';
import { SettingsView } from './components/views/SettingsView';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, toasts, removeToast } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'image_enhancer':
        return <ImageEnhancerView />;
      case 'photo_restorer':
        return <PhotoRestorerView />;
      case 'text_to_image':
        return <TextToImageView />;
      case 'text_to_video':
        return <TextToVideoView />;
      case 'image_to_video':
        return <ImageToVideoView />;
      case 'smart_editor':
        return <SmartEditorView />;
      case 'projects':
        return <ProjectsView />;
      case 'history':
        return <GenerationHistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#080A12] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#080A14]">
          {renderView()}
        </main>
      </div>

      {/* Floating Notifications (Toasts) */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-blue-950/90 border-blue-500/50 text-cyan-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <QueueProvider>
        <AppContent />
      </QueueProvider>
    </AppProvider>
  );
};

export default App;
