// Voice recognition service with Hindi and English support
export class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentLanguage = 'en-IN'; // Default to English (India)
    this.supportedLanguages = {
      'en-IN': { name: 'English (India)', code: 'en-IN' },
      'hi-IN': { name: 'हिंदी (भारत)', code: 'hi-IN' }
    };
    
    // Initialize speech recognition if available
    this.initializeSpeechRecognition();
  }

  // Initialize Web Speech API
  initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition settings
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = this.currentLanguage;

    return true;
  }

  // Check if speech recognition is supported
  isSupported() {
    return this.recognition !== null;
  }

  // Set language for recognition
  setLanguage(languageCode) {
    if (this.supportedLanguages[languageCode]) {
      this.currentLanguage = languageCode;
      if (this.recognition) {
        this.recognition.lang = languageCode;
      }
      console.log(`Voice recognition language set to: ${this.supportedLanguages[languageCode].name}`);
    }
  }

  // Get current language
  getCurrentLanguage() {
    return this.supportedLanguages[this.currentLanguage];
  }

  // Get all supported languages
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  // Start listening for voice input
  startListening(onResult, onError, onEnd) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    if (this.isListening) {
      console.warn('Already listening...');
      return;
    }

    this.isListening = true;
    let finalTranscript = '';
    let interimTranscript = '';

    // Handle results
    this.recognition.onresult = (event) => {
      interimTranscript = '';
      finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Call result callback with both interim and final results
      onResult?.({
        final: finalTranscript,
        interim: interimTranscript,
        isComplete: finalTranscript.length > 0
      });
    };

    // Handle errors
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      
      let errorMessage = 'Voice recognition error occurred';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Voice recognition error: ${event.error}`;
      }
      
      onError?.(errorMessage);
    };

    // Handle end of recognition
    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    // Start recognition
    try {
      this.recognition.start();
      console.log(`Started voice recognition in ${this.getCurrentLanguage().name}`);
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      this.isListening = false;
      onError?.('Failed to start voice recognition');
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('Voice recognition stopped');
    }
  }

  // Check if currently listening
  getIsListening() {
    return this.isListening;
  }

  // Detect language of text (simple heuristic)
  detectLanguage(text) {
    // Simple detection based on character patterns
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasHindi = hindiPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasHindi && !hasEnglish) {
      return 'hi-IN';
    } else if (hasEnglish && !hasHindi) {
      return 'en-IN';
    } else if (hasHindi && hasEnglish) {
      // Mixed language, prefer current setting
      return this.currentLanguage;
    } else {
      // Default to current language
      return this.currentLanguage;
    }
  }

  // Request microphone permission
  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  // Check if microphone permission is granted
  async checkMicrophonePermission() {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      return result.state === 'granted';
    } catch (error) {
      // Fallback: try to access microphone
      return await this.requestMicrophonePermission();
    }
  }

  // Get voice input with automatic language detection
  async getVoiceInput(onProgress, onComplete, onError) {
    // Check microphone permission first
    const hasPermission = await this.checkMicrophonePermission();
    if (!hasPermission) {
      onError?.('Microphone permission is required for voice input');
      return;
    }

    // Start listening
    this.startListening(
      (result) => {
        // Progress callback with interim results
        onProgress?.({
          text: result.interim || result.final,
          isComplete: result.isComplete,
          language: this.detectLanguage(result.interim || result.final)
        });
      },
      (error) => {
        onError?.(error);
      },
      () => {
        // End callback - recognition stopped
        console.log('Voice recognition ended');
      }
    );
  }
}

// Create and export singleton instance
export const voiceService = new VoiceService();
export default voiceService;