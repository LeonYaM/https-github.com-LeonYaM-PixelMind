import React, { useState } from 'react';
import { Sparkles, Wand2, Copy, Check, X, Camera, SunMedium, Palette } from 'lucide-react';
import { api } from '../../services/api';
import { PromptOptimizationResult } from '../../types';

interface PromptAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (enhancedPrompt: string, negativePrompt?: string) => void;
  initialPrompt?: string;
  mode?: 'image' | 'video';
}

export const PromptAssistantModal: React.FC<PromptAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyPrompt,
  initialPrompt = '',
  mode = 'video'
}) => {
  const [basePrompt, setBasePrompt] = useState(initialPrompt);
  const [selectedStyle, setSelectedStyle] = useState('Cinematográfico 35mm');
  const [selectedCamera, setSelectedCamera] = useState('Travelling dinámico suave');
  const [selectedLighting, setSelectedLighting] = useState('Iluminación volumétrica dramática');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromptOptimizationResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const styleOptions = [
    'Cinematográfico 35mm',
    'Fotorrealismo 8K',
    'Sci-Fi Cyberpunk',
    'Animación 3D Pixar Style',
    'Anime Makoto Shinkai',
    'Documental National Geographic',
    'Publicitario Alta Gama',
    'Vintage Retro Film'
  ];

  const cameraOptions = [
    'Travelling dinámico suave',
    'Dolly Zoom Vertigo',
    'Plano cenital panorámico',
    'Cámara en mano realista',
    'Órbita circular lenta 360',
    'Cámara fija con profundidad',
    'Primer plano macro con bokeh'
  ];

  const lightingOptions = [
    'Iluminación volumétrica dramática',
    'Golden Hour cálida natural',
    'Luces de neón cyberpunk azul/magenta',
    'Iluminación de estudio softbox',
    'Claroscuro tenebrista',
    'Luz solar difusa cinematográfica'
  ];

  const handleOptimize = async () => {
    if (!basePrompt.trim()) return;
    setLoading(true);
    try {
      const res = await api.optimizePrompt({
        prompt: basePrompt,
        style: selectedStyle,
        camera: selectedCamera,
        lighting: selectedLighting,
        mode
      });
      setResult(res.result);
    } catch (e: any) {
      console.error('Error optimizando prompt:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0E1222] border border-[#232D52] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2748] bg-[#12172C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-glow-violet">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                Asistente Inteligente de Prompts
                <span className="px-2 py-0.2 text-[10px] rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  IA Generativa
                </span>
              </h3>
              <p className="text-xs text-slate-400">Convierte ideas sencillas en instrucciones cinematográficas de alta gama</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Base input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ¿Qué quieres crear? (Describe tu idea en palabras sencillas):
            </label>
            <textarea
              value={basePrompt}
              onChange={(e) => setBasePrompt(e.target.value)}
              placeholder="Ejemplo: Un astronauta caminando en un bosque de cristales alienígenas al atardecer..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A33] border border-[#232C52] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Quick Preset Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1">
                <Palette className="w-3.5 h-3.5 text-pink-400" />
                Estilo Visual:
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-lg bg-[#141A33] border border-[#232C52] text-slate-200"
              >
                {styleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                Cámara:
              </label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-lg bg-[#141A33] border border-[#232C52] text-slate-200"
              >
                {cameraOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1">
                <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                Iluminación:
              </label>
              <select
                value={selectedLighting}
                onChange={(e) => setSelectedLighting(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-lg bg-[#141A33] border border-[#232C52] text-slate-200"
              >
                {lightingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleOptimize}
            disabled={loading || !basePrompt.trim()}
            className="w-full py-2.5 rounded-xl gradient-btn font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>{loading ? 'Analizando y Enriqueciendo Prompt...' : 'Potenciar Prompt con IA'}</span>
          </button>

          {/* Result Card */}
          {result && (
            <div className="p-4 rounded-xl bg-[#12182F] border border-[#25325C] space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    Prompt Cinematográfico Optimizado:
                  </span>
                  <button
                    onClick={() => handleCopy(result.enhancedPrompt)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-200 bg-[#0B0E1E] p-3 rounded-lg border border-[#1A223E] leading-relaxed select-all">
                  {result.enhancedPrompt}
                </p>
              </div>

              {result.negativePrompt && (
                <div>
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                    Prompt Negativo Sugerido:
                  </span>
                  <p className="text-xs text-slate-400 bg-[#0B0E1E] p-2 rounded-lg border border-[#1A223E] mt-1">
                    {result.negativePrompt}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div><span className="text-slate-300 font-semibold">Modelo Sugerido:</span> {result.recommendedModel}</div>
                <div><span className="text-slate-300 font-semibold">Aspect Ratio:</span> {result.aspectRatioRecommended}</div>
              </div>

              {result.tips && (
                <p className="text-xs text-purple-300 bg-purple-950/30 p-2 rounded border border-purple-500/20 italic">
                  💡 {result.tips}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#1E2748] bg-[#12172C] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Cerrar
          </button>
          {result && (
            <button
              onClick={() => {
                onApplyPrompt(result.enhancedPrompt, result.negativePrompt);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar al Estudio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
