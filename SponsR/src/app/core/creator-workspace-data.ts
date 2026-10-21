export interface CreatorNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: 'proposal' | 'payment' | 'campaign';
}

export interface CreatorProposal {
  id: string;
  campaign: string;
  brand: string;
  submitted: string;
  status: 'In review' | 'Shortlisted' | 'Needs update' | 'Accepted' | 'Declined';
  amount: string;
  deliverables: string;
  platform: string;
  timeline: string;
  usageRights: string;
  brief: string;
}

export interface CreatorDeadline {
  id: string;
  task: string;
  campaign: string;
  dueDate: string;
  daysRemaining: number;
  priority: 'Due soon' | 'Upcoming';
}

export interface CreatorCampaign {
  id: string;
  name: string;
  brand: string;
  status: string;
  nextStep: string;
  dueDate: string;
  amount: string;
}

export const creatorNotifications: CreatorNotification[] = [
  { id: 'notification-proposal-shortlist', title: 'You made the shortlist!', detail: 'Morrow · Make room for a reset', time: '12 min ago', kind: 'proposal' },
  { id: 'notification-payment-released', title: 'Payment is on its way', detail: 'Goodfolk Coffee · $1,850', time: '2 hours ago', kind: 'payment' },
  { id: 'notification-new-campaign', title: 'A new campaign fits your profile', detail: 'Trailhead Supply · Take the long way home', time: 'Yesterday', kind: 'campaign' }
];

export const creatorProposals: CreatorProposal[] = [
  { id: 'proposal-morrow-reset', campaign: 'Make room for a reset', brand: 'Morrow', submitted: 'Today', status: 'Shortlisted', amount: '$2,400', deliverables: '1 short-form video and 2 story frames', platform: 'Instagram and TikTok', timeline: 'Concept due Oct 25 · Publish by Nov 12', usageRights: 'Organic social usage for 90 days', brief: 'Share a genuine reset ritual that helps your community feel their best. Keep the story personal, approachable, and rooted in your everyday routine.' },
  { id: 'proposal-goodfolk-morning', campaign: 'A slower kind of morning', brand: 'Goodfolk Coffee', submitted: 'Yesterday', status: 'In review', amount: '$1,850', deliverables: '1 recipe-style video and 1 story frame', platform: 'Instagram', timeline: 'Concept due Oct 27 · Publish by Nov 16', usageRights: 'Organic social usage for 60 days', brief: 'Create a cozy morning moment featuring your own coffee ritual and an honest product mention.' },
  { id: 'proposal-velora-well', campaign: 'Wellbeing, your way', brand: 'Velora Health', submitted: 'Oct 18', status: 'Needs update', amount: '$2,100', deliverables: '1 short-form video and 3 still images', platform: 'TikTok and Instagram', timeline: 'Revised concept requested by Oct 24', usageRights: 'Organic social usage for 90 days', brief: 'Tell a grounded story about the small habits that help you feel well. Avoid medical claims and focus on personal experience.' },
  { id: 'proposal-mint-home', campaign: 'A home that feels like you', brand: 'Mint & Moss', submitted: 'Oct 16', status: 'Accepted', amount: '$3,200', deliverables: '1 room feature video and 3 story frames', platform: 'Instagram and Pinterest', timeline: 'Draft due Oct 21 · Publish by Nov 8', usageRights: 'Organic social usage for 90 days', brief: 'Show how a few considered, low-waste home details make your space feel personal and inviting.' }
];

export const creatorDeadlines: CreatorDeadline[] = [
  { id: 'deadline-mint-draft', task: 'Submit first draft', campaign: 'A home that feels like you · Mint & Moss', dueDate: 'Today', daysRemaining: 0, priority: 'Due soon' },
  { id: 'deadline-goodfolk-concept', task: 'Share concept for approval', campaign: 'A slower kind of morning · Goodfolk Coffee', dueDate: 'Tomorrow', daysRemaining: 1, priority: 'Due soon' },
  { id: 'deadline-morrow-post', task: 'Publish campaign content', campaign: 'Make room for a reset · Morrow', dueDate: 'Oct 25', daysRemaining: 4, priority: 'Upcoming' },
  { id: 'deadline-trailhead-outline', task: 'Send creative outline', campaign: 'Take the long way home · Trailhead Supply', dueDate: 'Oct 29', daysRemaining: 8, priority: 'Upcoming' }
];

export const creatorCampaigns: CreatorCampaign[] = [
  { id: 'creator-campaign-mint', name: 'A home that feels like you', brand: 'Mint & Moss', status: 'In progress', nextStep: 'Submit first draft', dueDate: 'Today', amount: '$3,200' },
  { id: 'creator-campaign-goodfolk', name: 'A slower kind of morning', brand: 'Goodfolk Coffee', status: 'Brief approved', nextStep: 'Share concept', dueDate: 'Tomorrow', amount: '$1,850' },
  { id: 'creator-campaign-morrow', name: 'Make room for a reset', brand: 'Morrow', status: 'Shortlisted', nextStep: 'Awaiting brand reply', dueDate: 'Oct 25', amount: '$2,400' }
];
