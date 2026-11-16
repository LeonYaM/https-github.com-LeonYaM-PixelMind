import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useQueue } from '../../context/QueueContext';
import { PromptAssistantModal } from '../common/PromptAssistantModal';
import { api } from '../../services/api';
import {
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Download,
  Palette,
  Ratio,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';

export const TextToImageView: React.FC = () => {
  const { user, showToast, refreshUser } = useApp();
  const { tasks } = useQueue();

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [numOutputs, setNumOutputs] = useState(1);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Latest completed text_to_image task
  const completedTask = tasks.find(t => t.type === 'text_to_image' && t.status === 'completed');
  const processingTask = tasks.find(t => t.type === 'text_to_image' && (t.status === 'pending' || t.status === 'processing'));

  const styles = [
    { id: 'photorealistic', label: 'Fotografía Realista' },
    { id: 'cinematic', label: 'Cinematográfico 35mm' },
    { id: 'digital_art', label: 'Arte Digital' },
    { id: '3d_render', label: 'Render 3D Pixar / Unreal' },
    { id: 'anime', label: 'Anime & Manga' },
    { id: 'advertising', label: 'Comercial & Producto' },
    { id: 'concept_art', label: 'Arte Conceptual Sci-Fi' }
  ];

  const aspectRatios = [
    { id: '16:9', label: '16:9 Panorámico (Cine / Desktop)' },
    { id: '9:16', label: '9:16 Vertical (Stories / TikTok)' },
    { id: '1:1', label: '1:1 Cuadrado (Instagram)' },
    { id: '4:5', label: '4:5 Retrato' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Por favor describe la imagen que deseas generar.', 'warning');
      return;
    }

    try {
      setGenerating(true);
      await api.generateTextToImage({
        prompt: prompt.trim(),
        style,
        aspectRatio,
        numOutputs
      });
      await refreshUser();
      showToast('Generación iniciada en la cola neuronal.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error al iniciar generación', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelmind_image_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E274A]">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>Módulo 04 &bull; Generación Neuronal de Imágenes</span>
          </div>
          <h2 className="text-2xl font-black text-white">Generador Text to Image (FLUX & Imagen 3)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Convierte tus instrucciones en fotografías cinematográficas, personajes y escenarios de alta resolución.
          </p>
        </div>

        <button
          onClick={() => setIsAssistantOpen(true)}
          className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-2 transition-all shadow-glow-violet"
        >
          <Wand2 className="w-4 h-4 text-purple-300" />
          <span>Abrir Asistente de Prompts IA</span>
        </button>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-[#0F1428] border border-[#202B52] space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Descripción / Prompt:
                </label>
                <button
                  onClick={() => setIsAssistantOpen(true)}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Mejorar con IA</span>
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Ejemplo: Retrato cinematográfico de una científica en un laboratorio submarino bioluminiscente, lentes anamórficos, reflejos de agua, 8k..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A33] border border-[#232C52] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Prompt Negativo (Lo que deseas excluir):
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="deformado, borroso, baja calidad, artefactos..."
                className="w-full px-3 py-2 rounded-lg bg-[#141A33] border border-[#232C52] text-xs text-slate-200 placeholder-slate-500"
              />
            </div>

            {/* Visual Style */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
                <Palette className="w-3.5 h-3.5 text-pink-400" />
                Estilo Artístico:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border ${
                      style === s.id
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/60 shadow-md'
                        : 'bg-[#141A33] text-slate-400 border-[#232C52] hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
                <Ratio className="w-3.5 h-3.5 text-cyan-400" />
                Relación de Aspecto (Formato):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAspectRatio(r.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border ${
                      aspectRatio === r.id
                        ? 'bg-blue-600/30 text-cyan-300 border-blue-500/60 shadow-md'
                        : 'bg-[#141A33] text-slate-400 border-[#232C52] hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{generating ? 'Enviando a la red neuronal...' : 'Generar Imagen con IA'}</span>
            </button>
          </div>
        </div>

        {/* Right Output Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Resultado Generado
            </h3>

            {completedTask?.outputUrl && (
              <button
                onClick={() => handleDownload(completedTask.outputUrl!)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar en Alta Resolución</span>
              </button>
            )}
          </div>

          {processingTask ? (
            <div className="rounded-2xl p-12 bg-[#0B0E1B] border border-emerald-500/40 text-center space-y-4 min-h-[460px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
              <div>
                <h4 className="text-base font-bold text-white">Sintetizando Imagen con Red Neuronal</h4>
                <p className="text-xs text-emerald-400 mt-1">{processingTask.stage}</p>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Progreso estimado: {processingTask.progress}%
                </p>
              </div>
            </div>
          ) : completedTask?.outputUrl ? (
            <div className="rounded-2xl bg-[#0B0E1B] border border-[#1E274A] p-4 space-y-3">
              <div className="relative group overflow-hidden rounded-xl bg-black flex items-center justify-center min-h-[380px]">
                <img
                  src={completedTask.outputUrl}
                  alt={completedTask.title}
                  className="max-h-[520px] max-w-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-[#1E274A]">
                <div>
                  <span className="text-slate-400">Modelo:</span>{' '}
                  <span className="font-semibold text-emerald-400">{completedTask.provider}</span>
                </div>
                <div>
                  <span className="text-slate-400">Prompt:</span>{' '}
                  <span className="text-slate-200 italic line-clamp-1">{completedTask.params?.prompt}</span>
                </div>
              </div>

              {completedTask.notice && (
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>{completedTask.notice}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[#1E274A] bg-[#0A0D1B] p-12 text-center text-slate-500 min-h-[460px] flex flex-col items-center justify-center">
              <ImageIcon className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Sin imágenes generadas aún</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Escribe un prompt a la izquierda y presiona "Generar Imagen con IA" para ver el resultado aquí.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Assistant Modal */}
      <PromptAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        initialPrompt={prompt}
        mode="image"
        onApplyPrompt={(enh, neg) => {
          setPrompt(enh);
          if (neg) setNegativePrompt(neg);
        }}
      />
    </div>
  );
};
