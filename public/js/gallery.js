/**
 * DEARLY - My Dearly Gallery & Remix Controller
 * Manages past creations, categorized grid, full-screen preview, direct share, and instant remixing.
 */

class GalleryManager {
  constructor(compositor, shareService, onRemixRequest) {
    this.compositor = compositor;
    this.shareService = shareService;
    this.onRemixRequest = onRemixRequest;
    this.creations = [];
    this.activeFilter = 'All';
    this.activeCreation = null;
  }

  async loadCreations() {
    try {
      const res = await fetch('/api/creations');
      const data = await res.json();
      if (data.success) {
        this.creations = data.creations;
        this.render();
      }
    } catch (e) {
      console.error('Error loading creations:', e);
    }
  }

  setFilter(category) {
    this.activeFilter = category;
    this.render();
  }

  getFilteredCreations() {
    if (this.activeFilter === 'All') return this.creations;
    return this.creations.filter(c => (c.category || '').toLowerCase() === this.activeFilter.toLowerCase());
  }

  render() {
    const grid = document.getElementById('galleryGrid');
    const empty = document.getElementById('galleryEmptyState');
    if (!grid) return;

    const filtered = this.getFilteredCreations();

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      return;
    }

    if (empty) empty.classList.add('hidden');
    grid.innerHTML = '';

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View ${item.title || 'Saved moment'}`);

      const thumb = item.photoUrl || '/assets/samples/grandchild.jpg';

      card.innerHTML = `
        <div class="gallery-card-thumb">
          <img src="${thumb}" alt="${item.title || 'Moment'}" loading="lazy"
            onerror="this.src='/assets/samples/grandchild.jpg'">
        </div>
        <div class="gallery-card-info">
          <div class="gallery-card-title">For ${item.recipient || 'Someone Special'}</div>
          <div class="gallery-card-excerpt">"${item.message}"</div>
        </div>
      `;

      card.addEventListener('click', () => this.openPreview(item));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          this.openPreview(item);
        }
      });

      grid.appendChild(card);
    });
  }

  async openPreview(item) {
    this.activeCreation = item;
    const modal = document.getElementById('previewModal');
    if (!modal) return;

    // Render high-res canvas in preview modal
    const canvas = document.getElementById('previewCanvas');
    if (canvas) {
      await this.compositor.render(canvas, {
        photoUrl: item.photoUrl,
        message: item.message,
        recipient: item.recipient,
        mood: item.mood,
        designTemplate: item.designTemplate,
        artisticStyle: item.artisticStyle,
        aspectRatio: item.aspectRatio || 'square'
      });
    }

    const titleEl = document.getElementById('previewTitle');
    if (titleEl) titleEl.textContent = item.title || 'Special Moment';

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }

  closePreview() {
    const modal = document.getElementById('previewModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
    this.activeCreation = null;
  }

  shareCurrent() {
    if (!this.activeCreation) return;
    const canvas = document.getElementById('previewCanvas');
    this.shareService.shareNative({
      title: this.activeCreation.title,
      message: this.activeCreation.message,
      canvas
    });
  }

  whatsAppCurrent() {
    if (!this.activeCreation) return;
    const canvas = document.getElementById('previewCanvas');
    this.shareService.shareWhatsApp({
      message: this.activeCreation.message,
      canvas
    });
  }

  downloadCurrent() {
    const canvas = document.getElementById('previewCanvas');
    if (canvas) {
      this.shareService.downloadImage(canvas, `dearly-${(this.activeCreation?.title || 'moment').toLowerCase().replace(/\s+/g, '-')}.png`);
    }
  }

  remixCurrent() {
    if (!this.activeCreation) return;
    const itemToRemix = { ...this.activeCreation };
    this.closePreview();
    if (this.onRemixRequest) {
      this.onRemixRequest(itemToRemix);
    }
  }

  async deleteCurrent() {
    if (!this.activeCreation) return;
    if (!confirm('Are you sure you want to remove this moment from My Dearly?')) return;

    try {
      const res = await fetch(`/api/creations/${this.activeCreation.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        this.closePreview();
        this.loadCreations();
      }
    } catch (e) {
      alert("We couldn't delete that just yet. Let's try again. ❤️");
    }
  }
}

window.GalleryManager = GalleryManager;
