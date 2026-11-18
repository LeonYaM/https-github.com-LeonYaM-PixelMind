import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Columns, Maximize2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Original / Antes',
  afterLabel = 'Mejorado / Después (AI)',
  className = ''
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSideBySide, setIsSideBySide] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    window.addEventListener('resize', updateWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));
  const resetZoom = () => setZoomLevel(1);

  return (
    <div className={`relative flex flex-col rounded-2xl bg-[#0B0E1B] border border-[#1E274A] overflow-hidden ${className}`}>
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0D1224] border-b border-[#1E274A] text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
            Comparador Interactivo
          </span>
          <span className="text-slate-400">Desliza la barra para ver la diferencia</span>
        </div>

        {/* Zoom & Mode Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#151C36] rounded-lg p-0.5 border border-[#25325A]">
            <button
              onClick={zoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 hover:bg-[#202C56] text-slate-300 hover:text-white rounded disabled:opacity-40"
              title="Alejar"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-cyan-300 font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoomLevel >= 4}
              className="p-1.5 hover:bg-[#202C56] text-slate-300 hover:text-white rounded disabled:opacity-40"
              title="Acercar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={resetZoom}
                className="p-1.5 hover:bg-[#202C56] text-slate-300 hover:text-white rounded ml-1"
                title="Reiniciar zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsSideBySide(!isSideBySide)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              isSideBySide
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                : 'bg-[#151C36] text-slate-300 border-[#25325A] hover:bg-[#202C56]'
            }`}
            title="Alternar vista lado a lado"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSideBySide ? 'Modo Split' : 'Lado a Lado'}</span>
          </button>
        </div>
      </div>

      {/* Comparison Canvas / Display Area */}
      {isSideBySide ? (
        // Side-by-Side Mode
        <div className="grid grid-cols-2 gap-2 p-3 bg-black/40 min-h-[360px] max-h-[560px] overflow-auto">
          <div className="relative rounded-xl overflow-hidden border border-red-500/30 flex items-center justify-center bg-black">
            <span className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur rounded text-xs text-red-300 font-semibold z-10 border border-red-500/30">
              {beforeLabel}
            </span>
            <img
              src={beforeUrl}
              alt="Antes"
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[500px] w-auto object-contain transition-transform duration-150"
            />
          </div>
          <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 flex items-center justify-center bg-black">
            <span className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur rounded text-xs text-emerald-300 font-semibold z-10 border border-emerald-500/30">
              {afterLabel}
            </span>
            <img
              src={afterUrl}
              alt="Después"
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[500px] w-auto object-contain transition-transform duration-150"
            />
          </div>
        </div>
      ) : (
        // Split Slider Mode
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className="relative min-h-[380px] max-h-[600px] w-full select-none cursor-ew-resize overflow-hidden flex items-center justify-center bg-black/60"
        >
          {/* Background image: After (Enhanced) */}
          <div
            style={{ transform: `scale(${zoomLevel})` }}
            className="w-full h-full flex items-center justify-center transition-transform duration-150"
          >
            <img
              src={afterUrl}
              alt="Después"
              className="max-h-[540px] max-w-full object-contain pointer-events-none"
            />
          </div>

          {/* Foreground clipped image: Before (Original) */}
          <div
            className="absolute top-0 left-0 bottom-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <div
              style={{
                width: `${containerWidth}px`,
                height: '100%',
                transform: `scale(${zoomLevel})`
              }}
              className="flex items-center justify-center transition-transform duration-150"
            >
              <img
                src={beforeUrl}
                alt="Antes"
                className="max-h-[540px] max-w-full object-contain"
              />
            </div>
          </div>

          {/* Floating Labels */}
          <span className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur rounded-lg text-xs font-semibold text-slate-200 border border-white/10 pointer-events-none shadow-lg">
            {beforeLabel}
          </span>
          <span className="absolute top-4 right-4 px-3 py-1 bg-blue-950/80 backdrop-blur rounded-lg text-xs font-semibold text-cyan-300 border border-cyan-500/30 pointer-events-none shadow-lg">
            {afterLabel}
          </span>

          {/* Draggable Vertical Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_15px_#00F0FF] pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Center Handle Handle Circle */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-lg">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-cyan-400 rounded-full"></div>
                <div className="w-0.5 h-3 bg-cyan-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
