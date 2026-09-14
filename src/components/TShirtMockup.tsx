import React, { useRef, useState } from 'react';
import { ProcessorSettings } from '../types';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

interface TShirtMockupProps {
  processedImage: string | null; // dataURL of the processed image
  settings: ProcessorSettings;
}

export const TShirtMockup: React.FC<TShirtMockupProps> = ({ processedImage, settings }) => {
  const [zoom, setZoom] = useState<number>(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  // Garment mockup colors list
  const garmentColors = [
    { name: 'Hitam', value: '#121212' },
    { name: 'Charcoal', value: '#2d3135' },
    { name: 'Putih', value: '#f4f5f7' },
    { name: 'Abu-abu Misty', value: '#a0a5ab' },
    { name: 'Biru Royal', value: '#1e3a8a' },
    { name: 'Merah', value: '#991b1b' },
    { name: 'Hijau Botol', value: '#14532d' },
    { name: 'Biru Navy', value: '#1e293b' },
  ];

  return (
    <div className="relative flex flex-col h-full bg-bg-card border border-border-main rounded-xl overflow-hidden select-none shadow-xl transition-colors duration-300">
      {/* Workspace Controls */}
      <div className="flex items-center justify-between p-3 border-b border-border-main bg-bg-card-sub/90 backdrop-blur-sm z-10 transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2 py-1 bg-maroon/15 text-gold rounded border border-gold/20">
            {settings.mockupType === 't-shirt' ? 'Kaos Mockup 👕' : 'Kanvas Flat 🖼️'}
          </span>
          <span className="text-xs text-txt-secondary hidden sm:inline">
            Tarik untuk geser kanvas, gunakan zoom untuk melihat dot raster
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setZoom(prev => Math.max(25, prev - 25))}
            className="p-1.5 hover:bg-bg-input text-txt-secondary hover:text-txt-primary rounded transition border border-border-main cursor-pointer"
            title="Perkecil Tampilan"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-txt-primary font-mono w-10 text-center font-semibold">{zoom}%</span>
          <button 
            onClick={() => setZoom(prev => Math.min(400, prev + 25))}
            className="p-1.5 hover:bg-bg-input text-txt-secondary hover:text-txt-primary rounded transition border border-border-main cursor-pointer"
            title="Perbesar Tampilan"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={resetView}
            className="p-1.5 hover:bg-bg-input text-txt-secondary hover:text-txt-primary rounded transition border border-border-main ml-1 cursor-pointer"
            title="Atur Ulang Posisi & Zoom"
          >
            <Maximize size={16} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div 
        className={`flex-1 relative flex items-center justify-center overflow-hidden cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage: settings.mockupType === 'flat' && settings.mockupShowGrid 
            ? 'linear-gradient(45deg, var(--checker-dark, #cbd5e1) 25%, transparent 25%), linear-gradient(-45deg, var(--checker-dark, #cbd5e1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--checker-dark, #cbd5e1) 75%), linear-gradient(-45deg, transparent 75%, var(--checker-dark, #cbd5e1) 75%)'
            : 'none',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          backgroundColor: settings.mockupType === 'flat' 
            ? (settings.mockupShowGrid ? 'var(--bg-input)' : settings.mockupBgColor) 
            : 'var(--bg-app)',
        }}
      >
        {/* Render container with dynamic zoom and pan */}
        <div 
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="relative flex items-center justify-center w-full h-full"
        >
          {settings.mockupType === 't-shirt' ? (
            // Realistic T-Shirt Graphic with pure SVG & CSS shading
            <div className="relative w-[500px] h-[500px] flex items-center justify-center transition-all duration-300">
              {/* T-Shirt Vector Mask */}
              <svg 
                className="absolute inset-0 w-full h-full drop-shadow-2xl" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* T-Shirt Base Silhouette */}
                <path 
                  d="M 24 16 
                     C 32 21, 68 21, 76 16 
                     L 92 24 
                     C 90 32, 85 41, 80 43 
                     L 77 38 
                     L 77 88 
                     C 77 91, 74 93, 71 93 
                     L 29 93 
                     C 26 93, 23 91, 23 88 
                     L 23 38 
                     L 20 43 
                     C 15 41, 10 32, 8 24 Z" 
                  fill={settings.mockupBgColor}
                  className="transition-colors duration-300"
                />
                
                {/* Collar/Crew neck ribbing details */}
                <path 
                  d="M 36 17.5 C 42 21.5, 58 21.5, 64 17.5 C 64 16, 36 16, 36 17.5 Z" 
                  fill="#000" 
                  opacity="0.15" 
                />
                <path 
                  d="M 37 18 C 42 21.8, 58 21.8, 63 18" 
                  stroke="#fff" 
                  strokeWidth="0.3" 
                  opacity="0.25" 
                />

                {/* Shading/Wrinkle overlay - simulated with gradients for realistic fabric look */}
                <path 
                  d="M 24 16 
                     C 32 21, 68 21, 76 16 
                     L 92 24 
                     C 90 32, 85 41, 80 43 
                     L 77 38 
                     L 77 88 
                     C 77 91, 74 93, 71 93 
                     L 29 93 
                     C 26 93, 23 91, 23 88 
                     L 23 38 
                     L 20 43 
                     C 15 41, 10 32, 8 24 Z" 
                  fill="url(#fabric-shading)" 
                  style={{ mixBlendMode: 'multiply' }}
                />

                {/* Fabric Highlights for wrinkles */}
                <path 
                  d="M 24 16 
                     C 32 21, 68 21, 76 16 
                     L 92 24 
                     C 90 32, 85 41, 80 43 
                     L 77 38 
                     L 77 88 
                     C 77 91, 74 93, 71 93 
                     L 29 93 
                     C 26 93, 23 91, 23 88 
                     L 23 38 
                     L 20 43 
                     C 15 41, 10 32, 8 24 Z" 
                  fill="url(#fabric-highlights)" 
                  style={{ mixBlendMode: 'screen' }}
                  opacity="0.2"
                />

                {/* SVG Shading Defs */}
                <defs>
                  {/* Wrinkle pattern shadows */}
                  <linearGradient id="fabric-shading" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="25%" stopColor="#000000" stopOpacity="0.12" />
                    <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#000000" stopOpacity="0.18" />
                    <stop offset="65%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="85%" stopColor="#000000" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>

                  {/* Highlights to make wrinkles pop */}
                  <linearGradient id="fabric-highlights" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="30%" stopColor="#000000" stopOpacity="0" />
                    <stop offset="55%" stopColor="#ffffff" stopOpacity="0.3" />
                    <stop offset="80%" stopColor="#000000" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Printable chest area bounds */}
              <div className="absolute top-[28%] left-[29%] w-[42%] h-[46%] flex items-center justify-center rounded border border-dashed border-white/10 group">
                {/* Print area guide badge */}
                <span className="absolute top-1 right-1 text-[8px] font-mono text-white/20 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition">
                  Area Cetak DTF
                </span>
                
                {processedImage ? (
                  <img 
                    src={processedImage} 
                    alt="Processed Print" 
                    className="max-w-full max-h-full object-contain drop-shadow-md pointer-events-none"
                    style={{
                      // Slight fabric texture overlay simulation on the artwork
                      mixBlendMode: 'normal'
                    }}
                  />
                ) : (
                  <div className="text-center p-2 text-txt-secondary text-[10px]">
                    Unggah desain untuk melihat hasil cetak
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Flat Canvas Mode
            <div className="relative flex items-center justify-center p-12 max-w-[85vw] max-h-[75vh]">
              {processedImage ? (
                <div className="relative shadow-2xl border border-border-main bg-transparent rounded overflow-hidden">
                  <img 
                    src={processedImage} 
                    alt="Processed Transparent Design" 
                    className="max-w-[450px] max-h-[450px] object-contain block pointer-events-none" 
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-80 h-80 border-2 border-dashed border-border-main bg-bg-card-sub/60 text-txt-secondary rounded-lg p-6 text-center">
                  <p className="text-sm">Unggah desain atau pilih demo gambar di bawah untuk memulai pemrosesan warna.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Help icon or indicator for dragging */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 bg-bg-card/90 border border-border-main rounded-md text-[10px] text-txt-secondary shadow-sm backdrop-blur-sm">
          <Move size={12} className="text-gold" />
          <span>Seret mouse untuk geser</span>
        </div>
      </div>
    </div>
  );
};
