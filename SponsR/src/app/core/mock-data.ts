export interface CreatorProfile {
  name: string;
  niche: string;
  platform: string;
  reach: string;
  engagement: string;
  rate: string;
  highlight: string;
}

export interface ChannelProfile {
  name: string;
  followers: string;
  status: string;
}

export interface RateCard {
  name: string;
  detail: string;
  price: string;
}

export interface CampaignRecord {
  name: string;
  brand: string;
  status: string;
  amount: string;
  milestones: Array<{ label: string; detail: string; complete: boolean }>;
}

export interface MessageThread {
  name: string;
  time: string;
  preview: string;
}

export interface ChatMessage {
  text: string;
  time: string;
  me: boolean;
}

export interface PayoutItem {
  label: string;
  note: string;
  amount: string;
}

export interface PaymentView {
  label: string;
  amount: string;
  detail: string;
}

export const overviewFeatures = [
  {
    icon: '🎥',
    title: 'Unified media kits',
    description: 'Creators aggregate YouTube, podcast, newsletter, and social proof in a single sponsor-ready profile.'
  },
  {
    icon: '🤝',
    title: 'Campaign proposals',
    description: 'Brands send offers, negotiate terms, and approve content milestones with a transparent workflow.'
  },
  {
    icon: '💸',
    title: 'Escrow-backed payouts',
    description: 'Stripe Connect and milestone approval help release funds securely and reduce disputes.'
  },
  {
    icon: '📈',
    title: 'Audience intelligence',
    description: 'Demographics, engagement quality, and channel performance are surfaced for faster brand-fit decisions.'
  }
];

export const creatorProfiles: CreatorProfile[] = [
  {
    name: 'Nova Frame',
    niche: 'Tech',
    platform: 'YouTube + Podcast',
    reach: '240K monthly',
    engagement: '7.2%',
    rate: '$2,400 / episode',
    highlight: 'B2B creator with high intent audiences and product demo storytelling.'
  },
  {
    name: 'Cora Content',
    niche: 'Finance',
    platform: 'Newsletter + Social',
    reach: '180K weekly',
    engagement: '8.6%',
    rate: '$3,100 / feature',
    highlight: 'Strong affinity with SaaS, fintech launches, and founder-led trust narratives.'
  },
  {
    name: 'Rift Rush',
    niche: 'Gaming',
    platform: 'Twitch + UGC',
    reach: '420K monthly',
    engagement: '9.4%',
    rate: '$5,800 / sponsorship',
    highlight: 'Community-first gaming creator with live event activation and rapid conversion.'
  },
  {
    name: 'Wellkind Studio',
    niche: 'Health',
    platform: 'Instagram + Podcast',
    reach: '95K monthly',
    engagement: '6.1%',
    rate: '$1,900 / campaign',
    highlight: 'Trusted wellness voice with efficient creator-led product education.'
  }
];

export const channelProfiles: ChannelProfile[] = [
  { name: 'YouTube', followers: '780K subscribers', status: 'Verified' },
  { name: 'Podcast', followers: '112K monthly listeners', status: 'Verified' },
  { name: 'Newsletter', followers: '54K subscribers', status: 'Verified' },
  { name: 'Instagram', followers: '96K followers', status: 'Pending' }
];

export const rateCards: RateCard[] = [
  { name: 'CPM', detail: 'Brand-safe inventory', price: '$11,500' },
  { name: 'Flat fee', detail: 'Sponsored episode', price: '$8,800' },
  { name: 'Affiliate', detail: 'Commission + bonus', price: '12%' },
  { name: 'Product gifting', detail: 'Owned content package', price: 'Included' }
];

export const campaignRecords: CampaignRecord[] = [
  {
    name: 'Summer Creator Launch',
    brand: 'Northstar Labs',
    status: 'Escrow funded',
    amount: '$12,500',
    milestones: [
      { label: 'Offer accepted', detail: 'Contract signed', complete: true },
      { label: 'Creative brief', detail: 'Approved by sponsor', complete: true },
      { label: 'Draft review', detail: 'Awaiting feedback', complete: false },
      { label: 'Publication', detail: 'Scheduled for July 12', complete: false }
    ]
  },
  {
    name: 'Wellness Product Push',
    brand: 'Velora Health',
    status: 'In review',
    amount: '$7,900',
    milestones: [
      { label: 'Offer accepted', detail: 'Contract signed', complete: true },
      { label: 'Creative brief', detail: 'Approved by sponsor', complete: true },
      { label: 'Draft review', detail: 'Brand feedback sent', complete: true },
      { label: 'Publication', detail: 'Pending final approval', complete: false }
    ]
  }
];

export const messageThreads: MessageThread[] = [
  { name: 'Northstar Labs', time: '2m ago', preview: 'Can we move the approval window to Friday?' },
  { name: 'Velora Health', time: '19m ago', preview: 'Great—preview assets are in the brief.' },
  { name: 'CreatorOps', time: '1h ago', preview: 'We need a revised payout schedule.' }
];

export const chatMessages: ChatMessage[] = [
  { text: 'We love the concept. Can you send a short script outline for approval?', time: '09:42 AM', me: false },
  { text: 'Absolutely. I’ll send a revised script and proofs by Friday morning.', time: '09:44 AM', me: true },
  { text: 'Perfect. Please include the final CTA and product URL.', time: '09:46 AM', me: false }
];

export const payoutItems: PayoutItem[] = [
  { label: 'Creator settlement', note: 'Northstar Labs • final approval', amount: '$8,400' },
  { label: 'Marketplace fee', note: 'Platform commission', amount: '$1,260' },
  { label: 'Admin reserve', note: 'Dispute reserve', amount: '$2,100' }
];

export const homepageMetrics = [
  { label: 'Creators live', value: '4.2K' },
  { label: 'Campaigns funded', value: '$12.8M' },
  { label: 'Avg. sponsor ROI', value: '4.8x' },
  { label: 'Approval speed', value: '2.3 days' }
];

export const featuredCreators = [
  { name: 'Nova Frame', niche: 'Tech', reach: '240K', rate: '$2.4K / episode', tag: 'YouTube + Podcast' },
  { name: 'Cora Content', niche: 'Finance', reach: '180K', rate: '$3.1K / feature', tag: 'Newsletter + Social' },
  { name: 'Rift Rush', niche: 'Gaming', reach: '420K', rate: '$5.8K / sponsor', tag: 'Twitch + UGC' },
  { name: 'Wellkind Studio', niche: 'Health', reach: '95K', rate: '$1.9K / campaign', tag: 'Instagram + Podcast' }
];

export const featuredCampaigns = [
  { title: 'Summer Creator Launch', brand: 'Northstar Labs', budget: '$12.5K', type: 'Product awareness', status: 'Escrow funded' },
  { title: 'Wellness Product Push', brand: 'Velora Health', budget: '$7.9K', type: 'Educational campaign', status: 'In review' },
  { title: 'Creator Community Boost', brand: 'SparkPilot', budget: '$9.2K', type: 'UGC + newsletter', status: 'Open brief' }
];

export const featuredCompanies = [
  'Northstar Labs',
  'Velora Health',
  'CreatorOps',
  'SparkPilot',
  'Aster & Co.',
  'SignalWorks'
];

export const paymentViews: Record<string, PaymentView[]> = {
  wallet: [
    { label: 'Available balance', amount: '$48,620', detail: 'Ready for next transfer' },
    { label: 'Pending payouts', amount: '$12,750', detail: 'Queued for approval' },
    { label: 'Platform credit', amount: '$3,140', detail: 'Campaign reserves' }
  ],
  escrow: [
    { label: 'Escrow held', amount: '$13,200', detail: 'Locked for active campaigns' },
    { label: 'Release ready', amount: '$8,400', detail: 'Final approval pending' },
    { label: 'Dispute reserve', amount: '$2,100', detail: 'Admin-managed hold' }
  ],
  invoices: [
    { label: 'Invoice #S-2046', amount: '$4,200', detail: 'Northstar Labs — sponsored episode' },
    { label: 'Invoice #S-2019', amount: '$2,800', detail: 'Velora Health — product feature' },
    { label: 'Invoice #S-1987', amount: '$1,620', detail: 'CreatorOps — campaign retainer' }
  ]
};

export const threadMessages: Record<string, ChatMessage[]> = {
  'Northstar Labs': [
    { text: 'We love the concept. Can you send a short script outline for approval?', time: '09:42 AM', me: false },
    { text: 'Absolutely. I’ll send a revised script and proofs by Friday morning.', time: '09:44 AM', me: true },
    { text: 'Perfect. Please include the final CTA and product URL.', time: '09:46 AM', me: false }
  ],
  'Velora Health': [
    { text: 'We need preview assets before we can approve final publication.', time: '08:18 AM', me: false },
    { text: 'I’ve uploaded the revised draft and key visuals for review.', time: '08:25 AM', me: true },
    { text: 'Great—this is aligned with the brief and timeline.', time: '08:31 AM', me: false }
  ],
  'CreatorOps': [
    { text: 'The contract needs a revised payout schedule for Q3.', time: 'Yesterday', me: false },
    { text: 'I can share a revised split structure with milestones.', time: 'Yesterday', me: true }
  ]
};
