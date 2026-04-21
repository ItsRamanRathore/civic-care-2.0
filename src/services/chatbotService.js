// Advanced AI Chatbot Service for Civic Care Platform
// Uses Google Gemini AI with strict civic-topic guardrails

const CIVIC_SYSTEM_PROMPT = [
  'You are the Civic Care AI Assistant specializing exclusively in the Civic Care civic governance platform.',
  'ONLY answer questions about the Civic Care platform and civic issues.',
  'Help users: report issues, track complaints, understand the dashboard, roles, analytics, live map, account management.',
  'If user context is provided, discuss their personal stats and reports.',
  'REFUSE all off-topic questions firmly: "I am the Civic Care Assistant. I can only help with platform questions."',
  'NEVER reveal other users personal data, passwords, secrets, or API keys.',
  'Keep responses concise (2-4 sentences). Be professional and helpful.',
].join(' ');

let _chatSession = null;
let _sessionInitialized = false;

async function getChatSession() {
  if (_sessionInitialized) return _chatSession;
  _sessionInitialized = true;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    console.warn('[CivicChatbot] VITE_GEMINI_API_KEY not set. Running in offline mode.');
    return null;
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    _chatSession = model.startChat({
      history: [
        { role: 'user', parts: [{ text: CIVIC_SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Understood. I am the Civic Care AI Assistant. I will only handle platform-related questions.' }] },
      ],
    });

    console.log('[CivicChatbot] Gemini 2.0 Flash session ready.');
    return _chatSession;
  } catch (err) {
    console.error('[CivicChatbot] Init failed:', err?.message);
    return null;
  }
}

export class ChatbotService {
  getGreeting(language = 'en') {
    if (language === 'hi') {
      return 'नमस्ते! मैं सिविक केयर AI सहायक हूं। आपकी कैसे मदद कर सकता हूं?';
    }
    return "Hello! I'm the Civic Care AI Assistant. Ask me about reporting issues, tracking complaints, or using the platform. 🏛️";
  }

  getQuickReplies() {
    return [
      'How to report an issue?',
      'Track my complaint',
      'What issue types can I report?',
      'How does the dashboard work?',
    ];
  }

  async processMessage(message, detectedLanguage = 'en', userContext = null) {
    const session = await getChatSession();
    if (!session) {
      return this._fallbackOffline(message, userContext);
    }

    try {
      const parts = [`User question: "${message}"`];

      if (userContext && userContext.user) {
        parts.push('[Secure Context — use to answer relevant questions, do not repeat verbatim]');
        parts.push(`Logged-in user: ${userContext.user.full_name || 'Unknown'} | Role: ${userContext.user.role}`);
        if (userContext.stats) {
          const s = userContext.stats;
          parts.push(`User dash stats — Total: ${s.total || 0}, Resolved: ${s.resolved || 0}, In Progress: ${s.inProgress || 0}, Pending: ${s.pending || 0}.`);
        }
      } else {
        parts.push('[No user logged in. If they ask about personal reports, tell them to sign in first.]');
      }

      const result = await session.sendMessage(parts.join('\n'));
      const text = result.response.text().trim();

      return {
        type: 'ai',
        message: text,
        quickReplies: userContext && userContext.user
          ? ['What is my report count?', 'Submit a new complaint?']
          : ['Create an account', 'Report anonymously?'],
      };
    } catch (err) {
      console.error('[CivicChatbot] sendMessage error:', err && err.message);

      const isQuota = err && err.message && (
        err.message.includes('429') ||
        err.message.includes('quota') ||
        err.message.includes('rate')
      );
      const is404 = err && err.message && (
        err.message.includes('404') ||
        err.message.includes('not found')
      );

      if (isQuota || is404) {
        _chatSession = null;
        _sessionInitialized = false;
        return this._fallbackOffline(message, userContext);
      }

      return {
        type: 'error',
        message: "I'm temporarily unavailable. Please try again in a moment.",
        quickReplies: ['How to report an issue?'],
      };
    }
  }

  /**
   * Offline fallback — intent-first using string.includes() (not regex word boundaries).
   * Personal queries are checked FIRST before generic patterns.
   */
  _fallbackOffline(message, userContext) {
    const msg = message.toLowerCase().trim();
    const user = userContext && userContext.user;
    const stats = userContext && userContext.stats;

    // Helper functions
    const has = function() {
      const words = Array.from(arguments);
      return words.some(function(w) { return msg.includes(w); });
    };
    const hasAll = function() {
      const words = Array.from(arguments);
      return words.every(function(w) { return msg.includes(w); });
    };

    // ── 1. PERSONAL MY-DATA (MUST BE FIRST before generic complaint patterns) ──
    const isPersonalDataQuery = (
      has('how many complaint', 'how many issue', 'how many report') ||
      has('complaints i have', 'issues i have', 'reports i have') ||
      has('complaints have i', 'issues have i', 'reports have i') ||
      (msg.includes('i') && msg.includes('filed') && has('complaint', 'issue', 'report')) ||
      (msg.includes('i') && msg.includes('submitted') && has('complaint', 'issue', 'report')) ||
      (msg.includes('i') && msg.includes('reported') && has('complaint', 'issue')) ||
      (has('my complaint', 'my report', 'my issue') && has('count', 'total', 'how many', 'till', 'so far', 'number'))
    );

    if (isPersonalDataQuery) {
      if (!user) {
        return {
          type: 'faq',
          message: 'You need to be signed in to see your complaint statistics. Please log in at /login and visit your Citizen Dashboard.',
          quickReplies: ['How to login?'],
        };
      }
      const t = (stats && stats.total !== undefined) ? stats.total : 'N/A';
      const r = (stats && stats.resolved !== undefined) ? stats.resolved : 'N/A';
      const ip = (stats && stats.inProgress !== undefined) ? stats.inProgress : 'N/A';
      const p = (stats && stats.pending !== undefined) ? stats.pending : 'N/A';
      const firstName = user.full_name ? user.full_name.split(' ')[0] : 'there';
      return {
        type: 'faq',
        message: 'Here is your civic report summary, ' + firstName + ':\n• Total filed: ' + t + '\n• Resolved: ' + r + '\n• In progress: ' + ip + '\n• Pending review: ' + p,
        quickReplies: ['How to track a complaint?', 'How to submit a new report?'],
      };
    }

    // "my dashboard", "my account", "my profile", "my role"
    if (has('my dashboard', 'my account', 'my profile', 'my role', 'my page')) {
      if (!user) {
        return { type: 'faq', message: 'Please sign in to access your personal dashboard. Visit /login and choose your role.', quickReplies: ['How to login?'] };
      }
      const link = user.role === 'citizen' ? 'citizen' : (user.role && user.role.includes('dept')) ? 'department' : 'admin';
      return {
        type: 'faq',
        message: 'You are logged in as ' + user.full_name + ' (role: ' + user.role + '). Your dashboard is at /' + link + '-dashboard.',
        quickReplies: ['How many complaints have I filed?'],
      };
    }

    // "am I logged in", "who am I?"
    if (has('am i logged', 'who am i', 'am i signed', 'what is my name', 'am i a user')) {
      if (!user) {
        return { type: 'faq', message: 'You are not currently signed in. Visit /login to access your personalized dashboard.', quickReplies: [] };
      }
      return { type: 'faq', message: 'You are signed in as ' + user.full_name + ' (' + user.role + '). Your session is active.', quickReplies: [] };
    }

    // ── 2. GREETING ────────────────────────────────────────────────────────────
    if (/^(hi|hello|hey|hii|namaste|good morning|good evening|good afternoon)\b/.test(msg)) {
      const name = user && user.full_name ? user.full_name.split(' ')[0] : null;
      return {
        type: 'greeting',
        message: 'Hello' + (name ? ', ' + name : '') + '! I am the Civic Care AI Assistant. Ask me about reporting issues, tracking complaints, the dashboard, roles, or any platform feature.',
        quickReplies: this.getQuickReplies(),
      };
    }

    // ── 3. WHAT IS CIVIC CARE ─────────────────────────────────────────────────
    if (has('what is civic care', 'about civic care', 'about this platform', 'about this website', 'what does civic care do', 'explain civic care')) {
      return {
        type: 'faq',
        message: 'Civic Care is an AI-powered civic issue reporting and governance platform. Citizens report local problems (roads, water, sanitation etc.), track resolution, vote on community issues, and earn reputation. Department officials manage and resolve reports via dedicated dashboards.',
        quickReplies: ['How to report an issue?', 'What issues can I report?'],
      };
    }

    // ── 4. TRACKING ───────────────────────────────────────────────────────────
    if (has('track my complaint', 'track my issue', 'track my report', 'status of my', 'what happened to my', 'where is my complaint', 'complaint status', 'issue status', 'report status')) {
      return {
        type: 'faq',
        message: "Track complaints via your Citizen Dashboard under 'My Complaints', or search by report ID at /public-reports-listing. Workflow: Submitted → In Review → In Progress → Resolved.",
        quickReplies: ['How many complaints have I filed?'],
      };
    }

    // ── 5. HOW TO REPORT ──────────────────────────────────────────────────────
    if (has('how to report', 'how do i report', 'how can i report', 'submit a complaint', 'file a complaint', 'raise a complaint', 'new complaint', 'report an issue', 'new issue')) {
      return {
        type: 'faq',
        message: 'To report an issue: 1) Click Report Issue in the header or go to /issue-reporting-form. 2) Enter title, category, and description. 3) Pin the location on the map. 4) Add photos (optional). 5) Submit — you will get a unique complaint ID.',
        quickReplies: ['Can I report anonymously?', 'What types of issues can I report?'],
      };
    }

    // ── 6. CATEGORIES ─────────────────────────────────────────────────────────
    if (has('types of issue', 'what can i report', 'what issues can', 'categories of issue', 'issue categories', 'kinds of problem', 'what problems can')) {
      return {
        type: 'faq',
        message: 'Reportable categories: Roads & Infrastructure, Water Supply, Sanitation & Waste, Electricity & Street Lighting, Public Health, Parks & Recreation, Traffic & Transport, Environmental Concerns.',
        quickReplies: ['How to report an issue?'],
      };
    }

    // ── 7. ANONYMOUS ──────────────────────────────────────────────────────────
    if (has('anonymous', 'anonymously', 'without account', 'no account required', 'without signing up', 'hide identity', 'private report')) {
      return {
        type: 'faq',
        message: 'Yes, you can report issues without an account — leave contact fields empty on the form. However, an account lets you track reports, receive status updates, and earn reputation points.',
        quickReplies: ['How to create an account?'],
      };
    }

    // ── 8. LOGIN / ACCOUNT ────────────────────────────────────────────────────
    if (has('login', 'log in', 'sign in', 'signup', 'sign up', 'register', 'create account', 'forgot password', 'logout', 'sign out', 'log out')) {
      return {
        type: 'faq',
        message: 'Visit /login to sign in or /signup to register for free. 3 roles: Citizen (report & track), Admin (manage all reports), Department Head (manage sector complaints). Demo credentials are on the login page.',
        quickReplies: [],
      };
    }

    // ── 9. DASHBOARD ──────────────────────────────────────────────────────────
    if (has('dashboard', 'home page', 'overview page')) {
      return {
        type: 'faq',
        message: 'Citizen Dashboard (/citizen-dashboard): your complaints, community feed, reputation score, and preferences. Admin Dashboard: platform-wide command center. Department Hub: sector complaints with status controls.',
        quickReplies: ['How many complaints have I filed?'],
      };
    }

    // ── 10. DEPARTMENT / ROLES ────────────────────────────────────────────────
    if (has('department head', 'dept head', 'what are the roles', 'types of roles', 'admin role', 'civic officer')) {
      return {
        type: 'faq',
        message: '3 roles on Civic Care:\n• Citizen — reports issues, tracks progress, votes on reports\n• Department Head — manages sector-specific complaints (Roads, Utilities, Sanitation, Health)\n• Admin — oversees all reports, departments, and platform settings',
        quickReplies: [],
      };
    }

    // ── 11. MAP ───────────────────────────────────────────────────────────────
    if (has('live map', 'interactive map', 'issue map', 'map of complaints', 'view on map')) {
      return {
        type: 'faq',
        message: 'The Interactive Live Map (/interactive-issue-map) shows all civic reports pinned to their locations. Filter by category, priority, or status to explore issues across the city.',
        quickReplies: [],
      };
    }

    // ── 12. RESOLUTION TIME ───────────────────────────────────────────────────
    if (has('how long does it take', 'when will my issue', 'how many days to resolve', 'wait time', 'resolution time', 'how long to fix')) {
      return {
        type: 'faq',
        message: 'Resolution times: simple issues (streetlights) — 2–5 days. Infrastructure problems (roads, drainage) — 1–4 weeks. Critical-priority issues are escalated faster. Track your report status from the dashboard.',
        quickReplies: ['How to track a complaint?'],
      };
    }

    // ── 13. ANALYTICS ─────────────────────────────────────────────────────────
    if (has('analytics dashboard', 'platform statistics', 'data trends', 'view charts', 'issue graphs', 'platform analytics')) {
      return {
        type: 'faq',
        message: 'The Analytics Dashboard (/analytics-dashboard) shows platform-wide resolution rates, issue trends over time, category breakdowns, and department performance metrics. Accessible to all signed-in users.',
        quickReplies: [],
      };
    }

    // ── 14. EMERGENCY ─────────────────────────────────────────────────────────
    if (has('emergency service', 'life threatening', 'call police', 'fire brigade', 'immediate danger', 'ambulance')) {
      return {
        type: 'faq',
        message: 'For emergencies: Police 100 | Fire 101 | Ambulance 102 | Disaster Helpline 108. Civic Care handles non-emergency civic issues requiring municipal attention, not active emergencies.',
        quickReplies: [],
      };
    }

    // ── 15. FREE / COST ───────────────────────────────────────────────────────
    if (has('is it free', 'is civic care free', 'how much does it cost', 'do i need to pay', 'any fees', 'any charges')) {
      return {
        type: 'faq',
        message: 'Civic Care is completely free for all citizens. There are no charges for reporting issues, tracking complaints, or using any platform feature.',
        quickReplies: [],
      };
    }

    // ── DEFAULT ───────────────────────────────────────────────────────────────
    return {
      type: 'fallback',
      message: "I am the Civic Care AI Assistant and can only answer platform-related questions. Try: 'How many complaints have I filed?', 'How to report an issue?', 'What departments handle complaints?', or 'What issue categories exist?'",
      quickReplies: this.getQuickReplies(),
    };
  }
}

export const chatbotService = new ChatbotService();
export default chatbotService;