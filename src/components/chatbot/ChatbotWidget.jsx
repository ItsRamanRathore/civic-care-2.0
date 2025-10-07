import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import chatbotService from '../../services/chatbotService';
import voiceService from '../../services/voiceService';

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

  // Initialize with greeting message
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = chatbotService.getGreeting();
      const quickReplies = chatbotService.getQuickReplies();
      setMessages([{
        id: 1,
        type: 'bot',
        message: greeting,
        quickReplies: quickReplies,
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  // Listen for custom events to open chatbot
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
    };

    window.addEventListener('openChatbot', handleOpenChatbot);
    return () => {
      window.removeEventListener('openChatbot', handleOpenChatbot);
    };
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      // Detect language of the input text
      const detectedLanguage = voiceService.detectLanguage(text);
      const languageCode = detectedLanguage === 'hi-IN' ? 'hi' : 'en';
      
      const response = chatbotService.processMessage(text, languageCode);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: response.message,
        quickReplies: response.quickReplies,
        relatedQuestions: response.relatedQuestions,
        timestamp: new Date(),
        detectedLanguage: languageCode
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const clearChat = () => {
    setMessages([]);
    const greeting = chatbotService.getGreeting();
    const quickReplies = chatbotService.getQuickReplies();
    setMessages([{
      id: Date.now(),
      type: 'bot',
      message: greeting,
      quickReplies: quickReplies,
      timestamp: new Date()
    }]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Voice input handlers
  const startVoiceInput = async () => {
    if (!voiceService.isSupported()) {
      alert('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    setIsListening(true);
    setInterimText('');
    voiceService.setLanguage(voiceLanguage);

    voiceService.getVoiceInput(
      // Progress callback
      (progress) => {
        setInterimText(progress.text);
        setInputValue(progress.text);
      },
      // Complete callback
      (result) => {
        setIsListening(false);
        setInterimText('');
        if (result && result.text && result.text.trim()) {
          handleSendMessage(result.text.trim());
        }
      },
      // Error callback
      (error) => {
        setIsListening(false);
        setInterimText('');
        console.error('Voice input error:', error);
        
        // Add error message to chat
        const errorMessage = {
          id: Date.now(),
          type: 'bot',
          message: `Voice input error: ${error}. Please try typing your question instead.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    );
  };

  const stopVoiceInput = () => {
    voiceService.stopListening();
    setIsListening(false);
    setInterimText('');
  };

  const toggleVoiceLanguage = () => {
    const newLang = voiceLanguage === 'en-IN' ? 'hi-IN' : 'en-IN';
    setVoiceLanguage(newLang);
    voiceService.setLanguage(newLang);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-card border border-border rounded-lg shadow-modal flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Icon name="MessageCircle" size={16} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Civic Care Assistant</h3>
                <p className="text-xs opacity-90">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-primary-foreground hover:bg-primary-foreground/20 p-1"
                title="Clear chat"
              >
                <Icon name="RotateCcw" size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChatbot}
                className="text-primary-foreground hover:bg-primary-foreground/20 p-1"
                title="Close chat"
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-2'
                        : 'bg-muted text-muted-foreground mr-2'
                    }`}
                  >
                    {message.message}
                  </div>
                  
                  {/* Quick Replies */}
                  {message.type === 'bot' && message.quickReplies && (
                    <div className="mt-2 space-y-1">
                      {message.quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(reply)}
                          className="block w-full text-left text-xs p-2 bg-background border border-border rounded hover:bg-muted transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Related Questions */}
                  {message.type === 'bot' && message.relatedQuestions && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Related questions:</p>
                      {message.relatedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(question)}
                          className="block w-full text-left text-xs p-2 bg-background border border-border rounded hover:bg-muted transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-1 px-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground p-3 rounded-lg mr-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            {/* Voice Language Selector */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Icon name="Mic" size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Voice Language:</span>
                <button
                  onClick={toggleVoiceLanguage}
                  className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                >
                  {voiceService.getSupportedLanguages()[voiceLanguage]?.name}
                </button>
              </div>
              
              {isListening && (
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </div>
              )}
            </div>

            {/* Input Row */}
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening... Speak now" : "Type your question..."}
                className={`flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  isListening ? 'border-green-400 bg-green-50' : ''
                }`}
                disabled={isTyping}
              />
              
              {/* Voice Input Button */}
              {voiceService.isSupported() && (
                <Button
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  disabled={isTyping}
                  size="sm"
                  variant={isListening ? "default" : "outline"}
                  className={`px-3 ${isListening ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  <Icon
                    name={isListening ? "MicOff" : "Mic"}
                    size={14}
                    className={isListening ? "text-white" : ""}
                  />
                </Button>
              )}
              
              {/* Send Button */}
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
                className="px-3"
              >
                <Icon name="Send" size={14} />
              </Button>
            </div>

            {/* Interim Text Display */}
            {interimText && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                <div className="flex items-center space-x-2">
                  <Icon name="Mic" size={12} className="text-green-600" />
                  <span className="italic">{interimText}</span>
                </div>
              </div>
            )}

            {/* Voice Instructions */}
            {voiceService.isSupported() && (
              <div className="mt-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Icon name="Info" size={10} />
                  <span>
                    Click the microphone to speak in {voiceService.getSupportedLanguages()[voiceLanguage]?.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChatbot}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-muted text-muted-foreground hover:bg-muted/80'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse'
        }`}
        title="Open Civic Care Assistant"
      >
        {isOpen ? (
          <Icon name="X" size={20} />
        ) : (
          <Icon name="MessageCircle" size={20} />
        )}
      </button>

      {/* Notification Badge */}
      {!isOpen && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
          !
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;