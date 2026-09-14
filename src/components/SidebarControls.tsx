import React from 'react';
import { ProcessorSettings, PRESET_SIZES, KnockoutTarget, HalftoneMode, HalftoneShape, DimensionUnit } from '../types';
import { calculatePixelDimensions } from '../utils/imageProcessor';
import { 
  Sliders, 
  Layers, 
  Trash2, 
  Sparkles, 
  SlidersHorizontal, 
  Eye, 
  Grid,
  Info,
  RefreshCw,
  Zap,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

interface SidebarControlsProps {
  settings: ProcessorSettings;
  onChange: (settings: ProcessorSettings) => void;
  originalImage: string | null;
  imageDimensions: { width: number; height: number } | null;
  onUploadClick: () => void;
  onClearImage: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Manual trigger / Generate settings
  autoApply: boolean;
  onAutoApplyToggle: (val: boolean) => void;
  hasUnappliedChanges: boolean;
  onGenerate: () => void;
  isProcessing: boolean;
  onReset: () => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  settings,
  onChange,
  originalImage,
  imageDimensions,
  onUploadClick,
  onClearImage,
  activeTab,
  setActiveTab,
  autoApply,
  onAutoApplyToggle,
  hasUnappliedChanges,
  onGenerate,
  isProcessing,
  onReset,
}) => {
  // Update fields helper
  const updateSettings = (fields: Partial<ProcessorSettings>) => {
    onChange({ ...settings, ...fields });
  };

  // Convert settings based on chosen presets
  const handlePresetChange = (presetId: string) => {
    const preset = PRESET_SIZES.find(p => p.id === presetId);
    if (!preset) return;
    
    if (preset.isCustom) {
      updateSettings({ presetId, isCustom: true } as any);
    } else {
      updateSettings({
        presetId,
        width: settings.unit === 'cm' ? preset.widthCm : parseFloat((preset.widthCm / 2.54).toFixed(1)),
        height: settings.unit === 'cm' ? preset.heightCm : parseFloat((preset.heightCm / 2.54).toFixed(1)),
      });
    }
  };

  // Calculate target pixel dimensions
  const { widthPx, heightPx } = calculatePixelDimensions(
    settings.width,
    settings.height,
    settings.unit,
    settings.dpi
  );

  // Check if upscaling will occur
  const isUpscaling = imageDimensions && (widthPx > imageDimensions.width || heightPx > imageDimensions.height);

  // Preset garment colors
  const garmentColors = [
    { name: 'Hitam', value: '#121212' },
    { name: 'Putih', value: '#f4f5f7' },
    { name: 'Charcoal', value: '#2d3135' },
    { name: 'Abu-abu', value: '#a0a5ab' },
    { name: 'Biru Navy', value: '#1e293b' },
    { name: 'Merah Maroon', value: '#991b1b' },
    { name: 'Hijau Botol', value: '#14532d' },
  ];

  return (
    <div className="flex flex-col h-full bg-bg-card border border-border-main rounded-xl overflow-hidden shadow-2xl transition-colors duration-300">
      {/* Tab Navigation */}
      <div className="flex border-b border-border-main bg-bg-card-sub p-1 transition-colors duration-300">
        {[
          { id: 'canvas', label: 'Kanvas', icon: Grid },
          { id: 'knockout', label: 'Knockout', icon: Layers },
          { id: 'halftone', label: 'Raster', icon: SlidersHorizontal },
          { id: 'mockup', label: 'Mockup', icon: Eye },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 text-[11px] sm:text-xs font-medium rounded-lg transition-all ${
                isActive 
                  ? 'bg-maroon text-gold font-bold border border-gold/20 shadow-lg shadow-maroon/20' 
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-maroon/10'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-txt-secondary'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* ================= CANVAS & RESOLUTION TAB ================= */}
        {activeTab === 'canvas' && (
          <div className="space-y-4">
            {/* Image Upload Status */}
            <div className="bg-bg-card-sub p-3.5 border border-border-main rounded-lg transition-colors duration-300">
              <h4 className="text-xs font-semibold text-txt-secondary uppercase tracking-wider mb-2.5">
                Status Gambar Input
              </h4>
              
              {originalImage ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Terunggah
                    </span>
                    <button 
                      onClick={onClearImage}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-rose-500/10 transition"
                    >
                      <Trash2 size={12} />
                      Hapus
                    </button>
                  </div>
                  
                  {imageDimensions && (
                    <div className="text-[11px] font-mono text-txt-secondary bg-bg-input p-2 rounded border border-border-main space-y-1 transition-colors duration-300">
                      <div>Dimensi: {imageDimensions.width} x {imageDimensions.height} px</div>
                      <div>Rasio: {(imageDimensions.width / imageDimensions.height).toFixed(2)}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-txt-secondary mb-2.5">Belum ada gambar yang dipilih</p>
                  <button
                    onClick={onUploadClick}
                    className="w-full text-xs bg-maroon hover:bg-maroon-hover text-white py-2 rounded border border-border-main transition duration-200 cursor-pointer"
                  >
                    Unggah dari Komputer
                  </button>
                </div>
              )}
            </div>

            {/* Print Dimensions Preset */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-txt-secondary">Ukuran Cetak (Sheet Size)</label>
              <select
                value={settings.presetId}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full text-xs bg-bg-input border border-border-main text-txt-primary rounded px-2.5 py-2 focus:outline-none focus:border-gold transition-colors duration-300"
              >
                {PRESET_SIZES.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Custom Dimension Inputs */}
            {settings.presetId === 'custom' && (
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-txt-secondary">Lebar ({settings.unit})</label>
                  <input
                    type="number"
                    value={settings.width}
                    onChange={(e) => updateSettings({ width: Math.max(1, parseFloat(e.target.value) || 0) })}
                    className="w-full text-xs bg-bg-input border border-border-main text-txt-primary rounded p-2 focus:outline-none focus:border-gold transition-colors duration-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-txt-secondary">Tinggi ({settings.unit})</label>
                  <input
                    type="number"
                    value={settings.height}
                    onChange={(e) => updateSettings({ height: Math.max(1, parseFloat(e.target.value) || 0) })}
                    className="w-full text-xs bg-bg-input border border-border-main text-txt-primary rounded p-2 focus:outline-none focus:border-gold transition-colors duration-300"
                  />
                </div>
              </div>
            )}

            {/* Unit & DPI Config */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-txt-secondary">Satuan Unit</label>
                <div className="flex rounded border border-border-main overflow-hidden text-xs transition-colors duration-300">
                  <button
                    onClick={() => {
                      if (settings.unit === 'inch') {
                        updateSettings({
                          unit: 'cm',
                          width: parseFloat((settings.width * 2.54).toFixed(1)),
                          height: parseFloat((settings.height * 2.54).toFixed(1)),
                        });
                      }
                    }}
                    className={`flex-1 py-1.5 text-center font-medium ${settings.unit === 'cm' ? 'bg-maroon text-gold border-r border-gold/20' : 'bg-bg-input text-txt-secondary hover:text-txt-primary'}`}
                  >
                    cm
                  </button>
                  <button
                    onClick={() => {
                      if (settings.unit === 'cm') {
                        updateSettings({
                          unit: 'inch',
                          width: parseFloat((settings.width / 2.54).toFixed(1)),
                          height: parseFloat((settings.height / 2.54).toFixed(1)),
                        });
                      }
                    }}
                    className={`flex-1 py-1.5 text-center font-medium ${settings.unit === 'inch' ? 'bg-maroon text-gold border-l border-gold/20' : 'bg-bg-input text-txt-secondary hover:text-txt-primary'}`}
                  >
                    inch
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-txt-secondary">Resolusi Cetak (DPI)</label>
                <select
                  value={settings.dpi}
                  onChange={(e) => updateSettings({ dpi: parseInt(e.target.value) })}
                  className="w-full text-xs bg-bg-input border border-border-main text-txt-primary rounded px-2.5 py-2.5 focus:outline-none focus:border-gold transition-colors duration-300"
                >
                  <option value={150}>150 DPI (Cepat)</option>
                  <option value={300}>300 DPI (Sangat Bagus)</option>
                  <option value={600}>600 DPI (Ultra Detail)</option>
                </select>
              </div>
            </div>

            {/* Calculated Pixel Info */}
            <div className="bg-gold/5 p-3 rounded-lg border border-border-main space-y-1.5 text-xs text-txt-secondary transition-colors duration-300">
              <div className="flex items-center gap-1.5 font-medium text-gold">
                <Info size={14} />
                <span>Dimensi Piksel Output:</span>
              </div>
              <div className="font-mono text-xs pl-5 text-gold-light">
                {widthPx} x {heightPx} px
              </div>
              
              {isUpscaling && (
                <p className="text-[10px] text-amber-500/95 pl-5 leading-normal mt-1">
                  💡 Resolusi cetak melebihi piksel asli gambar. Gambar akan mengalami sedikit interpolasi saat diekspor.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ================= COLOR KNOCKOUT TAB ================= */}
        {activeTab === 'knockout' && (
          <div className="space-y-4">
            <div className="bg-bg-card-sub p-3 border border-border-main rounded-lg text-[11px] text-txt-secondary leading-relaxed space-y-1 transition-colors duration-300">
              <span className="font-semibold text-txt-primary block">💡 Apa itu Color Knockout?</span>
              <p>Menghapus warna latar belakang desain (seperti hitam atau putih) agar langsung menyatu dengan warna serat kaos.</p>
              <p className="text-gold font-medium">Sangat disarankan untuk menghemat tinta dan membuat hasil cetak di kaos terasa lembut (tidak kaku seperti stiker).</p>
            </div>

            {/* Target Knockout Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-txt-secondary">Target Warna yang Dihapus</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', label: 'Tidak Ada (Utuh)' },
                  { id: 'black', label: 'Sembunyikan Hitam' },
                  { id: 'white', label: 'Sembunyikan Putih' },
                  { id: 'custom', label: 'Warna Kustom 🎨' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => updateSettings({ knockoutTarget: opt.id as KnockoutTarget })}
                    className={`py-2 px-1 text-center rounded border text-xs font-medium transition cursor-pointer ${
                      settings.knockoutTarget === opt.id
                        ? 'bg-maroon/20 border-gold/40 text-gold font-semibold'
                        : 'bg-bg-input border-border-main text-txt-secondary hover:bg-maroon/10 hover:text-txt-primary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            {settings.knockoutTarget === 'custom' && (
              <div className="p-3 bg-bg-card-sub rounded-lg border border-border-main space-y-3 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-txt-secondary">Pilih Warna Khusus</label>
                  <span className="text-xs font-mono text-txt-muted">{settings.knockoutColor}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.knockoutColor}
                    onChange={(e) => updateSettings({ knockoutColor: e.target.value })}
                    className="w-10 h-10 rounded border border-gold/15 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.knockoutColor}
                    onChange={(e) => updateSettings({ knockoutColor: e.target.value })}
                    placeholder="#ff0000"
                    className="flex-1 text-xs bg-bg-input border border-border-main text-txt-primary rounded p-2 focus:outline-none focus:border-gold font-mono transition-colors duration-300"
                  />
                </div>
              </div>
            )}

            {/* Tolerance Slider */}
            {settings.knockoutTarget !== 'none' && (
              <div className="space-y-2 bg-bg-card-sub p-3 rounded-lg border border-border-main transition-colors duration-300">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-txt-secondary">Toleransi Warna (Tolerance)</span>
                  <span className="text-gold font-mono font-bold">{settings.knockoutTolerance}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="80"
                  value={settings.knockoutTolerance}
                  onChange={(e) => updateSettings({ knockoutTolerance: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-bg-input rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <span className="text-[10px] text-txt-muted block leading-tight">
                  Makin tinggi toleransi, makin banyak gradasi warna serupa yang akan dihapus.
                </span>
              </div>
            )}

            {/* Fuzziness Slider */}
            {settings.knockoutTarget !== 'none' && (
              <div className="space-y-2 bg-bg-card-sub p-3 rounded-lg border border-border-main transition-colors duration-300">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-txt-secondary">Kelembutan Tepi (Fuzziness)</span>
                  <span className="text-gold font-mono font-bold">{settings.knockoutFuzziness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={settings.knockoutFuzziness}
                  onChange={(e) => updateSettings({ knockoutFuzziness: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-bg-input rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <span className="text-[10px] text-txt-muted block leading-tight">
                  Fuzziness menciptakan gradasi transparansi halus (feathering) agar gambar tidak bergerigi.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ================= HALFTONE TAB ================= */}
        {activeTab === 'halftone' && (
          <div className="space-y-4">
            {/* Mode Halftone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-secondary">Mode Raster Halftone</label>
              <select
                value={settings.halftoneMode}
                onChange={(e) => updateSettings({ halftoneMode: e.target.value as HalftoneMode })}
                className="w-full text-xs bg-bg-input border border-border-main text-txt-primary rounded px-2.5 py-2.5 focus:outline-none focus:border-gold transition-colors duration-300"
              >
                <option value="none">Murni (Tanpa Efek Halftone)</option>
                <option value="monochrome">Monokrom (1-Color Screen Print)</option>
                <option value="color-luminance">Warna Asli (Luminance Halftone)</option>
                <option value="cmyk">Separasi CMYK (Professional 4-Color Grid)</option>
              </select>
            </div>

            {settings.halftoneMode !== 'none' && (
              <>
                {/* Halftone Shape */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-txt-secondary">Bentuk Raster (Shape)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'dot', label: 'Bulat' },
                      { id: 'ellipse', label: 'Oval' },
                      { id: 'line', label: 'Garis' },
                      { id: 'square', label: 'Kotak' },
                    ].map(shape => (
                      <button
                        key={shape.id}
                        onClick={() => updateSettings({ halftoneShape: shape.id as HalftoneShape })}
                        className={`py-2 px-1 text-center rounded border text-[11px] font-medium transition cursor-pointer ${
                          settings.halftoneShape === shape.id
                            ? 'bg-maroon/20 border-gold/40 text-gold font-semibold'
                            : 'bg-bg-input border-border-main text-txt-secondary hover:bg-maroon/10 hover:text-txt-primary'
                        }`}
                      >
                        {shape.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency LPI */}
                <div className="space-y-2 bg-bg-card-sub p-3 rounded-lg border border-border-main transition-colors duration-300">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-txt-secondary">Kerapatan Grid (LPI)</span>
                    <span className="text-gold font-mono font-bold">{settings.lpi} LPI</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    value={settings.lpi}
                    onChange={(e) => updateSettings({ lpi: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-bg-input rounded-lg appearance-none cursor-pointer accent-gold"
                  />
                  <span className="text-[10px] text-txt-muted block leading-tight">
                    Lines Per Inch. Nilai rendah (20-30 LPI) menghasilkan dot berukuran besar (bergaya retro/kasar). Nilai tinggi (50-65 LPI) menghasilkan dot halus untuk detail tajam.
                  </span>
                </div>

                {/* Dot Scale Size */}
                <div className="space-y-2 bg-bg-card-sub p-3 rounded-lg border border-border-main transition-colors duration-300">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-txt-secondary">Skala Ukuran Dot</span>
                    <span className="text-gold font-mono font-bold">{settings.dotScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="1.4"
                    step="0.05"
                    value={settings.dotScale}
                    onChange={(e) => updateSettings({ dotScale: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-bg-input rounded-lg appearance-none cursor-pointer accent-gold"
                  />
                  <span className="text-[10px] text-txt-muted block leading-tight">
                    Mengontrol seberapa besar dot mengembang. Kurangi jika dot terlalu menyatu atau naikkan jika terlalu renggang.
                  </span>
                </div>

                {/* Contrast and Brightness Pre-Tuning */}
                <div className="p-3 bg-bg-card-sub rounded-lg border border-border-main space-y-3 transition-colors duration-300">
                  <h5 className="text-[11px] font-semibold text-txt-secondary uppercase tracking-wider mb-1">
                    Pre-Tuning Gambar (Sangat Membantu Detail Raster)
                  </h5>
                  
                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-txt-secondary">Kecerahan (Brightness)</span>
                      <span className="text-txt-muted font-mono">{settings.brightness > 0 ? '+' : ''}{settings.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={settings.brightness}
                      onChange={(e) => updateSettings({ brightness: parseInt(e.target.value) })}
                      className="w-full h-1 bg-bg-input rounded appearance-none cursor-pointer accent-gold"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-txt-secondary">Kontras (Contrast)</span>
                      <span className="text-txt-muted font-mono">{settings.contrast > 0 ? '+' : ''}{settings.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={settings.contrast}
                      onChange={(e) => updateSettings({ contrast: parseInt(e.target.value) })}
                      className="w-full h-1 bg-bg-input rounded appearance-none cursor-pointer accent-gold"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-txt-secondary flex items-center gap-1.5">
                        Kepekatan Warna (Saturation)
                        <span className="text-[9px] font-bold bg-maroon/20 text-gold px-1 rounded border border-gold/10">Baru</span>
                      </span>
                      <span className="text-txt-muted font-mono">{settings.saturation > 0 ? '+' : ''}{settings.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="100"
                      value={settings.saturation}
                      onChange={(e) => updateSettings({ saturation: parseInt(e.target.value) })}
                      className="w-full h-1 bg-bg-input rounded appearance-none cursor-pointer accent-gold"
                    />
                    <span className="text-[9px] text-txt-muted block leading-tight">
                      Meningkatkan saturasi warna agar hasil raster warna (CMYK / Luminance) tampak jauh lebih matang, tajam, dan menyala.
                    </span>
                  </div>
                </div>

                {/* Angles Control depending on Mode */}
                <div className="p-3 bg-bg-card-sub rounded-lg border border-border-main space-y-3 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-semibold text-txt-secondary uppercase tracking-wider">
                      Sudut Kemiringan Grid (Angles)
                    </h5>
                    <button 
                      onClick={() => updateSettings({ angleMono: 45, angleC: 15, angleM: 75, angleY: 0, angleK: 45 })}
                      className="text-[10px] text-gold hover:text-white flex items-center gap-0.5 cursor-pointer"
                      title="Reset Sudut Tradisional"
                    >
                      <RefreshCw size={10} />
                      Atur Ulang
                    </button>
                  </div>

                  {settings.halftoneMode === 'cmyk' ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-txt-secondary text-[10px]">C (Cyan): {settings.angleC}°</label>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={settings.angleC}
                          onChange={(e) => updateSettings({ angleC: parseInt(e.target.value) })}
                          className="w-full accent-cyan-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-txt-secondary text-[10px]">M (Magenta): {settings.angleM}°</label>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={settings.angleM}
                          onChange={(e) => updateSettings({ angleM: parseInt(e.target.value) })}
                          className="w-full accent-pink-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-txt-secondary text-[10px]">Y (Yellow): {settings.angleY}°</label>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={settings.angleY}
                          onChange={(e) => updateSettings({ angleY: parseInt(e.target.value) })}
                          className="w-full accent-yellow-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-txt-secondary text-[10px]">K (Key/Black): {settings.angleK}°</label>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={settings.angleK}
                          onChange={(e) => updateSettings({ angleK: parseInt(e.target.value) })}
                          className="w-full accent-slate-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-txt-secondary text-[10px]">Sudut Raster Grid</span>
                        <span className="text-txt-primary font-mono text-[10px]">{settings.angleMono}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={settings.angleMono}
                        onChange={(e) => updateSettings({ angleMono: parseInt(e.target.value) })}
                        className="w-full h-1 bg-bg-input rounded appearance-none cursor-pointer accent-gold"
                      />
                    </div>
                  )}
                  <span className="text-[9px] text-txt-muted block leading-tight">
                    💡 Perubahan sudut grid penting untuk mencegah pola &apos;Moiré&apos; (efek kotak-kokak berbayang yang merusak estetika sablon).
                  </span>
                </div>

                {/* Invert Halftone Toggle */}
                <div className="flex items-center justify-between bg-bg-card-sub p-2.5 rounded-lg border border-border-main transition-colors duration-300">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-txt-primary">Balik Ukuran Raster (Invert)</span>
                    <span className="text-[10px] text-txt-muted">Membuat dot lebih besar di area terang</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.invertHalftone}
                      onChange={(e) => updateSettings({ invertHalftone: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-maroon peer-checked:after:bg-white"></div>
                  </label>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= MOCKUP VIEW TAB ================= */}
        {activeTab === 'mockup' && (
          <div className="space-y-4">
            {/* Mockup Type Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-secondary">Tipe Visualisasi</label>
              <div className="flex rounded border border-border-main overflow-hidden text-xs transition-colors duration-300">
                <button
                  onClick={() => updateSettings({ mockupType: 'flat' })}
                  className={`flex-1 py-2 text-center font-medium cursor-pointer ${settings.mockupType === 'flat' ? 'bg-maroon text-gold border-r border-gold/20' : 'bg-bg-input text-txt-secondary hover:text-txt-primary'}`}
                >
                  Kanvas Flat
                </button>
                <button
                  onClick={() => updateSettings({ mockupType: 't-shirt' })}
                  className={`flex-1 py-2 text-center font-medium cursor-pointer ${settings.mockupType === 't-shirt' ? 'bg-maroon text-gold border-l border-gold/20' : 'bg-bg-input text-txt-secondary hover:text-txt-primary'}`}
                >
                  Kaos Mockup 👕
                </button>
              </div>
            </div>

            {settings.mockupType === 'flat' && (
              <div className="flex items-center justify-between bg-bg-card-sub p-3 rounded-lg border border-border-main transition-colors duration-300">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-txt-primary">Tampilkan Grid Catur</span>
                  <span className="text-[10px] text-txt-muted">Membantu memantau bagian transparan</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.mockupShowGrid}
                    onChange={(e) => updateSettings({ mockupShowGrid: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-maroon peer-checked:after:bg-white"></div>
                </label>
              </div>
            )}

            {/* Garment / Background Colors list */}
            <div className="space-y-3 bg-bg-card-sub p-3.5 rounded-lg border border-border-main transition-colors duration-300">
              <label className="text-xs font-semibold text-txt-secondary block">
                {settings.mockupType === 't-shirt' ? 'Warna Bahan Kaos' : 'Warna Latar Belakang'}
              </label>
              
              <div className="flex flex-wrap gap-2">
                {garmentColors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => updateSettings({ mockupBgColor: color.value })}
                    style={{ backgroundColor: color.value }}
                    className={`w-7 h-7 rounded-full border-2 transition relative cursor-pointer ${
                      settings.mockupBgColor.toLowerCase() === color.value.toLowerCase()
                        ? 'border-gold scale-110 shadow-lg shadow-gold/25'
                        : 'border-gold/10 hover:border-gold/30'
                    }`}
                    title={color.name}
                  >
                    {settings.mockupBgColor.toLowerCase() === color.value.toLowerCase() && (
                      <span className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-gold"></span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Color Background Background Picker */}
              <div className="space-y-1.5 pt-2 border-t border-border-main">
                <div className="flex items-center justify-between text-[11px] text-txt-muted">
                  <span>Pilih Warna Lain:</span>
                  <span className="font-mono font-semibold">{settings.mockupBgColor}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.mockupBgColor}
                    onChange={(e) => updateSettings({ mockupBgColor: e.target.value })}
                    className="w-6 h-6 rounded bg-transparent border border-gold/15 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.mockupBgColor}
                    onChange={(e) => updateSettings({ mockupBgColor: e.target.value })}
                    className="flex-1 text-[11px] font-mono bg-bg-input border border-border-main text-txt-primary rounded px-2 py-1 focus:outline-none transition-colors duration-300"
                    placeholder="#1e293b"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Control Panel: Generate Mode & Generate Button */}
      <div className="border-t border-border-main bg-bg-card/95 p-4 space-y-3 shadow-2xl backdrop-blur-sm flex-shrink-0 transition-colors duration-300">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-txt-primary">Pratinjau Otomatis</span>
            <span className="text-[10px] text-txt-muted">Update langsung ketika diseret</span>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoApply}
              onChange={(e) => onAutoApplyToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-maroon peer-checked:after:bg-white"></div>
          </label>
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-2">
          {/* Reset Button */}
          <button
            onClick={onReset}
            className="px-3.5 py-2.5 rounded-xl border border-border-main bg-bg-input hover:bg-maroon/20 text-txt-secondary hover:text-gold transition-all duration-200 text-xs flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
            title="Reset semua pengaturan ke bawaan (Default)"
            id="btn-reset-pengaturan"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          {/* Generate Button */}
          <button
            onClick={onGenerate}
            disabled={!originalImage || isProcessing || (autoApply && !hasUnappliedChanges)}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${
              !originalImage
                ? 'bg-bg-input border border-border-main text-txt-muted/50 cursor-not-allowed'
                : isProcessing
                ? 'bg-bg-input border border-maroon text-gold cursor-wait'
                : !autoApply && hasUnappliedChanges
                ? 'bg-gradient-to-r from-maroon to-gold text-white shadow-lg shadow-maroon/35 hover:from-maroon-hover hover:to-gold-hover hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                : 'bg-maroon hover:bg-maroon-hover text-white border border-gold/15 hover:scale-[1.01] cursor-pointer'
            }`}
            id="btn-proses-raster"
          >
            {isProcessing ? (
              <>
                <RefreshCw size={14} className="animate-spin text-gold" />
                <span className="truncate">MEMPROSES RASTER...</span>
              </>
            ) : !autoApply && hasUnappliedChanges ? (
              <>
                <Zap size={14} className="text-amber-300 fill-amber-300 animate-bounce" />
                <span className="truncate">GENERATE RASTER ⚡</span>
              </>
            ) : autoApply ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="truncate">LIVE UPDATE</span>
              </>
            ) : (
              <>
                <Zap size={14} className="text-slate-400" />
                <span className="truncate">PROSES RASTER</span>
              </>
            )}
          </button>
        </div>

        {!originalImage && (
          <p className="text-[10px] text-txt-muted text-center">
            💡 Unggah gambar terlebih dahulu untuk memproses raster
          </p>
        )}
        
        {originalImage && !autoApply && hasUnappliedChanges && (
          <p className="text-[10px] text-amber-400/90 text-center animate-pulse">
            ⚠️ Pengaturan berubah! Klik tombol di atas untuk proses raster baru.
          </p>
        )}
      </div>
    </div>
  );
};
