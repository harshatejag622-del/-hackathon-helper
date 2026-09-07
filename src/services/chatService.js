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

const SOCKET_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3001';

// Initial welcoming squad messages
export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-seed-1',
    senderId: 'candidate_priya_sharma',
    senderName: 'Priya Sharma',
    senderRole: 'ML Engineer',
    senderPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    text: 'Hey team! 🚀 I just set up our PyTorch data preprocessing pipeline for the health telemetry model.',
    timestamp: new Date(Date.now() - 3600 * 1000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 'msg-seed-2',
    senderId: 'candidate_marcus_vance',
    senderName: 'Marcus Vance',
    senderRole: 'Backend Architect',
    senderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    text: 'Nice! The FastAPI endpoints and Firestore authentication guards are live. Ready to connect whenever frontend is ready.',
    timestamp: new Date(Date.now() - 3600 * 1000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 'msg-seed-3',
    senderId: 'candidate_elena_rostova',
    senderName: 'Elena Rostova',
    senderRole: 'UI/UX Designer',
    senderPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    text: 'Figma wireframes are locked in! Check the 3D dashboard design tokens in the team repo. Let us crush this 48h sprint! 🔥',
    timestamp: new Date(Date.now() - 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
