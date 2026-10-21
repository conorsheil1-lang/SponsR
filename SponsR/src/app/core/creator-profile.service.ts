import { Injectable, signal } from '@angular/core';
import { mockCreatorUser, type CreatorRateCardItem, type CreatorSocialLink, type CreatorUserProfile } from './mock-users';

@Injectable({ providedIn: 'root' })
export class CreatorProfileService {
  readonly profile = signal<CreatorUserProfile>({
    ...mockCreatorUser.profile,
    contentTags: [...mockCreatorUser.profile.contentTags],
    channels: [...mockCreatorUser.profile.channels],
    languages: [...mockCreatorUser.profile.languages],
    contentFormats: [...mockCreatorUser.profile.contentFormats],
    audienceDemographics: {
      ...mockCreatorUser.profile.audienceDemographics,
      topLocations: [...mockCreatorUser.profile.audienceDemographics.topLocations],
      audienceGenderSplit: { ...mockCreatorUser.profile.audienceDemographics.audienceGenderSplit }
    },
    rateCard: mockCreatorUser.profile.rateCard.map((item) => ({ ...item })),
    socialLinks: mockCreatorUser.profile.socialLinks.map((link) => ({ ...link }))
  });

  updatePublicProfile(details: { name: string; handle: string; bio: string }): void {
    const name = details.name.trim();
    const handle = details.handle.trim();
    const bio = details.bio.trim();
    if (!name || !handle) {
      throw new Error('Enter both your name and handle.');
    }
    this.profile.update((profile) => ({ ...profile, name, handle, bio }));
  }

  updateAvatar(avatarUrl: string): void {
    this.profile.update((profile) => ({ ...profile, avatarUrl }));
  }

  addRateCardItem(item: CreatorRateCardItem): void {
    const deliverable = item.deliverable.trim();
    const platform = item.platform.trim();
    if (!deliverable || !platform || !Number.isFinite(item.rate) || item.rate <= 0) {
      throw new Error('Choose a content type and platform, and enter a price greater than zero.');
    }
    if (['Video', 'Live stream'].includes(deliverable) &&
        (!Number.isInteger(item.durationMinutes) || (item.durationMinutes ?? 0) <= 0)) {
      throw new Error('Enter a duration in minutes for videos and live streams.');
    }
    this.profile.update((profile) => ({
      ...profile,
      rateCard: [...profile.rateCard, { ...item, deliverable, platform }]
    }));
  }

  removeRateCardItem(index: number): void {
    this.profile.update((profile) => ({
      ...profile,
      rateCard: profile.rateCard.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  addContentTag(value: string): void {
    const tag = value.trim().toLocaleLowerCase();
    if (!tag) {
      return;
    }
    this.profile.update((profile) => profile.contentTags.includes(tag)
      ? profile
      : { ...profile, contentTags: [...profile.contentTags, tag] }
    );
  }

  removeContentTag(tag: string): void {
    this.profile.update((profile) => ({
      ...profile,
      contentTags: profile.contentTags.filter((current) => current !== tag)
    }));
  }

  addSocialLink(link: CreatorSocialLink): void {
    const platform = link.platform.trim();
    const handle = link.handle.trim();
    const url = link.url.trim();
    if (!platform || !handle || !url) {
      throw new Error('Choose a platform and enter both its handle and profile URL.');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error('Enter a valid platform profile URL.');
    }
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      throw new Error('Platform profile links must use HTTP or HTTPS.');
    }

    this.profile.update((profile) => {
      if (profile.socialLinks.some((current) => current.platform.toLowerCase() === platform.toLowerCase())) {
        throw new Error(`${platform} is already linked. Remove the current link before adding another.`);
      }
      return {
        ...profile,
        channels: profile.channels.includes(platform) ? profile.channels : [...profile.channels, platform],
        socialLinks: [...profile.socialLinks, { platform, handle, url }]
      };
    });
  }

  removeSocialLink(platform: string): void {
    this.profile.update((profile) => {
      const socialLinks = profile.socialLinks.filter((link) => link.platform !== platform);
      const stillLinked = socialLinks.some((link) => link.platform === platform);
      return {
        ...profile,
        socialLinks,
        channels: stillLinked ? profile.channels : profile.channels.filter((channel) => channel !== platform)
      };
    });
  }
}
