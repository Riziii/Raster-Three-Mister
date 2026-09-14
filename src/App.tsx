/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { DEFAULT_SETTINGS, ProcessorSettings, PRESET_SIZES } from './types';
import { SidebarControls } from './components/SidebarControls';
import { MainWorkspace } from './components/MainWorkspace';
import { Logo } from './components/Logo';
import { generateHalftone, calculatePixelDimensions, drawHalftoneShape } from './utils/imageProcessor';
import { generateDemoCanvas } from './utils/demos';
import { 
  Printer, 
  Download, 
  Layers, 
  Sparkles, 
  Shirt, 
  Sliders, 
  RefreshCw,
  Clock,
  Info,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<ProcessorSettings>(DEFAULT_SETTINGS);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('canvas');

  // Theme state: dark (malam) or light (siang)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('3mr_theme');
    if (saved) return saved === 'dark';
    return true; // default to dark mode for screen printing studio aesthetic
  });

  // Sync theme with html document element and meta theme-color
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      document.body.style.backgroundColor = '#0e0d0c';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#f8f8f7';
    }
    localStorage.setItem('3mr_theme', isDarkMode ? 'dark' : 'light');

    // Update meta theme-color if present
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#161413' : '#ffffff');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  // High-res export progress states
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [exportMessage, setExportMessage] = useState<string>('');

  // Generate mode configurations
  const [autoApply, setAutoApply] = useState<boolean>(true);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState<boolean>(false);

  // Offscreen canvases for performance optimization
  const originalPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalFullImageRef = useRef<HTMLImageElement | null>(null);

  // Hidden file input click trigger
  const triggerUpload = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  };

  // Handle uploaded image
  const handleImageUploaded = (dataUrl: string, width: number, height: number) => {
    setOriginalImage(dataUrl);
    setImageDimensions({ width, height });
    
    // Create an HTMLImageElement to use for canvas drawing
    const img = new Image();
    img.onload = () => {
      originalFullImageRef.current = img;
      
      // Create a downscaled preview canvas (max width/height 800px)
      // to keep live updates extremely fast and fluid!
      const maxPreviewSize = 800;
      let pWidth = width;
      let pHeight = height;
      
      if (width > maxPreviewSize || height > maxPreviewSize) {
        if (width > height) {
          pWidth = maxPreviewSize;
          pHeight = Math.round((height / width) * maxPreviewSize);
        } else {
          pHeight = maxPreviewSize;
          pWidth = Math.round((width / height) * maxPreviewSize);
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = pWidth;
      canvas.height = pHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, pWidth, pHeight);
        originalPreviewCanvasRef.current = canvas;
        
        // Trigger preview rendering
        renderPreview();
      }
    };
    img.src = dataUrl;
  };

  // Load a built-in vector demo graphic
  const handleLoadDemo = (id: string) => {
    setIsProcessing(true);
    // Create offscreen high-quality demo artwork
    const canvas = generateDemoCanvas(id, 1200, 1200);
    const dataUrl = canvas.toDataURL('image/png');
    handleImageUploaded(dataUrl, 1200, 1200);
  };

  // Clear loaded image and reset state
  const handleClearImage = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setImageDimensions(null);
    originalPreviewCanvasRef.current = null;
    originalFullImageRef.current = null;
  };

  // Main Preview Render loop
  const renderPreview = (customSettings?: ProcessorSettings) => {
    if (!originalPreviewCanvasRef.current) return;
    
    setIsProcessing(true);
    const activeSettings = customSettings || settings;
    
    // Render on small offscreen preview canvas for live performance
    setTimeout(() => {
      try {
        const outputCanvas = generateHalftone(
          originalPreviewCanvasRef.current!, 
          {
            ...activeSettings,
            // Adjust DPI and grid sizes for the smaller preview canvas
            // so LPI looks proportionally identical to the output print size!
            dpi: 150, 
            lpi: Math.round(activeSettings.lpi * (150 / activeSettings.dpi)) // scale LPI to preserve visual look on screen
          }
        );
        
        setProcessedImage(outputCanvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Failed to render preview', err);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  // Manual render trigger
  const handleGenerate = () => {
    renderPreview();
    setHasUnappliedChanges(false);
  };

  // Auto apply toggle handler
  const handleAutoApplyToggle = (val: boolean) => {
    setAutoApply(val);
    if (val && hasUnappliedChanges) {
      renderPreview();
      setHasUnappliedChanges(false);
    }
  };

  // Reset all settings to default values
  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasUnappliedChanges(false);
    if (originalImage) {
      renderPreview(DEFAULT_SETTINGS);
    }
  };

  // Debounced/Triggered preview updates when settings adjust
  useEffect(() => {
    if (!originalImage) return;

    if (autoApply) {
      renderPreview();
      setHasUnappliedChanges(false);
    } else {
      setHasUnappliedChanges(true);
    }
  }, [
    settings.knockoutTarget,
    settings.knockoutColor,
    settings.knockoutTolerance,
    settings.knockoutFuzziness,
    settings.halftoneMode,
    settings.halftoneShape,
    settings.lpi,
    settings.dotScale,
    settings.brightness,
    settings.contrast,
    settings.saturation,
    settings.invertHalftone,
    settings.angleC,
    settings.angleM,
    settings.angleY,
    settings.angleK,
    settings.angleMono,
  ]);

  // HIGH RESOLUTION PRINT FILE GENERATION & EXPORT
  const handleDownloadPNG = () => {
    if (!originalFullImageRef.current) return;
    
    // Start progress modal overlay
    setExportProgress(5);
    setExportMessage("Menghitung ukuran kertas cetak...");
    
    setTimeout(() => {
      try {
        const { widthPx, heightPx } = calculatePixelDimensions(
          settings.width,
          settings.height,
          settings.unit,
          settings.dpi
        );
        
        setExportMessage(`Membuka kanvas resolusi tinggi: ${widthPx} x ${heightPx} px...`);
        setExportProgress(15);
        
        // Create full scale master offscreen canvas
        const masterCanvas = document.createElement('canvas');
        masterCanvas.width = widthPx;
        masterCanvas.height = heightPx;
        const masterCtx = masterCanvas.getContext('2d');
        
        if (!masterCtx) {
          alert('Gagal menginisialisasi akselerasi grafis canvas.');
          setExportProgress(null);
          return;
        }
        
        // Fit original high-res design on the printable master sheet size
        setExportProgress(25);
        setExportMessage("Memposisikan ulang gambar desain di area cetak...");
        
        const img = originalFullImageRef.current!;
        const imgRatio = img.width / img.height;
        const canvasRatio = widthPx / heightPx;
        
        let drawWidth = widthPx;
        let drawHeight = heightPx;
        let offsetX = 0;
        let offsetY = 0;
        
        if (imgRatio > canvasRatio) {
          drawWidth = widthPx;
          drawHeight = widthPx / imgRatio;
          offsetY = (heightPx - drawHeight) / 2;
        } else {
          drawHeight = heightPx;
          drawWidth = heightPx * imgRatio;
          offsetX = (widthPx - drawWidth) / 2;
        }
        
        masterCtx.clearRect(0, 0, widthPx, heightPx);
        masterCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        setExportProgress(35);
        setExportMessage("Memulai konversi warna, knockout background & rendering halftone...");
        
        // Run full-resolution halftone engine
        setTimeout(() => {
          const finalCanvas = generateHalftone(
            masterCanvas,
            settings,
            (progress) => {
              // Map rendering progress from 35% to 85%
              const mappedProgress = Math.round(35 + (progress * 0.5));
              setExportProgress(mappedProgress);
              setExportMessage(`Mempersiapkan rincian halftone raster (${progress}%)...`);
            }
          );
          
          setExportProgress(90);
          setExportMessage("Mengonversi ke berkas PNG transparan resolusi tinggi...");
          
          setTimeout(() => {
            // Convert to download blob
            finalCanvas.toBlob((blob) => {
              if (blob) {
                setExportProgress(98);
                setExportMessage("Mengunduh file cetak...");
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                
                // Formulate beautiful name
                const dateStr = new Date().toISOString().slice(0, 10);
                const halftoneText = settings.halftoneMode !== 'none' ? `_halftone_${settings.halftoneShape}` : '_c-knockout';
                a.download = `dtf_print_${settings.width}x${settings.height}${settings.unit}_${settings.dpi}dpi${halftoneText}_${dateStr}.png`;
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } else {
                alert('Gagal menghasilkan file PNG.');
              }
              setExportProgress(null);
            }, 'image/png');
          }, 100);
          
        }, 100);
        
      } catch (err) {
        console.error('Failed to export image', err);
        alert('Gagal mengekspor gambar beresolusi tinggi.');
        setExportProgress(null);
      }
    }, 150);
  };

  // Get current local formatted time
  const currentLocalTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none antialiased bg-bg-app text-txt-primary transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="border-b border-border-main bg-bg-card/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 transition-colors duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Slogan */}
          <div className="flex items-center space-x-3">
            <Logo size={42} showBorderGlow className="hover:scale-105 transition-transform duration-200" />
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-txt-primary flex items-center gap-2">
                Three Mister Ruster
                <span className="text-[10px] font-normal px-1.5 py-0.5 bg-gold/10 text-gold rounded-full border border-gold/20">
                  v1.2 PRO
                </span>
              </h1>
              <p className="text-[11px] text-txt-secondary">
                Pemisah Warna & Efek Raster Siap Cetak Kaos (PNG Transparan • Kustom DPI)
              </p>
            </div>
          </div>

          {/* Action buttons (Download & Status & Theme Toggle) */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-bg-card-sub border border-border-main hover:border-gold/40 rounded-full text-xs shadow-sm transition-all duration-200 cursor-pointer"
              title={isDarkMode ? "Klik untuk ganti ke Mode Siang (Terang)" : "Klik untuk ganti ke Mode Malam (Gelap)"}
              id="theme-toggle-btn"
              aria-label="Toggle Mode Siang dan Malam"
            >
              <div className="flex items-center gap-1">
                <span className={`p-1 rounded-full transition-all duration-200 ${!isDarkMode ? 'bg-amber-500/20 text-amber-500 shadow-sm' : 'text-txt-muted'}`}>
                  <Sun size={13} className={!isDarkMode ? 'stroke-2' : 'stroke-1'} />
                </span>
                <span className={`p-1 rounded-full transition-all duration-200 ${isDarkMode ? 'bg-gold/20 text-gold shadow-sm' : 'text-txt-muted'}`}>
                  <Moon size={13} className={isDarkMode ? 'stroke-2' : 'stroke-1'} />
                </span>
              </div>
              <span className="font-semibold text-[11px] text-txt-primary pr-1 hidden sm:inline">
                {isDarkMode ? 'Mode Malam' : 'Mode Siang'}
              </span>
            </button>

            {originalImage && (
              <button
                onClick={handleDownloadPNG}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-maroon to-gold hover:from-maroon-hover hover:to-gold-hover text-white font-semibold rounded-lg text-xs shadow-lg shadow-maroon/30 transition-all transform active:scale-95 duration-200 w-full sm:w-auto cursor-pointer"
              >
                <Download size={14} />
                <span>Ekspor PNG Transparan</span>
              </button>
            )}
            
            <div className="hidden md:flex items-center space-x-1 text-txt-secondary text-xs px-2.5 py-1.5 bg-maroon/5 rounded-md border border-border-main font-mono">
              <Clock size={12} className="text-gold" />
              <span>{currentLocalTime} WIB</span>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN SPLIT CONTAINER ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* SIDEBAR PARAMETERS PANEL - Left (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col min-h-0 space-y-4">
          <div className="flex-1 min-h-[400px] lg:min-h-0">
            <SidebarControls
              settings={settings}
              onChange={setSettings}
              originalImage={originalImage}
              imageDimensions={imageDimensions}
              onUploadClick={triggerUpload}
              onClearImage={handleClearImage}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              autoApply={autoApply}
              onAutoApplyToggle={handleAutoApplyToggle}
              hasUnappliedChanges={hasUnappliedChanges}
              onGenerate={handleGenerate}
              isProcessing={isProcessing}
              onReset={handleReset}
            />
          </div>

          {/* Guidelines / Screen printing tip box */}
          <div className="bg-bg-card border border-border-main p-4 rounded-xl space-y-2.5 text-xs shadow-xl transition-colors duration-300">
            <h5 className="font-bold text-gold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Sparkles size={12} className="text-gold" />
              Tips Sablon Kaos (DTF / Plastisol)
            </h5>
            <ul className="space-y-1.5 text-txt-secondary list-disc list-inside text-[11px] leading-relaxed">
              <li>Untuk sablon kaos hitam, gunakan <strong className="text-txt-primary font-semibold">Knockout Hitam</strong> agar serat kaos menggantikan tinta hitam.</li>
              <li>Untuk desain gambar foto/gradasi, gunakan raster <strong className="text-txt-primary font-semibold">35-45 LPI</strong> agar dot terlihat retro dan estetik di kaos.</li>
              <li>Gunakan resolusi <strong className="text-gold font-semibold">300 DPI</strong> saat ekspor untuk hasil cetak yang sangat tajam tanpa blur.</li>
            </ul>
          </div>
        </div>

        {/* WORKSPACE PREVIEW AREA - Right (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <MainWorkspace
            originalImage={originalImage}
            processedImage={processedImage}
            settings={settings}
            imageDimensions={imageDimensions}
            onImageUploaded={handleImageUploaded}
            onLoadDemo={handleLoadDemo}
            isProcessing={isProcessing}
            autoApply={autoApply}
            hasUnappliedChanges={hasUnappliedChanges}
            onGenerate={handleGenerate}
          />
        </div>
      </main>

      {/* ================= FOOTER / COPYRIGHT ================= */}
      <footer className="mt-auto py-5 border-t border-border-main bg-bg-card/40 text-center transition-colors duration-300">
        <p className="text-xs text-txt-secondary font-medium tracking-wide">
          &copy; 2026 Three Mister. All rights reserved.
        </p>
      </footer>

      {/* ================= EXPORT PROGRESS OVERLAY MODAL ================= */}
      {exportProgress !== null && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border-main rounded-xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-center transition-colors duration-300">
            <div className="relative h-16 w-16 mx-auto flex items-center justify-center text-gold">
              <Logo size={44} showBorderGlow className="animate-pulse" />
              <div className="absolute -inset-1.5 rounded-2xl border-2 border-gold/20 border-t-gold animate-spin"></div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-txt-primary uppercase tracking-wider">Sedang Membuat Desain Siap Cetak</h3>
              <p className="text-xs text-txt-secondary">{exportMessage}</p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-bg-input rounded-full h-2 overflow-hidden border border-border-main">
                <div 
                  className="bg-gradient-to-r from-maroon to-gold h-full rounded-full transition-all duration-150"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-txt-secondary">
                <span>Ekspor PNG Transparan</span>
                <span>{exportProgress}%</span>
              </div>
            </div>

            <p className="text-[10px] text-txt-muted italic leading-relaxed">
              Mohon jangan menutup tab browser. Kami sedang memproses jutaan dot raster untuk memberikan hasil cetak kualitas profesional.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
