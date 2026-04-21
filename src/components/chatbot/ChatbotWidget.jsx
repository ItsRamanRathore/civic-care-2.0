import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, RotateCcw, Send, Mic, MicOff, Bot,
  Sparkles, ChevronDown, Globe, Shield, Zap
} from 'lucide-react';
import chatbotService from '../../services/chatbotService';
import voiceService from '../../services/voiceService';
import { useAuth } from '../../contexts/AuthContext';
import { useCivicIssues } from '../../hooks/useCivicIssues';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-IN');
  const [interimText, setInterimText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { user } = useAuth();
  // Fetch the current user's own issues (not global) for accurate chatbot context
  const { issues: myIssues, stats: myStats } = useCivicIssues(user ? { reporter_id: user.id } : {});

  // Build a user-specific stats summary for the chatbot
  const userChatStats = user && myIssues ? {
    total: myIssues.length,
    resolved: myIssues.filter(i => i.status === 'resolved').length,
    inProgress: myIssues.filter(i => i.status === 'in_progress').length,
    pending: myIssues.filter(i => ['submitted', 'in_review'].includes(i.status)).length,
  } : null;

  // Initialize greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = chatbotService.getGreeting();
      const quickReplies = chatbotService.getQuickReplies();
      setMessages([{ id: 1, type: 'bot', message: greeting, quickReplies, timestamp: new Date() }]);
    }
  }, [messages.length]);

  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener('openChatbot', handleOpenChatbot);
    return () => window.removeEventListener('openChatbot', handleOpenChatbot);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage = { id: Date.now(), type: 'user', message: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const detectedLanguage = voiceService.detectLanguage(text);
      const languageCode = detectedLanguage === 'hi-IN' ? 'hi' : 'en';
      const userContextBundle = user ? { user, stats: userChatStats } : null;
      const response = await chatbotService.processMessage(text, languageCode, userContextBundle);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: response.message,
        quickReplies: response.quickReplies,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const greeting = chatbotService.getGreeting();
    const quickReplies = chatbotService.getQuickReplies();
    setMessages([{ id: Date.now(), type: 'bot', message: greeting, quickReplies, timestamp: new Date() }]);
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const startVoiceInput = () => {
    if (!voiceService.isSupported()) return;
    setIsListening(true);
    setInterimText('');
    voiceService.setLanguage(voiceLanguage);
    voiceService.getVoiceInput(
      (progress) => { setInterimText(progress.text); setInputValue(progress.text); },
      (result) => { setIsListening(false); setInterimText(''); if (result?.text?.trim()) handleSendMessage(result.text.trim()); },
      (error) => { setIsListening(false); setInterimText(''); console.error('Voice error:', error); }
    );
  };

  const stopVoiceInput = () => { voiceService.stopListening(); setIsListening(false); setInterimText(''); };

  const toggleVoiceLanguage = () => {
    const newLang = voiceLanguage === 'en-IN' ? 'hi-IN' : 'en-IN';
    setVoiceLanguage(newLang);
    voiceService.setLanguage(newLang);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="w-[380px] flex flex-col rounded-[28px] overflow-hidden"
            style={{
              height: '580px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)'
            }}
          >
            {/* Header */}
            <div
              className="relative flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #6d28d9 100%)' }}
            >
              {/* Subtle radial glow */}
              <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.2), transparent 60%)' }} />

              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center ring-2 ring-white/20 shadow-inner">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-black text-sm tracking-tight">Civic Care AI</h3>
                    <span className="px-1.5 py-0.5 bg-white/15 text-white/90 text-[9px] font-black uppercase tracking-widest rounded-md">Gemini</span>
                  </div>
                  <p className="text-white/70 text-[10px] font-medium mt-0.5">Platform Assistant · Always available</p>
                </div>
              </div>

              <div className="relative flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-red-500/60 text-white/70 hover:text-white flex items-center justify-center transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Context pill if logged in */}
            {user && (
              <div className="flex-shrink-0 px-4 pt-3 pb-0" style={{ background: '#f8faff' }}>
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <Shield size={12} className="text-indigo-500 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">
                    Personalized context active — {user.full_name || user.email}
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              style={{
                background: 'linear-gradient(180deg, #f8faff 0%, #f1f5ff 100%)',
                scrollbarWidth: 'thin',
                scrollbarColor: '#c7d2fe transparent'
              }}
            >
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                  >
                    {/* Bot avatar */}
                    {message.type === 'bot' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md mb-1">
                        <Sparkles size={12} className="text-white" />
                      </div>
                    )}

                    <div className={`flex flex-col gap-2 ${message.type === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      {/* Bubble */}
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium ${
                          message.type === 'user'
                            ? 'text-white rounded-br-sm'
                            : 'text-slate-800 rounded-bl-sm border border-slate-100'
                        }`}
                        style={
                          message.type === 'user'
                            ? { background: 'linear-gradient(135deg, #4f46e5, #6d28d9)', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }
                            : { background: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }
                        }
                      >
                        {message.message}
                      </div>

                      {/* Quick reply chips */}
                      {message.type === 'bot' && message.quickReplies?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {message.quickReplies.map((reply, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(reply)}
                              className="px-3 py-1.5 bg-white border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="text-[9px] text-slate-400 font-medium px-1">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex items-end gap-2"
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <span
                          key={i}
                          className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div
              className="flex-shrink-0 p-4 border-t border-slate-100"
              style={{ background: '#ffffff' }}
            >
              {/* Listening indicator */}
              {isListening && (
                <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                    {interimText || 'Listening... speak now'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Language toggle */}
                <button
                  onClick={toggleVoiceLanguage}
                  title="Toggle voice language"
                  className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all flex-shrink-0"
                >
                  <Globe size={14} className="text-slate-500" />
                </button>

                {/* Input */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the platform..."
                    disabled={isTyping}
                    className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all font-medium"
                  />
                </div>

                {/* Voice btn */}
                {voiceService.isSupported() && (
                  <button
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    disabled={isTyping}
                    title={isListening ? 'Stop voice' : 'Voice input'}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      isListening
                        ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                        : 'border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  </button>
                )}

                {/* Send btn */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #6d28d9)', boxShadow: '0 4px 14px rgba(79,70,229,0.4)' }}
                >
                  <Send size={14} className="text-white" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-1.5">
                <Zap size={9} className="text-slate-300" />
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                  Powered by Gemini · Civic topics only
                </span>
                <Zap size={9} className="text-slate-300" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Trigger Button ── */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        title="Open Civic Care AI Assistant"
        className="relative w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #64748b, #475569)'
            : 'linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #6d28d9 100%)',
          boxShadow: isOpen
            ? '0 8px 24px rgba(0,0,0,0.2)'
            : '0 8px 30px rgba(79,70,229,0.5), 0 0 0 4px rgba(79,70,229,0.12)'
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown size={24} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={26} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification dot */}
        {!isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </motion.span>
        )}
      </motion.button>
    </div>
  );
};

export default ChatbotWidget;