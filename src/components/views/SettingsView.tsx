import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Settings,
  Key,
  ShieldCheck,
  Coins,
  Check,
  AlertCircle,
  Save,
  Server,
  Zap,
  Sliders
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, refreshSettings, user, refreshUser, showToast } = useApp();

  const [geminiKey, setGeminiKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');
  const [falKey, setFalKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Credit costs editing (Admin)
  const [creditCosts, setCreditCosts] = useState<Record<string, number>>(settings?.creditCosts || {});
  const [adminUserCredits, setAdminUserCredits] = useState<number>(user?.credits || 100);

  useEffect(() => {
    if (settings?.creditCosts) {
      setCreditCosts(settings.creditCosts);
    }
  }, [settings?.creditCosts]);

  useEffect(() => {
    if (user?.credits !== undefined) {
      setAdminUserCredits(user.credits);
    }
  }, [user?.credits]);

  const handleTest = async (provider: string, currentKey: string) => {
    try {
      setTestingProvider(provider);
      const res = await api.testConnection(provider, currentKey);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (e: any) {
      showToast(e.message || `Fallo al verificar ${provider}`, 'error');
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveKeys = async () => {
    try {
      setSaving(true);
      await api.updateSettings({
        apiKeys: {
          gemini: geminiKey,
          replicate: replicateKey,
          fal: falKey,
          openai: openaiKey
        }
      });
      await refreshSettings();
      setGeminiKey('');
      setReplicateKey('');
      setFalKey('');
      setOpenaiKey('');
      showToast('Claves de API actualizadas de forma segura en el servidor.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error guardando ajustes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCosts = async () => {
    try {
      await api.updateSettings({ creditCosts });
      await refreshSettings();
      showToast('Costos de créditos actualizados.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error actualizando costos', 'error');
    }
  };

  const handleAdminSetCredits = async () => {
    try {
      await api.setAdminCredits('user_admin', adminUserCredits);
      await refreshUser();
      showToast(`Créditos del usuario actualizados a ${adminUserCredits}.`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Error ajustando créditos', 'error');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E274A]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Módulo 10 &bull; Configuración del Sistema & APIs</span>
          </div>
          <h2 className="text-2xl font-black text-white">Configuración & Seguridad de Claves API</h2>
          <p className="text-xs text-slate-400 mt-1">
            Conecta tus proveedores de inteligencia artificial y administra los costos de crédito y límites del sistema.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: API Keys Manager */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0F1428] border border-[#202B52] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Proveedores de Inteligencia Artificial</span>
              </h3>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Almacenamiento seguro en Servidor</span>
              </span>
            </div>

            {/* Google Gemini API */}
            <div className="space-y-2 p-4 rounded-xl bg-[#141A33] border border-[#222E58]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Google Gemini & Imagen 3 API
                    {settings?.hasKeys.gemini && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                        Conectado ({settings.keyMasks.gemini})
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Utilizado para el Asistente de Prompts y generación con Imagen 3.
                  </p>
                </div>
                <button
                  onClick={() => handleTest('gemini', geminiKey)}
                  disabled={testingProvider === 'gemini'}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-blue-500/40 text-xs font-semibold"
                >
                  {testingProvider === 'gemini' ? 'Probando...' : 'Probar'}
                </button>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={settings?.hasKeys.gemini ? 'Nueva clave para reemplazar...' : 'Pega tu GEMINI_API_KEY aquí...'}
                className="w-full px-3 py-2 rounded-lg bg-[#0E1225] border border-[#232C52] text-xs text-slate-100 placeholder-slate-500 font-mono"
              />
            </div>

            {/* Replicate API Token */}
            <div className="space-y-2 p-4 rounded-xl bg-[#141A33] border border-[#222E58]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Replicate AI (Real-ESRGAN, CodeFormer, FLUX, SVD)
                    {settings?.hasKeys.replicate && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                        Conectado ({settings.keyMasks.replicate})
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Maneja superresolución 8X, restauración facial y animación de video.
                  </p>
                </div>
                <button
                  onClick={() => handleTest('replicate', replicateKey)}
                  disabled={testingProvider === 'replicate'}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs font-semibold"
                >
                  {testingProvider === 'replicate' ? 'Probando...' : 'Probar'}
                </button>
              </div>
              <input
                type="password"
                value={replicateKey}
                onChange={(e) => setReplicateKey(e.target.value)}
                placeholder={settings?.hasKeys.replicate ? 'Nuevo token para reemplazar...' : 'r8_... API Token'}
                className="w-full px-3 py-2 rounded-lg bg-[#0E1225] border border-[#232C52] text-xs text-slate-100 placeholder-slate-500 font-mono"
              />
            </div>

            {/* Fal.ai API Key */}
            <div className="space-y-2 p-4 rounded-xl bg-[#141A33] border border-[#222E58]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Fal.ai (FLUX Pro, Luma Dream Machine)
                    {settings?.hasKeys.fal && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                        Conectado ({settings.keyMasks.fal})
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Procesamiento de video e imágenes ultra-rápido en servidores distribuidos.
                  </p>
                </div>
                <button
                  onClick={() => handleTest('fal', falKey)}
                  disabled={testingProvider === 'fal'}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
                >
                  {testingProvider === 'fal' ? 'Probando...' : 'Probar'}
                </button>
              </div>
              <input
                type="password"
                value={falKey}
                onChange={(e) => setFalKey(e.target.value)}
                placeholder={settings?.hasKeys.fal ? 'Nueva key para reemplazar...' : 'fal_key_...'}
                className="w-full px-3 py-2 rounded-lg bg-[#0E1225] border border-[#232C52] text-xs text-slate-100 placeholder-slate-500 font-mono"
              />
            </div>

            <button
              onClick={handleSaveKeys}
              disabled={saving}
              className="w-full py-3 rounded-xl gradient-btn font-bold text-xs text-white flex items-center justify-center gap-2 shadow-glow-blue"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Claves de API en Servidor'}</span>
            </button>
          </div>
        </div>

        {/* Right: Credits Management & Operation Costs */}
        <div className="lg:col-span-5 space-y-6">
          {/* User Credits & Balance */}
          <div className="p-6 rounded-2xl bg-[#0F1428] border border-[#202B52] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Gestión de Saldo de Créditos</span>
            </h3>

            <div className="p-4 rounded-xl bg-[#141A33] border border-[#222E58] flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Usuario Activo:</p>
                <p className="text-sm font-bold text-white">{user?.name} ({user?.role})</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Saldo Disponible:</p>
                <p className="text-xl font-black font-mono text-cyan-300">{user?.credits} pts</p>
              </div>
            </div>

            {/* Admin credit assign */}
            <div className="pt-2 space-y-2">
              <label className="text-xs text-slate-300 block">Asignar Créditos Directos (Admin):</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={adminUserCredits}
                  onChange={(e) => setAdminUserCredits(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141A33] border border-[#222E58] text-xs text-slate-100 font-mono"
                />
                <button
                  onClick={handleAdminSetCredits}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white whitespace-nowrap shadow-md"
                >
                  Asignar
                </button>
              </div>
            </div>
          </div>

          {/* Operation Cost Config */}
          <div className="p-6 rounded-2xl bg-[#0F1428] border border-[#202B52] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Costos de Operación (Créditos)</span>
              </h3>
              <button
                onClick={handleSaveCosts}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                Guardar Costos
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'upscale_2x', label: 'Mejoramiento 2X' },
                { key: 'upscale_4x', label: 'Mejoramiento 4X' },
                { key: 'upscale_8x', label: 'Mejoramiento 8X Ultra' },
                { key: 'face_restore', label: 'Restauración Facial CodeFormer' },
                { key: 'old_photo', label: 'Restauración Foto Antigua' },
                { key: 'colorize', label: 'Colorización B&N' },
                { key: 'text_to_image', label: 'Generación Text to Image' },
                { key: 'text_to_video', label: 'Video Text to Video' },
                { key: 'image_to_video', label: 'Animación Image to Video' },
                { key: 'smart_edit', label: 'Edición Inpainting' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-2 rounded-lg bg-[#141A33] border border-[#202B52]">
                  <span className="text-slate-300">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={creditCosts[item.key] ?? 5}
                      onChange={(e) => setCreditCosts(prev => ({ ...prev, [item.key]: Number(e.target.value) }))}
                      className="w-16 px-2 py-1 rounded bg-[#0D1225] border border-[#24305A] text-right font-mono text-cyan-400 font-bold"
                    />
                    <span className="text-slate-400 text-[10px]">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
