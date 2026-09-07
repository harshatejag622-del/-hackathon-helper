import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { chatManager, INITIAL_CHAT_MESSAGES } from '../services/chatService';

const ChatContext = createContext({});

export const useChat = () => useContext(ChatContext);

// Teammate simulated response presets
const AUTO_REPLIES = [
  {
    senderName: 'Priya Sharma',
    senderRole: 'ML Engineer',
    senderPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    replies: [
      'Awesome progress! The Gemini inference response latency is down to 240ms.',
      'Checking this right now. Integrating our vector embeddings to match the Firestore schema.',
      'Looks great! Let us review the test set accuracy at Milestone 2.'
    ]
  },
  {
    senderName: 'Marcus Vance',
    senderRole: 'Backend Architect',
    senderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    replies: [
      'Got it! API route is tested and deployed on our staging container.',
      'Merging this pull request into main now. CI/CD checks passed!',
      'Database indexes are built. Queries are executing in sub-10ms.'
    ]
  }
];

export function ChatProvider({ children }) {
  const { currentUser, userProfile } = useAuth();

  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [unreadCount, setUnreadCount] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [pulseTick, setPulseTick] = useState(0); // 3D shockwave pulse trigger

  // Online / Offline presence list
  const [onlineUsers, setOnlineUsers] = useState([
    { name: 'Priya Sharma', role: 'ML Engineer', isOnline: true },
    { name: 'Marcus Vance', role: 'Backend Architect', isOnline: true },
    { name: 'Elena Rostova', role: 'UI/UX Designer', isOnline: true },
    { name: 'Aisha Tariq', role: 'DevOps & Cloud', isOnline: false }
  ]);

  // Load chat history on mount
  useEffect(() => {
    async function load() {
      const history = await chatManager.fetchHistory();
      setMessages(history);
    }
    load();

    // Subscribe to incoming messages
    const unsubMessage = chatManager.onMessage((incoming) => {
      setMessages(prev => [...prev, incoming]);
      setPulseTick(p => p + 1); // Trigger 3D pulse
      if (!isChatOpen) {
        setUnreadCount(c => c + 1);
      }
    });

    // Subscribe to typing indicators
    const unsubTyping = chatManager.onTyping(({ username, isTyping }) => {
      setTypingUsers(prev => {
        if (isTyping && !prev.includes(username)) return [...prev, username];
        if (!isTyping) return prev.filter(u => u !== username);
        return prev;
      });
    });

    return () => {
      unsubMessage();
      unsubTyping();
    };
  }, [isChatOpen]);

  // Reset unread count when chat is opened
  const toggleChat = () => {
    setIsChatOpen(prev => {
      const next = !prev;
      if (next) setUnreadCount(0);
      return next;
    });
  };

  const openChat = () => {
    setIsChatOpen(true);
    setUnreadCount(0);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  // Send a message
  const sendMessage = async (text, attachment = null) => {
    if (!text.trim() && !attachment) return;

    const senderName = userProfile?.displayName || currentUser?.displayName || 'You (Leader)';
    const senderRole = userProfile?.preferredRole || 'FullStack';
    const senderPhoto = currentUser?.photoURL || null;

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser?.uid || 'current-user',
      senderName,
      senderRole,
      senderPhoto,
      text: text.trim(),
      attachment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update local state
    setMessages(prev => [...prev, newMsg]);
    setPulseTick(p => p + 1); // Trigger 3D shockwave pulse immediately

    // Broadcast across socket & Firestore
    await chatManager.sendMessage(newMsg);

    // Simulate intelligent teammate response after 2.5 seconds
    setTimeout(() => {
      const responder = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const replyText = responder.replies[Math.floor(Math.random() * responder.replies.length)];

      // Trigger typing indicator first
      setTypingUsers([responder.senderName]);

      setTimeout(() => {
        setTypingUsers([]);
        const replyMsg = {
          id: `msg-${Date.now()}-reply`,
          senderId: `sim-${responder.senderName}`,
          senderName: responder.senderName,
          senderRole: responder.senderRole,
          senderPhoto: responder.senderPhoto,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, replyMsg]);
        setPulseTick(p => p + 1); // 3D pulse on incoming message
        if (!isChatOpen) {
          setUnreadCount(c => c + 1);
        }
      }, 1800);
    }, 1200);

    return newMsg;
  };

  const sendTyping = (isTyping) => {
    const senderName = userProfile?.displayName || currentUser?.displayName || 'You';
    chatManager.emitTyping(senderName, isTyping);
  };

  const value = {
    messages,
    unreadCount,
    isChatOpen,
    toggleChat,
    openChat,
    closeChat,
    typingUsers,
    onlineUsers,
    sendMessage,
    sendTyping,
    pulseTick
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
