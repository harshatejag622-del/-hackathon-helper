import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useInvites } from '../context/InviteContext';
import { 
  MessageSquare, 
  X, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  Check, 
  Users, 
  Sparkles, 
  Bot, 
  Minimize2, 
  Maximize2,
  Circle,
  Clock
} from 'lucide-react';

export default function TeamChatPanel() {
  const { 
    messages, 
    unreadCount, 
    isChatOpen, 
    toggleChat, 
    closeChat, 
    typingUsers, 
    onlineUsers, 
    sendMessage, 
    sendTyping 
  } = useChat();

  const { currentUser } = useAuth();
  const { acceptedTeammates } = useInvites();

  const [inputMsg, setInputMsg] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen, typingUsers]);

  // Handle typing indicator
  const handleInputChange = (e) => {
    setInputMsg(e.target.value);
    sendTyping(true);

    if (typingTimeout) clearTimeout(typingTimeout);
    const newTimeout = setTimeout(() => {
      sendTyping(false);
    }, 1500);
    setTypingTimeout(newTimeout);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type.startsWith('image/') ? 'image' : 'file',
        dataUrl: event.target?.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputMsg.trim() && !attachment) return;

    const textToSend = inputMsg;
    const fileToSend = attachment;
    setInputMsg('');
    setAttachment(null);
    sendTyping(false);

    await sendMessage(textToSend, fileToSend);
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Button */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all group flex items-center gap-3 border border-white/20"
          aria-label="Open Team War Room Chat"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 animate-pulse" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-white text-[10px] font-black items-center justify-center">
                  {unreadCount}
                </span>
              </span>
            )}
          </div>
          <span className="font-bold text-sm hidden sm:inline">Squad Chat</span>
        </button>
      )}

      {/* Floating Chat Drawer Panel */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full sm:w-[420px] max-h-[620px] h-[85vh] glass-panel-glow rounded-3xl border border-indigo-500/40 shadow-2xl flex flex-col overflow-hidden animate-fade-in backdrop-blur-2xl bg-slate-950/90">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  Squad Group War Room ({acceptedTeammates.length + 1} Members)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Live Multi-Member Group Chat • Real-Time Sync
              </span>
            </div>

            <button
              onClick={closeChat}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Online Teammates Status Strip */}
          <div className="px-4 py-2 bg-slate-950/70 border-b border-white/5 flex items-center gap-3 overflow-x-auto text-[11px]">
            <span className="text-slate-500 shrink-0 font-bold uppercase tracking-wider text-[10px]">
              Group Members:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80"></span>
              <span className="text-emerald-300 font-bold">You</span>
            </div>
            {acceptedTeammates.length > 0 ? (
              acceptedTeammates.map((teammate, idx) => (
                <div key={idx} className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80"></span>
                  <span className="text-slate-200 font-medium">
                    {(teammate.toName || teammate.fromName || 'Teammate').split(' ')[0]}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-slate-500 text-[10px] italic">
                Solo (Send invites in "Find Team" to grow your squad!)
              </span>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUser?.uid || msg.senderName.includes('You');

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Header */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {msg.senderPhoto ? (
                        <img
                          src={msg.senderPhoto}
                          alt={msg.senderName}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">
                          {msg.senderName.charAt(0)}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-slate-300">{msg.senderName}</span>
                      {msg.senderRole && (
                        <span className="text-[9px] px-1.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                          {msg.senderRole}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {/* Attachment preview if present */}
                    {msg.attachment && (
                      <div className="mb-2 p-2 rounded-xl bg-black/30 border border-white/10">
                        {msg.attachment.type === 'image' ? (
                          <img
                            src={msg.attachment.dataUrl}
                            alt={msg.attachment.name}
                            className="max-h-40 rounded-lg object-contain w-full"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-xs">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            <span className="truncate font-medium">{msg.attachment.name}</span>
                            <span className="text-[10px] text-slate-400">({msg.attachment.size})</span>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>

                  {isMe && (
                    <span className="text-[10px] text-slate-500 mt-0.5 px-1">{msg.timestamp}</span>
                  )}
                </div>
              );
            })}

            {/* Live Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic px-1 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>{typingUsers.join(', ')} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Staged attachment preview before send */}
          {attachment && (
            <div className="p-2.5 mx-4 mb-2 bg-slate-900 rounded-xl border border-indigo-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate text-white font-medium">{attachment.name}</span>
                <span className="text-slate-400 text-[10px]">({attachment.size})</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-slate-900/80 flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.json,.txt,.js,.py,.jsx,.ts"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-white/5 transition-colors"
              title="Attach File or Image"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputMsg}
              onChange={handleInputChange}
              placeholder="Type message to squad (press enter)..."
              className="flex-1 px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none text-xs sm:text-sm text-white placeholder-slate-500"
            />

            <button
              type="submit"
              disabled={!inputMsg.trim() && !attachment}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/25"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
