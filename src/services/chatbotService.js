// Chatbot service for Civic Care platform
export class ChatbotService {
  constructor() {
    // Hindi translations for common responses
    this.hindiResponses = {
      greeting: [
        "नमस्ते! मैं आपका सिविक केयर सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        "हैलो! मैं यहां आपके नागरिक मुद्दों के सवालों में मदद करने के लिए हूं। आप क्या जानना चाहते हैं?",
        "सिविक केयर में आपका स्वागत है! मैं मुद्दों की रिपोर्टिंग, शिकायतों की ट्रैकिंग और अन्य चीजों में आपकी मदद कर सकता हूं।"
      ],
      fallback: [
        "मुझे उस विशिष्ट प्रश्न के बारे में यकीन नहीं है, लेकिन मैं मुद्दों की रिपोर्टिंग, शिकायतों की ट्रैकिंग या सामान्य प्लेटफॉर्म जानकारी में आपकी मदद कर सकता हूं।",
        "यह एक बेहतरीन सवाल है! हालांकि मेरे पास इसका विशिष्ट उत्तर नहीं है, मैं मुद्दा रिपोर्टिंग, खाता प्रश्न या प्लेटफॉर्म उपयोग में मदद कर सकता हूं।"
      ]
    };

    this.faqs = [
      // Issue Reporting FAQs
      {
        id: 1,
        keywords: ['report', 'issue', 'complaint', 'problem', 'submit', 'file'],
        question: "How do I report a civic issue?",
        answer: "You can report civic issues by clicking the 'Report an Issue' button on the homepage or navigating to the Issue Reporting form. You'll need to provide details about the issue, location, and optionally upload photos.",
        category: "reporting"
      },
      {
        id: 2,
        keywords: ['track', 'status', 'progress', 'update', 'follow'],
        question: "How can I track my reported issue?",
        answer: "You can track your issues by visiting the 'Browse Issues' page or your citizen dashboard. Each issue has a unique ID and status updates that show the progress of resolution.",
        category: "tracking"
      },
      {
        id: 3,
        keywords: ['photo', 'image', 'picture', 'upload', 'attach'],
        question: "Can I attach photos to my issue report?",
        answer: "Yes! Adding photos helps authorities understand the issue better. You can upload multiple images when reporting an issue. Make sure images are clear and show the problem clearly.",
        category: "reporting"
      },
      
      // Account & Access FAQs
      {
        id: 4,
        keywords: ['account', 'register', 'signup', 'login', 'password'],
        question: "Do I need an account to report issues?",
        answer: "While you can browse public issues without an account, creating an account allows you to report issues, track your submissions, and receive updates on progress.",
        category: "account"
      },
      {
        id: 5,
        keywords: ['anonymous', 'private', 'identity', 'name'],
        question: "Can I report issues anonymously?",
        answer: "Yes, you can choose to make your reports anonymous. However, providing contact information helps authorities reach out for clarification if needed.",
        category: "privacy"
      },
      
      // Issue Categories FAQs
      {
        id: 6,
        keywords: ['categories', 'types', 'roads', 'water', 'sanitation', 'electricity'],
        question: "What types of issues can I report?",
        answer: "You can report various civic issues including: Roads & Infrastructure, Water Supply, Sanitation & Waste Management, Street Lighting, Public Safety, Parks & Recreation, and Environmental concerns.",
        category: "categories"
      },
      {
        id: 7,
        keywords: ['emergency', 'urgent', 'priority', 'immediate'],
        question: "What should I do for emergency situations?",
        answer: "For immediate emergencies, please call emergency services (100, 101, 102, 108). This platform is for non-emergency civic issues that require municipal attention.",
        category: "emergency"
      },
      
      // Resolution Process FAQs
      {
        id: 8,
        keywords: ['time', 'long', 'resolve', 'fix', 'duration'],
        question: "How long does it take to resolve issues?",
        answer: "Resolution time varies by issue type and complexity. Simple issues like street lighting may take 2-5 days, while infrastructure problems may take weeks. You'll receive status updates throughout the process.",
        category: "resolution"
      },
      {
        id: 9,
        keywords: ['department', 'authority', 'responsible', 'who'],
        question: "Which department handles my issue?",
        answer: "Issues are automatically assigned to relevant departments based on category. You can see the assigned department in your issue details and track their progress.",
        category: "departments"
      },
      
      // Platform Usage FAQs
      {
        id: 10,
        keywords: ['map', 'location', 'gps', 'address'],
        question: "How do I specify the location of an issue?",
        answer: "You can specify location by entering an address, using GPS coordinates, or selecting a location on the interactive map. Accurate location helps authorities respond faster.",
        category: "location"
      },
      {
        id: 11,
        keywords: ['vote', 'support', 'upvote', 'important'],
        question: "Can I support issues reported by others?",
        answer: "Yes! You can upvote issues or mark them as important to show community support. This helps prioritize issues that affect many citizens.",
        category: "community"
      },
      {
        id: 12,
        keywords: ['notification', 'updates', 'email', 'sms'],
        question: "Will I get notifications about my issues?",
        answer: "Yes, you'll receive notifications via email and SMS (if provided) when your issue status changes, gets assigned to a department, or is resolved.",
        category: "notifications"
      },
      
      // Technical Support FAQs
      {
        id: 13,
        keywords: ['mobile', 'phone', 'app', 'responsive'],
        question: "Can I use this platform on my mobile phone?",
        answer: "Yes! Our platform is fully responsive and works great on mobile devices. You can report issues, upload photos, and track progress from your smartphone.",
        category: "technical"
      },
      {
        id: 14,
        keywords: ['browser', 'compatible', 'support', 'technical'],
        question: "Which browsers are supported?",
        answer: "Our platform works on all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, please use the latest version of your browser.",
        category: "technical"
      },
      
      // General Information FAQs
      {
        id: 15,
        keywords: ['free', 'cost', 'charge', 'payment'],
        question: "Is this service free to use?",
        answer: "Yes, Civic Care is completely free for all citizens. Our goal is to improve community engagement and help resolve civic issues efficiently.",
        category: "general"
      },
      {
        id: 16,
        keywords: ['contact', 'support', 'help', 'assistance'],
        question: "How can I get additional help or support?",
        answer: "For additional support, you can use this chatbot, check our FAQ section, or contact our support team through the contact information provided on the platform.",
        category: "support"
      }
    ];

    this.quickReplies = [
      "How to report an issue?",
      "Track my complaint",
      "What types of issues can I report?",
      "How long does resolution take?",
      "Is this service free?",
      "Contact support"
    ];

    this.greetings = [
      "Hello! I'm your Civic Care assistant. How can I help you today?",
      "Hi there! I'm here to help with your civic issue questions. What would you like to know?",
      "Welcome to Civic Care! I can help you with reporting issues, tracking complaints, and more. How can I assist you?"
    ];

    this.fallbackResponses = [
      "I'm not sure about that specific question, but I can help you with reporting issues, tracking complaints, or general platform information. Try asking about those topics!",
      "That's a great question! While I don't have a specific answer for that, I can help you with issue reporting, account questions, or platform usage. What would you like to know?",
      "I don't have information about that particular topic, but I'm here to help with civic issue reporting, tracking, and platform support. Is there something else I can assist you with?"
    ];
  }

  // Get a random greeting message
  getGreeting(language = 'en') {
    if (language === 'hi' && this.hindiResponses.greeting) {
      return this.hindiResponses.greeting[Math.floor(Math.random() * this.hindiResponses.greeting.length)];
    }
    return this.greetings[Math.floor(Math.random() * this.greetings.length)];
  }

  // Get quick reply suggestions
  getQuickReplies() {
    return this.quickReplies;
  }

  // Process user message and find best response
  processMessage(message, detectedLanguage = 'en') {
    const normalizedMessage = message.toLowerCase().trim();
    const isHindi = detectedLanguage === 'hi' || this.containsHindi(message);
    
    // Check for greetings
    if (this.isGreeting(normalizedMessage)) {
      return {
        type: 'greeting',
        message: this.getGreeting(isHindi ? 'hi' : 'en'),
        quickReplies: this.getQuickReplies()
      };
    }

    // Find matching FAQ
    const matchedFAQ = this.findBestMatch(normalizedMessage);
    
    if (matchedFAQ) {
      let response = matchedFAQ.answer;
      
      // Add Hindi note if user spoke in Hindi
      if (isHindi) {
        response = `${response}\n\n(हिंदी में सहायता के लिए, कृपया अंग्रेजी में प्रश्न पूछें या हमारी सहायता टीम से संपर्क करें।)`;
      }
      
      return {
        type: 'faq',
        message: response,
        relatedQuestions: this.getRelatedQuestions(matchedFAQ.category, matchedFAQ.id)
      };
    }

    // Return fallback response
    return {
      type: 'fallback',
      message: this.getFallbackResponse(isHindi ? 'hi' : 'en'),
      quickReplies: this.getQuickReplies()
    };
  }

  // Check if message is a greeting
  isGreeting(message) {
    const greetingKeywords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'start', 'help', 'नमस्ते', 'हैलो', 'मदद'];
    return greetingKeywords.some(keyword => message.includes(keyword));
  }

  // Check if text contains Hindi characters
  containsHindi(text) {
    const hindiPattern = /[\u0900-\u097F]/;
    return hindiPattern.test(text);
  }

  // Find the best matching FAQ based on keywords
  findBestMatch(message) {
    let bestMatch = null;
    let highestScore = 0;

    this.faqs.forEach(faq => {
      const score = this.calculateMatchScore(message, faq.keywords);
      if (score > highestScore && score > 0) {
        highestScore = score;
        bestMatch = faq;
      }
    });

    return bestMatch;
  }

  // Calculate match score based on keyword presence
  calculateMatchScore(message, keywords) {
    let score = 0;
    keywords.forEach(keyword => {
      if (message.includes(keyword)) {
        score += 1;
      }
    });
    return score;
  }

  // Get related questions from the same category
  getRelatedQuestions(category, currentId) {
    return this.faqs
      .filter(faq => faq.category === category && faq.id !== currentId)
      .slice(0, 3)
      .map(faq => faq.question);
  }

  // Get a random fallback response
  getFallbackResponse(language = 'en') {
    if (language === 'hi' && this.hindiResponses.fallback) {
      return this.hindiResponses.fallback[Math.floor(Math.random() * this.hindiResponses.fallback.length)];
    }
    return this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
  }

  // Get all FAQs by category
  getFAQsByCategory() {
    const categories = {};
    this.faqs.forEach(faq => {
      if (!categories[faq.category]) {
        categories[faq.category] = [];
      }
      categories[faq.category].push(faq);
    });
    return categories;
  }

  // Search FAQs by query
  searchFAQs(query) {
    const normalizedQuery = query.toLowerCase();
    return this.faqs.filter(faq => 
      faq.question.toLowerCase().includes(normalizedQuery) ||
      faq.answer.toLowerCase().includes(normalizedQuery) ||
      faq.keywords.some(keyword => keyword.includes(normalizedQuery))
    );
  }
}

// Create and export singleton instance
export const chatbotService = new ChatbotService();
export default chatbotService;