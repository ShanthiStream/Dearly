/**
 * DEARLY - Sharing Service
 * Handles native Web Share, WhatsApp direct sharing, high-res download, and social link sharing.
 */

class ShareService {
  constructor(compositor) {
    this.compositor = compositor;
  }

  // 1. WhatsApp Direct Sharing
  async shareWhatsApp({ message, canvas }) {
    const cleanText = encodeURIComponent(`"${message}"\n\n— Made with love using DEARLY ❤️`);
    const waUrl = `https://api.whatsapp.com/send?text=${cleanText}`;
    
    // Automatically trigger high-res image download so user can attach on WhatsApp
    if (canvas) {
      this.downloadImage(canvas, 'dearly-moment.png');
    }
    
    // Open WhatsApp
    window.open(waUrl, '_blank');
  }

  // 2. Platform Native Share (Web Share API)
  async shareNative({ title = 'A special message for you', message, canvas }) {
    if (navigator.share) {
      try {
        const shareData = {
          title: 'DEARLY Moment ❤️',
          text: `"${message}"\n\n— Made with DEARLY`,
        };

        // Try attaching the image file directly if supported
        if (canvas && navigator.canShare) {
          const blob = await this.compositor.exportAsBlob(canvas);
          const file = new File([blob], 'dearly-moment.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        }

        await navigator.share(shareData);
        return { success: true };
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Native share error, falling back:', err);
        }
      }
    }

    // Fallback: Copy message & download photo
    return this.fallbackShare({ message, canvas });
  }

  // 3. Save to Photos / Download
  downloadImage(canvas, filename = 'dearly-moment.png') {
    const dataUrl = this.compositor.exportAsDataUrl(canvas);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 4. Fallback Share (Copy text & notify)
  async fallbackShare({ message, canvas }) {
    if (canvas) {
      this.downloadImage(canvas, 'dearly-moment.png');
    }
    try {
      await navigator.clipboard.writeText(`"${message}" — Made with DEARLY ❤️`);
      alert('Message copied to clipboard and photo downloaded! You can now paste and send it to your loved one. ❤️');
    } catch (e) {
      alert('Photo downloaded! Ready to share with your loved one. ❤️');
    }
    return { success: true };
  }
}

window.ShareService = ShareService;
