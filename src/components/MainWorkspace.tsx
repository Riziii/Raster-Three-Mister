import React, { useState, useRef } from 'react';
import { ProcessorSettings, PRESET_SIZES } from '../types';
import { TShirtMockup } from './TShirtMockup';
import { DEMO_ITEMS, DemoItem } from '../utils/demos';
import { Upload, Eye, Columns, Sparkles, Image as ImageIcon, Sliders, AlertTriangle, Zap, Split } from 'lucide-react';

interface MainWorkspaceProps {
  originalImage: string | null;
  processedImage: string | null;
  settings: ProcessorSettings;
  imageDimensions: { width: number; height: number } | null;
  onImageUploaded: (dataUrl: string, width: number, height: number) => void;
  onLoadDemo: (id: string) => void;
  isProcessing: boolean;
  autoApply: boolean;
  hasUnappliedChanges: boolean;
  onGenerate: () => void;
}

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  originalImage,
  processedImage,
  settings,
  imageDimensions,
  onImageUploaded,
  onLoadDemo,
  isProcessing,
  autoApply,
  hasUnappliedChanges,
  onGenerate,
}) => {
  const [viewMode, setViewMode] = useState<'mockup' | 'split' | 'side-by-side'>('mockup');
  const [splitSliderPos, setSplitSliderPos] = useState<number>(50);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File drag & drop handlers
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onImageUploaded(dataUrl, img.width, img.height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Split-screen comparison slider drag
  const handleSplitMouseMove = (e: React.MouseEvent) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitSliderPos(percentage);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {originalImage ? (
        /* ================= WORKSPACE INTERACTIVE VIEW ================= */
        <div className="flex-1 flex flex-col min-h-0 bg-bg-card rounded-xl border border-border-main p-3 space-y-3 shadow-xl transition-colors duration-300">
          {/* View Toolbar */}
          <div className="flex items-center justify-between border-b border-border-main pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-txt-secondary font-medium">Mode Tampilan:</span>
              <div className="flex bg-bg-input p-1 rounded-lg border border-border-main text-xs transition-colors duration-300">
                <button
                  onClick={() => setViewMode('mockup')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                    viewMode === 'mockup' 
                      ? 'bg-maroon text-gold font-bold border border-gold/20 shadow-md shadow-maroon/10' 
                      : 'text-txt-secondary hover:text-txt-primary'
                  }`}
                  id="view-mode-mockup"
                >
                  <Eye size={13} />
                  <span>Mockup {settings.mockupType === 't-shirt' ? 'Kaos' : 'Kanvas'}</span>
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                    viewMode === 'split' 
                      ? 'bg-maroon text-gold font-bold border border-gold/20 shadow-md shadow-maroon/10' 
                      : 'text-txt-secondary hover:text-txt-primary'
                  }`}
                  id="view-mode-split"
                >
                  <Split size={13} />
                  <span>Slider Belah</span>
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                    viewMode === 'side-by-side' 
                      ? 'bg-maroon text-gold font-bold border border-gold/20 shadow-md shadow-maroon/10' 
                      : 'text-txt-secondary hover:text-txt-primary'
                  }`}
                  id="view-mode-side-by-side"
                >
                  <Columns size={13} />
                  <span>Berdampingan</span>
                </button>
              </div>
            </div>

            {isProcessing ? (
              <div className="flex items-center space-x-2 text-gold text-xs font-semibold animate-pulse">
                <span className="h-2 w-2 rounded-full bg-gold"></span>
                <span>Sedang Memproses...</span>
              </div>
            ) : !autoApply && hasUnappliedChanges ? (
              <button
                onClick={onGenerate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold rounded-lg border border-amber-500/30 transition-all duration-200 cursor-pointer animate-pulse"
                title="Klik untuk memproses raster hasil edit terbaru"
              >
                <AlertTriangle size={13} className="text-amber-500" />
                <span>Pengaturan Berubah! Terapkan Efek ⚡</span>
              </button>
            ) : null}
          </div>

          {/* Interactive Screen container */}
          <div className="flex-1 min-h-0">
            {viewMode === 'mockup' ? (
              <TShirtMockup processedImage={processedImage} settings={settings} />
            ) : viewMode === 'split' ? (
              /* Split comparison viewer */
              <div 
                ref={splitContainerRef}
                onMouseMove={handleSplitMouseMove}
                className="relative h-full w-full bg-bg-input border border-border-main rounded-xl overflow-hidden cursor-ew-resize select-none flex items-center justify-center transition-colors duration-300"
              >
                {/* Background Checkerboard */}
                <div 
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, var(--checker-dark, #cbd5e1) 25%, transparent 25%), linear-gradient(-45deg, var(--checker-dark, #cbd5e1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--checker-dark, #cbd5e1) 75%), linear-gradient(-45deg, transparent 75%, var(--checker-dark, #cbd5e1) 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  }}
                />

                {/* Left Side: Original Image */}
                <div className="absolute inset-y-0 left-0 w-full flex items-center justify-center">
                  <div className="max-w-[85%] max-h-[85%] flex items-center justify-center">
                    <img 
                      src={originalImage} 
                      alt="Original Design" 
                      className="max-h-[380px] max-w-[380px] object-contain pointer-events-none opacity-40" 
                    />
                  </div>
                </div>

                {/* Right Side: Processed Image with clip mask */}
                <div 
                  className="absolute inset-y-0 right-0 left-0 flex items-center justify-center bg-bg-card/90 border-l border-gold/45 backdrop-blur-[1px]"
                  style={{ 
                    clipPath: `inset(0 0 0 ${splitSliderPos}%)`,
                  }}
                >
                  <div className="max-w-[85%] max-h-[85%] flex items-center justify-center">
                    {processedImage ? (
                      <img 
                        src={processedImage} 
                        alt="Processed Design" 
                        className="max-h-[380px] max-w-[380px] object-contain pointer-events-none" 
                      />
                    ) : (
                      <span className="text-xs text-txt-muted font-mono">Memuat hasil...</span>
                    )}
                  </div>
                </div>

                {/* Slidable Divider Line */}
                <div 
                  className="absolute inset-y-0 w-1 bg-gold cursor-ew-resize pointer-events-none"
                  style={{ left: `${splitSliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-maroon text-gold flex items-center justify-center shadow-lg border border-gold">
                    <Columns size={12} />
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-bg-card/90 text-[10px] font-semibold text-txt-secondary rounded pointer-events-none border border-border-main shadow-sm backdrop-blur-sm">
                  SEBELUM (ASLI)
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-maroon/90 text-[10px] font-semibold text-gold rounded pointer-events-none border border-gold/30 shadow-sm backdrop-blur-sm">
                  SESUDAH (EFEK RASTER / KNOCKOUT)
                </div>
              </div>
            ) : (
              /* Side-by-side comparison viewer */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full min-h-[350px]">
                {/* Left side: Original */}
                <div className="relative flex flex-col bg-bg-input border border-border-main rounded-xl overflow-hidden p-3.5 flex-1 min-h-[260px] justify-center items-center transition-colors duration-300">
                  {/* Background Checkerboard */}
                  <div 
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, var(--checker-dark, #cbd5e1) 25%, transparent 25%), linear-gradient(-45deg, var(--checker-dark, #cbd5e1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--checker-dark, #cbd5e1) 75%), linear-gradient(-45deg, transparent 75%, var(--checker-dark, #cbd5e1) 75%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  />
                  <div className="relative z-10 max-w-full max-h-full flex items-center justify-center">
                    <img 
                      src={originalImage} 
                      alt="Original Design" 
                      className="max-h-[320px] max-w-full object-contain pointer-events-none transition-all" 
                    />
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-bg-card/90 text-[10px] font-bold text-txt-secondary rounded pointer-events-none border border-border-main uppercase tracking-wider shadow-sm backdrop-blur-sm">
                    Sebelum (Asli)
                  </div>
                </div>

                {/* Right side: Processed */}
                <div className="relative flex flex-col bg-bg-input border border-border-main rounded-xl overflow-hidden p-3.5 flex-1 min-h-[260px] justify-center items-center transition-colors duration-300">
                  {/* Background Checkerboard */}
                  <div 
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, var(--checker-dark, #cbd5e1) 25%, transparent 25%), linear-gradient(-45deg, var(--checker-dark, #cbd5e1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--checker-dark, #cbd5e1) 75%), linear-gradient(-45deg, transparent 75%, var(--checker-dark, #cbd5e1) 75%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  />
                  <div className="relative z-10 max-w-full max-h-full flex items-center justify-center">
                    {processedImage ? (
                      <img 
                        src={processedImage} 
                        alt="Processed Design" 
                        className="max-h-[320px] max-w-full object-contain pointer-events-none transition-all" 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 text-center py-6">
                        <div className="h-6 w-6 rounded-full border-2 border-gold/20 border-t-gold animate-spin"></div>
                        <span className="text-xs text-txt-muted font-mono">Memuat hasil...</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-maroon/90 text-[10px] font-bold text-gold rounded pointer-events-none border border-gold/30 uppercase tracking-wider shadow-sm backdrop-blur-sm">
                    Sesudah (Efek Raster / Knockout)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= EMPTY STATE / FILE DROPZONE ================= */
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center transition-all min-h-[320px] ${
            isDraggingOver 
              ? 'border-gold bg-gold/10' 
              : 'border-border-main bg-bg-card hover:border-gold/40 hover:bg-bg-card-sub'
          }`}
        >
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-bg-input flex items-center justify-center text-txt-secondary border border-border-main mb-4 transition duration-300 shadow-sm">
              <Upload size={28} className="text-gold" />
            </div>
            
            <h3 className="text-base font-bold text-txt-primary mb-1.5">Tarik & Letakkan File Gambar</h3>
            <p className="text-xs text-txt-secondary leading-relaxed mb-6">
              Mendukung file format <span className="font-semibold text-txt-primary">PNG transparan</span>, JPG, atau WebP beresolusi tinggi. Ideal untuk desain kaos sablon DTF/DTG.
            </p>
            
            <button
              onClick={triggerFileInput}
              className="px-5 py-2.5 bg-gradient-to-r from-maroon to-gold hover:from-maroon-hover hover:to-gold-hover text-white font-medium rounded-lg text-xs shadow-lg shadow-maroon/20 transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              Pilih Gambar Desain
            </button>
          </div>
        </div>
      )}

      {/* ================= PRESET / DEMO SELECTION AREA ================= */}
      <div className="bg-bg-card border border-border-main rounded-xl p-4 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={14} className="text-gold" />
          <h4 className="text-xs font-bold text-txt-primary uppercase tracking-wider">
            Belum punya gambar? Coba dengan template demo desain kaos ini:
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_ITEMS.map((demo: DemoItem) => (
            <button
              key={demo.id}
              onClick={() => onLoadDemo(demo.id)}
              className="flex items-start text-left gap-3 p-3 bg-bg-card-sub hover:bg-bg-input border border-border-main hover:border-gold/40 rounded-lg transition duration-200 group cursor-pointer shadow-sm"
            >
              <div className="h-10 w-10 flex-shrink-0 rounded bg-bg-input border border-border-main flex items-center justify-center group-hover:bg-maroon/10 transition">
                <ImageIcon size={18} className="text-gold group-hover:text-gold-dark" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-txt-primary group-hover:text-gold transition">
                  {demo.name}
                </div>
                <div className="text-[10px] text-txt-secondary leading-normal">
                  {demo.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
