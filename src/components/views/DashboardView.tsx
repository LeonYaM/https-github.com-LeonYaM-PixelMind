import React from 'react';
import { useApp } from '../../context/AppContext';
import { useQueue } from '../../context/QueueContext';
import {
  Sparkles,
  History,
  Image as ImageIcon,
  Film,
  Video,
  Wand2,
  Coins,
  ArrowRight,
  Clock,
  CheckCircle2,
  Play
} from 'lucide-react';
import { ViewType } from '../../types';

export const DashboardView: React.FC = () => {
  const { setCurrentView, user } = useApp();
  const { activeTasks, completedTasks } = useQueue();

  const studioTools = [
    {
      id: 'image_enhancer' as ViewType,
      title: 'Mejoramiento de Imágenes',
      tag: 'Superresolución 2X - 8X',
      desc: 'Aumenta resolución, nitidez, remueve granulado y restaura rostros con preservación de identidad.',
      gradient: 'from-blue-600/30 to-cyan-500/20',
      border: 'border-blue-500/40',
      icon: Sparkles,
      iconColor: 'text-cyan-400'
    },
    {
      id: 'photo_restorer' as ViewType,
      title: 'Restauración de Fotos',
      tag: 'Vintage & Dañadas',
      desc: 'Elimina rayas, dobladuras y grietas de fotos antiguas, y colorea tomas blanco y negro con IA.',
      gradient: 'from-purple-600/30 to-pink-500/20',
      border: 'border-purple-500/40',
      icon: History,
      iconColor: 'text-purple-400'
    },
    {
      id: 'text_to_image' as ViewType,
      title: 'Generación Text to Image',
      tag: 'FLUX & Imagen 3',
      desc: 'Crea fotografías hiperrealistas, ilustraciones cinemáticas y conceptos artísticos desde texto.',
      gradient: 'from-emerald-600/30 to-teal-500/20',
      border: 'border-emerald-500/40',
      icon: ImageIcon,
      iconColor: 'text-emerald-400'
    },
    {
      id: 'text_to_video' as ViewType,
      title: 'Video Text to Video',
      tag: 'Google Veo & Kling',
      desc: 'Sintetiza tomas cinematográficas con movimiento de cámara, iluminación dinámica y estilo de película.',
      gradient: 'from-indigo-600/30 to-blue-500/20',
      border: 'border-indigo-500/40',
      icon: Film,
      iconColor: 'text-indigo-400'
    },
    {
      id: 'image_to_video' as ViewType,
      title: 'Animación Image to Video',
      tag: 'Retratos & Paisajes',
      desc: 'Anima fotografías fijas con expresiones orgánicas, viento, partículas y movimientos suaves.',
      gradient: 'from-rose-600/30 to-amber-500/20',
      border: 'border-rose-500/40',
      icon: Video,
      iconColor: 'text-rose-400'
    },
    {
      id: 'smart_editor' as ViewType,
      title: 'Editor Inteligente',
      tag: 'Inpainting & Canvas',
      desc: 'Pinta máscaras interactivas para sustituir fondos, eliminar objetos y alterar elementos con texto.',
      gradient: 'from-fuchsia-600/30 to-purple-500/20',
      border: 'border-fuchsia-500/40',
      icon: Wand2,
      iconColor: 'text-fuchsia-400'
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-[#0E1328] via-[#131936] to-[#0A0D1B] border border-[#232F5C] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-cyan-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Estudio Creativo de Inteligencia Artificial Multimedia
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Bienvenido a <span className="gradient-text-electric">PIXELMIND AI</span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Transforma, restaura y da vida a tus imágenes y videos mediante modelos neuronales de última generación.
              Alta fidelidad visual, preservación estricta de identidades y calidad cinematográfica profesional.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-4">
            <div className="px-5 py-3.5 rounded-2xl bg-[#080B17]/80 border border-[#202B52] backdrop-blur text-center">
              <span className="text-[11px] text-slate-400 uppercase font-mono">Créditos</span>
              <p className="text-2xl font-black text-cyan-300">{user?.credits ?? 0}</p>
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-[#080B17]/80 border border-[#202B52] backdrop-blur text-center">
              <span className="text-[11px] text-slate-400 uppercase font-mono">En Proceso</span>
              <p className="text-2xl font-black text-amber-400">{activeTasks.length}</p>
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-[#080B17]/80 border border-[#202B52] backdrop-blur text-center">
              <span className="text-[11px] text-slate-400 uppercase font-mono">Finalizados</span>
              <p className="text-2xl font-black text-emerald-400">{completedTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Jobs Live Banner (if any) */}
      {activeTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 animate-spin">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-200">
                {activeTasks.length} tarea(s) procesándose en la cola neuronal
              </p>
              <p className="text-xs text-amber-300/80">{activeTasks[0].title} — {activeTasks[0].stage}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('history')}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 border border-amber-400/30"
          >
            <span>Ver Cola en Vivo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Studio Modules Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <span>Herramientas del Estudio</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studioTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => setCurrentView(tool.id)}
                className={`group cursor-pointer rounded-2xl p-6 bg-[#0D1122] border ${tool.border} hover:scale-[1.02] transition-all duration-200 relative overflow-hidden shadow-lg`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-20 group-hover:opacity-40 transition-opacity`} />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#141A33] border border-[#232D56] flex items-center justify-center shadow-md">
                      <Icon className={`w-5 h-5 ${tool.iconColor}`} />
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {tool.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-1 text-xs font-medium text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>Abrir espacio de trabajo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Generations Showcase */}
      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Trabajos Recientes</span>
            </h2>
            <button
              onClick={() => setCurrentView('history')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todo el historial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {completedTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="group relative rounded-xl overflow-hidden bg-[#0E1224] border border-[#1E2748] aspect-video flex items-center justify-center"
              >
                {task.resultType === 'video' ? (
                  <video
                    src={task.outputUrl || ''}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                  />
                ) : (
                  <img
                    src={task.outputUrl || ''}
                    alt={task.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                  <span className="text-[10px] text-cyan-300">{task.provider}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
