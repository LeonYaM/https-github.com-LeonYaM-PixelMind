import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useQueue } from '../../context/QueueContext';
import { PromptAssistantModal } from '../common/PromptAssistantModal';
import { downloadMedia } from '../../utils/download';
import { api } from '../../services/api';
import {
  Film,
  Sparkles,
  Wand2,
  Download,
  Camera,
  Clock,
  Ratio,
  Sliders,
  Play,
  Info
} from 'lucide-react';

export const TextToVideoView: React.FC = () => {
  const { showToast, refreshUser } = useApp();
  const { tasks } = useQueue();

  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState('1080p');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [style, setStyle] = useState('cinematic');
  const [camera, setCamera] = useState('travelling');
  const [motionSpeed, setMotionSpeed] = useState('normal');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const currentTask = tasks.find(t => t.id === currentTaskId) || tasks.find(t => t.type === 'text_to_video');
  const completedTask = currentTask?.status === 'completed' ? currentTask : tasks.find(t => t.type === 'text_to_video' && t.status === 'completed');
  const processingTask = currentTask && (currentTask.status === 'pending' || currentTask.status === 'processing') ? currentTask : tasks.find(t => t.type === 'text_to_video' && (t.status === 'pending' || t.status === 'processing'));

  const cameraMotions = [
    { id: 'travelling', label: 'Travelling Dinámico' },
    { id: 'zoom_in', label: 'Zoom In Progresivo' },
    { id: 'panoramic', label: 'Panorámica Horizontal' },
    { id: 'orbit', label: 'Órbita Circular 360' },
    { id: 'static', label: 'Cámara Fija de Enfoque' },
    { id: 'fpv', label: 'Seguimiento FPV Rápido' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Por favor describe la escena de video a sintetizar.', 'warning');
      return;
    }

    try {
      setGenerating(true);
      const res = await api.generateTextToVideo({
        prompt: prompt.trim(),
        duration,
        resolution,
        aspectRatio,
        style,
        camera
      });
      if (res?.task?.id) {
        setCurrentTaskId(res.task.id);
      }
      await refreshUser();
      showToast('Generación de video encolada. El renderizado neuronal toma 1-3 minutos.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error generando video', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (url: string) => {
    showToast('Descargando archivo de video MP4...', 'info');
    await downloadMedia(url, `pixelmind_video_${Date.now()}`, 'mp4');
    showToast('Descarga completada.', 'success');
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E274A]">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Film className="w-4 h-4" />
            <span>Módulo 05 &bull; Síntesis de Video Cinematográfico</span>
          </div>
          <h2 className="text-2xl font-black text-white">Generador Text to Video (Google Veo & Kling AI)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Describe cualquier secuencia y genera tomas de cine con control de movimiento de cámara, física realista e iluminación.
          </p>
        </div>

        <button
          onClick={() => setIsAssistantOpen(true)}
          className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-2 transition-all shadow-glow-violet"
        >
          <Wand2 className="w-4 h-4 text-purple-300" />
          <span>Director de Prompts IA</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-[#0F1428] border border-[#202B52] space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Instrucción de la Escena (Prompt):
                </label>
                <button
                  onClick={() => setIsAssistantOpen(true)}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Asistente Creativo</span>
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Ejemplo: Vista aérea cinemática de un auto deportivo vintage viajando por una carretera costera de Amalfi al atardecer, olas rompiendo, iluminación dorada..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A33] border border-[#232C52] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Duration (5s, 10s, 15s, 30s) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Duración del Video:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      duration === d
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-glow-blue'
                        : 'bg-[#141A33] text-slate-400 border-[#232C52] hover:text-white'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Motion */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
                <Camera className="w-3.5 h-3.5 text-pink-400" />
                Movimiento de Cámara Cinematográfico:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {cameraMotions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCamera(c.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border ${
                      camera === c.id
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/60 shadow-md'
                        : 'bg-[#141A33] text-slate-400 border-[#232C52] hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format & Resolution */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Formato:</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg bg-[#141A33] border border-[#232C52] text-slate-200"
                >
                  <option value="16:9">16:9 Cine</option>
                  <option value="9:16">9:16 Vertical</option>
                  <option value="1:1">1:1 Cuadrado</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Resolución:</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg bg-[#141A33] border border-[#232C52] text-slate-200"
                >
                  <option value="720p">720p HD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="4k">4K Ultra HD</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Film className="w-4 h-4 text-cyan-300" />
              <span>{generating ? 'Enviando a la red neuronal...' : 'Renderizar Video con IA'}</span>
            </button>
          </div>
        </div>

        {/* Video Player Output Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Reproductor de Video Generado
            </h3>

            {completedTask?.outputUrl && (
              <button
                onClick={() => handleDownload(completedTask.outputUrl!)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Video MP4</span>
              </button>
            )}
          </div>

          {processingTask ? (
            <div className="rounded-2xl p-12 bg-[#0B0E1B] border border-indigo-500/40 text-center space-y-4 min-h-[460px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin" />
              <div>
                <h4 className="text-base font-bold text-white">Sintetizando Cuadro por Cuadro</h4>
                <p className="text-xs text-indigo-400 mt-1">{processingTask.stage}</p>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Progreso: {processingTask.progress}%
                </p>
              </div>
            </div>
          ) : completedTask?.outputUrl ? (
            <div className="rounded-2xl bg-[#0B0E1B] border border-[#1E274A] p-4 space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[380px]">
                <video
                  src={completedTask.outputUrl}
                  controls
                  autoPlay
                  loop
                  className="max-h-[500px] w-full rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-[#1E274A]">
                <div>
                  <span className="text-slate-400">Modelo:</span>{' '}
                  <span className="font-semibold text-indigo-400">{completedTask.provider}</span>
                </div>
                <div>
                  <span className="text-slate-400">Duración:</span>{' '}
                  <span className="text-slate-200">{completedTask.params?.duration} segundos</span>
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
              <Film className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Sin video generado aún</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Configura tu prompt y movimiento de cámara a la izquierda para generar una escena cinematográfica.
              </p>
            </div>
          )}
        </div>
      </div>

      <PromptAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        initialPrompt={prompt}
        mode="video"
        onApplyPrompt={(enh) => setPrompt(enh)}
      />
    </div>
  );
};
