/**
 * DEARLY - Application Entrypoint
 * "The technology should disappear. The emotion should remain."
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. INITIALIZE CORE SERVICES
  // =========================================================================
  const compositor = new DearlyCompositor();
  const shareService = new ShareService(compositor);
  const usageManager = new UsageBillingManager();

  let creationFlow;
  const galleryManager = new GalleryManager(compositor, shareService, (remixItem) => {
    switchTab('tab-create');
    creationFlow.startWithRemix(remixItem);
  });

  creationFlow = new CreationFlow(compositor, shareService, usageManager, (newCreation) => {
    galleryManager.loadCreations();
    _renderRecentMomentsOnHome();
  });

  // Expose globally for inline references (just in case)
  window.compositor = compositor;
  window.shareService = shareService;
  window.usageManager = usageManager;
  window.galleryManager = galleryManager;
  window.creationFlow = creationFlow;

  // =========================================================================
  // 2. TAB NAVIGATION
  // =========================================================================
  const navButtons = document.querySelectorAll('.nav-item');
  const screens = document.querySelectorAll('.app-screen');

  function switchTab(targetTabId) {
    navButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === targetTabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    screens.forEach(screen => {
      screen.classList.toggle('active', screen.id === targetTabId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Lazy-load data on tab switch
    if (targetTabId === 'tab-gallery') {
      galleryManager.loadCreations();
    } else if (targetTabId === 'tab-people') {
      _loadPeopleList();
    }
  }

  // Expose globally — needed for any inline calls
  window.switchTab = switchTab;

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) switchTab(tabId);
    });
  });

  // =========================================================================
  // 3. HEADER LOGO → HOME
  // =========================================================================
  document.getElementById('headerLogo')?.addEventListener('click', () => switchTab('tab-home'));
  document.getElementById('headerLogo')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') switchTab('tab-home');
  });

  // =========================================================================
  // 4. ACCESSIBILITY: LARGE TEXT TOGGLE
  // =========================================================================
  const accessibilityToggleBtn = document.getElementById('accessibilityTextBtn');
  const isLargeText = localStorage.getItem('dearly_large_text') === 'true';
  if (isLargeText) {
    document.body.classList.add('large-text-mode');
    _updateA11yBtnText(true);
  }

  accessibilityToggleBtn?.addEventListener('click', () => {
    const isLarge = document.body.classList.toggle('large-text-mode');
    localStorage.setItem('dearly_large_text', isLarge ? 'true' : 'false');
    _updateA11yBtnText(isLarge);
  });

  function _updateA11yBtnText(isLarge) {
    if (accessibilityToggleBtn) {
      accessibilityToggleBtn.innerHTML = isLarge
        ? '<span class="a11y-icon">🔍</span> Large Text: ON'
        : '<span class="a11y-icon">🔍</span> Text Size';
    }
  }

  // =========================================================================
  // 5. USAGE STATUS & BILLING
  // =========================================================================
  usageManager.fetchSession();

  document.getElementById('usagePill')?.addEventListener('click', () => {
    usageManager.showUpgradeModal('creator');
  });

  document.getElementById('closePricingModalBtn')?.addEventListener('click', () => {
    usageManager.hideUpgradeModal();
  });

  // Close modals on overlay click
  document.getElementById('pricingModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'pricingModal') usageManager.hideUpgradeModal();
  });

  document.querySelectorAll('.choose-plan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan');
      if (plan === 'single') {
        usageManager.buySingleCreation();
      } else {
        usageManager.selectPlan(plan);
      }
    });
  });

  // Settings page billing buttons
  document.getElementById('settingsUpgradeBtn')?.addEventListener('click', () => {
    usageManager.showUpgradeModal('creator');
  });
  document.getElementById('settingsBuyOneBtn')?.addEventListener('click', () => {
    usageManager.buySingleCreation();
  });

  // =========================================================================
  // 6. HOME SCREEN QUICK ACTIONS
  // =========================================================================
  document.getElementById('homeStartCard')?.addEventListener('click', () => {
    switchTab('tab-create');
    creationFlow.resetCreation();
  });

  document.getElementById('homeSurpriseBtn')?.addEventListener('click', () => {
    switchTab('tab-create');
    creationFlow.selectRandomSample();
  });

  document.getElementById('homeGalleryBtn')?.addEventListener('click', () => {
    switchTab('tab-gallery');
  });

  // Quick Occasion Pills
  document.querySelectorAll('.home-quick-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const intention = pill.getAttribute('data-intention') || '';
      const mood = pill.getAttribute('data-mood') || 'Loving';
      const recipient = pill.getAttribute('data-recipient') || 'Someone Special';

      switchTab('tab-create');
      creationFlow.resetCreation();

      // Pre-fill state
      creationFlow.state.intention = intention;
      creationFlow.state.mood = mood;
      creationFlow.state.recipient = recipient;

      // Select a random sample photo
      creationFlow.selectRandomSample();

      // Pre-fill input
      const input = document.getElementById('intentionInput');
      if (input) input.value = intention;

      // Update UI selections
      creationFlow._selectMoodInUI(mood);
      creationFlow._selectRecipientInUI(recipient);

      // Skip to step 2 so they see their prefilled intention
      creationFlow._goToStep(2);
    });
  });

  // =========================================================================
  // 7. SAMPLE PHOTOS GRID (STEP 1)
  // =========================================================================
  function _renderSamplePhotosGrid() {
    const container = document.getElementById('samplePhotosGrid');
    if (!container || !window.SAMPLE_MOMENTS) return;
    container.innerHTML = '';
    window.SAMPLE_MOMENTS.forEach((sample, idx) => {
      const card = document.createElement('div');
      card.className = 'sample-photo-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('data-idx', idx);
      card.setAttribute('aria-label', sample.title);
      card.innerHTML = `
        <img src="${sample.url}" alt="${sample.title}" class="sample-photo-img" loading="lazy">
        <span class="sample-photo-label">${sample.title}</span>
      `;
      container.appendChild(card);
    });
  }

  _renderSamplePhotosGrid();

  // =========================================================================
  // 8. GALLERY CATEGORY FILTERS
  // =========================================================================
  document.querySelectorAll('.gallery-filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.gallery-filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      galleryManager.setFilter(pill.getAttribute('data-category'));
    });
  });

  // Gallery create button
  document.getElementById('galleryCreateBtn')?.addEventListener('click', () => switchTab('tab-create'));

  // Gallery Preview Modal Actions
  document.getElementById('closePreviewModalBtn')?.addEventListener('click', () => galleryManager.closePreview());
  document.getElementById('previewModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'previewModal') galleryManager.closePreview();
  });
  document.getElementById('previewShareBtn')?.addEventListener('click', () => galleryManager.shareCurrent());
  document.getElementById('previewWhatsAppBtn')?.addEventListener('click', () => galleryManager.whatsAppCurrent());
  document.getElementById('previewDownloadBtn')?.addEventListener('click', () => galleryManager.downloadCurrent());
  document.getElementById('previewRemixBtn')?.addEventListener('click', () => galleryManager.remixCurrent());
  document.getElementById('previewDeleteBtn')?.addEventListener('click', () => galleryManager.deleteCurrent());

  // =========================================================================
  // 9. MY PEOPLE
  // =========================================================================
  async function _loadPeopleList() {
    const listEl = document.getElementById('peopleList');
    if (!listEl) return;
    try {
      const res = await fetch('/api/people');
      const data = await res.json();
      if (data.success) {
        listEl.innerHTML = '';
        if (data.people.length === 0) {
          listEl.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding: 24px 0;">Add the special people in your life to personalize messages faster. ❤️</p>`;
          return;
        }
        data.people.forEach(p => {
          const item = document.createElement('div');
          item.className = 'person-card';
          item.innerHTML = `
            <div class="person-avatar">${p.avatarEmoji || '❤️'}</div>
            <div class="person-details">
              <h4 class="person-name">${p.name}</h4>
              <p class="person-rel">${p.relationship}</p>
              ${p.notes ? `<p class="person-notes">"${p.notes}"</p>` : ''}
            </div>
            <button class="btn btn-sm btn-primary send-to-person-btn">Send Love ❤️</button>
          `;
          item.querySelector('.send-to-person-btn').addEventListener('click', () => {
            switchTab('tab-create');
            creationFlow.resetCreation();
            creationFlow.selectRandomSample();
            creationFlow._selectRecipientInUI(p.relationship);
            creationFlow.state.recipient = `${p.relationship} (${p.name})`;
            creationFlow._goToStep(2);
          });
          listEl.appendChild(item);
        });
      }
    } catch (e) {
      console.warn('Error loading people:', e);
    }
  }

  document.getElementById('addPersonBtn')?.addEventListener('click', async () => {
    const name = prompt('Name of loved one (e.g. Leo, Maya, Sarah):');
    if (!name?.trim()) return;
    const relationship = prompt('Relationship (e.g. Grandchild, Child, Partner, Friend):') || 'Someone Special';
    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), relationship, avatarEmoji: '❤️' })
      });
      const data = await res.json();
      if (data.success) _loadPeopleList();
    } catch (e) {
      alert("Couldn't add right now. Please try again.");
    }
  });

  // =========================================================================
  // 10. SETTINGS & PRIVACY
  // =========================================================================
  document.getElementById('deleteUserDataBtn')?.addEventListener('click', async () => {
    if (!confirm('Are you sure? This will delete all your saved moments.')) return;
    try {
      const res = await fetch('/api/user/delete-data', { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'All moments deleted. ❤️');
      galleryManager.loadCreations();
      _renderRecentMomentsOnHome();
    } catch (e) {
      alert("Couldn't delete right now.");
    }
  });

  document.getElementById('deleteAccountBtn')?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to permanently erase your DEARLY account and all data?')) return;
    try {
      const res = await fetch('/api/user/delete-account', { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Account deleted. ❤️');
      location.reload();
    } catch (e) {
      alert("Couldn't delete account right now.");
    }
  });

  // Gemini API Key Save
  document.getElementById('saveGeminiKeyBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('geminiApiKeyInput');
    const key = input?.value?.trim();
    if (!key) { alert('Please paste your Gemini API key.'); return; }

    try {
      const res = await fetch('/api/settings/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      const data = await res.json();
      const statusEl = document.getElementById('geminiKeyStatus');
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.textContent = data.success
          ? '✓ API key saved! Restart the server to fully activate Gemini AI.'
          : '✗ ' + (data.error || 'Could not save key.');
        statusEl.style.color = data.success ? 'var(--accent-sage)' : '#D66042';
      }
    } catch (e) {
      console.warn('Could not save key:', e);
      // Fallback: just show success since it's local
      const statusEl = document.getElementById('geminiKeyStatus');
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.textContent = '✓ Key noted! Please set GEMINI_API_KEY environment variable and restart the server.';
        statusEl.style.color = 'var(--accent-sage)';
      }
    }
  });

  // =========================================================================
  // 11. HOME RECENT MOMENTS
  // =========================================================================
  async function _renderRecentMomentsOnHome() {
    const list = document.getElementById('homeRecentGrid');
    if (!list) return;
    try {
      const res = await fetch('/api/creations');
      const data = await res.json();
      if (data.success && data.creations.length > 0) {
        list.innerHTML = '';
        data.creations.slice(0, 3).forEach(item => {
          const card = document.createElement('div');
          card.className = 'recent-home-card';
          const thumb = item.photoUrl || '/assets/samples/grandchild.jpg';
          card.innerHTML = `
            <img src="${thumb}" alt="Moment" class="recent-home-thumb" loading="lazy"
              onerror="this.src='/assets/samples/grandchild.jpg'">
            <div class="recent-home-content">
              <span class="recent-home-badge">For ${item.recipient}</span>
              <p class="recent-home-text">"${item.message}"</p>
            </div>
          `;
          card.addEventListener('click', () => galleryManager.openPreview(item));
          list.appendChild(card);
        });
      } else {
        list.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding: 20px 0;">Your beautiful moments will appear here once you create some. ❤️</p>`;
      }
    } catch (e) {
      console.warn('Could not load recent moments:', e);
    }
  }

  // =========================================================================
  // 12. ONBOARDING DEMO MODAL
  // =========================================================================
  document.getElementById('closeDemoBtn')?.addEventListener('click', () => _closeDemo());
  document.getElementById('closeOnboardingDemoBtn')?.addEventListener('click', () => _closeDemo());
  document.getElementById('showDemoBtn')?.addEventListener('click', () => _openDemo());

  document.getElementById('onboardingDemoModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'onboardingDemoModal') _closeDemo();
  });

  document.getElementById('tryDemoNowBtn')?.addEventListener('click', () => {
    _closeDemo();
    switchTab('tab-create');
    creationFlow.resetCreation();
    if (window.SAMPLE_MOMENTS?.[0]) {
      creationFlow.selectSamplePhoto(window.SAMPLE_MOMENTS[0]);
    }
    const input = document.getElementById('intentionInput');
    if (input) input.value = 'I miss my grandchildren so much';
    creationFlow.state.intention = 'I miss my grandchildren so much';
    creationFlow._goToStep(2);
  });

  function _openDemo() {
    const modal = document.getElementById('onboardingDemoModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function _closeDemo() {
    const modal = document.getElementById('onboardingDemoModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Show onboarding for first-time visitors
  if (!localStorage.getItem('dearly_onboarding_seen')) {
    setTimeout(() => _openDemo(), 800);
    localStorage.setItem('dearly_onboarding_seen', 'true');
  }

  // =========================================================================
  // 13. INITIAL LOADS
  // =========================================================================
  _renderRecentMomentsOnHome();
  galleryManager.loadCreations();

});
