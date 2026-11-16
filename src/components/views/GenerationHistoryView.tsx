import React from 'react';
import { useQueue } from '../../context/QueueContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Trash2,
  Download,
  Coins,
  ExternalLink,
  Layers
} from 'lucide-react';
import { TaskStatus } from '../../types';

export const GenerationHistoryView: React.FC = () => {
  const { tasks, cancelTask, retryTask, deleteTask } = useQueue();

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3 animate-spin" />
            <span>En espera</span>
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/20 text-cyan-300 border border-blue-500/30 flex items-center gap-1 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Procesando</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Finalizado</span>
          </span>
        );
      case 'error':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Error</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Cancelado</span>
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E274A]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Módulo 09 &bull; Cola Asíncrona & Registro de Tareas</span>
          </div>
          <h2 className="text-2xl font-black text-white">Historial de Generaciones</h2>
          <p className="text-xs text-slate-400 mt-1">
            Supervisa el estado en tiempo real de tus renderizados, reintenta tareas fallidas o cancela procesos en curso.
          </p>
        </div>
      </div>

      {/* Task Table / Cards */}
      {tasks.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-[#0B0E1B] rounded-2xl border border-[#1E274A]">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No hay tareas registradas</p>
          <p className="text-xs text-slate-500 mt-1">
            Inicia un mejoramiento o generación de video para ver su estado aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(t => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-[#0D1225] border border-[#1E274A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-slate-600"
            >
              {/* Left Info & Preview thumbnail */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-black border border-[#232F5C] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {t.outputUrl ? (
                    t.resultType === 'video' ? (
                      <video src={t.outputUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={t.outputUrl} alt={t.title} className="w-full h-full object-cover" />
                    )
                  ) : t.inputUrl ? (
                    <img src={t.inputUrl} alt="Input" className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <Clock className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{t.title}</h4>
                    {getStatusBadge(t.status)}
                  </div>
                  <p className="text-xs text-slate-400">
                    {t.stage || 'Procesando modelo neuronal'} &bull;{' '}
                    <span className="text-cyan-400 font-mono">{t.provider}</span>
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>ID: {t.id.substring(0, 14)}...</span>
                    <span>&bull;</span>
                    <span>{new Date(t.createdAt).toLocaleTimeString()}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Coins className="w-3 h-3" />
                      {t.creditsCost} créditos
                    </span>
                  </div>

                  {t.status === 'processing' && (
                    <div className="w-60 bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                  )}

                  {t.error && (
                    <p className="text-xs text-red-400 mt-1 font-mono">Error: {t.error}</p>
                  )}
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {t.outputUrl && (
                  <a
                    href={t.outputUrl}
                    download
                    className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 text-xs flex items-center gap-1"
                    title="Descargar archivo"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Descargar</span>
                  </a>
                )}

                {(t.status === 'pending' || t.status === 'processing') && (
                  <button
                    onClick={() => cancelTask(t.id)}
                    className="p-2 rounded-xl bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/40 text-xs flex items-center gap-1"
                    title="Cancelar tarea"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                )}

                {(t.status === 'error' || t.status === 'cancelled') && (
                  <button
                    onClick={() => retryTask(t.id)}
                    className="p-2 rounded-xl bg-blue-950/40 text-cyan-400 border border-blue-500/30 hover:bg-blue-900/40 text-xs flex items-center gap-1"
                    title="Reintentar tarea"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reintentar</span>
                  </button>
                )}

                <button
                  onClick={() => deleteTask(t.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
