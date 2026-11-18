import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useQueue } from '../../context/QueueContext';
import { FileUploader } from '../common/FileUploader';
import { BeforeAfterSlider } from '../common/BeforeAfterSlider';
import { downloadMedia } from '../../utils/download';
import { api } from '../../services/api';
import {
  Sparkles,
  Download,
  Sliders,
  UserCheck,
  Shield,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';

export const ImageEnhancerView: React.FC = () => {
  const { user, showToast, refreshUser, setCurrentView } = useApp();
  const { tasks } = useQueue();

  const [inputUrl, setInputUrl] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [scale, setScale] = useState<number>(4);
  const [faceEnhance, setFaceEnhance] = useState<boolean>(true);
  const [denoise, setDenoise] = useState<boolean>(true);
  const [sharpen, setSharpen] = useState<boolean>(true);
  const [intensity, setIntensity] = useState<number>(85);
  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // Look for the active or latest completed enhance task for this image
  const currentTask = tasks.find(t => t.id === currentTaskId) ||
    tasks.find(t => t.type === 'enhance' && (t.inputUrl === inputUrl || t.beforeUrl === inputUrl));

  const handleStartEnhance = async () => {
    if (!inputUrl) {
      showToast('Por favor sube una imagen primero.', 'warning');
      return;
    }

    try {
      setProcessing(true);
      const res = await api.upscaleImage({
        inputUrl,
        filename,
        scale,
        faceEnhance,
        denoise,
        sharpen
      });
      if (res?.task?.id) {
        setCurrentTaskId(res.task.id);
      }
      await refreshUser();
      showToast(`Tarea iniciada con escala ${scale}X. Procesando en cola...`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Error al procesar mejoramiento', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (format: 'png' | 'jpg' | 'webp') => {
    const url = currentTask?.outputUrl || inputUrl;
    if (!url) return;
    showToast(`Preparando descarga en ${format.toUpperCase()}...`, 'info');
    await downloadMedia(url, `pixelmind_enhanced_${scale}x_${Date.now()}`, format);
    showToast(`Descarga completada en formato ${format.toUpperCase()}`, 'success');
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title & Info Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E274A]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Módulo 02 &bull; Superresolución & Restauración Facial</span>
          </div>
          <h2 className="text-2xl font-black text-white">AI Image Enhancer Profesional</h2>
          <p className="text-xs text-slate-400 mt-1">
            Aumenta resolución hasta 8X, recupera microdetalles y preserva estrictamente la identidad facial.
          </p>
        </div>

        {/* Identity Preservation Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200 text-xs">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Preservación facial CodeFormer / GFPGAN activa</span>
        </div>
      </div>

      {/* Main Grid: Upload & Controls on Left, Comparison on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* File Upload Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">1. Fotografía de Origen:</label>
            <FileUploader
              onFileUploaded={(url, fn) => {
                setInputUrl(url);
                setFilename(fn);
              }}
              label="Cargar foto de baja resolución o borrosa"
            />
          </div>

          {/* AI Settings Box */}
          <div className="p-5 rounded-2xl bg-[#0F1428] border border-[#202B52] space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-mono">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Parámetros de Mejoramiento</span>
            </h3>

            {/* Scale Options (2X, 4X, 8X) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Factor de Superresolución:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 4, 8].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScale(s)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      scale === s
                        ? 'bg-blue-600 text-white border-blue-400 shadow-glow-blue'
                        : 'bg-[#151C38] text-slate-400 border-[#25325C] hover:text-white'
                    }`}
                  >
                    {s}X Ultra HD
                  </button>
                ))}
              </div>
            </div>

            {/* Neural Face Restoration Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#141B36] border border-[#222E58]">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">Restauración de Rostros</p>
                  <p className="text-[10px] text-slate-400">Preserva identidad original y edad aparente</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={faceEnhance}
                onChange={(e) => setFaceEnhance(e.target.checked)}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Denoise & Sharpen switches */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#141B36] border border-[#222E58] cursor-pointer">
                <span className="text-slate-300">Eliminar Ruido</span>
                <input
                  type="checkbox"
                  checked={denoise}
                  onChange={(e) => setDenoise(e.target.checked)}
                  className="accent-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#141B36] border border-[#222E58] cursor-pointer">
                <span className="text-slate-300">Recuperar Nitidez</span>
                <input
                  type="checkbox"
                  checked={sharpen}
                  onChange={(e) => setSharpen(e.target.checked)}
                  className="accent-blue-500"
                />
              </label>
            </div>

            {/* Intensity Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Intensidad del Mejoramiento:</span>
                <span className="font-mono text-cyan-400 font-bold">{intensity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartEnhance}
              disabled={processing || !inputUrl}
              className="w-full py-3 rounded-xl gradient-btn font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow-blue"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>
                {processing ? 'Enviando a la Red Neuronal...' : `Iniciar Mejoramiento ${scale}X`}
              </span>
            </button>
          </div>
        </div>

        {/* Visual Preview / Comparison Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Espacio de Comparación en Vivo</span>
            </h3>

            {/* Download dropdown */}
            {currentTask?.status === 'completed' && currentTask.outputUrl && (
              <div className="flex items-center gap-2">
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value as any)}
                  className="text-xs px-2 py-1.5 rounded-lg bg-[#141B36] border border-[#25325C] text-slate-200"
                >
                  <option value="png">PNG (Sin pérdida)</option>
                  <option value="jpg">JPG (Web)</option>
                  <option value="webp">WEBP (Comprimido)</option>
                </select>

                <button
                  onClick={() => handleDownload(downloadFormat)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive Before/After Slider or Placeholder */}
          {currentTask && currentTask.status === 'completed' && currentTask.outputUrl ? (
            <div className="space-y-3">
              <BeforeAfterSlider
                beforeUrl={currentTask.beforeUrl || inputUrl}
                afterUrl={currentTask.outputUrl}
                beforeLabel="Original (Baja Resolución)"
                afterLabel={`IA Mejorada (${scale}X Ultra HD)`}
              />
              {currentTask.notice && (
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>{currentTask.notice}</span>
                </div>
              )}
            </div>
          ) : currentTask && currentTask.status === 'processing' ? (
            <div className="rounded-2xl p-12 bg-[#0B0E1B] border border-blue-500/40 text-center space-y-4 min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
              <div>
                <h4 className="text-base font-bold text-white">Procesando Red Neuronal {scale}X</h4>
                <p className="text-xs text-cyan-400 mt-1">{currentTask.stage}</p>
                <div className="w-64 bg-slate-800 rounded-full h-2 mx-auto mt-4 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentTask.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : inputUrl ? (
            <div className="rounded-2xl bg-[#0B0E1B] border border-[#1E274A] p-4 flex flex-col items-center justify-center min-h-[420px]">
              <img
                src={inputUrl}
                alt="Original"
                className="max-h-[380px] max-w-full rounded-xl object-contain shadow-lg"
              />
              <p className="text-xs text-slate-400 mt-4">
                Haz clic en "Iniciar Mejoramiento" para generar la versión en alta resolución.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[#1E274A] bg-[#0A0D1B] p-12 text-center text-slate-500 min-h-[420px] flex flex-col items-center justify-center">
              <Sparkles className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Sin imagen seleccionada</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Sube una fotografía en el panel izquierdo para previsualizar y comparar el antes y después.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
