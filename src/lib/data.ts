import { Message } from '@/types';

export const messages: Message[] = [
  {
    id: 0,
    name: 'Rahul Nair',
    initials: 'RN',
    channel: 'whatsapp',
    channelLabel: 'WhatsApp',
    priority: 'urgent',
    time: '3m ago',
    preview: "I've been waiting for the revised timeline — when can we expect it?",
    unread: true,
    gradient: 'linear-gradient(135deg,#f97316,#fb923c)',
    thread: [
      { type: 'incoming', text: 'Hey, just wanted to follow up on the project. The client is pushing hard on deadlines.', time: 'Yesterday 2:14 PM' },
      { type: 'outgoing', text: "Hi Rahul! I'm working on the revised timeline. Should have something solid by EOD.", time: 'Yesterday 3:30 PM' },
      { type: 'incoming', text: 'EOD has passed btw. Still waiting.', time: 'Yesterday 8:45 PM' },
      { type: 'incoming', text: "I've been waiting for the revised timeline — when can we expect it?", time: '3 min ago' }
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
      { type: 'incoming', text: "Hi there! I've been evaluating Torqe for our team of 50+. Could you share the enterprise pricing breakdown?", time: '18 min ago' }
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
      { type: 'outgoing', text: "Hi Vikram! Following up on our demo call. Would love to hear your team's thoughts.", time: 'Yesterday 11:00 AM' },
      { type: 'incoming', text: "Let me check with my team and circle back.", time: '1h ago' }
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
      { type: 'outgoing', text: "Hi Neha, attached is the proposal for the Q2 campaign. Let me know if any questions!", time: 'Yesterday 9:00 AM' },
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
      { type: 'incoming', text: "Hey, quick question — can we sync on the integration timeline tomorrow?", time: '3h ago' }
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
    preview: "Interesting, let me think about it. What's the minimum commitment?",
    unread: false,
    gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)',
    thread: [
      { type: 'outgoing', text: "Here's how Torqe could help your recruiting workflow — 60% faster candidate screening with AI.", time: 'Yesterday 2:00 PM' },
      { type: 'incoming', text: "Interesting, let me think about it. What's the minimum commitment?", time: '4h ago' }
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
      { type: 'incoming', text: "Saw your product demo reel. Looks interesting! Do you have a B2B version?", time: '6h ago' }
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
      { type: 'incoming', text: "URGENT: Our current contract expires tomorrow. We need the renewal terms ASAP to get legal approval. Can you send the updated agreement by EOD?", time: '7h ago' }
    ]
  }
];

export const inboxStats = [
  { label: 'Total Messages', value: '2,847', change: '+12.5% this week', changeType: 'up' as const },
  { label: 'Avg Response Time', value: '4.2', suffix: 'min', change: '-18% faster', changeType: 'up' as const },
  { label: 'Active Threads', value: '38', change: '-3 from yesterday', changeType: 'down' as const },
  { label: 'Urgent', value: '7', change: 'Needs attention now', color: 'text-orange' },
];

export const aiStats = [
  { label: 'AI Drafts Today', value: '23', change: '+8 more than avg', changeType: 'up' as const },
  { label: 'Voice Notes Transcribed', value: '12', change: '100% accuracy', changeType: 'up' as const },
  { label: 'Sentiment Alerts', value: '3', change: '2 leads cooling', changeType: 'down' as const, color: 'text-danger' },
  { label: 'Tone Rewrites', value: '17', change: 'Most used: Professional', changeType: 'up' as const },
];

export const pipelineStats = [
  { label: 'Ghost Follow-ups Pending', value: '5', change: 'Awaiting approval', color: 'text-orange' },
  { label: 'Queued Messages', value: '12', change: 'Optimized send times', changeType: 'up' as const },
  { label: 'Scam Alerts', value: '2', change: 'Flagged today', changeType: 'down' as const, color: 'text-danger' },
  { label: 'Follow-up Rate', value: '94', suffix: '%', change: '+6% this month', changeType: 'up' as const },
];

export const negotiateStats = [
  { label: 'Active Deals', value: '8', change: '3 closing this week', changeType: 'up' as const },
  { label: 'Avg Close Rate', value: '67', suffix: '%', change: '+5% with AI coaching', changeType: 'up' as const },
  { label: 'Counter-offers Made', value: '14', change: '9 accepted', changeType: 'up' as const },
  { label: 'Revenue at Stake', value: '₹24', suffix: 'L', change: 'Across all active deals' },
];
