import { ProcessorSettings, HalftoneShape } from '../types';

// Helper to convert CM to Inches
export const cmToInches = (cm: number): number => cm / 2.54;
export const inchesToCm = (inches: number): number => inches * 2.54;

// Calculate pixel dimensions based on CM/Inch and DPI
export function calculatePixelDimensions(
  width: number,
  height: number,
  unit: 'cm' | 'inch',
  dpi: number
): { widthPx: number; heightPx: number } {
  const widthInches = unit === 'cm' ? cmToInches(width) : width;
  const heightInches = unit === 'cm' ? cmToInches(height) : height;
  return {
    widthPx: Math.round(widthInches * dpi),
    heightPx: Math.round(heightInches * dpi),
  };
}

// Convert Hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return {
    r: isNaN(r) ? 0 : r,
    g: isNaN(g) ? 0 : g,
    b: isNaN(b) ? 0 : b,
  };
}

// Convert RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const componentToHex = (c: number) => {
    const hex = clamp(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Process Color Knockout on ImageData
export function applyColorKnockout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: ProcessorSettings
): ImageData {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const target = settings.knockoutTarget;
  
  if (target === 'none') {
    return imgData;
  }
  
  let kr = 0;
  let kg = 0;
  let kb = 0;
  
  if (target === 'black') {
    kr = 0; kg = 0; kb = 0;
  } else if (target === 'white') {
    kr = 255; kg = 255; kb = 255;
  } else if (target === 'custom') {
    const rgb = hexToRgb(settings.knockoutColor);
    kr = rgb.r;
    kg = rgb.g;
    kb = rgb.b;
  }
  
  const tolerance = settings.knockoutTolerance / 100; // 0..1
  const fuzziness = Math.max(0.01, settings.knockoutFuzziness / 100); // 0.01..1
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a === 0) continue;
    
    // Calculate color distance (Euclidean normalized in 0..1)
    const dist = Math.sqrt(
      Math.pow(r - kr, 2) + 
      Math.pow(g - kg, 2) + 
      Math.pow(b - kb, 2)
    ) / Math.sqrt(255 * 255 * 3);
    
    if (dist < tolerance) {
      // Complete knockout (fully transparent)
      data[i + 3] = 0;
    } else if (dist < tolerance + fuzziness) {
      // Smooth gradient/feathering of transparency
      const factor = (dist - tolerance) / fuzziness;
      data[i + 3] = Math.round(a * factor);
    }
  }
  
  return imgData;
}

// Adjust Brightness & Contrast of ImageData
export function applyBrightnessContrast(
  imgData: ImageData,
  brightnessOffset: number, // -100 to 100
  contrastOffset: number // -100 to 100
): ImageData {
  if (brightnessOffset === 0 && contrastOffset === 0) {
    return imgData;
  }
  
  const data = imgData.data;
  const bFactor = brightnessOffset * 2.55; // convert to -255..255 scale
  const cFactor = (contrastOffset + 100) / 100; // convert to 0..2 scale multiplier
  const cFactorSq = cFactor * cFactor;
  
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let val = data[i + c];
      
      // Brightness
      if (brightnessOffset !== 0) {
        val += bFactor;
      }
      
      // Contrast
      if (contrastOffset !== 0) {
        val = (val - 128) * cFactorSq + 128;
      }
      
      data[i + c] = Math.max(0, Math.min(255, val));
    }
  }
  
  return imgData;
}

// Adjust Saturation (Color Sharpness / Vibrancy) of ImageData
export function applySaturation(
  imgData: ImageData,
  saturationOffset: number // -100 to 100
): ImageData {
  if (saturationOffset === 0) {
    return imgData;
  }
  
  const data = imgData.data;
  const factor = 1 + saturationOffset / 100;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a === 0) continue;
    
    // Grayscale luminance
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Boost/reduce the color differences from gray
    data[i] = Math.max(0, Math.min(255, Math.round(l + (r - l) * factor)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(l + (g - l) * factor)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(l + (b - l) * factor)));
  }
  
  return imgData;
}

// Convert RGB pixel to Grayscale luminance
export function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Convert RGB to CMYK
export function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 1 };
  }
  
  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);
  
  return { c, m, y, k };
}

// Helper to draw a single halftone shape on Canvas 2D
export function drawHalftoneShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: HalftoneShape,
  angleRad: number
) {
  if (size <= 0.1) return;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);
  
  ctx.beginPath();
  switch (shape) {
    case 'dot':
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'ellipse':
      ctx.ellipse(0, 0, size / 2, size / 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'line':
      // Line orientation along the angle
      ctx.rect(-size / 2, -size / 4, size, size / 2);
      ctx.fill();
      break;
      
    case 'square':
      ctx.rect(-size / 2, -size / 2, size, size);
      ctx.fill();
      break;
  }
  ctx.restore();
}

/**
 * Generate Halftone Effect
 * Returns a new Canvas with the applied halftone effect
 */
export function generateHalftone(
  sourceCanvas: HTMLCanvasElement,
  settings: ProcessorSettings,
  onProgress?: (progress: number) => void
): HTMLCanvasElement {
  const { width, height } = sourceCanvas;
  
  // Create output canvas
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outCtx = outputCanvas.getContext('2d');
  if (!outCtx) return sourceCanvas;
  
  // Create temporary processing canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return sourceCanvas;
  
  // Draw the original image onto temporary canvas
  tempCtx.drawImage(sourceCanvas, 0, 0);
  
  // 1. Apply Color Knockout
  let imgData = applyColorKnockout(tempCtx, width, height, settings);
  
  // 2. Apply Brightness and Contrast
  imgData = applyBrightnessContrast(imgData, settings.brightness, settings.contrast);
  
  // 3. Apply Color Saturation (Vibrancy / Sharpness)
  imgData = applySaturation(imgData, settings.saturation);
  
  // Put modified pixels back to temp canvas
  tempCtx.putImageData(imgData, 0, 0);
  
  // If halftone mode is 'none', just return the color knocked-out image!
  if (settings.halftoneMode === 'none') {
    outCtx.drawImage(tempCanvas, 0, 0);
    if (onProgress) onProgress(100);
    return outputCanvas;
  }
  
  // Grid spacing based on LPI and DPI
  // Calculate LPI size: dots per inch.
  // We want to translate this to pixel distance.
  // gridSize = DPI / LPI
  const dpi = settings.dpi;
  const lpi = settings.lpi;
  const gridSize = Math.max(2.5, dpi / lpi);
  
  // Clear output canvas
  outCtx.clearRect(0, 0, width, height);
  
  // Fast pixel data lookup
  const sourceData = tempCtx.getImageData(0, 0, width, height);
  const data = sourceData.data;
  
  const getPixelAt = (px: number, py: number) => {
    const x = Math.max(0, Math.min(width - 1, Math.round(px)));
    const y = Math.max(0, Math.min(height - 1, Math.round(py)));
    const idx = (y * width + x) * 4;
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
      a: data[idx + 3],
    };
  };
  
  // Helper to calculate rotated bounding box for grid traversal
  const getRotatedBounds = (angleRad: number) => {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    const corners = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: 0, y: height },
      { x: width, y: height },
    ];
    
    let minRotX = Infinity;
    let maxRotX = -Infinity;
    let minRotY = Infinity;
    let maxRotY = -Infinity;
    
    corners.forEach(p => {
      const rx = p.x * cos - p.y * sin;
      const ry = p.x * sin + p.y * cos;
      minRotX = Math.min(minRotX, rx);
      maxRotX = Math.max(maxRotX, rx);
      minRotY = Math.min(minRotY, ry);
      maxRotY = Math.max(maxRotY, ry);
    });
    
    return { minRotX, maxRotX, minRotY, maxRotY };
  };
  
  const halftoneMode = settings.halftoneMode;
  
  if (halftoneMode === 'monochrome' || halftoneMode === 'color-luminance') {
    const angleRad = (settings.angleMono * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    const { minRotX, maxRotX, minRotY, maxRotY } = getRotatedBounds(angleRad);
    
    // Set draw color based on monochrome or color mode
    outCtx.fillStyle = '#000000'; // Default black for mono
    
    // Estimate total operations for progress bar
    const totalStepsX = Math.ceil((maxRotX - minRotX) / gridSize);
    const totalStepsY = Math.ceil((maxRotY - minRotY) / gridSize);
    const totalSteps = totalStepsX * totalStepsY;
    let currentStep = 0;
    
    for (let rx = Math.floor(minRotX / gridSize) * gridSize; rx <= maxRotX; rx += gridSize) {
      for (let ry = Math.floor(minRotY / gridSize) * gridSize; ry <= maxRotY; ry += gridSize) {
        currentStep++;
        
        // Unrotate back to canvas space to find source center
        const ux = rx * cos + ry * sin;
        const uy = -rx * sin + ry * cos;
        
        if (ux >= 0 && ux < width && uy >= 0 && uy < height) {
          // Sample pixel
          const pixel = getPixelAt(ux, uy);
          if (pixel.a === 0) continue;
          
          // Calculate intensity
          let intensity = getLuminance(pixel.r, pixel.g, pixel.b) / 255; // 0 (black) to 1 (white)
          
          if (settings.invertHalftone) {
            intensity = 1 - intensity;
          }
          
          // For screen printing, we usually map black ink to dark areas:
          // So darker pixel -> larger dot (meaning dot scale is proportional to 1 - intensity)
          // Unless invert is active.
          let dotFactor = settings.invertHalftone ? intensity : (1 - intensity);
          
          if (halftoneMode === 'color-luminance') {
            // For color-luminance, we want to preserve the original colors and design quality exactly.
            // Using a uniform dot size based on the pixel's opacity keeps the colors 100% vibrant,
            // sharp, and identical to the original design, while rendering it in a beautiful halftone grid!
            dotFactor = 1.0;
          }
          
          // Max size is cell spacing (gridSize) multiplied by scale and original alpha factor
          const maxDotSize = gridSize * settings.dotScale;
          const dotSize = maxDotSize * dotFactor * (pixel.a / 255);
          
          if (dotSize > 0.2) {
            if (halftoneMode === 'color-luminance') {
              // Draw dot using the original pixel color at full solid opacity!
              // In physical screen printing, the ink is 100% opaque; the illusion of shade is created 
              // entirely by the dot size. Making dots semi-transparent washes out colors.
              outCtx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
            } else {
              // Draw black or solid color at full solid opacity for maximum sharpness
              outCtx.fillStyle = `rgb(0, 0, 0)`;
            }
            
            drawHalftoneShape(outCtx, ux, uy, dotSize, settings.halftoneShape, angleRad);
          }
        }
      }
      
      if (onProgress && currentStep % 500 === 0) {
        onProgress(Math.round((currentStep / totalSteps) * 100));
      }
    }
  } else if (halftoneMode === 'cmyk') {
    // Create a temporary CMYK canvas with a white background to perform subtractive ink blending (multiply)
    const cmykCanvas = document.createElement('canvas');
    cmykCanvas.width = width;
    cmykCanvas.height = height;
    const cmykCtx = cmykCanvas.getContext('2d');
    if (!cmykCtx) return sourceCanvas;
    
    // Fill with solid white
    cmykCtx.fillStyle = '#ffffff';
    cmykCtx.fillRect(0, 0, width, height);
    
    // CMYK separating and halftoning!
    // We render each channel in its own loop and overlay them
    const channels = [
      { name: 'Y', angle: settings.angleY, color: 'rgb(255, 235, 0)' }, // Yellow (solid ink)
      { name: 'M', angle: settings.angleM, color: 'rgb(236, 0, 140)' }, // Magenta (solid ink)
      { name: 'C', angle: settings.angleC, color: 'rgb(0, 174, 239)' }, // Cyan (solid ink)
      { name: 'K', angle: settings.angleK, color: 'rgb(0, 0, 0)' },       // Black (solid ink)
    ];
    
    channels.forEach((ch, chIdx) => {
      const angleRad = (ch.angle * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      
      const { minRotX, maxRotX, minRotY, maxRotY } = getRotatedBounds(angleRad);
      
      // Use 'multiply' blend mode so CMYK inks combine subtractively on the white background,
      // creating beautiful, vibrant, and correct secondary colors (R, G, B) and deep blacks!
      cmykCtx.globalCompositeOperation = 'multiply';
      cmykCtx.fillStyle = ch.color;
      
      for (let rx = Math.floor(minRotX / gridSize) * gridSize; rx <= maxRotX; rx += gridSize) {
        for (let ry = Math.floor(minRotY / gridSize) * gridSize; ry <= maxRotY; ry += gridSize) {
          const ux = rx * cos + ry * sin;
          const uy = -rx * sin + ry * cos;
          
          if (ux >= 0 && ux < width && uy >= 0 && uy < height) {
            const pixel = getPixelAt(ux, uy);
            if (pixel.a === 0) continue;
            
            // Convert to CMYK
            const cmyk = rgbToCmyk(pixel.r, pixel.g, pixel.b);
            let channelVal = 0;
            if (ch.name === 'C') channelVal = cmyk.c;
            else if (ch.name === 'M') channelVal = cmyk.m;
            else if (ch.name === 'Y') channelVal = cmyk.y;
            else if (ch.name === 'K') channelVal = cmyk.k;
            
            if (settings.invertHalftone) {
              channelVal = 1 - channelVal;
            }
            
            const maxDotSize = gridSize * settings.dotScale;
            const dotSize = maxDotSize * channelVal * (pixel.a / 255);
            
            if (dotSize > 0.2) {
              drawHalftoneShape(cmykCtx, ux, uy, dotSize, settings.halftoneShape, angleRad);
            }
          }
        }
      }
      
      if (onProgress) {
        onProgress(Math.round(((chIdx + 1) / channels.length) * 100));
      }
    });
    
    // Now, transfer the blended CMYK print back to our final transparent outCtx.
    // We use a mathematically precise 'Unmultiply' formula to turn the white background transparent
    // while keeping the cyan, magenta, yellow, and black inks 100% sharp and true to their original color.
    const cmykImgData = cmykCtx.getImageData(0, 0, width, height);
    const cmykData = cmykImgData.data;
    
    for (let i = 0; i < cmykData.length; i += 4) {
      const r = cmykData[i];
      const g = cmykData[i + 1];
      const b = cmykData[i + 2];
      
      // Calculate alpha based on how far the pixel is from pure white (255, 255, 255)
      const alphaNorm = 1 - Math.min(r, g, b) / 255;
      
      if (alphaNorm <= 0) {
        cmykData[i] = 0;
        cmykData[i + 1] = 0;
        cmykData[i + 2] = 0;
        cmykData[i + 3] = 0; // Fully transparent
      } else {
        // Reverse multiply blend to extract the exact ink color at this alpha
        cmykData[i] = Math.max(0, Math.min(255, Math.round(255 + (r - 255) / alphaNorm)));
        cmykData[i + 1] = Math.max(0, Math.min(255, Math.round(255 + (g - 255) / alphaNorm)));
        cmykData[i + 2] = Math.max(0, Math.min(255, Math.round(255 + (b - 255) / alphaNorm)));
        cmykData[i + 3] = Math.round(alphaNorm * 255);
      }
    }
    
    outCtx.putImageData(cmykImgData, 0, 0);
  }
  
  if (onProgress) onProgress(100);
  return outputCanvas;
}
