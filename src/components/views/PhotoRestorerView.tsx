import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useQueue } from '../../context/QueueContext';
import { FileUploader } from '../common/FileUploader';
import { BeforeAfterSlider } from '../common/BeforeAfterSlider';
import { api } from '../../services/api';
import {
  History,
  Palette,
  Sparkles,
  Download,
  FileText,
  Info,
  ShieldAlert
} from 'lucide-react';

export const PhotoRestorerView: React.FC = () => {
  const { showToast, refreshUser } = useApp();
  const { tasks } = useQueue();

  const [inputUrl, setInputUrl] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'restore_scratches' | 'colorize' | 'documents'>('restore_scratches');
  const [withScratch, setWithScratch] = useState(true);
  const [processing, setProcessing] = useState(false);

  const currentTask = tasks.find(t =>
    (t.type === 'restore_old' || t.type === 'colorize') &&
    (t.inputUrl === inputUrl || t.beforeUrl === inputUrl)
  );

  const handleExecute = async () => {
    if (!inputUrl) {
      showToast('Por favor sube una fotografía para restaurar.', 'warning');
      return;
    }

    try {
      setProcessing(true);
      if (activeTab === 'restore_scratches') {
        await api.restoreOldPhoto({
          inputUrl,
          filename,
          withScratch
        });
        showToast('Restauración de rayaduras y grietas iniciada.', 'success');
      } else if (activeTab === 'colorize') {
        await api.colorizePhoto({
          inputUrl,
          filename
        });
        showToast('Colorización neuronal DeOldify iniciada.', 'success');
      } else {
        // Document enhancement
        await api.upscaleImage({
          inputUrl,
          filename,
          scale: 2,
          faceEnhance: false,
          sharpen: true
        });
        showToast('Optimización de documento iniciada.', 'success');
      }
      await refreshUser();
    } catch (e: any) {
      showToast(e.message || 'Error en la restauración', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const url = currentTask?.outputUrl || inputUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelmind_restored_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E274A]">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Módulo 03 &bull; Restauración Histórica & Color</span>
          </div>
          <h2 className="text-2xl font-black text-white">Restaurador de Fotografías Antiguas</h2>
          <p className="text-xs text-slate-400 mt-1">
            Recupera fotos familiares antiguas dañadas por el tiempo, elimina grietas y devuelve los colores originales.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#0E1325] p-1 rounded-xl border border-[#202A50]">
          <button
            onClick={() => setActiveTab('restore_scratches')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'restore_scratches' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reparar Daños & Grietas</span>
          </button>
          <button
            onClick={() => setActiveTab('colorize')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'colorize' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Colorear B&N</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'documents' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documentos</span>
          </button>
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Settings */}
        <div className="lg:col-span-5 space-y-6">
          <FileUploader
            onFileUploaded={(url, fn) => {
              setInputUrl(url);
              setFilename(fn);
            }}
            label="Subir foto antigua, dañada o en blanco y negro"
          />

          <div className="p-5 rounded-2xl bg-[#0F1428] border border-[#202B52] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Opciones de Restauración
            </h3>

            {activeTab === 'restore_scratches' && (
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#141B36] border border-[#222E58] cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Detección Profunda de Rayaduras</p>
                    <p className="text-[10px] text-slate-400">Elimina pliegues, manchas de polvo y raspaduras</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={withScratch}
                    onChange={(e) => setWithScratch(e.target.checked)}
                    className="accent-purple-500"
                  />
                </label>
              </div>
            )}

            {activeTab === 'colorize' && (
              <p className="text-xs text-slate-300 bg-[#141B36] p-3 rounded-xl border border-[#222E58] leading-relaxed">
                El modelo neuronal de colorización analiza las tonalidades grises y el contexto histórico de vestimentas, piel y vegetación para predecir colores auténticos.
              </p>
            )}

            {activeTab === 'documents' && (
              <p className="text-xs text-slate-300 bg-[#141B36] p-3 rounded-xl border border-[#222E58] leading-relaxed">
                Aumenta el contraste de texto manuscrito o impreso desvanecido, aplana sombras de escaneo y aclara el fondo.
              </p>
            )}

            <button
              onClick={handleExecute}
              disabled={processing || !inputUrl}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-glow-violet disabled:opacity-50"
            >
              <History className="w-4 h-4 text-purple-200" />
              <span>
                {processing ? 'Procesando Restauración...' : 'Ejecutar Restauración con IA'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Resultado de Restauración
            </h3>

            {currentTask?.status === 'completed' && currentTask.outputUrl && (
              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Restauración</span>
              </button>
            )}
          </div>

          {currentTask && currentTask.status === 'completed' && currentTask.outputUrl ? (
            <div className="space-y-3">
              <BeforeAfterSlider
                beforeUrl={currentTask.beforeUrl || inputUrl}
                afterUrl={currentTask.outputUrl}
                beforeLabel="Foto Original Dañada / B&N"
                afterLabel="Foto Restaurada con IA"
              />
              {currentTask.notice && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{currentTask.notice}</span>
                </div>
              )}
            </div>
          ) : currentTask && currentTask.status === 'processing' ? (
            <div className="rounded-2xl p-12 bg-[#0B0E1B] border border-purple-500/40 text-center space-y-4 min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-purple-400 border-t-transparent animate-spin" />
              <div>
                <h4 className="text-base font-bold text-white">Restaurando Microdetalles</h4>
                <p className="text-xs text-purple-400 mt-1">{currentTask.stage}</p>
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
                Presiona "Ejecutar Restauración con IA" para iniciar el proceso.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[#1E274A] bg-[#0A0D1B] p-12 text-center text-slate-500 min-h-[420px] flex flex-col items-center justify-center">
              <History className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Sin fotografía seleccionada</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Carga una foto en el panel izquierdo para restaurar rayas o aplicar colorización.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
