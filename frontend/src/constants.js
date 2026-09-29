// Keep in sync with backend/lib/validate.js
export const CATEGORIES = [
  'Restaurant',
  'Cafe/Dessert',
  'Bar/Nightlife',
  'Attraction/Landmark',
  'Nature/Viewpoint',
  'Shopping/Market',
  'Museum/Culture',
  'Activity/Experience',
];

export const CATEGORY_EMOJI = {
  Restaurant: '🍜',
  'Cafe/Dessert': '☕',
  'Bar/Nightlife': '🍸',
  'Attraction/Landmark': '🏛️',
  'Nature/Viewpoint': '🌄',
  'Shopping/Market': '🛍️',
  'Museum/Culture': '🎨',
  'Activity/Experience': '🎟️',
};

// map_url can be a real link (Google Maps, Instagram, TikTok, a blog...) or a plain address.
export function mapHref(mapUrl) {
  if (/^https?:\/\//i.test(mapUrl)) return mapUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapUrl)}`;
}

export function linkLabel(mapUrl) {
  if (!/^https?:\/\//i.test(mapUrl)) return 'Open in Google Maps';
  try {
    const host = new URL(mapUrl).hostname.replace(/^www\./, '');
    if (/google\.|goo\.gl|maps\.app/.test(host)) return 'Open in Google Maps';
    if (host.includes('instagram')) return 'View on Instagram';
    if (host.includes('tiktok')) return 'View on TikTok';
    if (host.includes('youtube') || host === 'youtu.be') return 'Watch on YouTube';
    return `Open link (${host})`;
  } catch {
    return 'Open link';
  }
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
