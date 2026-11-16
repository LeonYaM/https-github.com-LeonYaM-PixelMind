import React, { useState, useRef } from 'react';
import { UploadCloud, Image, FileVideo, X } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface FileUploaderProps {
  onFileUploaded: (fileUrl: string, filename: string) => void;
  accept?: 'image' | 'video' | 'both';
  maxSizeMB?: number;
  label?: string;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUploaded,
  accept = 'image',
  maxSizeMB = 50,
  label = 'Arrastra una fotografía o haz clic para subir',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useApp();

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      showToast(`El archivo excede el límite de ${maxSizeMB}MB.`, 'error');
      return;
    }

    try {
      setIsUploading(true);
      const res = await api.uploadImage(file);
      setPreviewUrl(res.fileUrl);
      onFileUploaded(res.fileUrl, res.filename);
      showToast('Archivo subido con éxito.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error al subir archivo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onFileUploaded('', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-6 text-center flex flex-col items-center justify-center min-h-[220px] ${
        isDragging
          ? 'border-cyan-400 bg-cyan-950/20 shadow-glow-cyan'
          : previewUrl
          ? 'border-blue-500/50 bg-[#0E1325]'
          : 'border-[#222C52] bg-[#0A0D1A] hover:border-blue-500/50 hover:bg-[#0F1426]'
      } ${className}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept={accept === 'video' ? 'video/*' : accept === 'both' ? 'image/*,video/*' : 'image/*'}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative group max-w-full">
          <img
            src={previewUrl}
            alt="Subida"
            className="max-h-52 rounded-xl object-contain shadow-lg border border-[#25325C]"
          />
          <button
            onClick={handleClear}
            className="absolute -top-3 -right-3 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-500 shadow-md transition-all"
            title="Quitar archivo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center text-cyan-400 shadow-glow-blue">
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            ) : accept === 'video' ? (
              <FileVideo className="w-7 h-7" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">{label}</p>
            <p className="text-xs text-slate-400 mt-1">
              Soporta {accept === 'video' ? 'MP4, WebM, MOV' : 'JPG, PNG, WEBP, TIFF'} hasta {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
