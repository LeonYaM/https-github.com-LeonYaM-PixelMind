import React, { createContext, useContext, useState, useEffect } from 'react';
import { GenerationTask } from '../types';
import { api } from '../services/api';
import { useApp } from './AppContext';

interface QueueContextType {
  tasks: GenerationTask[];
  activeTasks: GenerationTask[];
  completedTasks: GenerationTask[];
  cancelTask: (id: string) => Promise<void>;
  retryTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const { showToast, refreshUser } = useApp();

  const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'processing');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const refreshTasks = async () => {
    try {
      const list = await api.getTasks({ limit: 50 });
      setTasks(list);
    } catch (e) {
      console.warn('Error loading tasks:', e);
    }
  };

  useEffect(() => {
    refreshTasks();

    // Setup SSE connection
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/queue/stream');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'init') {
            setTasks(data.tasks);
          } else if (data.type === 'task_queued') {
            setTasks(prev => {
              const exists = prev.some(t => t.id === data.task.id);
              if (exists) return prev.map(t => t.id === data.task.id ? data.task : t);
              return [data.task, ...prev];
            });
            showToast(`Nueva tarea en cola: ${data.task.title}`, 'info');
          } else if (data.type === 'task_updated') {
            setTasks(prev => prev.map(t => t.id === data.task.id ? data.task : t));

            if (data.task.status === 'completed') {
              showToast(`¡Tarea completada!: ${data.task.title}`, 'success');
              refreshUser();
            } else if (data.task.status === 'error') {
              showToast(`Error en tarea: ${data.task.error || 'Fallo'}`, 'error');
              refreshUser();
            }
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn('SSE stream error, reconnecting...', err);
      };
    } catch (e) {
      console.warn('EventSource not supported or failed:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const cancelTask = async (id: string) => {
    try {
      await api.cancelTask(id);
      showToast('Tarea cancelada y créditos reembolsados.', 'info');
      refreshTasks();
      refreshUser();
    } catch (e: any) {
      showToast(e.message || 'Error al cancelar', 'error');
    }
  };

  const retryTask = async (id: string) => {
    try {
      await api.retryTask(id);
      showToast('Tarea reencolada.', 'info');
      refreshTasks();
      refreshUser();
    } catch (e: any) {
      showToast(e.message || 'Error al reintentar', 'error');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast('Registro eliminado.', 'info');
    } catch (e: any) {
      showToast(e.message || 'Error al eliminar', 'error');
    }
  };

  return (
    <QueueContext.Provider
      value={{
        tasks,
        activeTasks,
        completedTasks,
        cancelTask,
        retryTask,
        deleteTask,
        refreshTasks
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueue must be used within QueueProvider');
  return ctx;
};
