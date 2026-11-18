import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useQueue } from '../../context/QueueContext';
import { FileUploader } from '../common/FileUploader';
import { CanvasInpainter } from '../common/CanvasInpainter';
import { BeforeAfterSlider } from '../common/BeforeAfterSlider';
import { downloadMedia } from '../../utils/download';
import { api } from '../../services/api';
import {
  Wand2,
  Sparkles,
  Download,
  Image as ImageIcon,
  Eraser,
  Sun,
  Shirt,
  Expand,
  Info
} from 'lucide-react';

export const SmartEditorView: React.FC = () => {
  const { showToast, refreshUser } = useApp();
  const { tasks } = useQueue();

  const [inputUrl, setInputUrl] = useState('');
  const [maskData, setMaskData] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [actionType, setActionType] = useState('inpaint');
  const [processing, setProcessing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const currentTask = tasks.find(t => t.id === currentTaskId) ||
    tasks.find(t => t.type === 'smart_edit' && (t.inputUrl === inputUrl || t.beforeUrl === inputUrl));
  const completedTask = currentTask?.status === 'completed' ? currentTask : tasks.find(t => t.type === 'smart_edit' && t.status === 'completed');
  const processingTask = currentTask && (currentTask.status === 'pending' || currentTask.status === 'processing') ? currentTask : tasks.find(t => t.type === 'smart_edit' && (t.status === 'pending' || t.status === 'processing'));

  const quickActions = [
    { id: 'replace_bg', label: 'Reemplazar Fondo', icon: ImageIcon, promptPreset: 'Change background to a modern architectural luxury penthouse at night' },
    { id: 'remove_object', label: 'Eliminar Objeto', icon: Eraser, promptPreset: 'Completely remove the painted object and seamlessly blend with the background texture' },
    { id: 'change_lighting', label: 'Modificar Iluminación', icon: Sun, promptPreset: 'Change lighting to moody warm sunset golden hour reflections' },
    { id: 'clothing_color', label: 'Cambiar Vestimenta', icon: Shirt, promptPreset: 'Change clothes to an elegant dark navy tailored suit with silk lapels' },
    { id: 'outpaint', label: 'Expandir Bordes', icon: Expand, promptPreset: 'Seamlessly extend the canvas borders with matching environmental surroundings' }
  ];

  const handleApplyEdit = async () => {
    if (!inputUrl) {
      showToast('Por favor sube una imagen base.', 'warning');
      return;
    }
    if (!prompt.trim()) {
      showToast('Escribe una descripción de lo que deseas modificar o agregar.', 'warning');
      return;
    }

    try {
      setProcessing(true);
      const res = await api.inpaintImage({
        inputUrl,
        maskData: maskData || undefined,
        prompt: prompt.trim(),
        action: actionType
      });
      if (res?.task?.id) {
        setCurrentTaskId(res.task.id);
      }
      await refreshUser();
      showToast('Edición inteligente en proceso en la red neuronal.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error en edición inteligente', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (url: string) => {
    showToast('Descargando imagen editada...', 'info');
    await downloadMedia(url, `pixelmind_smart_edit_${Date.now()}`, 'png');
    showToast('Descarga completada.', 'success');
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E274A]">
        <div>
          <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Wand2 className="w-4 h-4" />
            <span>Módulo 07 &bull; Edición Neuronal con Máscaras (Inpainting)</span>
          </div>
          <h2 className="text-2xl font-black text-white">Editor Inteligente & Magic Canvas</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pinta cualquier área de la fotografía y dile a la IA qué objeto remover, agregar o transformar.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Actions and Prompts */}
        <div className="lg:col-span-5 space-y-6">
          {!inputUrl ? (
            <FileUploader
              onFileUploaded={(url) => setInputUrl(url)}
              label="Cargar fotografía para editar"
            />
          ) : (
            <div className="p-3 bg-[#0E1325] border border-[#202C54] rounded-2xl flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Foto base lista para pintar</span>
              <button
                onClick={() => setInputUrl('')}
                className="text-xs text-red-400 hover:underline"
              >
                Cambiar foto
              </button>
            </div>
          )}

          {/* Quick presets */}
          <div className="p-5 rounded-2xl bg-[#0F1428] border border-[#202B52] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Acciones Rápidas con IA
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickActions.map(act => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      setActionType(act.id);
                      setPrompt(act.promptPreset);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all text-left ${
                      actionType === act.id
                        ? 'bg-fuchsia-600/30 text-fuchsia-200 border-fuchsia-500/60 shadow-md'
                        : 'bg-[#141A33] text-slate-400 border-[#232C52] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                    <span className="truncate">{act.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Prompt input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Instrucción para el área pintada:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe con precisión qué debe generar la IA dentro de la máscara..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A33] border border-[#232C52] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            <button
              onClick={handleApplyEdit}
              disabled={processing || !inputUrl || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-fuchsia-200" />
              <span>{processing ? 'Aplicando Edición...' : 'Ejecutar Edición Inteligente'}</span>
            </button>
          </div>
        </div>

        {/* Right: Interactive Canvas or Before/After Result */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              {completedTask?.outputUrl ? 'Resultado de Edición' : 'Lienzo de Selección (Máscara)'}
            </h3>

            {completedTask?.outputUrl && (
              <button
                onClick={() => handleDownload(completedTask.outputUrl!)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Resultado</span>
              </button>
            )}
          </div>

          {processingTask ? (
            <div className="rounded-2xl p-12 bg-[#0B0E1B] border border-fuchsia-500/40 text-center space-y-4 min-h-[460px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-fuchsia-400 border-t-transparent animate-spin" />
              <div>
                <h4 className="text-base font-bold text-white">Sustituyendo Área con IA Generativa</h4>
                <p className="text-xs text-fuchsia-400 mt-1">{processingTask.stage}</p>
              </div>
            </div>
          ) : completedTask?.outputUrl ? (
            <div className="space-y-3">
              <BeforeAfterSlider
                beforeUrl={inputUrl || completedTask.beforeUrl || ''}
                afterUrl={completedTask.outputUrl}
                beforeLabel="Antes de Edición"
                afterLabel="Después de Inpainting IA"
              />
              <button
                onClick={() => setInputUrl(completedTask.outputUrl!)}
                className="w-full py-2 rounded-xl bg-[#141A33] border border-[#232C52] text-xs font-semibold text-slate-200 hover:bg-[#1D2547]"
              >
                Usar este resultado como nueva base para seguir editando
              </button>
            </div>
          ) : inputUrl ? (
            <CanvasInpainter
              imageUrl={inputUrl}
              onMaskChange={(mask) => setMaskData(mask)}
            />
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[#1E274A] bg-[#0A0D1B] p-12 text-center text-slate-500 min-h-[460px] flex flex-col items-center justify-center">
              <Wand2 className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Sin imagen seleccionada</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Sube una imagen para activar el pincel de máscara y modificar elementos específicos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
