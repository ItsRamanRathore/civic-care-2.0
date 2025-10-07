import React, { useState, useRef, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const VoiceInput = ({ onTranscript, isActive, onToggle, className = "" }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event?.resultIndex; i < event?.results?.length; i++) {
          const transcriptPart = event?.results?.[i]?.[0]?.transcript;
          if (event?.results?.[i]?.isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        onTranscript?.(fullTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event?.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef?.current) {
        recognitionRef?.current?.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      recognitionRef?.current?.stop();
      setIsListening(false);
      onToggle?.(false);
    } else {
      recognitionRef?.current?.start();
      setIsListening(true);
      onToggle?.(true);
    }
  };

  if (!isSupported) {
    return (
      <div className={`p-3 bg-muted rounded-md border border-border ${className}`}>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Icon name="MicOff" size={16} />
          <span className="text-sm">Voice input not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Mic" size={18} className="text-primary" />
          <span className="text-sm font-medium text-text-primary">Voice Input</span>
        </div>
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          onClick={toggleListening}
          iconName={isListening ? "MicOff" : "Mic"}
          iconPosition="left"
          iconSize={16}
        >
          {isListening ? "Stop Recording" : "Start Recording"}
        </Button>
      </div>

      {isListening && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm text-primary font-medium">Listening...</span>
          </div>
          {transcript && (
            <p className="text-sm text-text-secondary italic">
              "{transcript}"
            </p>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>• Click "Start Recording" and speak clearly</p>
        <p>• Supports English and Hindi languages</p>
        <p>• Your voice will be converted to text automatically</p>
      </div>
    </div>
  );
};

export default VoiceInput;