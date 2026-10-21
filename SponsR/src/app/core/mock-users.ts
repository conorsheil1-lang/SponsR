import type { CompanyAccount, CreatorAccount } from './marketplace-models';

export interface CreatorAudienceDemographics {
  primaryAgeRange: string;
  topLocations: string[];
  audienceGenderSplit: {
    women: number;
    men: number;
    other: number;
  };
}

export interface CreatorRateCardItem {
  deliverable: string;
  platform: string;
  rate: number;
  currency: 'USD';
}

export interface CreatorUserProfile extends CreatorAccount {
  email: string;
  location: string;
  languages: string[];
  contentFormats: string[];
  audienceDemographics: CreatorAudienceDemographics;
  rateCard: CreatorRateCardItem[];
  mediaKitUrl: string;
  website: string;
}

export interface CompanyUserProfile extends CompanyAccount {
  email: string;
  contactName: string;
  website: string;
  headquarters: string;
  targetAudience: string;
  preferredPlatforms: string[];
  brandVoice: string[];
  defaultContentReview: boolean;
}

interface MockUserCredentials {
  password: string;
}

export interface MockCreatorUser extends MockUserCredentials {
  type: 'creator';
  profile: CreatorUserProfile;
}

export interface MockCompanyUser extends MockUserCredentials {
  type: 'company';
  profile: CompanyUserProfile;
}

export type MockUser = MockCreatorUser | MockCompanyUser;

export const mockCreatorUser: MockCreatorUser = {
  type: 'creator',
  password: 'password',
  profile: {
    id: 'creator-maya-chen',
    accountType: 'creator',
    name: 'Maya Chen',
    email: 'creator@sponsr.com',
    handle: '@mayamakes',
    niche: 'Food & lifestyle',
    bio: 'Approachable recipes, everyday rituals, and thoughtful finds for a slower, more joyful home life.',
    channels: ['Instagram', 'TikTok', 'YouTube'],
    audienceSize: 186000,
    engagementRate: 8.7,
    typicalRate: 2400,
    verified: true,
    trendingScore: 90,
    avatarTone: 'peach',
    location: 'Portland, Oregon',
    languages: ['English', 'Mandarin'],
    contentFormats: ['Short-form video', 'Stories', 'Recipe photography', 'Product reviews'],
    audienceDemographics: {
      primaryAgeRange: '25–34',
      topLocations: ['United States', 'Canada', 'United Kingdom'],
      audienceGenderSplit: { women: 68, men: 29, other: 3 }
    },
    rateCard: [
      { deliverable: 'Short-form video', platform: 'Instagram or TikTok', rate: 2400, currency: 'USD' },
      { deliverable: 'Story frames (3)', platform: 'Instagram', rate: 750, currency: 'USD' },
      { deliverable: 'Recipe photography set', platform: 'Instagram or Pinterest', rate: 1100, currency: 'USD' }
    ],
    mediaKitUrl: 'https://sponsr.example/creators/maya-chen',
    website: 'https://maya-chen.example'
  }
};

export const mockCompanyUser: MockCompanyUser = {
  type: 'company',
  password: 'password',
  profile: {
    id: 'brand-northstar',
    accountType: 'company',
    name: 'Northstar Labs',
    email: 'company@sponsr.com',
    handle: '@northstarlabs',
    category: 'Technology',
    description: 'Helpful technology for people building what comes next. We work with creators to show practical, human uses for our products.',
    logoMark: 'n',
    verified: true,
    activeCampaigns: 7,
    creatorPartners: 31,
    popularityScore: 91,
    avatarTone: 'lilac',
    contactName: 'Jordan Lee',
    website: 'https://northstarlabs.example',
    headquarters: 'Seattle, Washington',
    targetAudience: 'Curious professionals, independent makers, and small creative teams.',
    preferredPlatforms: ['YouTube', 'Instagram', 'TikTok', 'Newsletters'],
    brandVoice: ['Useful', 'Curious', 'Clear', 'Optimistic'],
    defaultContentReview: true
  }
};

export const mockUsers: MockUser[] = [mockCreatorUser, mockCompanyUser];
