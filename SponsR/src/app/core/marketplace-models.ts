export interface CreatorAccount {
  id: string;
  accountType: 'creator';
  name: string;
  handle: string;
  niche: string;
  contentTags: string[];
  bio: string;
  avatarUrl?: string;
  channels: string[];
  audienceSize: number;
  engagementRate: number;
  typicalRate: number;
  verified: boolean;
  trendingScore: number;
  avatarTone: string;
}

export interface CompanyAccount {
  id: string;
  accountType: 'company';
  name: string;
  handle: string;
  category: string;
  description: string;
  logoMark: string;
  verified: boolean;
  activeCampaigns: number;
  creatorPartners: number;
  popularityScore: number;
  avatarTone: string;
}

export interface MarketplaceCampaign {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  category: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  applicants: number;
  status: 'Open' | 'New' | 'Closing soon';
  trendingScore: number;
  avatarTone: string;
}
