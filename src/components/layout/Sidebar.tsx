import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  History,
  Image as ImageIcon,
  Film,
  Video,
  Wand2,
  FolderKanban,
  Clock,
  Settings,
  Zap,
  Coins
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useQueue } from '../../context/QueueContext';
import { ViewType } from '../../types';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, user } = useApp();
  const { activeTasks } = useQueue();

  const menuItems: { id: ViewType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: '1. Panel Principal', icon: LayoutDashboard },
    { id: 'image_enhancer', label: '2. Mejorar Imágenes', icon: Sparkles },
    { id: 'photo_restorer', label: '3. Restaurar Fotos', icon: History },
    { id: 'text_to_image', label: '4. Generar Imágenes', icon: ImageIcon },
    { id: 'text_to_video', label: '5. Texto a Video', icon: Film },
    { id: 'image_to_video', label: '6. Imagen a Video', icon: Video },
    { id: 'smart_editor', label: '7. Editor Inteligente', icon: Wand2 },
    { id: 'projects', label: '8. Mis Proyectos', icon: FolderKanban },
    { id: 'history', label: '9. Historial / Cola', icon: Clock, badge: activeTasks.length },
    { id: 'settings', label: '10. Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0A0D18] border-r border-[#1B2342] flex flex-col justify-between select-none z-20 flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-[#1B2342]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-glow-blue">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-wider text-lg gradient-text-electric">
              PIXELMIND <span className="text-white text-xs px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-400/30">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Multimedia Studio</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/40 shadow-glow-blue'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131930]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User & Credits Panel */}
      <div className="p-4 border-t border-[#1B2342] space-y-3 bg-[#080A14]">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#12172D] border border-[#222C54]">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300">Créditos:</span>
          </div>
          <span className="font-bold font-mono text-sm text-cyan-400">
            {user?.credits ?? '...'}
          </span>
        </div>

        <div className="flex items-center gap-3 px-1">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover border border-purple-500/50"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Creador'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.role === 'admin' ? 'Administrador' : 'Usuario Pro'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
