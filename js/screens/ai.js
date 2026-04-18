/* ═══ js/screens/ai.js ═══ */
let aiChatHistory = [];
const AI_DAILY_LIMIT = 5;

function getAIDailyUsage() {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem('ai_usage');
  if (stored) {
    const data = JSON.parse(stored);
    if (data.date === today) return data;
  }
  return { date: today, count: 0 };
}

function incrementAIDailyUsage() {
  const usage = getAIDailyUsage();
  usage.count++;
  localStorage.setItem('ai_usage', JSON.stringify(usage));
  updateAIUsageDisplay();
}

function updateAIUsageDisplay() {
  const usage = getAIDailyUsage();
  const el = document.getElementById('ai-limit-badge');
  if (el) {
    el.innerText = `${AI_DAILY_LIMIT - usage.count} ${t('aiChatRemaining')}`;
    if (usage.count >= AI_DAILY_LIMIT) {
      el.style.color = 'var(--terra)';
    }
  }
}

function buildAIScreen() {
  const screen = document.getElementById('screen-ai');
  const usage = getAIDailyUsage();
  screen.innerHTML = `
    <div class="scroll-area ai-scroll-area">
      <div class="screen-header">
        <button class="back-btn" onclick="goBack()">←</button>
        <div class="screen-title">${t('navAI')}</div>
      </div>
      
      <div class="ai-chat-container">
        <div class="ai-intro-card mindful-focus-section">
          <div style="display:flex; justify-content:space-between; align-items:flex-start">
            <p style="margin:0">${t('aiChatIntro')}</p>
            <div id="ai-limit-badge" style="font-size:10px; font-weight:600; white-space:nowrap; margin-left:8px; color:var(--text-soft)">
              ${AI_DAILY_LIMIT - usage.count} ${t('aiChatRemaining')}
            </div>
          </div>
          <p style="font-size: 11px; margin-top: 8px; color: var(--text-hint);">⚠️ ${t('aiChatSafety')}</p>
        </div>

        <div id="ai-chat-messages" class="ai-messages-list">
          <!-- Messages will appear here -->
        </div>
      </div>

      <div class="ai-input-area">
        <div class="ai-input-wrapper">
          <textarea id="ai-user-input" placeholder="${t('aiChatPlaceholder')}" rows="1"></textarea>
          <button id="ai-send-btn" onclick="handleAISend()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
      <div class="spacer-bottom"></div>
    </div>`;

  // Restore history
  renderAIChat();
  updateAIUsageDisplay();

  // Auto-resize textarea
  const textarea = document.getElementById('ai-user-input');
  if (textarea) {
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
    // Enter to send (but Shift+Enter for newline)
    textarea.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAISend();
      }
    });
  }
}

function renderAIChat() {
  const container = document.getElementById('ai-chat-messages');
  if (!container) return;
  container.innerHTML = aiChatHistory.map(msg => `
    <div class="ai-msg ${msg.role === 'user' ? 'msg-user' : 'msg-ai'}">
      <div class="ai-msg-content">${msg.text.replace(/\n/g, '<br>')}</div>
    </div>
  `).join('');
  
  // Scroll to bottom
  const scrollArea = document.querySelector('.ai-scroll-area');
  if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
}

async function handleAISend() {
  const input = document.getElementById('ai-user-input');
  const btn = document.getElementById('ai-send-btn');
  const text = input.value.trim();
  if (!text || btn.disabled) return;

  // Check Daily Limit
  const usage = getAIDailyUsage();
  if (usage.count >= AI_DAILY_LIMIT) {
    aiChatHistory.push({ role: 'assistant', text: t('aiChatLimitReached') });
    renderAIChat();
    input.value = '';
    return;
  }

  // Add user message to history
  aiChatHistory.push({ role: 'user', text: text });
  input.value = '';
  input.style.height = 'auto';
  renderAIChat();

  // Show thinking state
  btn.disabled = true;
  const loadingId = 'loading-' + Date.now();
  const msgList = document.getElementById('ai-chat-messages');
  const loadingDiv = document.createElement('div');
  loadingDiv.id = loadingId;
  loadingDiv.className = 'ai-msg msg-ai thinking';
  loadingDiv.innerHTML = `<div class="ai-msg-content">${t('aiChatThinking')}</div>`;
  msgList.appendChild(loadingDiv);
  
  const scrollArea = document.querySelector('.ai-scroll-area');
  if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;

  try {
    const response = await callGemini(text);
    // Remove loading
    const l = document.getElementById(loadingId);
    if (l) l.remove();

    aiChatHistory.push({ role: 'assistant', text: response });
    incrementAIDailyUsage();
    renderAIChat();
  } catch (err) {
    console.error('AI Error:', err);
    const l = document.getElementById(loadingId);
    if (l) l.remove();
    aiChatHistory.push({ role: 'assistant', text: t('aiChatError') });
    renderAIChat();
  } finally {
    btn.disabled = false;
  }
}

async function callGemini(userMessage) {
  // We need to import the library. Since we are in a vanilla environment, we use dynamic import or the script tag.
  // AI Studio environment allows process.env access.
  if (!window.GoogleGenAI) {
    // This is a fallback if the script isn't loaded yet
    return "AI library not ready.";
  }

  const ai = new window.GoogleGenAI({ apiKey: window.AI_CONFIG_KEY });
  
  // Prepare System Instruction with context
  const systemInstruction = `You are a specialized Mindfulness Guide for neurodivergent individuals (ADHD, Autism). 
Your personality: Supportive, trauma-informed, clear, and non-judgmental. 
Methodology: The "Fourfold Axis" (Body, Breath, Attention, Space). 

CONTEXT:
Knowledge FAQ: ${JSON.stringify(KNOWLEDGE_FAQ[LANG] || KNOWLEDGE_FAQ.el)}
Concepts: ${JSON.stringify(KNOWLEDGE_CONCEPTS)}

RULES:
1. Always align with the Fourfold Axis methodology.
2. Use clinical but gentle language (e.g., mention Vagus Nerve, DMN, Interoception).
3. If a user is in crisis, recommend "SOS Mode" or "Grounding".
4. Be concise but warm.
5. Answer in the same language as the user (${LANG === 'el' ? 'Greek' : 'English'}).
6. Never judge the user if their mind wandering or if they find it hard. Remind them that "Returning is the practice".
7. Avoid overly spiritual or mystical language unless it's a specific tradition mentioned in the knowledge base.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: aiChatHistory.map(m => ({ role: m.role || 'user', parts: [{ text: m.text }] })),
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (e) {
    console.error("Gemini API Error:", e);
    throw e;
  }
}
