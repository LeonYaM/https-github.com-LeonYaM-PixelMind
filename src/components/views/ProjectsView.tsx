import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useQueue } from '../../context/QueueContext';
import { api } from '../../services/api';
import {
  FolderKanban,
  FolderPlus,
  Trash2,
  Folder,
  Download,
  ExternalLink,
  Layers,
  FileCheck
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { projects, activeProject, setActiveProject, refreshProjects, showToast } = useApp();
  const { tasks } = useQueue();

  const [selectedFolder, setSelectedFolder] = useState('Todos');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFolder, setNewProjectFolder] = useState('Mejoras');
  const [isCreating, setIsCreating] = useState(false);

  const folders = ['Todos', 'Mejoras', 'Videos', 'Generaciones', 'Restauraciones'];

  const filteredProjects = selectedFolder === 'Todos'
    ? projects
    : projects.filter(p => p.folder === selectedFolder);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await api.createProject({
        name: newProjectName.trim(),
        folder: newProjectFolder
      });
      setNewProjectName('');
      setIsCreating(false);
      await refreshProjects();
      showToast('Proyecto creado exitosamente.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error creando proyecto', 'error');
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que deseas eliminar este proyecto?')) return;
    try {
      await api.deleteProject(id);
      await refreshProjects();
      showToast('Proyecto eliminado.', 'info');
    } catch (e: any) {
      showToast(e.message || 'Error eliminando proyecto', 'error');
    }
  };

  // Files/tasks belonging to active project
  const projectTasks = tasks.filter(t => t.projectId === activeProject?.id || !t.projectId);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E274A]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Módulo 08 &bull; Administración de Proyectos & Almacenamiento</span>
          </div>
          <h2 className="text-2xl font-black text-white">Mis Proyectos & Galería</h2>
          <p className="text-xs text-slate-400 mt-1">
            Organiza tus creaciones por carpetas, gestiona archivos multimedia y revisa estados de renderizado.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-glow-blue transition-all"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* Create project dialog */}
      {isCreating && (
        <form onSubmit={handleCreateProject} className="p-5 rounded-2xl bg-[#0F1428] border border-blue-500/40 space-y-4">
          <h3 className="text-sm font-bold text-white">Crear Nuevo Proyecto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Nombre del Proyecto:</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Ejemplo: Campaña Comercial 2026"
                className="w-full px-3 py-2 rounded-lg bg-[#141A33] border border-[#232C52] text-xs text-slate-100"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Carpeta de Organización:</label>
              <select
                value={newProjectFolder}
                onChange={(e) => setNewProjectFolder(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141A33] border border-[#232C52] text-xs text-slate-100"
              >
                {folders.filter(f => f !== 'Todos').map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
            >
              Guardar Proyecto
            </button>
          </div>
        </form>
      )}

      {/* Folder Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {folders.map(folder => (
          <button
            key={folder}
            onClick={() => setSelectedFolder(folder)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all border ${
              selectedFolder === folder
                ? 'bg-blue-600/30 text-cyan-300 border-blue-500/50 shadow-md'
                : 'bg-[#0E1325] text-slate-400 border-[#202B52] hover:text-white'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>{folder}</span>
          </button>
        ))}
      </div>

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredProjects.map(proj => {
          const isActive = activeProject?.id === proj.id;
          return (
            <div
              key={proj.id}
              onClick={() => setActiveProject(proj)}
              className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-[#121832] to-[#0A0D1B] border-blue-500 shadow-glow-blue'
                  : 'bg-[#0D1122] border-[#1E2748] hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {proj.folder}
                </span>
                {proj.id !== 'proj_default' && (
                  <button
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded"
                    title="Eliminar proyecto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <h3 className="font-bold text-sm text-white mb-1">{proj.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{proj.description || 'Sin descripción'}</p>
              <div className="mt-4 pt-3 border-t border-[#1C2444] flex items-center justify-between text-[11px] text-slate-400">
                <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                <span className={isActive ? 'text-cyan-400 font-bold' : ''}>
                  {isActive ? 'Activo en Sesión' : 'Seleccionar'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Files of Selected Project */}
      <div className="space-y-4 pt-6 border-t border-[#1E274A]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Archivos y Resultados en: {activeProject?.name || 'Estudio'}</span>
          </h3>
          <span className="text-xs text-slate-400">{projectTasks.length} elementos</span>
        </div>

        {projectTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-[#0B0E1B] rounded-2xl border border-[#1E274A]">
            <p className="text-xs">Este proyecto aún no tiene generaciones asociadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {projectTasks.map(t => (
              <div key={t.id} className="p-3 bg-[#0D1225] border border-[#1E274A] rounded-xl space-y-2">
                <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  {t.resultType === 'video' && t.outputUrl ? (
                    <video src={t.outputUrl} className="w-full h-full object-cover" muted />
                  ) : t.outputUrl ? (
                    <img src={t.outputUrl} alt={t.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[11px] text-slate-500">{t.status}</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-200 truncate">{t.title}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="capitalize">{t.status}</span>
                  {t.outputUrl && (
                    <a
                      href={t.outputUrl}
                      download
                      className="text-cyan-400 hover:underline flex items-center gap-0.5"
                    >
                      <Download className="w-3 h-3" />
                      <span>Bajar</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
