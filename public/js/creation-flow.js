/**
 * DEARLY - Creation Flow Wizard
 * The core 6-step magical journey:
 * 1. Choose Photo → 2. What to Say → 3. Recipient → 4. Mood → 5. Ready → 6. Message → 7. Result & Share
 */

class CreationFlow {
  constructor(compositor, shareService, usageBillingManager, onSaved) {
    this.compositor = compositor;
    this.shareService = shareService;
    this.usageManager = usageBillingManager;
    this.onSaved = onSaved;
    this.loadingInterval = null;

    // Current creation state
    this.state = {
      step: 1,
      photoUrl: null,
      photoDescription: '',
      intention: '',
      recipient: 'Someone Special',
      mood: 'Loving',
      message: '',
      candidates: [],
      designTemplate: 'Warm',
      artisticStyle: 'original',
      aspectRatio: 'square'
    };

    this._initEventListeners();
  }

  _initEventListeners() {
    // =====================================================================
    // STEP 1: PHOTO SELECTION
    // =====================================================================
    const uploadBox = document.getElementById('uploadPhotoBox');
    const fileInput = document.getElementById('photoFileInput');

    // Clicking the upload box opens file picker
    if (uploadBox) {
      uploadBox.addEventListener('click', () => fileInput && fileInput.click());
      uploadBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInput && fileInput.click();
        }
      });
    }

    // File selected
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this._handleFileUpload(e));
    }

    // Change photo button
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    if (changePhotoBtn) {
      changePhotoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._clearUploadedPhoto();
      });
    }

    // Surprise me
    const surpriseBtn = document.getElementById('surprisePhotoBtn');
    if (surpriseBtn) {
      surpriseBtn.addEventListener('click', () => this.selectRandomSample());
    }

    // Sample photos grid — populated by app.js but events delegated here
    const sampleGrid = document.getElementById('samplePhotosGrid');
    if (sampleGrid) {
      sampleGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.sample-photo-card');
        if (!card) return;
        const idx = parseInt(card.getAttribute('data-idx'), 10);
        if (!isNaN(idx) && window.SAMPLE_MOMENTS[idx]) {
          document.querySelectorAll('.sample-photo-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          this.selectSamplePhoto(window.SAMPLE_MOMENTS[idx]);
        }
      });
    }

    // Step 1 continue
    const s1Btn = document.getElementById('step1ContinueBtn');
    if (s1Btn) s1Btn.addEventListener('click', () => {
      if (!this.state.photoUrl) {
        // Auto-select the first sample if nothing chosen
        this.selectSamplePhoto(window.SAMPLE_MOMENTS[0]);
      }
      this._goToStep(2);
    });

    // =====================================================================
    // STEP 2: INTENTION
    // =====================================================================
    document.querySelectorAll('.intention-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-text');
        const input = document.getElementById('intentionInput');
        if (input) {
          input.value = text;
          this.state.intention = text;
        }
        // Auto-advance to step 3
        this._goToStep(3);
      });
    });

    const dontKnowBtn = document.getElementById('dontKnowBtn');
    if (dontKnowBtn) {
      dontKnowBtn.addEventListener('click', () => {
        const input = document.getElementById('intentionInput');
        if (input) input.value = '';
        this.state.intention = '';
        this._goToStep(3);
      });
    }

    document.getElementById('step2BackBtn')?.addEventListener('click', () => this._goToStep(1));
    document.getElementById('step2ContinueBtn')?.addEventListener('click', () => {
      this._readIntention();
      this._goToStep(3);
    });

    // =====================================================================
    // STEP 3: RECIPIENT
    // =====================================================================
    document.querySelectorAll('.recipient-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.recipient-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.recipient = btn.getAttribute('data-recipient');
      });
    });

    document.getElementById('skipRecipientBtn')?.addEventListener('click', () => {
      this.state.recipient = 'Someone Special';
      this._goToStep(4);
    });

    document.getElementById('step3BackBtn')?.addEventListener('click', () => this._goToStep(2));
    document.getElementById('step3ContinueBtn')?.addEventListener('click', () => this._goToStep(4));

    // =====================================================================
    // STEP 4: MOOD
    // =====================================================================
    document.querySelectorAll('.mood-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mood-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.mood = btn.getAttribute('data-mood');
      });
    });

    document.getElementById('skipMoodBtn')?.addEventListener('click', () => {
      this.state.mood = 'Loving';
      this._goToStep(5);
    });

    document.getElementById('step4BackBtn')?.addEventListener('click', () => this._goToStep(3));
    document.getElementById('step4ContinueBtn')?.addEventListener('click', () => this._goToStep(5));

    // =====================================================================
    // STEP 5: READY TO CREATE
    // =====================================================================
    document.getElementById('step5BackBtn')?.addEventListener('click', () => this._goToStep(4));
    document.getElementById('makeBeautifulBtn')?.addEventListener('click', () => this.generateCreation());

    // =====================================================================
    // STEP 6: MESSAGE CHOICES
    // =====================================================================
    document.querySelectorAll('.refine-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-refine');
        this._refineCurrentMessage(type);
      });
    });

    document.getElementById('step6BackBtn')?.addEventListener('click', () => this._goToStep(5));
    document.getElementById('step6ContinueBtn')?.addEventListener('click', () => this._proceedToResult());

    // =====================================================================
    // STEP 7: RESULT & SHARING
    // =====================================================================
    document.getElementById('step7BackBtn')?.addEventListener('click', () => this._goToStep(6));

    // Design templates
    document.querySelectorAll('.template-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.template-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.designTemplate = btn.getAttribute('data-template');
        this._renderCanvas();
      });
    });

    // Aspect ratio
    document.querySelectorAll('.aspect-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.aspect-choice-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.aspectRatio = btn.getAttribute('data-ratio');
        this._renderCanvas();
      });
    });

    // Artistic styles
    document.querySelectorAll('.artistic-style-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.artistic-style-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.state.artisticStyle = card.getAttribute('data-style');
        this._renderCanvas();
      });
    });

    // Share buttons
    document.getElementById('shareWhatsAppBtn')?.addEventListener('click', () => {
      const canvas = document.getElementById('resultCanvas');
      this.shareService.shareWhatsApp({ message: this.state.message, canvas });
    });

    document.getElementById('shareNativeBtn')?.addEventListener('click', () => {
      const canvas = document.getElementById('resultCanvas');
      this.shareService.shareNative({
        title: `For ${this.state.recipient}`,
        message: this.state.message,
        canvas
      });
    });

    document.getElementById('savePhotoBtn')?.addEventListener('click', () => {
      const canvas = document.getElementById('resultCanvas');
      this.shareService.downloadImage(canvas, `dearly-for-${this.state.recipient.toLowerCase().replace(/\s+/g, '-')}.png`);
    });

    document.getElementById('saveToGalleryBtn')?.addEventListener('click', () => this._saveToGallery());
    document.getElementById('makeAnotherBtn')?.addEventListener('click', () => this.resetCreation());
  }

  // =========================================================================
  // PHOTO HANDLING
  // =========================================================================

  _handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, HEIC, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      this.state.photoUrl = ev.target.result;
      this.state.photoDescription = 'Personal uploaded photo';
      this._showUploadPreview(ev.target.result);
      this._hideSampleSelectedInfo();
    };
    reader.readAsDataURL(file);

    // Reset file input to allow re-selecting same file
    e.target.value = '';
  }

  _showUploadPreview(dataUrl) {
    const uploadBox = document.getElementById('uploadPhotoBox');
    const previewBox = document.getElementById('uploadPreviewBox');
    const previewImg = document.getElementById('uploadedPhotoPreview');

    if (uploadBox) uploadBox.style.display = 'none';
    if (previewBox) previewBox.style.display = 'block';
    if (previewImg) previewImg.src = dataUrl;
  }

  _clearUploadedPhoto() {
    const uploadBox = document.getElementById('uploadPhotoBox');
    const previewBox = document.getElementById('uploadPreviewBox');

    if (uploadBox) uploadBox.style.display = '';
    if (previewBox) previewBox.style.display = 'none';

    this.state.photoUrl = null;
    this.state.photoDescription = '';
  }

  selectSamplePhoto(sample) {
    this.state.photoUrl = sample.url;
    this.state.photoDescription = sample.description;

    if (sample.suggestedRecipient) {
      this.state.recipient = sample.suggestedRecipient;
      this._selectRecipientInUI(sample.suggestedRecipient);
    }
    if (sample.suggestedMood) {
      this.state.mood = sample.suggestedMood;
      this._selectMoodInUI(sample.suggestedMood);
    }
    if (sample.suggestedIntention && !this.state.intention) {
      const input = document.getElementById('intentionInput');
      if (input) input.value = sample.suggestedIntention;
      this.state.intention = sample.suggestedIntention;
    }

    // Hide upload box, show sample selected info
    const uploadBox = document.getElementById('uploadPhotoBox');
    const previewBox = document.getElementById('uploadPreviewBox');
    if (uploadBox) uploadBox.style.display = 'none';
    if (previewBox) previewBox.style.display = 'none';

    const sampleInfo = document.getElementById('sampleSelectedInfo');
    const sampleLabel = document.getElementById('sampleSelectedLabel');
    if (sampleInfo) sampleInfo.style.display = 'block';
    if (sampleLabel) sampleLabel.textContent = `📷 "${sample.title}" selected`;
  }

  _hideSampleSelectedInfo() {
    const sampleInfo = document.getElementById('sampleSelectedInfo');
    if (sampleInfo) sampleInfo.style.display = 'none';

    // Re-deselect sample cards
    document.querySelectorAll('.sample-photo-card').forEach(c => c.classList.remove('selected'));
  }

  selectRandomSample() {
    const idx = Math.floor(Math.random() * window.SAMPLE_MOMENTS.length);
    const sample = window.SAMPLE_MOMENTS[idx];

    // Highlight the selected card in grid
    document.querySelectorAll('.sample-photo-card').forEach((c, i) => {
      c.classList.toggle('selected', i === idx);
    });

    this.selectSamplePhoto(sample);
  }

  // =========================================================================
  // STEP NAVIGATION
  // =========================================================================

  _readIntention() {
    const input = document.getElementById('intentionInput');
    if (input) this.state.intention = input.value.trim();
  }

  _goToStep(stepNumber) {
    // Read intention when leaving step 2
    if (this.state.step === 2) {
      this._readIntention();
    }

    // Update summary card when going to step 5
    if (stepNumber === 5) {
      this._updateSummary();
    }

    this.state.step = stepNumber;

    document.querySelectorAll('.wizard-step').forEach(el => {
      const n = parseInt(el.getAttribute('data-step'), 10);
      el.classList.toggle('active', n === stepNumber);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _updateSummary() {
    const recEl = document.getElementById('summaryRecipient');
    const moodEl = document.getElementById('summaryMood');
    const intentionRow = document.getElementById('summaryIntentionRow');
    const previewImg = document.getElementById('selectedPhotoPreview');

    if (recEl) recEl.textContent = `For ${this.state.recipient}`;
    if (moodEl) moodEl.textContent = `Mood: ${this.state.mood}`;

    if (intentionRow) {
      const hasIntention = this.state.intention && !this.state.intention.toLowerCase().includes("don't know");
      intentionRow.innerHTML = hasIntention
        ? `<p style="font-size:14px; color:var(--text-muted); text-align:center; margin-bottom: 12px;">"${this.state.intention}"</p>`
        : `<p style="font-size:14px; color:var(--accent-sage); text-align:center; margin-bottom: 12px;">✨ DEARLY will choose the perfect words</p>`;
    }

    if (previewImg && this.state.photoUrl) {
      previewImg.src = this.state.photoUrl;
    }
  }

  _selectRecipientInUI(recipientName) {
    document.querySelectorAll('.recipient-choice-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-recipient') === recipientName);
    });
  }

  _selectMoodInUI(moodName) {
    document.querySelectorAll('.mood-choice-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-mood') === moodName);
    });
  }

  // =========================================================================
  // AI GENERATION
  // =========================================================================

  async generateCreation() {
    this._showLoadingScreen();

    try {
      const photoUrl = this.state.photoUrl || (window.SAMPLE_MOMENTS?.[0]?.url);

      const res = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoInfo: {
            url: photoUrl,
            description: this.state.photoDescription
          },
          intention: this.state.intention,
          recipient: this.state.recipient,
          mood: this.state.mood
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Generation failed');

      this.state.candidates = data.candidates || [];
      this.state.message = this.state.candidates[0]?.text || 'Thinking of you today. ❤️';

      if (data.recommendedDesign) {
        this.state.designTemplate = data.recommendedDesign;
        // Update design toggle UI
        document.querySelectorAll('.template-toggle-btn').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-template') === data.recommendedDesign);
        });
      }

      this._hideLoadingScreen();
      this._renderMessageChoices();
      this._goToStep(6);

    } catch (err) {
      this._hideLoadingScreen();
      console.error('Generation error:', err);
      alert("We couldn't create that just yet. Let's try again. ❤️");
    }
  }

  _showLoadingScreen() {
    const overlay = document.getElementById('loadingOverlay');
    const textEl = document.getElementById('loadingMessageText');
    if (!overlay) return;

    const messages = [
      'Looking at your photo… 📷',
      'Finding the right words… ✍️',
      'Crafting something beautiful… 🌸',
      'Almost ready… ❤️'
    ];

    let msgIdx = 0;
    if (textEl) textEl.textContent = messages[0];
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');

    this.loadingInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      if (textEl) textEl.textContent = messages[msgIdx];
    }, 1500);
  }

  _hideLoadingScreen() {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  _renderMessageChoices() {
    const container = document.getElementById('messageCandidatesContainer');
    if (!container) return;

    container.innerHTML = '';
    if (!this.state.candidates || this.state.candidates.length === 0) {
      container.innerHTML = `<p style="text-align:center; color: var(--text-muted);">No messages generated. Please try again.</p>`;
      return;
    }

    this.state.candidates.forEach((cand, idx) => {
      const isSelected = cand.text === this.state.message;
      const item = document.createElement('div');
      item.className = `message-choice-card${isSelected ? ' selected' : ''}`;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.innerHTML = `
        <div class="message-choice-header">
          <span class="message-choice-badge">${cand.label || cand.style || `Option ${idx + 1}`}</span>
          <button type="button" class="btn btn-sm btn-subtle use-this-btn">Use this ❤️</button>
        </div>
        <p class="message-choice-text">"${cand.text}"</p>
      `;

      const useBtn = item.querySelector('.use-this-btn');
      useBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.state.message = cand.text;
        this._highlightSelectedCard(item);
        this._proceedToResult();
      });

      item.addEventListener('click', () => {
        this.state.message = cand.text;
        this._highlightSelectedCard(item);
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.state.message = cand.text;
          this._highlightSelectedCard(item);
        }
      });

      container.appendChild(item);
    });
  }

  _highlightSelectedCard(selectedItem) {
    document.querySelectorAll('.message-choice-card').forEach(c => c.classList.remove('selected'));
    selectedItem.classList.add('selected');
  }

  async _refineCurrentMessage(type) {
    const refineBtn = document.querySelector(`.refine-btn[data-refine="${type}"]`);
    if (refineBtn) {
      refineBtn.disabled = true;
      refineBtn.textContent = '…';
    }

    try {
      const res = await fetch('/api/refine-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMessage: this.state.message,
          refinementType: type,
          context: { recipient: this.state.recipient, mood: this.state.mood }
        })
      });
      const data = await res.json();
      if (data.success && data.refinedMessage) {
        this.state.message = data.refinedMessage;

        // Inject as a new first candidate
        this.state.candidates.unshift({
          id: 'refined_' + type,
          style: 'Refined',
          label: `Refined (${type})`,
          text: data.refinedMessage
        });

        this._renderMessageChoices();
      }
    } catch (e) {
      console.warn('Refinement error:', e);
    } finally {
      if (refineBtn) {
        refineBtn.disabled = false;
        const labels = {
          warmer: 'Make it warmer ❤️',
          shorter: 'Make it shorter ✂️',
          funnier: 'Add humor 😄',
          different: 'Try again ✍️'
        };
        refineBtn.textContent = labels[type] || type;
      }
    }
  }

  // =========================================================================
  // RESULT & CANVAS
  // =========================================================================

  _proceedToResult() {
    this._goToStep(7);
    this._renderCanvas();
  }

  async _renderCanvas() {
    const canvas = document.getElementById('resultCanvas');
    if (!canvas) return;

    const photoUrl = this.state.photoUrl || (window.SAMPLE_MOMENTS?.[0]?.url);

    await this.compositor.render(canvas, {
      photoUrl,
      message: this.state.message || 'Thinking of you today. ❤️',
      recipient: this.state.recipient,
      mood: this.state.mood,
      designTemplate: this.state.designTemplate,
      artisticStyle: this.state.artisticStyle,
      aspectRatio: this.state.aspectRatio
    });

    const subEl = document.getElementById('resultSubtitle');
    if (subEl) {
      subEl.textContent = `For ${this.state.recipient} • ${this.state.designTemplate} Design`;
    }
  }

  async _saveToGallery() {
    const btn = document.getElementById('saveToGalleryBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

    try {
      const canvas = document.getElementById('resultCanvas');
      const dataUrl = canvas ? this.compositor.exportAsDataUrl(canvas) : null;

      const res = await fetch('/api/creations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `For ${this.state.recipient}`,
          recipient: this.state.recipient,
          mood: this.state.mood,
          designTemplate: this.state.designTemplate,
          artisticStyle: this.state.artisticStyle,
          aspectRatio: this.state.aspectRatio,
          message: this.state.message,
          photoUrl: this.state.photoUrl,
          dataUrl: dataUrl,
          photoDescription: this.state.photoDescription,
          category: this._determineCategory()
        })
      });

      const data = await res.json();
      if (data.success) {
        if (btn) { btn.textContent = '✓ Saved to My Dearly!'; }
        setTimeout(() => {
          if (btn) { btn.disabled = false; btn.innerHTML = '<span>❤️</span> Save to My Dearly'; }
        }, 2000);
        if (this.onSaved) this.onSaved(data.creation);
        this.usageManager.fetchSession();
      } else {
        throw new Error(data.error || 'Save failed');
      }
    } catch (e) {
      console.error('Save error:', e);
      if (btn) { btn.disabled = false; btn.innerHTML = '<span>❤️</span> Save to My Dearly'; }
      alert("Couldn't save right now. Please try again. ❤️");
    }
  }

  _determineCategory() {
    const rc = this.state.recipient.toLowerCase();
    const md = this.state.mood.toLowerCase();
    const intent = (this.state.intention || '').toLowerCase();
    if (rc.includes('child') || rc.includes('grandchild') || rc.includes('family')) return 'Family';
    if (rc.includes('partner') || md.includes('romantic')) return 'Love';
    if (md.includes('happy') || intent.includes('birthday') || intent.includes('congrat')) return 'Birthdays';
    return 'Memories';
  }

  // =========================================================================
  // PUBLIC METHODS
  // =========================================================================

  startWithRemix(item) {
    this.state.photoUrl = item.photoUrl || (window.SAMPLE_MOMENTS?.[0]?.url);
    this.state.photoDescription = item.photoDescription || 'Remixed moment';
    this.state.recipient = item.recipient || 'Someone Special';
    this.state.mood = item.mood || 'Loving';
    this.state.message = item.message || '';
    this.state.designTemplate = item.designTemplate || 'Warm';
    this.state.artisticStyle = item.artisticStyle || 'original';
    this.state.aspectRatio = item.aspectRatio || 'square';
    this.state.intention = item.message || '';

    this._selectRecipientInUI(this.state.recipient);
    this._selectMoodInUI(this.state.mood);

    // Prefill candidates with the existing message
    this.state.candidates = [{
      id: 'remix_1',
      style: 'Original',
      label: 'Your Message',
      text: this.state.message
    }];

    this._renderMessageChoices();
    this._goToStep(6);
  }

  resetCreation() {
    this.state = {
      step: 1,
      photoUrl: null,
      photoDescription: '',
      intention: '',
      recipient: 'Someone Special',
      mood: 'Loving',
      message: '',
      candidates: [],
      designTemplate: 'Warm',
      artisticStyle: 'original',
      aspectRatio: 'square'
    };

    // Reset UI
    const input = document.getElementById('intentionInput');
    if (input) input.value = '';

    const uploadBox = document.getElementById('uploadPhotoBox');
    const previewBox = document.getElementById('uploadPreviewBox');
    const sampleInfo = document.getElementById('sampleSelectedInfo');
    if (uploadBox) uploadBox.style.display = '';
    if (previewBox) previewBox.style.display = 'none';
    if (sampleInfo) sampleInfo.style.display = 'none';

    document.querySelectorAll('.sample-photo-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.recipient-choice-btn').forEach((b, i) => b.classList.toggle('selected', i === 0));
    document.querySelectorAll('.mood-choice-btn').forEach((b, i) => b.classList.toggle('selected', i === 0));
    document.querySelectorAll('.template-toggle-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
    document.querySelectorAll('.aspect-choice-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
    document.querySelectorAll('.artistic-style-card').forEach((c, i) => c.classList.toggle('selected', i === 0));

    this._goToStep(1);
  }
}

window.CreationFlow = CreationFlow;
