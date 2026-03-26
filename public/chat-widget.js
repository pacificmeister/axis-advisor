/**
 * AXIS Foiling Guide Chat Widget
 * Embed with: <script src="https://axis-advisor.vercel.app/chat-widget.js"></script>
 */
(function () {
  'use strict';

  // Config
  var API_BASE = 'https://axis-advisor.vercel.app';
  var MAX_SESSION_MESSAGES = 20;
  var WELCOME_MESSAGE = "👋 Hey! I'm the AXIS Foiling Guide. I can help you find the perfect foil setup for your riding style. What are you looking for?";

  // Detect API base from script src if possible
  var scripts = document.getElementsByTagName('script');
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src || '';
    if (src.indexOf('chat-widget.js') !== -1) {
      try {
        var url = new URL(src);
        API_BASE = url.origin;
      } catch (e) {}
      break;
    }
  }

  // State
  var messages = []; // {role: 'user'|'assistant', content: string}
  var isOpen = false;
  var isLoading = false;
  var messageCount = 0;

  // ===== STYLES =====
  var styles = `
    #axis-chat-widget * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    #axis-chat-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #CC2929;
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(204, 41, 41, 0.4), 0 2px 8px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      outline: none;
    }

    #axis-chat-toggle:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(204, 41, 41, 0.5), 0 3px 10px rgba(0,0,0,0.25);
    }

    #axis-chat-toggle:active {
      transform: scale(0.96);
    }

    #axis-chat-toggle svg {
      width: 28px;
      height: 28px;
      transition: opacity 0.2s, transform 0.2s;
    }

    #axis-chat-toggle .axis-icon-chat { opacity: 1; position: absolute; }
    #axis-chat-toggle .axis-icon-close { opacity: 0; position: absolute; }
    #axis-chat-toggle.axis-open .axis-icon-chat { opacity: 0; transform: rotate(-90deg); }
    #axis-chat-toggle.axis-open .axis-icon-close { opacity: 1; transform: rotate(0deg); }

    #axis-chat-panel {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 120px);
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 99998;
      transform: scale(0.95) translateY(12px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.2s ease, opacity 0.2s ease;
      transform-origin: bottom right;
    }

    #axis-chat-panel.axis-visible {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    .axis-header {
      background: #1a1a1a;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .axis-header-icon {
      width: 38px;
      height: 38px;
      background: #CC2929;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .axis-header-icon svg {
      width: 22px;
      height: 22px;
      color: #fff;
    }

    .axis-header-text {
      flex: 1;
      min-width: 0;
    }

    .axis-header-title {
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .axis-header-subtitle {
      color: #CC2929;
      font-size: 11px;
      font-weight: 500;
      margin-top: 1px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .axis-header-status {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #aaa;
      font-size: 11px;
    }

    .axis-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      animation: axis-pulse 2s infinite;
    }

    @keyframes axis-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .axis-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }

    .axis-messages::-webkit-scrollbar {
      width: 4px;
    }
    .axis-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .axis-messages::-webkit-scrollbar-thumb {
      background: #e0e0e0;
      border-radius: 2px;
    }

    .axis-msg {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      max-width: 100%;
    }

    .axis-msg.axis-user {
      flex-direction: row-reverse;
    }

    .axis-msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #CC2929;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-bottom: 2px;
    }

    .axis-msg-avatar svg {
      width: 16px;
      height: 16px;
      color: #fff;
    }

    .axis-bubble {
      max-width: 78%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
    }

    .axis-user .axis-bubble {
      background: #CC2929;
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    .axis-bot .axis-bubble {
      background: #f3f4f6;
      color: #1a1a1a;
      border-bottom-left-radius: 4px;
    }

    /* Markdown-like formatting in bot bubbles */
    .axis-bubble strong, .axis-bubble b {
      font-weight: 700;
    }

    .axis-bubble a {
      color: #CC2929;
      text-decoration: underline;
    }

    .axis-bubble a:hover {
      color: #aa1f1f;
    }

    .axis-bubble p {
      margin-bottom: 6px;
    }

    .axis-bubble p:last-child {
      margin-bottom: 0;
    }

    .axis-bubble ul, .axis-bubble ol {
      margin: 6px 0 6px 18px;
    }

    .axis-bubble li {
      margin-bottom: 3px;
    }

    .axis-bubble h3 {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .axis-bubble code {
      background: rgba(0,0,0,0.08);
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 12px;
    }

    .axis-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      background: #f3f4f6;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      width: fit-content;
    }

    .axis-typing span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #999;
      animation: axis-bounce 1.2s infinite;
    }

    .axis-typing span:nth-child(2) { animation-delay: 0.15s; }
    .axis-typing span:nth-child(3) { animation-delay: 0.3s; }

    @keyframes axis-bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
      40% { transform: translateY(-6px); opacity: 1; }
    }

    .axis-input-area {
      padding: 12px 14px;
      border-top: 1px solid #f0f0f0;
      background: #fff;
      flex-shrink: 0;
    }

    .axis-input-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .axis-input {
      flex: 1;
      border: 1.5px solid #e5e7eb;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 14px;
      line-height: 1.4;
      resize: none;
      outline: none;
      max-height: 100px;
      min-height: 42px;
      font-family: inherit;
      color: #1a1a1a;
      transition: border-color 0.15s;
      background: #fafafa;
    }

    .axis-input:focus {
      border-color: #CC2929;
      background: #fff;
    }

    .axis-input::placeholder {
      color: #aaa;
    }

    .axis-send-btn {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: #CC2929;
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s, transform 0.1s;
      outline: none;
    }

    .axis-send-btn:hover:not(:disabled) {
      background: #b52424;
    }

    .axis-send-btn:active:not(:disabled) {
      transform: scale(0.94);
    }

    .axis-send-btn:disabled {
      background: #e5e7eb;
      cursor: not-allowed;
    }

    .axis-send-btn svg {
      width: 18px;
      height: 18px;
    }

    .axis-footer {
      text-align: center;
      font-size: 10px;
      color: #bbb;
      padding: 0 14px 10px;
    }

    .axis-footer a {
      color: #CC2929;
      text-decoration: none;
    }

    .axis-error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      text-align: center;
    }

    /* Mobile adjustments */
    @media (max-width: 480px) {
      #axis-chat-panel {
        bottom: 80px;
        right: 12px;
        left: 12px;
        width: auto;
        max-width: none;
        height: calc(100vh - 110px);
      }

      #axis-chat-toggle {
        bottom: 16px;
        right: 16px;
        width: 56px;
        height: 56px;
      }
    }
  `;

  // ===== SVG ICONS =====
  var ICON_FOIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18 C6 12, 14 8, 22 10"/><path d="M2 18 C4 22, 8 22, 10 20"/><path d="M10 20 L22 10"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>';
  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  var ICON_USER = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';

  // ===== MARKDOWN RENDERER (simple) =====
  function renderMarkdown(text) {
    // Escape HTML first
    var escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Bold *text* (single asterisk only if not preceded/followed by word)
    escaped = escaped.replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, '<strong>$1</strong>');
    // Inline code
    escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links [text](url)
    escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // Bare URLs
    escaped = escaped.replace(/(?<![">])(https?:\/\/[^\s<"]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');

    // Headers ### / ##
    escaped = escaped.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    escaped = escaped.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');

    // Bullet lists
    var lines = escaped.split('\n');
    var result = [];
    var inList = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var bulletMatch = line.match(/^[\-\*]\s+(.+)$/);
      if (bulletMatch) {
        if (!inList) { result.push('<ul>'); inList = true; }
        result.push('<li>' + bulletMatch[1] + '</li>');
      } else {
        if (inList) { result.push('</ul>'); inList = false; }
        if (line.trim() === '') {
          if (result.length > 0) result.push('<p>');
        } else {
          result.push('<p>' + line + '</p>');
        }
      }
    }
    if (inList) result.push('</ul>');

    // Clean up empty paragraphs
    var html = result.join('').replace(/<p><\/p>/g, '').replace(/<p>\s*<\/p>/g, '');
    return html;
  }

  // ===== DOM BUILDER =====
  function injectStyles() {
    if (document.getElementById('axis-chat-styles')) return;
    var el = document.createElement('style');
    el.id = 'axis-chat-styles';
    el.textContent = styles;
    document.head.appendChild(el);
  }

  function buildWidget() {
    // Toggle button
    var toggle = document.createElement('button');
    toggle.id = 'axis-chat-toggle';
    toggle.setAttribute('aria-label', 'Open AXIS Foiling Guide chat');
    toggle.innerHTML = '<span class="axis-icon-chat">' + ICON_CHAT + '</span><span class="axis-icon-close">' + ICON_CLOSE + '</span>';
    toggle.addEventListener('click', toggleChat);
    document.body.appendChild(toggle);

    // Panel
    var panel = document.createElement('div');
    panel.id = 'axis-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'AXIS Foiling Guide');

    // Header
    var header = document.createElement('div');
    header.className = 'axis-header';
    header.innerHTML = '<div class="axis-header-icon">' + ICON_FOIL + '</div>' +
      '<div class="axis-header-text">' +
        '<div class="axis-header-title">AXIS Foiling Guide</div>' +
        '<div class="axis-header-subtitle">axisfoils.com</div>' +
      '</div>' +
      '<div class="axis-header-status"><span class="axis-status-dot"></span>Online</div>';
    panel.appendChild(header);

    // Messages area
    var messagesEl = document.createElement('div');
    messagesEl.className = 'axis-messages';
    messagesEl.id = 'axis-messages';
    panel.appendChild(messagesEl);

    // Input area
    var inputArea = document.createElement('div');
    inputArea.className = 'axis-input-area';
    inputArea.innerHTML = '<div class="axis-input-row">' +
      '<textarea class="axis-input" id="axis-input" placeholder="Ask about foils, setups, disciplines..." rows="1" aria-label="Message"></textarea>' +
      '<button class="axis-send-btn" id="axis-send-btn" aria-label="Send">' + ICON_SEND + '</button>' +
    '</div>';
    panel.appendChild(inputArea);

    // Footer
    var footer = document.createElement('div');
    footer.className = 'axis-footer';
    footer.innerHTML = 'Powered by AXIS Foils AI &bull; <a href="https://axisfoils.com" target="_blank">axisfoils.com</a>';
    panel.appendChild(footer);

    document.body.appendChild(panel);

    // Wire up input
    var input = document.getElementById('axis-input');
    var sendBtn = document.getElementById('axis-send-btn');

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    input.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    sendBtn.addEventListener('click', sendMessage);

    // Show welcome message
    addBotMessage(WELCOME_MESSAGE);
  }

  // ===== CHAT LOGIC =====
  function toggleChat() {
    isOpen = !isOpen;
    var toggle = document.getElementById('axis-chat-toggle');
    var panel = document.getElementById('axis-chat-panel');

    if (isOpen) {
      toggle.classList.add('axis-open');
      panel.classList.add('axis-visible');
      toggle.setAttribute('aria-label', 'Close chat');
      setTimeout(function () {
        var input = document.getElementById('axis-input');
        if (input) input.focus();
        scrollToBottom();
      }, 200);
    } else {
      toggle.classList.remove('axis-open');
      panel.classList.remove('axis-visible');
      toggle.setAttribute('aria-label', 'Open AXIS Foiling Guide chat');
    }
  }

  function scrollToBottom() {
    var el = document.getElementById('axis-messages');
    if (el) {
      setTimeout(function () { el.scrollTop = el.scrollHeight; }, 50);
    }
  }

  function addBotMessage(text) {
    var el = document.getElementById('axis-messages');
    if (!el) return null;

    var msgDiv = document.createElement('div');
    msgDiv.className = 'axis-msg axis-bot';

    var avatar = document.createElement('div');
    avatar.className = 'axis-msg-avatar';
    avatar.innerHTML = ICON_FOIL;

    var bubble = document.createElement('div');
    bubble.className = 'axis-bubble';
    bubble.innerHTML = renderMarkdown(text);

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    el.appendChild(msgDiv);
    scrollToBottom();
    return bubble;
  }

  function addUserMessage(text) {
    var el = document.getElementById('axis-messages');
    if (!el) return;

    var msgDiv = document.createElement('div');
    msgDiv.className = 'axis-msg axis-user';

    var avatar = document.createElement('div');
    avatar.className = 'axis-msg-avatar';
    avatar.innerHTML = ICON_USER;

    var bubble = document.createElement('div');
    bubble.className = 'axis-bubble';
    bubble.textContent = text;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    el.appendChild(msgDiv);
    scrollToBottom();
  }

  function showTyping() {
    var el = document.getElementById('axis-messages');
    if (!el) return null;

    var msgDiv = document.createElement('div');
    msgDiv.className = 'axis-msg axis-bot';
    msgDiv.id = 'axis-typing-indicator';

    var avatar = document.createElement('div');
    avatar.className = 'axis-msg-avatar';
    avatar.innerHTML = ICON_FOIL;

    var typing = document.createElement('div');
    typing.className = 'axis-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(typing);
    el.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
  }

  function removeTyping() {
    var el = document.getElementById('axis-typing-indicator');
    if (el) el.parentNode.removeChild(el);
  }

  function setInputDisabled(disabled) {
    var input = document.getElementById('axis-input');
    var btn = document.getElementById('axis-send-btn');
    if (input) input.disabled = disabled;
    if (btn) btn.disabled = disabled;
  }

  function showError(msg) {
    var el = document.getElementById('axis-messages');
    if (!el) return;
    var err = document.createElement('div');
    err.className = 'axis-error-banner';
    err.textContent = msg;
    el.appendChild(err);
    scrollToBottom();
    setTimeout(function () {
      if (err.parentNode) err.parentNode.removeChild(err);
    }, 6000);
  }

  function sendMessage() {
    if (isLoading) return;

    var input = document.getElementById('axis-input');
    if (!input) return;

    var text = (input.value || '').trim();
    if (!text) return;

    if (messageCount >= MAX_SESSION_MESSAGES) {
      showError('You\'ve reached the session limit. Refresh to start a new conversation, or email info@axisfoils.com for help!');
      return;
    }

    // Add to state
    messages.push({ role: 'user', content: text });
    messageCount++;

    // Clear input
    input.value = '';
    input.style.height = 'auto';

    // Show in UI
    addUserMessage(text);

    // Start loading
    isLoading = true;
    setInputDisabled(true);
    showTyping();

    // Call API with streaming
    fetchStream(messages.slice());
  }

  function fetchStream(msgs) {
    var responseText = '';
    var bubbleEl = null;
    var typingRemoved = false;

    function ensureBubble() {
      if (!typingRemoved) {
        removeTyping();
        typingRemoved = true;
        bubbleEl = addBotMessage('');
      }
    }

    // Use fetch with streaming
    fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs })
    }).then(function (response) {
      if (!response.ok) {
        return response.json().then(function (data) {
          throw new Error(data.error || 'Request failed (' + response.status + ')');
        });
      }

      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';

      function processChunk() {
        return reader.read().then(function (result) {
          if (result.done) {
            // Finalize
            if (!typingRemoved) {
              removeTyping();
              typingRemoved = true;
            }
            if (responseText) {
              messages.push({ role: 'assistant', content: responseText });
            }
            isLoading = false;
            setInputDisabled(false);
            var input = document.getElementById('axis-input');
            if (input && isOpen) input.focus();
            return;
          }

          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split('\n');
          buffer = lines.pop(); // keep partial line

          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line || !line.startsWith('data: ')) continue;
            var data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              var parsed = JSON.parse(data);
              if (parsed.text) {
                responseText += parsed.text;
                ensureBubble();
                if (bubbleEl) {
                  bubbleEl.innerHTML = renderMarkdown(responseText);
                  scrollToBottom();
                }
              }
            } catch (e) {}
          }

          return processChunk();
        });
      }

      return processChunk();
    }).catch(function (err) {
      removeTyping();
      isLoading = false;
      setInputDisabled(false);
      var msg = err && err.message ? err.message : 'Something went wrong. Please try again or email info@axisfoils.com';
      showError(msg);
    });
  }

  // ===== INIT =====
  function init() {
    injectStyles();
    buildWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
