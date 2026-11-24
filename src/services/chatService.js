import { io } from 'socket.io-client';
import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  isConfigured 
} from '../firebase/config';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { cloudSync } from './cloudSyncService';

const SOCKET_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3001';

// Initial system welcome message for group chat
export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-system-welcome',
    senderId: 'system',
    senderName: '🚀 Hackathon System',
    senderRole: 'Group Channel',
    senderPhoto: null,
    text: 'Welcome to your Squad Group War Room! All messages sent here are synced in real time across tabs and devices.',
    timestamp: 'Just now'
  }
];

class ChatSocketManager {
  constructor() {
    this.socket = null;
    this.broadcastChannel = null;
    this.messageListeners = new Set();
    this.typingListeners = new Set();
    this.init();
  }

  init() {
    // 1. BroadcastChannel for instant zero-config multi-tab communication
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('hh_team_chat_channel');
        this.broadcastChannel.onmessage = (event) => {
          const { type, data } = event.data;
          if (type === 'new_message') {
            this.messageListeners.forEach(cb => cb(data));
          } else if (type === 'typing') {
            this.typingListeners.forEach(cb => cb(data));
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel init notice:", e);
    }

    // 2. Socket.io Client
    try {
      this.socket = io(SOCKET_URL, {
        autoConnect: false,
        reconnectionAttempts: 2,
        timeout: 3000
      });

      this.socket.on('connect', () => {
        console.log("Socket.io connected to chat server");
      });

      this.socket.on('message', (msg) => {
        this.messageListeners.forEach(cb => cb(msg));
      });

      this.socket.on('typing', (data) => {
        this.typingListeners.forEach(cb => cb(data));
      });
    } catch (err) {
      console.warn("Socket.io init note:", err.message);
    }

    // 3. Cross-Laptop CloudSync for multi-device chatting
    try {
      cloudSync.on('CHAT_MESSAGE', (incoming) => {
        if (!incoming || !incoming.id) return;
        this.messageListeners.forEach(cb => cb(incoming));
      });
    } catch (e) {}
  }

  // Subscribe to new messages
  onMessage(callback) {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  // Subscribe to typing indicators
  onTyping(callback) {
    this.typingListeners.add(callback);
    return () => this.typingListeners.delete(callback);
  }

  // Broadcast message across Socket.io, BroadcastChannel and Firestore
  async sendMessage(messageData) {
    // 1. Socket.io emit if connected
    if (this.socket && this.socket.connected) {
      this.socket.emit('message', messageData);
    }

    // 2. BroadcastChannel
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'new_message',
        data: messageData
      });
    }

    // 3. Save to Firestore
    try {
      if (db && isConfigured) {
        await addDoc(collection(db, 'team_messages'), {
          ...messageData,
          serverCreatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn("Could not save to live Firestore messages, stored locally:", err.message);
    }

    // 4. Save to localStorage
    const stored = JSON.parse(localStorage.getItem('hh_team_chat_history') || '[]');
    stored.push(messageData);
    localStorage.setItem('hh_team_chat_history', JSON.stringify(stored));

    // 5. Broadcast across all laptops & devices via CloudSync
    cloudSync.publish('CHAT_MESSAGE', messageData);

    return messageData;
  }

  // Send typing event
  emitTyping(username, isTyping) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing', { username, isTyping });
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'typing',
        data: { username, isTyping }
      });
    }
  }

  // Load chat history from Firestore or local cache
  async fetchHistory() {
    let history = [];

    try {
      if (db && isConfigured) {
        const q = query(collection(db, 'team_messages'), orderBy('timestamp', 'asc'), limit(50));
        const snap = await getDocs(q);
        snap.forEach(docSnap => {
          history.push({ ...docSnap.data(), id: docSnap.id });
        });
      }
    } catch (e) {
      console.warn("Using local chat history cache:", e.message);
    }

    if (history.length === 0) {
      const cached = localStorage.getItem('hh_team_chat_history');
      if (cached) {
        history = JSON.parse(cached);
      } else {
        history = INITIAL_CHAT_MESSAGES;
        localStorage.setItem('hh_team_chat_history', JSON.stringify(history));
      }
    }

    return history;
  }
}

export const chatManager = new ChatSocketManager();
