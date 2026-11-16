import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useQueue } from '../../context/QueueContext';
import { FileUploader } from '../common/FileUploader';
import { api } from '../../services/api';
import {
  Video,
  Sparkles,
  Download,
  ShieldCheck,
  Camera,
  Play,
  Activity,
  Layers,
  Info
} from 'lucide-react';

export const ImageToVideoView: React.FC = () => {
  const { showToast, refreshUser } = useApp();
  const { tasks } = useQueue();

  const [inputUrl, setInputUrl] = useState('');
  const [endImageUrl, setEndImageUrl] = useState('');
  const [prompt, setPrompt] = useState('organic wind motion, natural eye blink, subtle camera zoom in');
  const [duration, setDuration] = useState(5);
  const [camera, setCamera] = useState('slow zoom in');
  const [intensity, setIntensity] = useState('medium');
  const [preserveFaces, setPreserveFaces] = useState(true);
  const [animating, setAnimating] = useState(false);

  const completedTask = tasks.find(t => t.type === 'image_to_video' && t.status === 'completed');
  const processingTask = tasks.find(t => t.type === 'image_to_video' && (t.status === 'pending' || t.status === 'processing'));

  const handleAnimate = async () => {
    if (!inputUrl) {
      showToast('Por favor sube una imagen inicial para animar.', 'warning');
      return;
    }

    try {
      setAnimating(true);
      await api.generateImageToVideo({
        inputUrl,
        endImageUrl: endImageUrl || undefined,
        prompt,
        duration,
        camera,
        intensity,
        preserveFaces
      });
      await refreshUser();
      showToast('Animación de imagen iniciada con preservación facial.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error al iniciar animación', 'error');
    } finally {
      setAnimating(false);
    }
  };

  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelmind_animated_${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E274A]">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Video className="w-4 h-4" />
            <span>Módulo 06 &bull; Animación Neuronal de Retratos & Paisajes</span>
          </div>
          <h2 className="text-2xl font-black text-white">Transformador Image to Video</h2>
          <p className="text-xs text-slate-400 mt-1">
            Convierte fotos fijas en tomas cinematográficas vivas con preservación estricta de vestimenta, rasgos y rostro.
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs">
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          <span>Preservación Estricta de Identidad Activa</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs & Parameters */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Fotografía Inicial a Animar:</label>
            <FileUploader
              onFileUploaded={(url) => setInputUrl(url)}
              label="Cargar foto fija (Retrato, paisaje o escena)"
            />
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1428] border border-[#202B52] space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-1.5">
                Descripción del Movimiento Deseado:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Ejemplo: La persona parpadea y sonríe sutilmente, el viento mueve su cabello y la cámara se acerca lentamente..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A33] border border-[#232C52] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Camera Motion & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Trayectoria de Cámara:</label>
                <select
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg bg-[#141A33] border border-[#232C52] text-slate-200"
                >
                  <option value="slow zoom in">Zoom In Suave</option>
                  <option value="slow zoom out">Zoom Out Alejamiento</option>
                  <option value="pan right">Panorámica Derecha</option>
                  <option value="pan left">Panorámica Izquierda</option>
                  <option value="orbit">Órbita Circular</option>
                  <option value="static">Cámara Fija</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Duración:</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-2 rounded-lg bg-[#141A33] border border-[#232C52] text-slate-200"
                >
                  <option value={5}>5 Segundos</option>
                  <option value={10}>10 Segundos</option>
                </select>
              </div>
            </div>

            {/* Motion Intensity */}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Intensidad de Movimiento:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['subtle', 'medium', 'dynamic'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensity(lvl)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      intensity === lvl
                        ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                        : 'bg-[#141A33] text-slate-400 border-[#232C52] hover:text-white'
                    }`}
                  >
                    {lvl === 'subtle' ? 'Sutil' : lvl === 'medium' ? 'Moderado' : 'Dinámico'}
                  </button>
                ))}
              </div>
            </div>

            {/* Face lock checkbox */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#141B36] border border-[#222E58] cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-200">Bloqueo de Rasgos Faciales</p>
                <p className="text-[10px] text-slate-400">Impide morphing y preserva la persona exacta</p>
              </div>
              <input
                type="checkbox"
                checked={preserveFaces}
                onChange={(e) => setPreserveFaces(e.target.checked)}
                className="accent-rose-500"
              />
            </label>

            <button
              onClick={handleAnimate}
              disabled={animating || !inputUrl}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{animating ? 'Sintetizando Movimiento...' : 'Animar Fotografía a Video'}</span>
            </button>
          </div>
        </div>

        {/* Right Output Video Player */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Resultado de Video Animado
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
            <div className="rounded-2xl p-12 bg-[#0B0E1B] border border-rose-500/40 text-center space-y-4 min-h-[460px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-rose-400 border-t-transparent animate-spin" />
              <div>
                <h4 className="text-base font-bold text-white">Interpolando Cuadros y Movimiento Facial</h4>
                <p className="text-xs text-rose-400 mt-1">{processingTask.stage}</p>
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
                  <span className="font-semibold text-rose-400">{completedTask.provider}</span>
                </div>
                <div>
                  <span className="text-slate-400">Duración:</span>{' '}
                  <span className="text-slate-200">{completedTask.params?.duration}s</span>
                </div>
              </div>

              {completedTask.notice && (
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>{completedTask.notice}</span>
                </div>
              )}
            </div>
          ) : inputUrl ? (
            <div className="rounded-2xl bg-[#0B0E1B] border border-[#1E274A] p-4 flex flex-col items-center justify-center min-h-[420px]">
              <img
                src={inputUrl}
                alt="Imagen inicial"
                className="max-h-[380px] max-w-full rounded-xl object-contain shadow-lg"
              />
              <p className="text-xs text-slate-400 mt-4">
                Presiona "Animar Fotografía a Video" para generar los cuadros en movimiento.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[#1E274A] bg-[#0A0D1B] p-12 text-center text-slate-500 min-h-[460px] flex flex-col items-center justify-center">
              <Video className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Sin fotografía seleccionada</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Sube una imagen a la izquierda para animarla con movimiento cinematográfico.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
