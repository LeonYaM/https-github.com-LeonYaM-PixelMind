import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Coins, Folder, ShieldCheck, KeyRound } from 'lucide-react';
import { api } from '../../services/api';

export const Header: React.FC = () => {
  const { currentView, setCurrentView, user, projects, activeProject, setActiveProject, refreshUser, settings, showToast } = useApp();
  const [recharging, setRecharging] = useState(false);

  const viewTitles: Record<string, string> = {
    dashboard: 'Panel Principal & Estudio Multimedia',
    image_enhancer: 'Módulo de Mejoramiento de Imágenes (AI Image Enhancer)',
    photo_restorer: 'Módulo de Restauración & Colorización de Fotos Antiguas',
    text_to_image: 'Módulo de Generación de Imágenes (Text to Image)',
    text_to_video: 'Módulo de Generación de Videos desde Texto (Text to Video)',
    image_to_video: 'Módulo de Transformación de Imágenes a Video (Image to Video)',
    smart_editor: 'Editor Inteligente & Modificación Neuronal (Magic Inpaint)',
    projects: 'Sistema de Administración de Proyectos & Archivos',
    history: 'Cola de Procesamiento & Historial de Generaciones',
    settings: 'Configuración del Sistema, Claves de API & Control de Créditos'
  };

  const handleQuickRecharge = async () => {
    try {
      setRecharging(true);
      await api.rechargeCredits(100);
      await refreshUser();
      showToast('¡Se han añadido +100 créditos a tu cuenta!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error recargando créditos', 'error');
    } finally {
      setRecharging(false);
    }
  };

  const hasAnyKey = settings ? (settings.hasKeys.gemini || settings.hasKeys.replicate || settings.hasKeys.fal) : false;

  return (
    <header className="h-16 bg-[#090C16] border-b border-[#1A223E] px-6 flex items-center justify-between sticky top-0 z-10">
      {/* View Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          {viewTitles[currentView] || 'Estudio Multimedia'}
        </h2>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Project Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#11162B] border border-[#202B52] text-xs text-slate-300">
          <Folder className="w-3.5 h-3.5 text-blue-400" />
          <select
            value={activeProject?.id || ''}
            onChange={(e) => {
              const p = projects.find(proj => proj.id === e.target.value);
              if (p) setActiveProject(p);
            }}
            className="bg-transparent border-none outline-none text-slate-200 cursor-pointer"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-[#0F1325] text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* API Key Status Pill */}
        <button
          onClick={() => setCurrentView('settings')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            hasAnyKey
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:border-emerald-400'
              : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:border-amber-300 animate-pulse'
          }`}
          title="Ver estado de proveedores y claves API"
        >
          {hasAnyKey ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <KeyRound className="w-3.5 h-3.5 text-amber-400" />}
          <span>{hasAnyKey ? 'IA Conectada' : 'Añadir API Keys'}</span>
        </button>

        {/* Credit Recharge Button */}
        <div className="flex items-center gap-2 bg-[#12182F] border border-[#222E58] pl-3 pr-1 py-1 rounded-xl">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold font-mono text-cyan-300">{user?.credits ?? 0}</span>
          </div>
          <button
            onClick={handleQuickRecharge}
            disabled={recharging}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-glow-blue disabled:opacity-50"
          >
            <Plus className="w-3 h-3" />
            <span>{recharging ? '...' : '+100'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
