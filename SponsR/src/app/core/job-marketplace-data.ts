export interface CampaignOpportunity {
  id: string;
  companyName: string;
  title: string;
  category: string;
  description: string;
  creatorCapacity: number;
  assignedCreatorIds: string[];
  interestedCreatorIds: string[];
}

export interface JobOpportunity {
  id: string;
  campaignId: string | null;
  campaignTitle: string | null;
  companyName: string;
  title: string;
  category: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  interestDeadline: string;
  deliveryDeadline: string;
  creatorCapacity: number;
  assignedCreatorIds: string[];
  interestedCreatorIds: string[];
  shortlistedCreatorIds: string[];
}

export const campaignOpportunities: CampaignOpportunity[] = [
  {
    id: 'campaign-slower-mornings',
    companyName: 'Morrow',
    title: 'The slower mornings series',
    category: 'Wellness',
    description: 'A collection of creator-led stories celebrating the small rituals that make mornings feel better.',
    creatorCapacity: 8,
    assignedCreatorIds: ['creator-lena-park', 'creator-aria-morgan'],
    interestedCreatorIds: ['creator-sam-rivera', 'creator-maya-patel', 'creator-zoe-chen']
  },
  {
    id: 'campaign-outside-more',
    companyName: 'Trailhead Supply',
    title: 'Outside, more often',
    category: 'Outdoors',
    description: 'Inspire more people to find a nearby trail, park, or fresh-air escape.',
    creatorCapacity: 6,
    assignedCreatorIds: ['creator-jules-lee'],
    interestedCreatorIds: ['creator-eli-williams', 'creator-amara-jones', 'creator-finn-murphy']
  },
  {
    id: 'campaign-goodfolk-rituals',
    companyName: 'Goodfolk Coffee',
    title: 'Good mornings, made together',
    category: 'Food & drink',
    description: 'Creator-led stories for people who make space for a good cup and a slower start.',
    creatorCapacity: 5,
    assignedCreatorIds: [],
    interestedCreatorIds: ['creator-lena-park', 'creator-aria-morgan']
  },
  {
    id: 'campaign-northstar-next',
    companyName: 'Northstar Labs',
    title: 'Tools for what’s next',
    category: 'Technology',
    description: 'Show how useful technology can make room for the ideas and projects ahead.',
    creatorCapacity: 3,
    assignedCreatorIds: ['creator-noah-bennett'],
    interestedCreatorIds: ['creator-theo-brooks', 'creator-marcus-reed']
  },
  {
    id: 'campaign-velora-movement',
    companyName: 'Velora Health',
    title: 'Find your kind of movement',
    category: 'Fitness',
    description: 'Creator-led stories that make movement feel welcoming, joyful, and doable.',
    creatorCapacity: 4,
    assignedCreatorIds: [],
    interestedCreatorIds: ['creator-amara-jones']
  }
];

export const jobOpportunities: JobOpportunity[] = [
  {
    id: 'job-morrow-reset',
    campaignId: 'campaign-goodfolk-rituals',
    campaignTitle: 'Good mornings, made together',
    companyName: 'Morrow',
    title: 'Make room for a reset',
    category: 'Wellness',
    description: 'Create a short-form video about a small routine that helps your audience reset.',
    budgetMin: 1800,
    budgetMax: 3200,
    interestDeadline: '2026-10-28',
    deliveryDeadline: '2026-11-12',
    creatorCapacity: 4,
    assignedCreatorIds: ['creator-lena-park'],
    interestedCreatorIds: ['creator-sam-rivera', 'creator-aria-morgan', 'creator-amara-jones'],
    shortlistedCreatorIds: ['creator-sam-rivera']
  },
  {
    id: 'job-goodfolk-morning',
    campaignId: 'campaign-slower-mornings',
    campaignTitle: 'The slower mornings series',
    companyName: 'Goodfolk Coffee',
    title: 'A slower kind of morning',
    category: 'Food & drink',
    description: 'Share your favorite cozy coffee ritual in an authentic, everyday story.',
    budgetMin: 1200,
    budgetMax: 2800,
    interestDeadline: '2026-10-30',
    deliveryDeadline: '2026-11-16',
    creatorCapacity: 3,
    assignedCreatorIds: ['creator-aria-morgan'],
    interestedCreatorIds: ['creator-lena-park', 'creator-maya-patel'],
    shortlistedCreatorIds: []
  },
  {
    id: 'job-trailhead-weekend',
    campaignId: 'campaign-outside-more',
    campaignTitle: 'Outside, more often',
    companyName: 'Trailhead Supply',
    title: 'Take the long way home',
    category: 'Outdoors',
    description: 'Show your community a nearby escape and the essentials you take along.',
    budgetMin: 2500,
    budgetMax: 5200,
    interestDeadline: '2026-11-02',
    deliveryDeadline: '2026-11-24',
    creatorCapacity: 3,
    assignedCreatorIds: [],
    interestedCreatorIds: ['creator-jules-lee', 'creator-zoe-chen', 'creator-finn-murphy'],
    shortlistedCreatorIds: ['creator-jules-lee', 'creator-zoe-chen']
  },
  {
    id: 'job-northstar-tools',
    campaignId: 'campaign-northstar-next',
    campaignTitle: 'Tools for what’s next',
    companyName: 'Northstar Labs',
    title: 'Tools for what’s next',
    category: 'Technology',
    description: 'Put a genuinely useful new tool in the hands of your audience.',
    budgetMin: 3200,
    budgetMax: 7000,
    interestDeadline: '2026-11-05',
    deliveryDeadline: '2026-11-30',
    creatorCapacity: 2,
    assignedCreatorIds: ['creator-noah-bennett'],
    interestedCreatorIds: ['creator-theo-brooks', 'creator-marcus-reed'],
    shortlistedCreatorIds: ['creator-theo-brooks']
  },
  {
    id: 'job-mint-home',
    campaignId: null,
    campaignTitle: null,
    companyName: 'Mint & Moss',
    title: 'A home that feels like you',
    category: 'Interiors',
    description: 'Create an inviting home story featuring thoughtful, low-waste essentials.',
    budgetMin: 1600,
    budgetMax: 3600,
    interestDeadline: '2026-11-08',
    deliveryDeadline: '2026-12-02',
    creatorCapacity: 3,
    assignedCreatorIds: [],
    interestedCreatorIds: ['creator-maya-patel', 'creator-aria-morgan'],
    shortlistedCreatorIds: []
  },
  {
    id: 'job-velora-movement',
    campaignId: 'campaign-velora-movement',
    campaignTitle: 'Find your kind of movement',
    companyName: 'Velora Health',
    title: 'Movement that meets you where you are',
    category: 'Fitness',
    description: 'Create an encouraging story about movement that fits your real life.',
    budgetMin: 1500,
    budgetMax: 4500,
    interestDeadline: '2026-11-10',
    deliveryDeadline: '2026-12-05',
    creatorCapacity: 3,
    assignedCreatorIds: [],
    interestedCreatorIds: ['creator-amara-jones'],
    shortlistedCreatorIds: []
  }
];
