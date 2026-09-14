// Dynamic vector demo generators so users don't need to find a high-res image to start.
export interface DemoItem {
  id: string;
  name: string;
  description: string;
}

export const DEMO_ITEMS: DemoItem[] = [
  { id: 'logo_3mr', name: 'Logo Submark 3MR (Official)', description: 'Badge emblem resmi 3MR dengan palet maroon & emas, sempurna untuk raster dan cetak kaos.' },
  { id: 'synthwave', name: 'Matahari Terbenam Neon Synthwave', description: 'Warna-warni cerah pink & oranye, cocok untuk uji CMYK dan knockout warna hitam.' },
  { id: 'vintage_biker', name: 'Emblem Biker Vintage Klasik', description: 'Grafik hitam & emas bertekstur, bagus untuk menguji knockout latar belakang.' },
  { id: 'portrait_contrast', name: 'Siluet Wajah Kontras Tinggi', description: 'Monokrom berskala abu-abu, ideal untuk melihat transisi halftone bulat klasik.' },
];

export function generateDemoCanvas(id: string, width = 1200, height = 1200): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  // Clear with solid background depending on design, but make the graphic transparent
  ctx.clearRect(0, 0, width, height);

  if (id === 'logo_3mr') {
    // 3MR Submark Logo
    const centerX = width / 2;
    const centerY = height / 2;
    
    const badgeW = width * 0.52;
    const badgeH = height * 0.72;
    const badgeX = centerX - badgeW / 2;
    const badgeY = centerY - badgeH / 2;
    const radius = badgeW * 0.13;
    const strokeW = Math.max(6, width * 0.014);

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, radius);
    } else {
      ctx.rect(badgeX, badgeY, badgeW, badgeH);
    }
    ctx.fillStyle = '#560007';
    ctx.fill();
    ctx.strokeStyle = '#D29F54';
    ctx.lineWidth = strokeW;
    ctx.stroke();

    // Three vertical gold bars
    const barW = badgeW * 0.145;
    const barH = badgeH * 0.72;
    const gap = badgeW * 0.075;
    const totalBarsW = barW * 3 + gap * 2;
    const startX = centerX - totalBarsW / 2;
    const startY = centerY - barH / 2;

    ctx.fillStyle = '#D29F54';
    ctx.fillRect(startX, startY, barW, barH);
    ctx.fillRect(startX + barW + gap, startY, barW, barH);
    ctx.fillRect(startX + (barW + gap) * 2, startY, barW, barH);
    ctx.restore();
    return canvas;
  }
  
  if (id === 'synthwave') {
    // 1. Draw Synthwave Sunset
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw Sun with linear gradient
    const sunRadius = Math.min(width, height) * 0.28;
    const sunY = centerY - 50;
    const grad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    grad.addColorStop(0, '#f43f5e'); // rose-500
    grad.addColorStop(0.5, '#f97316'); // orange-500
    grad.addColorStop(1, '#eab308'); // yellow-500
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw horizontal blackout slices (synthwave sun pattern)
    ctx.fillStyle = '#000000'; // Draw black slices that can be knocked out later!
    const numSlices = 8;
    for (let i = 0; i < numSlices; i++) {
      const sliceHeight = 8 + i * 4;
      const sliceY = sunY + 20 + i * 25;
      if (sliceY < sunY + sunRadius) {
        ctx.fillRect(centerX - sunRadius - 10, sliceY, sunRadius * 2 + 20, sliceHeight);
      }
    }
    
    // Draw neon grid floor
    const gridTop = centerY + 100;
    const gridBottom = height - 150;
    
    // Grid perspective lines
    ctx.strokeStyle = '#06b6d4'; // cyan-500
    ctx.lineWidth = 4;
    const numLines = 14;
    for (let i = 0; i <= numLines; i++) {
      const xTop = centerX - 150 + (i / numLines) * 300;
      const xBottom = centerX - 600 + (i / numLines) * 1200;
      ctx.beginPath();
      ctx.moveTo(xTop, gridTop);
      ctx.lineTo(xBottom, gridBottom);
      ctx.stroke();
    }
    
    // Horizontal lines getting closer
    for (let i = 0; i < 8; i++) {
      const ratio = Math.pow(i / 7, 2); // perspective crowding
      const y = gridTop + ratio * (gridBottom - gridTop);
      ctx.beginPath();
      ctx.moveTo(centerX - 600, y);
      ctx.lineTo(centerX + 600, y);
      ctx.stroke();
    }
    
    // Draw mountain silhouettes in background (purple)
    ctx.fillStyle = '#1e1b4b'; // deep purple-950
    ctx.beginPath();
    ctx.moveTo(centerX - 400, gridTop);
    ctx.lineTo(centerX - 200, gridTop - 120);
    ctx.lineTo(centerX - 50, gridTop);
    ctx.lineTo(centerX + 150, gridTop - 180);
    ctx.lineTo(centerX + 350, gridTop - 80);
    ctx.lineTo(centerX + 500, gridTop);
    ctx.fill();
    
    // Palm trees
    ctx.fillStyle = '#000000';
    // Left Palm
    drawPalmSilhouette(ctx, centerX - 250, gridTop + 20, 180);
    // Right Palm
    drawPalmSilhouette(ctx, centerX + 280, gridTop + 20, 220);
    
    // Retro font overlay
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#d946ef'; // fuchsia-500 glow
    ctx.shadowBlur = 15;
    ctx.font = 'bold 84px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SYNTHWAVE', centerX, gridBottom + 90);
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold italic 28px monospace';
    ctx.fillText('OUTRUN DIVISION', centerX, gridBottom + 130);
    
  } else if (id === 'vintage_biker') {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Outer circle ring
    ctx.strokeStyle = '#d97706'; // amber-600
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 380, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 360, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw custom shield/badge in middle
    ctx.fillStyle = '#1e293b'; // dark background for badge
    ctx.beginPath();
    ctx.moveTo(centerX - 250, centerY - 150);
    ctx.lineTo(centerX + 250, centerY - 150);
    ctx.lineTo(centerX + 220, centerY + 180);
    ctx.lineTo(centerX, centerY + 280);
    ctx.lineTo(centerX - 220, centerY + 180);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw biker graphics: wings and piston/skull
    // Wings left
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY - 20);
    ctx.bezierCurveTo(centerX - 150, centerY - 100, centerX - 220, centerY - 80, centerX - 300, centerY);
    ctx.bezierCurveTo(centerX - 240, centerY + 50, centerX - 150, centerY + 40, centerX - 40, centerY + 10);
    ctx.fill();
    
    // Wings right
    ctx.beginPath();
    ctx.moveTo(centerX + 40, centerY - 20);
    ctx.bezierCurveTo(centerX + 150, centerY - 100, centerX + 220, centerY - 80, centerX + 300, centerY);
    ctx.bezierCurveTo(centerX + 240, centerY + 50, centerX + 150, centerY + 40, centerX + 40, centerY + 10);
    ctx.fill();
    
    // Center golden piston
    ctx.fillStyle = '#fbbf24'; // amber-400
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    
    // Draw Piston Head
    ctx.fillRect(centerX - 50, centerY - 90, 100, 70);
    ctx.strokeRect(centerX - 50, centerY - 90, 100, 70);
    // Grooves
    ctx.fillRect(centerX - 45, centerY - 80, 90, 6);
    ctx.fillRect(centerX - 45, centerY - 65, 90, 6);
    // Shaft
    ctx.fillRect(centerX - 18, centerY - 20, 36, 120);
    ctx.strokeRect(centerX - 18, centerY - 20, 36, 120);
    // Bottom Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY + 100, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Ribbons and Text
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(centerX - 320, centerY - 190);
    ctx.lineTo(centerX + 320, centerY - 190);
    ctx.lineTo(centerX + 280, centerY - 260);
    ctx.lineTo(centerX - 280, centerY - 260);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#000000';
    ctx.font = 'black 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('CUSTOM MOTORCYCLE', centerX, centerY - 212);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'black 52px serif';
    ctx.fillText('GARAGE 99', centerX, centerY + 30);
    
    ctx.fillStyle = '#ef4444'; // red stars
    const drawStar = (x: number, y: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * r + x, -Math.sin((18 + i * 72) * Math.PI / 180) * r + y);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (r * 0.4) + x, -Math.sin((54 + i * 72) * Math.PI / 180) * (r * 0.4) + y);
      }
      ctx.closePath();
      ctx.fill();
    };
    drawStar(centerX - 120, centerY + 220, 16);
    drawStar(centerX, centerY + 220, 16);
    drawStar(centerX + 120, centerY + 220, 16);
    
  } else {
    // 3. Portrait Grayscale Contrast
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw abstract portrait silhoutte with smooth shadows to showcase halftone transitions
    const bgGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 500);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(0.4, '#b5b5b5');
    bgGrad.addColorStop(0.8, '#4f4f4f');
    bgGrad.addColorStop(1, '#000000');
    
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    
    // Dynamic overlay for stylized human face using shadows and lighting
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY - 50, 220, 0, Math.PI * 2);
    ctx.clip();
    
    // Deep lighting shadows
    const shadowGrad = ctx.createLinearGradient(centerX - 150, centerY - 250, centerX + 150, centerY + 150);
    shadowGrad.addColorStop(0, '#ffffff');
    shadowGrad.addColorStop(0.3, '#888888');
    shadowGrad.addColorStop(0.6, '#222222');
    shadowGrad.addColorStop(1, '#000000');
    
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(centerX - 250, centerY - 300, 500, 500);
    ctx.restore();
    
    // Elegant lines framing the face
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 50, 230, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY - 50, 230, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px serif';
    ctx.textAlign = 'center';
    ctx.fillText('PORTRAIT', centerX, centerY + 310);
    
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '24px monospace';
    ctx.fillText('PERFECT HALFTONE DOT TRANSITIONS', centerX, centerY + 360);
  }
  
  return canvas;
}

// Draw a stylized palm tree branch vector
function drawPalmSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, height: number) {
  ctx.save();
  ctx.translate(x, y);
  
  // Trunk
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.quadraticCurveTo(-15, -height/2, -5, -height);
  ctx.lineTo(5, -height);
  ctx.quadraticCurveTo(-5, -height/2, 10, 0);
  ctx.closePath();
  ctx.fill();
  
  // Fronds
  ctx.translate(-5, -height);
  const numFronds = 6;
  for (let i = 0; i < numFronds; i++) {
    const angle = (-30 - i * 30) * Math.PI / 180;
    ctx.save();
    ctx.rotate(angle);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(50, -20, 100, 0);
    ctx.quadraticCurveTo(50, 10, 0, 0);
    ctx.closePath();
    ctx.fill();
    
    // Frond leaves/needles
    ctx.beginPath();
    for (let j = 10; j < 95; j += 6) {
      const leafHeight = Math.sin((j / 100) * Math.PI) * 20;
      ctx.moveTo(j, 0);
      ctx.lineTo(j - 5, leafHeight);
    }
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }
  
  ctx.restore();
}
