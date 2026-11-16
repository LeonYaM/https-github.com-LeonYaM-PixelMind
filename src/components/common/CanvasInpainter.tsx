import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Paintbrush, Eraser, Trash2, Undo2 } from 'lucide-react';

interface CanvasInpainterProps {
  imageUrl: string;
  onMaskChange: (maskBase64: string | null) => void;
  className?: string;
}

export const CanvasInpainter: React.FC<CanvasInpainterProps> = ({
  imageUrl,
  onMaskChange,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushSize, setBrushSize] = useState(35);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Initialize canvas with matching aspect ratio
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [imageUrl]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      setHistory(prev => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    saveState();
    setIsDrawing(true);
    const { x, y } = getPos(e);
    draw(x, y);
  };

  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(236, 72, 153, 0.7)'; // Neon pink visual mask
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
    }

    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Export mask as black/white image
    exportMask();
  };

  const moveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    draw(x, y);
  };

  const stopDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      exportMask();
    }
  };

  const exportMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary black & white canvas for AI inpainting model
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Fill black background
    tempCtx.fillStyle = '#000000';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw painted areas as white
    tempCtx.drawImage(canvas, 0, 0);
    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      if (imgData.data[i + 3] > 0) {
        // Pixel is painted -> turn to solid white
        imgData.data[i] = 255;
        imgData.data[i + 1] = 255;
        imgData.data[i + 2] = 255;
        imgData.data[i + 3] = 255;
      }
    }
    tempCtx.putImageData(imgData, 0, 0);

    const base64 = tempCanvas.toDataURL('image/png');
    onMaskChange(base64);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onMaskChange(null);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previous = history[history.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory(prev => prev.slice(0, -1));
    exportMask();
  };

  return (
    <div className={`flex flex-col rounded-2xl bg-[#090C16] border border-[#1A223E] overflow-hidden ${className}`}>
      {/* Canvas Toolset */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0F1428] border-b border-[#1A223E] text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEraser(false)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
              !isEraser ? 'bg-pink-600 text-white shadow-lg' : 'bg-[#171E3A] text-slate-300 hover:bg-[#20294E]'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Pincel de Máscara</span>
          </button>

          <button
            onClick={() => setIsEraser(true)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
              isEraser ? 'bg-indigo-600 text-white' : 'bg-[#171E3A] text-slate-300 hover:bg-[#20294E]'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Borrador</span>
          </button>
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Grosor:</span>
          <input
            type="range"
            min="5"
            max="120"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 accent-pink-500 cursor-pointer"
          />
          <span className="font-mono text-pink-400 font-bold w-7 text-right">{brushSize}px</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1.5 rounded-lg bg-[#171E3A] text-slate-300 hover:text-white disabled:opacity-40"
            title="Deshacer trazo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded-lg bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/40 text-xs flex items-center gap-1"
            title="Limpiar máscara"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Layered Canvas Container */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center p-3 min-h-[380px] max-h-[580px] bg-black/60 overflow-hidden select-none"
      >
        {/* Background Target Image */}
        <img
          src={imageUrl}
          alt="Para editar"
          className="max-h-[520px] max-w-full object-contain pointer-events-none rounded-lg"
        />

        {/* Drawing Overlay Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={stopDraw}
          className="absolute max-h-[520px] max-w-full object-contain cursor-crosshair rounded-lg"
        />
      </div>
      <p className="px-4 py-2 text-[11px] text-slate-400 bg-[#0A0D1B] border-t border-[#18203B] text-center">
        Pinta sobre el área u objeto que deseas que la IA modifique, elimine o reemplace.
      </p>
    </div>
  );
};
