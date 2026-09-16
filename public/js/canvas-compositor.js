/**
 * DEARLY - Canvas Greeting Card Compositor
 * High-DPI professional typography and photo compositor.
 * Supports Classic, Warm, and Elegant designs, multi-aspect ratios, and 5 artistic filters.
 */

class DearlyCompositor {
  constructor() {
    this.imageCache = new Map();
  }

  async loadImage(src) {
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (src.startsWith('http://') || src.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        // Return fallback blank image if error
        console.warn('Could not load image, using fallback:', src);
        const fallback = new Image();
        fallback.src = '/assets/samples/grandchild.jpg';
        fallback.onload = () => resolve(fallback);
        fallback.onerror = () => {
          // Absolute last resort - resolve with a 1x1 blank canvas
          const blank = document.createElement('canvas');
          blank.width = 1; blank.height = 1;
          resolve(blank);
        };
      };

      img.src = src;
    });
  }

  getDimensions(aspectRatio = 'square', baseWidth = 1080) {
    switch (aspectRatio) {
      case 'story':
        return { width: 1080, height: 1920 };
      case 'portrait':
        return { width: 1080, height: 1350 };
      case 'square':
      default:
        return { width: 1080, height: 1080 };
    }
  }

  async render(canvas, config = {}) {
    const {
      photoUrl,
      message = 'Thinking of you today with all my heart. ❤️',
      recipient = 'Someone Special',
      mood = 'Loving',
      designTemplate = 'Warm',
      artisticStyle = 'original',
      aspectRatio = 'square'
    } = config;

    const { width, height } = this.getDimensions(aspectRatio);
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background Photograph
    if (photoUrl) {
      const img = await this.loadImage(photoUrl);
      this.drawCoverImage(ctx, img, width, height);
    } else {
      // Warm default canvas gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#FAF5EE');
      grad.addColorStop(1, '#F3E4D3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Apply Artistic Filter if selected
    if (artisticStyle && artisticStyle !== 'original') {
      this.applyArtisticFilter(ctx, artisticStyle, width, height);
    }

    // 3. Render Chosen Design Template
    switch (designTemplate) {
      case 'Classic':
        this.renderClassicTemplate(ctx, message, recipient, mood, width, height);
        break;
      case 'Elegant':
        this.renderElegantTemplate(ctx, message, recipient, mood, width, height);
        break;
      case 'Warm':
      default:
        this.renderWarmTemplate(ctx, message, recipient, mood, width, height);
        break;
    }

    // 4. Subtle Brand Mark at the very bottom
    this.renderBrandWatermark(ctx, width, height);
  }

  drawCoverImage(ctx, img, targetW, targetH) {
    const imgRatio = img.width / img.height;
    const targetRatio = targetW / targetH;
    let renderW, renderH, offsetX, offsetY;

    if (imgRatio > targetRatio) {
      renderH = targetH;
      renderW = targetH * imgRatio;
      offsetX = (targetW - renderW) / 2;
      offsetY = 0;
    } else {
      renderW = targetW;
      renderH = targetW / imgRatio;
      offsetX = 0;
      offsetY = (targetH - renderH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  applyArtisticFilter(ctx, style, width, height) {
    ctx.save();
    switch (style) {
      case 'van_gogh':
        // Expressive golden swirling wash
        ctx.globalCompositeOperation = 'color-burn';
        ctx.fillStyle = 'rgba(230, 160, 40, 0.35)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = 'rgba(70, 130, 180, 0.25)';
        ctx.fillRect(0, 0, width, height);
        break;

      case 'monet':
        // Soft luminous impressionism
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 235, 205, 0.3)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = 'rgba(175, 215, 235, 0.4)';
        ctx.fillRect(0, 0, width, height);
        break;

      case 'picasso':
        // Bold abstract contrast
        ctx.globalCompositeOperation = 'hard-light';
        ctx.fillStyle = 'rgba(215, 75, 60, 0.25)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(255, 250, 220, 0.3)';
        ctx.fillRect(0, 0, width, height);
        break;

      case 'renaissance':
        // Classical dramatic chiaroscuro
        ctx.globalCompositeOperation = 'multiply';
        const vignette = ctx.createRadialGradient(
          width / 2, height / 2, width * 0.3,
          width / 2, height / 2, width * 0.75
        );
        vignette.addColorStop(0, 'rgba(255, 240, 220, 0)');
        vignette.addColorStop(1, 'rgba(55, 30, 20, 0.65)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
        break;

      case 'japanese':
        // Japanese woodblock print
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = 'rgba(195, 210, 200, 0.45)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(240, 230, 210, 0.3)';
        ctx.fillRect(0, 0, width, height);
        break;
    }
    ctx.restore();
  }

  // --- TEMPLATE 1: WARM ---
  renderWarmTemplate(ctx, message, recipient, mood, width, height) {
    const cardWidth = Math.min(width * 0.88, 880);
    const cardPadding = 48;
    const cardX = (width - cardWidth) / 2;

    // Calculate text wrapping to determine card height dynamically
    ctx.font = 'normal 42px "Playfair Display", Georgia, serif';
    const lines = this.wrapText(ctx, message, cardWidth - (cardPadding * 2));
    const lineHeight = 60;
    const textBlockHeight = lines.length * lineHeight;
    const cardHeight = Math.max(textBlockHeight + 160, 280);
    const cardY = height - cardHeight - 80;

    // Soft Warm Card Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(40, 20, 10, 0.28)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;

    // Rounded Warm Cream Card
    this.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 36);
    ctx.fillStyle = '#FAF6EE';
    ctx.fill();
    ctx.restore();

    // Subtle Card Inner Border
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#EDE3D2';
    this.roundRect(ctx, cardX + 10, cardY + 10, cardWidth - 20, cardHeight - 20, 28);
    ctx.stroke();
    ctx.restore();

    // Recipient & Mood Pill
    ctx.save();
    const pillY = cardY + 45;
    ctx.fillStyle = '#E87A5D';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1px';
    const label = `FOR ${recipient.toUpperCase()}  •  ${mood.toUpperCase()}`;
    ctx.fillText(label, width / 2, pillY);
    ctx.restore();

    // The Warm Message
    ctx.save();
    ctx.fillStyle = '#2D211C';
    ctx.font = 'italic 40px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    const textStartY = cardY + 110;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], width / 2, textStartY + (i * lineHeight));
    }
    ctx.restore();
  }

  // --- TEMPLATE 2: CLASSIC ---
  renderClassicTemplate(ctx, message, recipient, mood, width, height) {
    // Elegant bottom gradient scrim
    const scrimH = height * 0.55;
    const scrim = ctx.createLinearGradient(0, height - scrimH, 0, height);
    scrim.addColorStop(0, 'rgba(15, 10, 8, 0)');
    scrim.addColorStop(0.35, 'rgba(15, 10, 8, 0.72)');
    scrim.addColorStop(1, 'rgba(15, 10, 8, 0.95)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, height - scrimH, width, scrimH);

    // Delicate Double Divider
    const dividerY = height - 280;
    ctx.save();
    ctx.strokeStyle = '#F3D299';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 140, dividerY);
    ctx.lineTo(width / 2 + 140, dividerY);
    ctx.stroke();

    // Center Diamond
    ctx.fillStyle = '#F3D299';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', width / 2, dividerY + 5);
    ctx.restore();

    // Recipient
    ctx.save();
    ctx.fillStyle = '#F3D299';
    ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText(`TO ${recipient.toUpperCase()}`, width / 2, dividerY - 24);
    ctx.restore();

    // Message
    ctx.save();
    ctx.font = '38px "Playfair Display", Georgia, serif';
    const maxTextW = width * 0.82;
    const lines = this.wrapText(ctx, message, maxTextW);
    const lineHeight = 56;
    const textStartY = dividerY + 60;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], width / 2, textStartY + (i * lineHeight));
    }
    ctx.restore();
  }

  // --- TEMPLATE 3: ELEGANT ---
  renderElegantTemplate(ctx, message, recipient, mood, width, height) {
    const cardWidth = Math.min(width * 0.86, 860);
    const cardPadding = 44;
    const cardX = (width - cardWidth) / 2;

    ctx.font = '38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const lines = this.wrapText(ctx, message, cardWidth - (cardPadding * 2));
    const lineHeight = 56;
    const textBlockHeight = lines.length * lineHeight;
    const cardHeight = Math.max(textBlockHeight + 170, 300);
    const cardY = height - cardHeight - 70;

    // Frosted Glassmorphism Card
    ctx.save();
    ctx.shadowColor = 'rgba(20, 10, 5, 0.35)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 20;

    this.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 32);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fill();
    ctx.restore();

    // Subtle Rose Gold Accent Border
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#D9826C';
    this.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 32);
    ctx.stroke();
    ctx.restore();

    // Editorial Subtitle
    ctx.save();
    ctx.fillStyle = '#78685C';
    ctx.font = '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText(`DEARLY MOMENT  •  ${recipient.toUpperCase()}`, width / 2, cardY + 52);
    ctx.restore();

    // Quotation Flourish
    ctx.save();
    ctx.fillStyle = '#D9826C';
    ctx.font = 'italic 48px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('“', width / 2, cardY + 95);
    ctx.restore();

    // Message
    ctx.save();
    ctx.fillStyle = '#1F1714';
    ctx.font = '400 36px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    const textStartY = cardY + 145;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], width / 2, textStartY + (i * lineHeight));
    }
    ctx.restore();
  }

  renderBrandWatermark(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText('DEARLY', width / 2, height - 24);
    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  exportAsBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png', 0.98);
    });
  }

  exportAsDataUrl(canvas) {
    return canvas.toDataURL('image/png', 0.98);
  }
}

window.DearlyCompositor = DearlyCompositor;
