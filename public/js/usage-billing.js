/**
 * DEARLY - Usage & Billing Client Controller
 * Manages user limits, free weekly allowance status pill, and honest upgrade modals.
 */

class UsageBillingManager {
  constructor() {
    this.user = null;
    this.onUserUpdate = null;
  }

  async fetchSession() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      if (data.success) {
        this.user = data.user;
        this.renderUsageStatus();
        if (this.onUserUpdate) this.onUserUpdate(this.user);
        return this.user;
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
    }
    return null;
  }

  renderUsageStatus() {
    const pill = document.getElementById('usagePill');
    if (!pill || !this.user) return;

    if (this.user.plan === 'creative_pro') {
      pill.innerHTML = `
        <span class="pill-dot pro"></span>
        <span class="pill-text">Creative Pro • Unlimited Magic ✨</span>
      `;
      return;
    }

    if (this.user.plan === 'creator') {
      pill.innerHTML = `
        <span class="pill-dot creator"></span>
        <span class="pill-text">Creator Plan Active ❤️</span>
      `;
      return;
    }

    // Free plan
    if (this.user.freeCreationsRemaining > 0) {
      pill.innerHTML = `
        <span class="pill-icon">❤️</span>
        <span class="pill-text">1 free creation available this week</span>
      `;
    } else if (this.user.paidCreationsBalance > 0) {
      pill.innerHTML = `
        <span class="pill-icon">✨</span>
        <span class="pill-text">${this.user.paidCreationsBalance} moment credit${this.user.paidCreationsBalance > 1 ? 's' : ''} available</span>
      `;
    } else {
      pill.innerHTML = `
        <span class="pill-icon">💌</span>
        <span class="pill-text">Free creation used • Make another for $0.99</span>
      `;
    }
  }

  async checkCanCreate(isArtistic = false) {
    try {
      const res = await fetch('/api/can-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArtistic })
      });
      return await res.json();
    } catch (err) {
      return { allowed: true };
    }
  }

  showUpgradeModal(preselectedPlan = 'creator', contextReason = '') {
    const modal = document.getElementById('pricingModal');
    if (!modal) return;

    const reasonEl = document.getElementById('pricingReasonText');
    if (reasonEl) {
      reasonEl.textContent = contextReason || 'Choose how you would like to continue creating beautiful moments for people you love.';
    }

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }

  hideUpgradeModal() {
    const modal = document.getElementById('pricingModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  async selectPlan(planId) {
    try {
      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId })
      });
      const data = await res.json();
      if (data.success) {
        this.user = data.user;
        this.renderUsageStatus();
        this.hideUpgradeModal();
        alert(`Thank you! You are now enjoying the ${data.user.planName}. ❤️`);
        if (this.onUserUpdate) this.onUserUpdate(this.user);
      }
    } catch (err) {
      alert("We couldn't process that just yet. Let's try again. ❤️");
    }
  }

  async buySingleCreation() {
    try {
      const res = await fetch('/api/billing/buy-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        this.user = data.user;
        this.renderUsageStatus();
        this.hideUpgradeModal();
        alert('Thank you! 1 moment credit added ($0.99). ❤️');
        if (this.onUserUpdate) this.onUserUpdate(this.user);
      }
    } catch (err) {
      alert("We couldn't process that just yet. Let's try again. ❤️");
    }
  }
}

window.UsageBillingManager = UsageBillingManager;
