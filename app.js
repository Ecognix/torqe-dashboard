// ============================================
// Torqe DASHBOARD — App Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderInboxMessages();
  renderThread(0);
  initFilters();
  initToneSelector();
  initSearch();
  animateStatsOnView();
  initMobileBehavior();
});

function initMobileBehavior() {
  const isMobile = () => window.innerWidth <= 768;
  
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      closeMobileSidebar();
      closeMobileThread();
    }
  });
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
  
  if (sidebar.classList.contains('open')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function showMobileThread() {
  const inboxLayout = document.querySelector('.inbox-layout');
  if (window.innerWidth <= 768) {
    inboxLayout.classList.add('mobile-show-thread');
    document.body.classList.add('mobile-viewing-thread');
  }
}

function closeMobileThread() {
  const inboxLayout = document.querySelector('.inbox-layout');
  inboxLayout.classList.remove('mobile-show-thread');
  document.body.classList.remove('mobile-viewing-thread');
}

function selectMessage(id) {
  document.querySelectorAll('.msg-item').forEach(el => {
    el.classList.remove('active');
    if (parseInt(el.dataset.id) === id) el.classList.add('active');
  });
  renderThread(id);
  showMobileThread();
  closeMobileSidebar();
}

// ============================================
// NAVIGATION
// ============================================

const viewMap = {
  inbox: { title: 'Inbox', icon: '📬' },
  ai: { title: 'AI Tools', icon: '🧠' },
  pipeline: { title: 'Pipeline', icon: '📋' },
  negotiate: { title: 'Negotiate Coach', icon: '🤝' }
};

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-view]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      switchView(view);
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      closeMobileSidebar();
      closeMobileThread();
    });
  });
  
  const channelItems = document.querySelectorAll('.nav-item[id^="nav-"]');
  channelItems.forEach(item => {
    item.addEventListener('click', () => {
      closeMobileSidebar();
    });
  });
}

function switchView(viewId) {
  const views = document.querySelectorAll('.view');
  views.forEach(v => v.classList.remove('active'));

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('active');
    document.getElementById('header-title').textContent = viewMap[viewId]?.title || 'Dashboard';
    animateStatsOnView();
  }
}

// ============================================
// INBOX MESSAGES DATA
// ============================================

const messages = [
  {
    id: 0,
    name: 'Rahul Nair',
    initials: 'RN',
    channel: 'whatsapp',
    channelLabel: 'WhatsApp',
    priority: 'urgent',
    time: '3m ago',
    preview: 'I\'ve been waiting for the revised timeline — when can we expect it?',
    unread: true,
    gradient: 'linear-gradient(135deg,#f97316,#fb923c)',
    thread: [
      { type: 'incoming', text: 'Hey, just wanted to follow up on the project. The client is pushing hard on deadlines.', time: 'Yesterday 2:14 PM' },
      { type: 'outgoing', text: 'Hi Rahul! I\'m working on the revised timeline. Should have something solid by EOD.', time: 'Yesterday 3:30 PM' },
      { type: 'incoming', text: 'EOD has passed btw. Still waiting.', time: 'Yesterday 8:45 PM' },
      { type: 'incoming', text: 'I\'ve been waiting for the revised timeline — when can we expect it?', time: '3 min ago' }
    ]
  },
  {
    id: 1,
    name: 'Priya Mehta',
    initials: 'PM',
    channel: 'gmail',
    channelLabel: 'Gmail',
    priority: 'high',
    time: '18m ago',
    preview: 'Could you share the enterprise pricing breakdown?',
    unread: true,
    gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)',
    thread: [
      { type: 'incoming', text: 'Hi there! I\'ve been evaluating Torqe for our team of 50+. Could you share the enterprise pricing breakdown?', time: '18 min ago' }
    ]
  },
  {
    id: 2,
    name: 'Deepa Krishnan',
    initials: 'DK',
    channel: 'whatsapp',
    channelLabel: 'WhatsApp',
    priority: 'urgent',
    time: '32m ago',
    preview: '🎤 Voice Note (1:24) — about API webhooks and board meeting',
    unread: true,
    gradient: 'linear-gradient(135deg,#22c55e,#4ade80)',
    thread: [
      { type: 'incoming', text: '🎤 Voice Note (1:24)', time: '32 min ago' },
      { type: 'incoming', text: '[Transcription] "Hey, I just got off the call with my CFO and... the annual commitment is a concern. Can we do quarterly? Also, does the API support webhooks? Let me know ASAP — board meeting Friday."', time: '32 min ago' }
    ]
  },
  {
    id: 3,
    name: 'Vikram Singh',
    initials: 'VS',
    channel: 'linkedin',
    channelLabel: 'LinkedIn',
    priority: 'high',
    time: '1h ago',
    preview: 'Let me check with my team and circle back.',
    unread: false,
    gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
    thread: [
      { type: 'outgoing', text: 'Hi Vikram! Following up on our demo call. Would love to hear your team\'s thoughts.', time: 'Yesterday 11:00 AM' },
      { type: 'incoming', text: 'Let me check with my team and circle back.', time: '1h ago' }
    ]
  },
  {
    id: 4,
    name: 'Neha Gupta',
    initials: 'NG',
    channel: 'gmail',
    channelLabel: 'Gmail',
    priority: 'normal',
    time: '2h ago',
    preview: 'Will get back to you on the proposal by Thursday.',
    unread: false,
    gradient: 'linear-gradient(135deg,#ec4899,#f472b6)',
    thread: [
      { type: 'outgoing', text: 'Hi Neha, attached is the proposal for the Q2 campaign. Let me know if any questions!', time: 'Yesterday 9:00 AM' },
      { type: 'incoming', text: 'Will get back to you on the proposal by Thursday.', time: '2h ago' }
    ]
  },
  {
    id: 5,
    name: 'Amit Rao',
    initials: 'AR',
    channel: 'slack',
    channelLabel: 'Slack',
    priority: 'normal',
    time: '3h ago',
    preview: 'Can we sync on the integration timeline tomorrow?',
    unread: true,
    gradient: 'linear-gradient(135deg,#e01e5a,#f472b6)',
    thread: [
      { type: 'incoming', text: 'Hey, quick question — can we sync on the integration timeline tomorrow?', time: '3h ago' }
    ]
  },
  {
    id: 6,
    name: 'Karan Reddy',
    initials: 'KR',
    channel: 'whatsapp',
    channelLabel: 'WhatsApp',
    priority: 'high',
    time: '4h ago',
    preview: 'Interesting, let me think about it. What\'s the minimum commitment?',
    unread: false,
    gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)',
    thread: [
      { type: 'outgoing', text: 'Here\'s how Torqe could help your recruiting workflow — 60% faster candidate screening with AI.', time: 'Yesterday 2:00 PM' },
      { type: 'incoming', text: 'Interesting, let me think about it. What\'s the minimum commitment?', time: '4h ago' }
    ]
  },
  {
    id: 7,
    name: 'Simran Sethi',
    initials: 'SS',
    channel: 'telegram',
    channelLabel: 'Telegram',
    priority: 'normal',
    time: '5h ago',
    preview: 'Can you send me the case studies you mentioned?',
    unread: true,
    gradient: 'linear-gradient(135deg,#eab308,#facc15)',
    thread: [
      { type: 'incoming', text: 'Hi! Can you send me the case studies you mentioned during the call?', time: '5h ago' }
    ]
  },
  {
    id: 8,
    name: 'Anil Patel',
    initials: 'AP',
    channel: 'instagram',
    channelLabel: 'Instagram',
    priority: 'normal',
    time: '6h ago',
    preview: 'Saw your product demo reel. Looks interesting!',
    unread: false,
    gradient: 'linear-gradient(135deg,#e1306c,#f77737)',
    thread: [
      { type: 'incoming', text: 'Saw your product demo reel. Looks interesting! Do you have a B2B version?', time: '6h ago' }
    ]
  },
  {
    id: 9,
    name: 'Meera Sharma',
    initials: 'MS',
    channel: 'gmail',
    channelLabel: 'Gmail',
    priority: 'urgent',
    time: '7h ago',
    preview: 'URGENT: Contract expires tomorrow — need renewal terms ASAP',
    unread: true,
    gradient: 'linear-gradient(135deg,#ef4444,#f87171)',
    thread: [
      { type: 'incoming', text: 'URGENT: Our current contract expires tomorrow. We need the renewal terms ASAP to get legal approval. Can you send the updated agreement by EOD?', time: '7h ago' }
    ]
  }
];

// ============================================
// RENDER INBOX
// ============================================

const channelSvgPaths = {
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  gmail: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  slack: 'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z',
  instagram: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
  telegram: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z'
};

function getChannelIconSvg(channel) {
  const path = channelSvgPaths[channel];
  if (!path) return '';
  return `<svg class="channel-svg" viewBox="0 0 24 24" fill="currentColor"><path d="${path}"/></svg>`;
}

function renderInboxMessages(filter = 'all') {
  const container = document.getElementById('inbox-messages');
  let filtered = messages;

  if (filter === 'urgent') filtered = messages.filter(m => m.priority === 'urgent');
  else if (filter === 'high') filtered = messages.filter(m => m.priority === 'high');
  else if (filter === 'unread') filtered = messages.filter(m => m.unread);

  container.innerHTML = filtered.map((msg, idx) => `
    <div class="msg-item ${msg.unread ? 'unread' : ''} ${idx === 0 ? 'active' : ''}" data-id="${msg.id}" onclick="selectMessage(${msg.id})">
      <div class="msg-avatar" style="background:${msg.gradient};color:#fff;">${msg.initials}</div>
      <div class="msg-content">
        <div class="msg-top">
          <span class="msg-name">${msg.name}</span>
          <span class="msg-time">${msg.time}</span>
        </div>
        <div class="msg-preview">${msg.preview}</div>
        <div class="msg-right-meta">
          <span class="channel-icon-black">${getChannelIconSvg(msg.channel)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function selectMessage(id) {
  // Update active state
  document.querySelectorAll('.msg-item').forEach(el => {
    el.classList.remove('active');
    if (parseInt(el.dataset.id) === id) el.classList.add('active');
  });
  renderThread(id);
  
  // Show mobile thread view on mobile
  if (window.innerWidth <= 768) {
    showMobileThread();
  }
}

function renderThread(id) {
  const msg = messages.find(m => m.id === id);
  if (!msg) return;

  document.getElementById('thread-avatar').textContent = msg.initials;
  document.getElementById('thread-avatar').style.background = msg.gradient;
  document.getElementById('thread-name').textContent = msg.name;
  document.getElementById('thread-detail').textContent = `${msg.channelLabel} · Last active ${msg.time}`;

  const container = document.getElementById('thread-messages');
  container.innerHTML = msg.thread.map(t => `
    <div class="thread-msg ${t.type}">
      ${t.text}
      <div class="thread-msg-time">${t.time}</div>
    </div>
  `).join('');

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

// ============================================
// FILTERS
// ============================================

function initFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderInboxMessages(chip.dataset.filter);
    });
  });
}

// ============================================
// TONE SELECTOR
// ============================================

const toneResponses = {
  professional: '💼 Professional\n\nDear Rahul, thank you for your patience regarding the project timeline. I want to assure you that we\'re making strong progress — I\'ve outlined a revised delivery schedule with clear milestones attached. Could we schedule a call this week to walk through it together?',
  casual: '😎 Casual\n\nHey Rahul! Sorry for the delay on that timeline — things got hectic on our end. Good news though, I\'ve got the updated plan ready. Want to hop on a quick call this week to go over it?',
  assertive: '💪 Assertive\n\nRahul, I understand your concern on the timeline. Here\'s the revised delivery plan with non-negotiable milestones — I\'m confident we can deliver. Let\'s lock in a call to align expectations and move forward decisively.',
  warm: '🤗 Warm\n\nHi Rahul! I really appreciate your patience — I know waiting can be frustrating, and I don\'t take that lightly. I\'ve put together a thoughtful revised plan that I think you\'ll feel good about. When can we chat?'
};

function initToneSelector() {
  const buttons = document.querySelectorAll('#tone-options .tone-btn');
  const output = document.getElementById('tone-output');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tone = btn.dataset.tone;
      const parts = toneResponses[tone].split('\n\n');
      output.innerHTML = `
        <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">${parts[0]}</div>
        ${parts[1]}
      `;

      // Add subtle animation
      output.style.opacity = '0';
      output.style.transform = 'translateY(4px)';
      requestAnimationFrame(() => {
        output.style.transition = 'all 0.3s ease';
        output.style.opacity = '1';
        output.style.transform = 'translateY(0)';
      });
    });
  });
}

// ============================================
// SEARCH
// ============================================

function initSearch() {
  const searchInput = document.getElementById('global-search');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (!query) {
      renderInboxMessages();
      return;
    }

    const filtered = messages.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.preview.toLowerCase().includes(query) ||
      m.channelLabel.toLowerCase().includes(query)
    );

    const container = document.getElementById('inbox-messages');
    container.innerHTML = filtered.map((msg) => `
      <div class="msg-item ${msg.unread ? 'unread' : ''}" data-id="${msg.id}" onclick="selectMessage(${msg.id})">
        <div class="msg-avatar" style="background:${msg.gradient};color:#fff;">${msg.initials}</div>
        <div class="msg-content">
          <div class="msg-top">
            <span class="msg-name">${msg.name}</span>
            <span class="msg-time">${msg.time}</span>
          </div>
          <div class="msg-preview">${msg.preview}</div>
          <div class="msg-right-meta">
            <span class="channel-icon-black">${getChannelIconSvg(msg.channel)}</span>
          </div>
        </div>
      </div>
    `).join('');
  });
}

// ============================================
// STAT ANIMATION
// ============================================

function animateStatsOnView() {
  const stats = document.querySelectorAll('.view.active .stat-value');
  stats.forEach(stat => {
    stat.style.opacity = '0';
    stat.style.transform = 'translateY(10px)';
    requestAnimationFrame(() => {
      stat.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      stat.style.opacity = '1';
      stat.style.transform = 'translateY(0)';
    });
  });
}

// ============================================
// AI DRAFT BUTTON
// ============================================

document.getElementById('btn-ai-draft')?.addEventListener('click', () => {
  const input = document.getElementById('thread-input');
  const currentMsg = messages.find(m => m.id === getCurrentThreadId());
  if (currentMsg) {
    input.value = '';
    const draftText = `Hi ${currentMsg.name.split(' ')[0]}! Thanks for following up. I have the updated details ready — let me share them with you right away.`;
    let i = 0;
    input.focus();
    const typing = setInterval(() => {
      if (i < draftText.length) {
        input.value += draftText[i];
        i++;
      } else {
        clearInterval(typing);
      }
    }, 20);
  }
});

function getCurrentThreadId() {
  const active = document.querySelector('.msg-item.active');
  return active ? parseInt(active.dataset.id) : 0;
}

// ============================================
// SEND BUTTON
// ============================================

document.getElementById('btn-send')?.addEventListener('click', () => {
  const input = document.getElementById('thread-input');
  const text = input.value.trim();
  if (!text) return;

  const container = document.getElementById('thread-messages');
  const msgEl = document.createElement('div');
  msgEl.className = 'thread-msg outgoing';
  msgEl.innerHTML = `${text}<div class="thread-msg-time">Just now</div>`;
  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;
  input.value = '';
});

// ============================================
// INBOX INLINE AI TOOLS & SMART SEND
// ============================================

function inlineAiAction(action) {
  const currentContact = messages[getCurrentThreadId()] || messages[0];
  const container = document.getElementById('thread-messages');
  
  if (action === 'summarise') {
    const summaryCard = document.createElement('div');
    summaryCard.className = 'inline-ai-card';
    summaryCard.innerHTML = `
      <div class="inline-ai-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Conversation Summary
      </div>
      <div class="inline-ai-content">
        Based on the recent thread, ${currentContact.name.split(' ')[0]} ${currentContact.priority === 'urgent' ? 'is urgently waiting for an update.' : 'is expecting a follow-up.'} The main context is: "${currentContact.preview}"
      </div>
      <div class="inline-ai-actions">
        <button class="btn-primary" onclick="this.closest('.inline-ai-card').remove(); document.getElementById('thread-input').value = 'Thanks for reaching out! Let me check on this.'; triggerSmartSend()">Send Acknowledgment →</button>
        <button class="btn-ghost" onclick="this.closest('.inline-ai-card').remove()">Dismiss</button>
      </div>
    `;
    container.appendChild(summaryCard);
    container.scrollTop = container.scrollHeight;
  } else if (action === 'draft') {
    const draftCard = document.createElement('div');
    draftCard.className = 'inline-ai-card';
    draftCard.innerHTML = `
      <div class="inline-ai-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        AI Draft Reply
      </div>
      <div class="inline-ai-content" id="draft-content-${currentContact.id}">Hi ${currentContact.name.split(' ')[0]}, I'm working on the details you requested and will share an update shortly. Would you like a quick call to go over it?</div>
      <div class="inline-ai-actions">
        <button class="btn-primary" onclick="sendInlineDraft(this)">Send</button>
        <button class="btn-secondary" onclick="editInlineDraft(this)">Edit</button>
        <button class="btn-ghost" onclick="regenerateInlineDraft(this)">Regenerate</button>
      </div>
    `;
    container.appendChild(draftCard);
    container.scrollTop = container.scrollHeight;
  }
}

function sendInlineDraft(btn) {
  const card = btn.closest('.inline-ai-card');
  const text = card.querySelector('.inline-ai-content').textContent.trim();
  const container = document.getElementById('thread-messages');
  const msgEl = document.createElement('div');
  msgEl.className = 'thread-msg outgoing';
  msgEl.innerHTML = `${text}<div class="thread-msg-time">Just now</div>`;
  container.appendChild(msgEl);
  card.remove();
  container.scrollTop = container.scrollHeight;
}

function editInlineDraft(btn) {
  const card = btn.closest('.inline-ai-card');
  const contentEl = card.querySelector('.inline-ai-content');
  if (contentEl.contentEditable === "true") {
    contentEl.contentEditable = "false";
    contentEl.style.border = "none";
    contentEl.style.padding = "0";
    btn.textContent = "Edit";
  } else {
    contentEl.contentEditable = "true";
    contentEl.style.border = "1px solid var(--border)";
    contentEl.style.padding = "8px";
    contentEl.style.borderRadius = "4px";
    contentEl.focus();
    btn.textContent = "Save";
  }
}

function regenerateInlineDraft(btn) {
  const contentEl = btn.closest('.inline-ai-card').querySelector('.inline-ai-content');
  contentEl.style.opacity = '0.5';
  setTimeout(() => {
    contentEl.textContent = "Thanks for reaching out! I've escalated your request and we'll have an answer by EOD.";
    contentEl.style.opacity = '1';
  }, 500);
}

// Smart Send Autopilot
let autopilotTimerInterval;
function triggerSmartSend() {
  const bar = document.getElementById('autopilot-bar');
  const composer = document.getElementById('thread-composer');
  
  bar.classList.add('active');
  composer.style.opacity = '0';
  composer.style.pointerEvents = 'none';
  
  let timeRemaining = 60;
  const timerEl = document.getElementById('autopilot-timer');
  timerEl.textContent = timeRemaining;
  
  clearInterval(autopilotTimerInterval);
  autopilotTimerInterval = setInterval(() => {
    timeRemaining--;
    timerEl.textContent = timeRemaining;
    if (timeRemaining <= 0) {
      clearInterval(autopilotTimerInterval);
      const input = document.getElementById('thread-input');
      const text = input.value.trim();
      
      const container = document.getElementById('thread-messages');
      const msgEl = document.createElement('div');
      msgEl.className = 'thread-msg outgoing';
      msgEl.innerHTML = `${text || 'Message sent via Autopilot.'}<div class="thread-msg-time">Just now</div>`;
      container.appendChild(msgEl);
      container.scrollTop = container.scrollHeight;
      
      cancelSmartSend(true);
    }
  }, 1000);
}

function cancelSmartSend(completed = false) {
  clearInterval(autopilotTimerInterval);
  const bar = document.getElementById('autopilot-bar');
  const composer = document.getElementById('thread-composer');
  
  bar.classList.remove('active');
  composer.style.opacity = '1';
  composer.style.pointerEvents = 'all';
  
  if (!completed) {
    document.getElementById('thread-input').focus();
  } else {
    document.getElementById('thread-input').value = '';
  }
}


// ============================================
// GAUGE ANIMATION
// ============================================

function animateGauge() {
  const circle = document.getElementById('gauge-circle');
  if (circle) {
    const circumference = 2 * Math.PI * 65; // r=65
    const percentage = 67;
    const offset = circumference - (percentage / 100) * circumference;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;
    setTimeout(() => {
      circle.style.strokeDashoffset = offset;
    }, 300);
  }
}

// Trigger gauge animation when negotiate view is shown
const negotiateNav = document.getElementById('nav-negotiate');
if (negotiateNav) {
  negotiateNav.addEventListener('click', () => {
    setTimeout(animateGauge, 100);
  });
}

// ============================================
// AI CHATBOT PANEL
// ============================================

let chatbotOpen = false;
let currentChatbotTab = 'agent';

// Store chat history per tab
const chatHistory = {
  agent: [
    { role: 'bot', name: 'Torqe Agent', avatar: '🤖', text: "Hi Arjun! I'm your Torqe AI Agent. I can help you with your inbox, draft replies, summarise conversations, and manage follow-ups. What would you like me to do?", time: 'Just now' },
    { role: 'bot', name: 'Torqe Agent', avatar: '🤖', text: '💡 <strong>Quick tip:</strong> Use the action buttons above to run AI tools on your current conversation. Or just ask me anything!', time: 'Just now' }
  ],
  negotiate: [
    { role: 'bot', name: 'Negotiate Coach', avatar: '🤝', text: "I'm your Negotiate Coach. I can analyse live deals, suggest counter-offers, coach you on negotiation tactics, and help you close more deals. Which deal would you like to work on?", time: 'Just now' },
    { role: 'bot', name: 'Negotiate Coach', avatar: '🤝', text: '📊 <strong>Active deals:</strong> You have 8 deals in negotiation. Rahul Nair\'s deal (₹6L) has the highest close probability at 67%. Want me to analyse it?', time: 'Just now' }
  ]
};

function toggleChatbot(tab) {
  const panel = document.getElementById('chatbot-panel');
  const overlay = document.getElementById('chatbot-overlay');

  if (chatbotOpen && currentChatbotTab === tab) {
    // Close if same tab clicked again
    closeChatbot();
    return;
  }

  // Open panel
  chatbotOpen = true;
  panel.classList.add('open');
  overlay.classList.add('open');
  switchChatbotTab(tab);
  updateToggleButtons(tab);

  // Focus input
  setTimeout(() => document.getElementById('chatbot-input').focus(), 400);
}

function closeChatbot() {
  const panel = document.getElementById('chatbot-panel');
  const overlay = document.getElementById('chatbot-overlay');
  chatbotOpen = false;
  panel.classList.remove('open');
  overlay.classList.remove('open');
  updateToggleButtons(null);
}

function updateToggleButtons(activeTab) {
  document.getElementById('btn-Torqe-agent').classList.toggle('active-bot', activeTab === 'agent');
  document.getElementById('btn-negotiate-bot').classList.toggle('active-bot', activeTab === 'negotiate');
}

function switchChatbotTab(tab) {
  currentChatbotTab = tab;

  // Update tab active states
  document.getElementById('tab-agent').classList.toggle('active', tab === 'agent');
  document.getElementById('tab-negotiate').classList.toggle('active', tab === 'negotiate');

  // Update input placeholder
  const input = document.getElementById('chatbot-input');
  input.placeholder = tab === 'agent' ? 'Ask Torqe anything...' : 'Ask about deal strategy...';

  // Render the correct chat history
  renderChatHistory(tab);
  updateToggleButtons(tab);
}

function renderChatHistory(tab) {
  const container = document.getElementById('chatbot-messages');
  const history = chatHistory[tab];

  container.innerHTML = history.map(msg => {
    if (msg.role === 'bot') {
      const cssClass = msg.isAction ? 'chatbot-msg bot action-result' : 'chatbot-msg bot';
      return `
        <div class="${cssClass}">
          <div class="chatbot-msg-avatar">${msg.avatar}</div>
          <div class="chatbot-msg-content">
            <div class="chatbot-msg-name">${msg.name}</div>
            <div class="chatbot-msg-text">${msg.text}</div>
            <div class="chatbot-msg-time">${msg.time}</div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="chatbot-msg user">
          <div class="chatbot-msg-avatar">AK</div>
          <div class="chatbot-msg-content">
            <div class="chatbot-msg-name">You</div>
            <div class="chatbot-msg-text">${msg.text}</div>
            <div class="chatbot-msg-time">${msg.time}</div>
          </div>
        </div>
      `;
    }
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function sendChatbotMessage() {
  const input = document.getElementById('chatbot-input');
  const text = input.value.trim();
  if (!text) return;

  // Add user message
  const userMsg = { role: 'user', text, time: 'Just now' };
  chatHistory[currentChatbotTab].push(userMsg);
  renderChatHistory(currentChatbotTab);
  input.value = '';

  // Simulate bot response
  showTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();
    const response = generateBotResponse(text, currentChatbotTab);
    chatHistory[currentChatbotTab].push(response);
    renderChatHistory(currentChatbotTab);
  }, 1200 + Math.random() * 800);
}

function generateBotResponse(userText, tab) {
  const currentContact = messages[getCurrentThreadId()] || messages[0];
  const lower = userText.toLowerCase();

  if (tab === 'agent') {
    if (lower.includes('summar')) {
      return { role: 'bot', name: 'Torqe Agent', avatar: '🤖', text: `📋 <strong>Summary of ${currentContact.name}'s conversation:</strong><br><br>• ${currentContact.name} has been in contact via ${currentContact.channelLabel}<br>• Priority level: <strong>${currentContact.priority.toUpperCase()}</strong><br>• Last message: "${currentContact.preview}"<br>• Sentiment: The conversation tone suggests ${currentContact.priority === 'urgent' ? 'urgency and frustration' : 'moderate interest and patience'}`, time: 'Just now' };
    } else if (lower.includes('draft') || lower.includes('reply')) {
      return { role: 'bot', name: 'Torqe Agent', avatar: '🤖', text: `✍️ <strong>Draft reply for ${currentContact.name}:</strong><br><br>"Hi ${currentContact.name.split(' ')[0]}! Thanks for reaching out. I wanted to personally follow up on your message. I've reviewed everything on my end and have the details ready for you. Would you prefer a quick call or should I send everything over in a message?"<br><br><em>Tone: Professional & Warm</em>`, time: 'Just now' };
    } else if (lower.includes('follow') || lower.includes('remind')) {
      return { role: 'bot', name: 'Torqe Agent', avatar: '🤖', text: `⏰ <strong>Follow-up scheduled:</strong><br><br>I've queued a follow-up message for <strong>${currentContact.name}</strong> optimised for their most active time. It'll be sent via <strong>${currentContact.channelLabel}</strong> at the next optimal window.<br><br>📝 Draft: "Hey ${currentContact.name.split(' ')[0]}, just wanted to check in — did you get a chance to review my last message?"`, time: 'Just now' };
    } else if (lower.includes('help') || lower.includes('what can')) {
      return { role: 'bot', name: 'Torqe Agent', avatar: '🤖', text: '🧰 <strong>Here\'s what I can do:</strong><br><br>📋 <strong>Summarise</strong> — Get a quick summary of any conversation<br>✍️ <strong>Draft Reply</strong> — AI-generated response matched to your tone<br>⏰ <strong>Follow-up</strong> — Schedule smart follow-ups after silence<br>📤 <strong>Smart Send</strong> — Send at the optimal time for each contact<br>🧠 <strong>Vibe Check</strong> — Get a mood/objection analysis before calls<br>🎭 <strong>Tone Rewrite</strong> — Rewrite messages in different tones<br><br>Just click the buttons above or ask me directly!', time: 'Just now' };
    } else {
      return { role: 'bot', name: 'Torqe Agent', avatar: '🤖', text: `Got it! I'm analysing your request regarding "<em>${userText}</em>" in the context of your conversation with <strong>${currentContact.name}</strong>.<br><br>Based on the current thread, I'd recommend addressing their main concern directly and following up with specific details. Want me to draft a response or take a specific action?`, time: 'Just now' };
    }
  } else {
    // Negotiate Coach responses
    if (lower.includes('counter') || lower.includes('offer') || lower.includes('price')) {
      return { role: 'bot', name: 'Negotiate Coach', avatar: '🤝', text: '💰 <strong>Counter-Offer Analysis:</strong><br><br>Based on Rahul\'s anchoring at ₹4.5L against your ₹6L proposal:<br><br>🟢 <strong>Recommended:</strong> ₹5.4L (-10%) — Position as "early adopter rate" with free onboarding<br>🟡 <strong>Conservative:</strong> ₹5.7L (-5%) — Add extra quarter of premium support<br>🔴 <strong>Aggressive:</strong> ₹4.8L (-20%) — Only if deal is slipping, require 2-year commitment<br><br>📊 At ₹5.4L, close probability increases from 67% to ~78%', time: 'Just now' };
    } else if (lower.includes('close') || lower.includes('score') || lower.includes('likelihood')) {
      return { role: 'bot', name: 'Negotiate Coach', avatar: '🤝', text: '📊 <strong>Close Likelihood: 67%</strong><br><br>Key signals:<br>• ✅ <strong>Engagement:</strong> High — responding within hours<br>• ⚠️ <strong>Objections:</strong> 2 open (pricing + timeline)<br>• 🕐 <strong>Timeline:</strong> Decision expected this week<br>• 📈 <strong>Trend:</strong> Positive — stopped pushing back on price, asking about ROI<br><br>💡 <strong>Tip:</strong> Share a case study from his industry to push past 75%', time: 'Just now' };
    } else if (lower.includes('strateg') || lower.includes('tactic') || lower.includes('tip')) {
      return { role: 'bot', name: 'Negotiate Coach', avatar: '🤝', text: '🎯 <strong>Negotiation Strategy for this deal:</strong><br><br>1️⃣ <strong>Feel, Felt, Found:</strong> "I understand your concern. Other companies in your space felt the same way, but found that the ROI justified the investment within Q1."<br><br>2️⃣ <strong>Quarterly billing:</strong> Offer to break annual fee into quarterly — reduces risk perception without cutting price<br><br>3️⃣ <strong>Urgency play:</strong> Free onboarding (₹50K value) if signed by Friday<br><br>⚠️ <strong>Avoid:</strong> Don\'t discount more than 15%. He wants value, not cheapness.', time: 'Just now' };
    } else {
      return { role: 'bot', name: 'Negotiate Coach', avatar: '🤝', text: `Analysing your question: "<em>${userText}</em>"<br><br>In the context of the current deal with Rahul (₹6L enterprise plan), I'd suggest maintaining your value position. The buyer is showing positive engagement signals — this is not the time to make concessions unless strategically necessary.<br><br>Want me to prepare a specific counter-offer or analyse a different aspect?`, time: 'Just now' };
    }
  }
}

// ============================================
// AI TOOL ACTION BUTTONS
// ============================================

function chatbotAction(action) {
  const currentContact = messages[getCurrentThreadId()] || messages[0];
  const botName = currentChatbotTab === 'agent' ? 'Torqe Agent' : 'Negotiate Coach';
  const botAvatar = currentChatbotTab === 'agent' ? '🤖' : '🤝';

  // Open chatbot if not open
  if (!chatbotOpen) {
    toggleChatbot(currentChatbotTab || 'agent');
  }

  // Flash the clicked button
  const btns = document.querySelectorAll('.chatbot-tool-btn');
  btns.forEach(b => b.classList.remove('active-tool'));

  const actionResponses = {
    summarise: {
      user: `Summarise my conversation with ${currentContact.name}`,
      bot: `📋 <strong>Conversation Summary — ${currentContact.name}</strong><br><br>📌 <strong>Channel:</strong> ${currentContact.channelLabel}<br>🔴 <strong>Priority:</strong> ${currentContact.priority.toUpperCase()}<br>💬 <strong>Messages exchanged:</strong> ${currentContact.thread.length}<br>📅 <strong>Last activity:</strong> ${currentContact.time}<br><br>📝 <strong>Key points:</strong><br>• Latest message: "${currentContact.preview}"<br>• ${currentContact.priority === 'urgent' ? 'Needs immediate attention — frustration signals detected' : 'Engagement level is moderate — follow-up recommended within 24hrs'}<br>• Recommended next action: ${currentContact.priority === 'urgent' ? 'Send a direct response acknowledging the delay' : 'Queue a follow-up with relevant details'}`
    },
    followup: {
      user: `Create a follow-up for ${currentContact.name}`,
      bot: `👻 <strong>Follow-up Draft Ready</strong><br><br>📤 <strong>To:</strong> ${currentContact.name} via ${currentContact.channelLabel}<br>⏰ <strong>Optimal send time:</strong> Tomorrow, 10:30 AM<br><br>📝 <strong>Draft message:</strong><br>"Hi ${currentContact.name.split(' ')[0]}! Just wanted to circle back on our last conversation. I have some updates that I think you'll find valuable. When would be a good time to connect?"<br><br><em>Click Approve & Send to queue this message.</em>`
    },
    smartsend: {
      user: `What's the best time to message ${currentContact.name}?`,
      bot: `⏰ <strong>Smart Send Analysis — ${currentContact.name}</strong><br><br>📊 Based on ${currentContact.name}'s response patterns:<br><br>🟢 <strong>Best time:</strong> 10:15 AM – 11:30 AM (weekdays)<br>🟡 <strong>Good:</strong> 2:00 PM – 3:30 PM<br>🔴 <strong>Avoid:</strong> After 6:00 PM and weekends<br><br>📈 <strong>Response rate:</strong> 89% within 2 hours when sent in the morning window<br>📱 <strong>Preferred channel:</strong> ${currentContact.channelLabel}<br><br>💡 I can schedule your message to send at the optimal time automatically.`
    },
    draft: {
      user: `Draft a reply to ${currentContact.name}`,
      bot: `✍️ <strong>AI Draft Reply — ${currentContact.name}</strong><br><br>"Hi ${currentContact.name.split(' ')[0]}! Thanks for your message. I've been reviewing everything and wanted to get back to you with a comprehensive response.<br><br>${currentContact.priority === 'urgent' ? 'I understand the urgency here and want to assure you this is my top priority. I\'m preparing the details right now and will have everything ready for you within the hour.' : 'I appreciate your patience. I\'ve put together the information you requested and would love to walk you through it. Would you prefer a quick call or should I send everything in a detailed message?'}<br><br>Looking forward to hearing from you!"<br><br><em>Tone: Professional & Responsive</em>`
    },
    vibecheck: {
      user: `Vibe check on ${currentContact.name}`,
      bot: `🧠 <strong>Vibe Check — ${currentContact.name}</strong><br><br>😤 <strong>Mood:</strong> ${currentContact.priority === 'urgent' ? 'Frustrated — tone is direct and expectant. Minimal pleasantries.' : currentContact.priority === 'high' ? 'Interested but cautious — asking qualifying questions.' : 'Relaxed and curious — open to conversation.'}<br><br>🛡️ <strong>Objections:</strong> ${currentContact.priority === 'urgent' ? 'Concerned about speed of delivery. Expects immediate action.' : 'May be comparing options. Needs more confidence in value proposition.'}<br><br>🎯 <strong>Best Angle:</strong> ${currentContact.priority === 'urgent' ? 'Lead with urgency acknowledgment and immediate next steps. No fluff.' : 'Share social proof and specific ROI numbers. Build trust gradually.'}<br><br>⚡ <strong>Energy match:</strong> ${currentContact.priority === 'urgent' ? 'Be responsive, concise, and action-oriented' : 'Be warm, detailed, and thorough'}`
    },
    tone: {
      user: `Rewrite my last message to ${currentContact.name} in different tones`,
      bot: `🎭 <strong>Tone Rewrite Options</strong><br><br>💼 <strong>Professional:</strong><br>"Dear ${currentContact.name.split(' ')[0]}, thank you for your continued patience. I've prepared a comprehensive update that addresses your key concerns. Shall we schedule a brief call to review?"<br><br>😎 <strong>Casual:</strong><br>"Hey ${currentContact.name.split(' ')[0]}! Got everything sorted out on my end. Want to hop on a quick call and go through it together?"<br><br>💪 <strong>Assertive:</strong><br>"${currentContact.name.split(' ')[0]}, I have the full breakdown ready. Let's lock in a time today to review and move forward decisively."<br><br>🤗 <strong>Warm:</strong><br>"Hi ${currentContact.name.split(' ')[0]}! I really appreciate you reaching out. I've put extra care into preparing this — I think you'll feel great about what we've got. When can we chat?"`
    }
  };

  const response = actionResponses[action];
  if (!response) return;

  // Add user request message
  chatHistory[currentChatbotTab].push({ role: 'user', text: response.user, time: 'Just now' });
  renderChatHistory(currentChatbotTab);

  // Show typing then bot response
  showTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();
    chatHistory[currentChatbotTab].push({
      role: 'bot',
      name: botName,
      avatar: botAvatar,
      text: response.bot,
      time: 'Just now',
      isAction: true
    });
    renderChatHistory(currentChatbotTab);
  }, 1000 + Math.random() * 500);
}

// ============================================
// TYPING INDICATOR
// ============================================

function showTypingIndicator() {
  const container = document.getElementById('chatbot-messages');
  const typingEl = document.createElement('div');
  typingEl.className = 'chatbot-msg bot';
  typingEl.id = 'chatbot-typing';
  const avatar = currentChatbotTab === 'agent' ? '🤖' : '🤝';
  typingEl.innerHTML = `
    <div class="chatbot-msg-avatar">${avatar}</div>
    <div class="chatbot-msg-content">
      <div class="chatbot-typing">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  container.appendChild(typingEl);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById('chatbot-typing');
  if (typing) typing.remove();
}
