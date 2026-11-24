import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { chatManager, INITIAL_CHAT_MESSAGES } from '../services/chatService';

const ChatContext = createContext({});

export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }) {
  const { currentUser, userProfile, isTeamLead } = useAuth();

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
      setMessages(prev => {
        if (prev.some(m => m.id === incoming.id)) return prev;
        return [...prev, incoming];
      });
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

  // Reload complete past message history
  const reloadHistory = async () => {
    try {
      const history = await chatManager.fetchHistory();
      setMessages(history);
    } catch (e) {}
  };

  // Reset unread count & refresh all past messages when chat is opened
  const toggleChat = () => {
    setIsChatOpen(prev => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
        reloadHistory();
      }
      return next;
    });
  };

  const openChat = () => {
    setIsChatOpen(true);
    setUnreadCount(0);
    reloadHistory();
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  // Send a message
  const sendMessage = async (text, attachment = null) => {
    if (!text.trim() && !attachment) return;

    const baseName = userProfile?.displayName || currentUser?.displayName || 'Teammate';
    const senderName = isTeamLead ? `${baseName} (Lead)` : baseName;
    const senderRole = isTeamLead ? '👑 Team Lead' : (userProfile?.preferredRole || 'Developer');
    const senderPhoto = currentUser?.photoURL || null;

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser?.uid || `user-${Math.random().toString(36).substring(2, 6)}`,
      senderName,
      senderRole,
      senderPhoto,
      isLead: !!isTeamLead,
      text: text.trim(),
      attachment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update local state
    setMessages(prev => [...prev, newMsg]);
    setPulseTick(p => p + 1); // Trigger 3D shockwave pulse immediately

    // Broadcast across socket & Firestore & BroadcastChannel
    await chatManager.sendMessage(newMsg);

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
