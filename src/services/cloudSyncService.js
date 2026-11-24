/**
 * Cloud Real-Time Sync Service
 * Enables instant multi-laptop, cross-device, and cross-tab communication
 * using public zero-config Server-Sent Events (SSE) and HTTP pub/sub.
 */

const SYNC_TOPIC = 'hh_squad_sync_prod_2026';
const NTFY_BASE = `https://ntfy.sh/${SYNC_TOPIC}`;

class CloudSyncService {
  constructor() {
    this.listeners = new Map(); // eventType -> Set of callbacks
    this.processedIds = new Set();
    this.eventSource = null;
    this.broadcastChannel = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // 1. Setup local BroadcastChannel for zero-latency multi-tab on same computer
    try {
      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('hh_cloud_bridge_channel');
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncoming(event.data, false);
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel init notice:", e);
    }

    // 2. Setup Cloud SSE EventSource for cross-laptop & cross-device real-time sync
    this.connectSSE();

    // 3. Fetch past cloud state on launch (restores users, invites, chat across laptops)
    this.pollPastEvents();
  }

  connectSSE() {
    try {
      if (typeof EventSource === 'undefined') return;
      if (this.eventSource) this.eventSource.close();

      this.eventSource = new EventSource(`${NTFY_BASE}/sse`);

      this.eventSource.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.event === 'message' && raw.message) {
            const parsed = JSON.parse(raw.message);
            this.handleIncoming(parsed, false);
          }
        } catch (err) {
          // Non-JSON or heartbeats can be ignored
        }
      };

      this.eventSource.onerror = () => {
        // Automatically reconnect after 3 seconds if disconnected
        setTimeout(() => {
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            this.connectSSE();
          }
        }, 3000);
      };
    } catch (err) {
      console.warn("CloudSync SSE connection error:", err);
    }
  }

  // Poll recent history to catch up on anything sent while offline / on another laptop
  async pollPastEvents() {
    try {
      const res = await fetch(`${NTFY_BASE}/json?poll=1`);
      if (!res.ok) return;
      const text = await res.text();
      const lines = text.trim().split('\n');
      for (const line of lines) {
        if (!line) continue;
        try {
          const raw = JSON.parse(line);
          if (raw.event === 'message' && raw.message) {
            const parsed = JSON.parse(raw.message);
            this.handleIncoming(parsed, true);
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Could not poll cloud sync history:", err);
    }
  }

  // Handle incoming event from SSE or BroadcastChannel
  handleIncoming(payload, isCatchUp = false) {
    if (!payload || !payload.type || !payload.id) return;

    // Deduplicate
    if (this.processedIds.has(payload.id)) return;
    this.processedIds.add(payload.id);

    // Keep processed IDs set bounded
    if (this.processedIds.size > 2000) {
      const first = this.processedIds.values().next().value;
      this.processedIds.delete(first);
    }

    // Auto-persist community users into localStorage so all views see other laptops!
    if (payload.type === 'USER_REGISTERED' || payload.type === 'USER_UPDATED') {
      try {
        const user = payload.data;
        if (user && user.uid) {
          const all = JSON.parse(localStorage.getItem('hh_all_community_users') || '[]');
          const filtered = all.filter(u => u.uid !== user.uid);
          filtered.unshift(user);
          localStorage.setItem('hh_all_community_users', JSON.stringify(filtered));
        }
      } catch (e) {}
    }

    // Auto-persist invites into localStorage
    if (payload.type === 'INVITE_SENT') {
      try {
        const inv = payload.data;
        if (inv && inv.id) {
          const all = JSON.parse(localStorage.getItem('hh_invites') || '[]');
          if (!all.some(i => i.id === inv.id)) {
            all.push(inv);
            localStorage.setItem('hh_invites', JSON.stringify(all));
          }
        }
      } catch (e) {}
    }

    if (payload.type === 'INVITE_ACCEPTED') {
      try {
        const { inviteId } = payload.data;
        const all = JSON.parse(localStorage.getItem('hh_invites') || '[]');
        const updated = all.map(i => i.id === inviteId ? { ...i, status: 'accepted' } : i);
        localStorage.setItem('hh_invites', JSON.stringify(updated));
      } catch (e) {}
    }

    // Auto-persist chat history
    if (payload.type === 'CHAT_MESSAGE') {
      try {
        const msg = payload.data;
        if (msg && msg.id) {
          const all = JSON.parse(localStorage.getItem('hh_team_chat_history') || '[]');
          if (!all.some(m => m.id === msg.id)) {
            all.push(msg);
            localStorage.setItem('hh_team_chat_history', JSON.stringify(all));
          }
        }
      } catch (e) {}
    }

    // Dispatch to registered listeners
    const typeListeners = this.listeners.get(payload.type);
    if (typeListeners) {
      typeListeners.forEach(cb => {
        try {
          cb(payload.data, isCatchUp);
        } catch (e) {
          console.error(`Error in listener for ${payload.type}:`, e);
        }
      });
    }

    const allListeners = this.listeners.get('*');
    if (allListeners) {
      allListeners.forEach(cb => {
        try {
          cb(payload, isCatchUp);
        } catch (e) {}
      });
    }
  }

  // Publish event across all laptops, phones, and tabs
  async publish(type, data) {
    this.init();
    const eventId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const payload = {
      id: eventId,
      type,
      data,
      timestamp: Date.now()
    };

    // Mark as processed locally
    this.processedIds.add(eventId);

    // 1. Post to local BroadcastChannel (for instant multi-tab on same computer)
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(payload);
      }
    } catch (e) {}

    // 2. Post to Cloud relay (for other laptops, phones, Vercel deployments)
    try {
      await fetch(NTFY_BASE, {
        method: 'POST',
        headers: {
          'Title': `HH_${type}`
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("CloudSync publish notice (offline/local only):", err.message);
    }

    return payload;
  }

  // Subscribe to an event type (e.g. 'USER_REGISTERED', 'INVITE_SENT', 'CHAT_MESSAGE')
  on(type, callback) {
    this.init();
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);

    // Return unsubscribe function
    return () => {
      const set = this.listeners.get(type);
      if (set) set.delete(callback);
    };
  }
}

export const cloudSync = new CloudSyncService();
