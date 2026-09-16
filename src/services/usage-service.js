/**
 * DEARLY Server-Side Usage & Credit Engine
 * Enforces usage limits securely on the server.
 * Never trust client-side counters for monetization.
 */

const fs = require('node:fs');
const path = require('node:path');

const DATA_PATH = path.join(__dirname, '../../data/users.json');

class UsageService {
  constructor() {
    this.users = this._loadUsers();
  }

  _loadUsers() {
    try {
      if (fs.existsSync(DATA_PATH)) {
        return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
      }
    } catch (e) {
      console.error('Error loading users:', e);
    }
    return {};
  }

  _saveUsers() {
    try {
      fs.writeFileSync(DATA_PATH, JSON.stringify(this.users, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving users:', e);
    }
  }

  getUser(userId = 'default_user') {
    if (!this.users[userId]) {
      this.users[userId] = {
        id: userId,
        name: 'Beloved Friend',
        email: 'user@example.com',
        plan: 'free',
        planName: 'Free Weekly Moment',
        freeCreationsRemaining: 1,
        paidCreationsBalance: 0,
        currentWeekReset: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        totalCreated: 0,
        createdAt: new Date().toISOString()
      };
      this._saveUsers();
    }
    return this.users[userId];
  }

  checkCanCreate(userId = 'default_user', { isArtistic = false } = {}) {
    const user = this.getUser(userId);

    // Check plan specifics
    if (user.plan === 'creative_pro') {
      // 10 creations/day + artistic included
      return { allowed: true, reason: 'Included with Creative Pro' };
    }

    if (user.plan === 'creator') {
      // 20 creations/mo
      if (isArtistic && user.paidCreationsBalance < 1) {
        return {
          allowed: false,
          requiresPayment: true,
          price: 1.00,
          reason: 'Artistic styles are +$1.00 or included in Creative Pro'
        };
      }
      return { allowed: true, reason: 'Included in Creator Plan' };
    }

    // Free plan check
    if (user.freeCreationsRemaining > 0 && !isArtistic) {
      return { allowed: true, reason: 'Free weekly creation' };
    }

    if (user.paidCreationsBalance > 0) {
      return { allowed: true, reason: 'Paid creation balance' };
    }

    if (isArtistic) {
      return {
        allowed: false,
        requiresPayment: true,
        price: 1.99, // $0.99 base + $1.00 artistic
        reason: 'Artistic creations are $1.00 extra (or upgrade to Creative Pro)'
      };
    }

    return {
      allowed: false,
      requiresPayment: true,
      price: 0.99,
      reason: "You've used your free creation this week. Create this one for $0.99 or unlock a plan."
    };
  }

  consumeCreation(userId = 'default_user', { isArtistic = false } = {}) {
    const check = this.checkCanCreate(userId, { isArtistic });
    if (!check.allowed) {
      return { success: false, ...check };
    }

    const user = this.getUser(userId);

    if (user.plan === 'creative_pro') {
      user.totalCreated = (user.totalCreated || 0) + 1;
    } else if (user.plan === 'creator') {
      user.totalCreated = (user.totalCreated || 0) + 1;
      if (isArtistic) {
        user.paidCreationsBalance = Math.max(0, user.paidCreationsBalance - 1);
      }
    } else {
      // Free plan
      if (user.freeCreationsRemaining > 0 && !isArtistic) {
        user.freeCreationsRemaining -= 1;
      } else if (user.paidCreationsBalance > 0) {
        user.paidCreationsBalance -= 1;
      }
      user.totalCreated = (user.totalCreated || 0) + 1;
    }

    this._saveUsers();
    return {
      success: true,
      user
    };
  }

  updatePlan(userId = 'default_user', planId) {
    const user = this.getUser(userId);
    user.plan = planId;

    if (planId === 'creator') {
      user.planName = 'Creator ($9.99/mo)';
    } else if (planId === 'creative_pro') {
      user.planName = 'Creative Pro ($19.99/mo)';
    } else {
      user.plan = 'free';
      user.planName = 'Free Weekly Moment';
    }

    this._saveUsers();
    return user;
  }

  purchaseSingle(userId = 'default_user', amount = 1) {
    const user = this.getUser(userId);
    user.paidCreationsBalance = (user.paidCreationsBalance || 0) + amount;
    this._saveUsers();
    return user;
  }

  deleteUserData(userId = 'default_user') {
    if (this.users[userId]) {
      delete this.users[userId];
      this._saveUsers();
      return true;
    }
    return false;
  }
}

module.exports = new UsageService();
