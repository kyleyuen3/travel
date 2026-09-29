const CATEGORIES = [
  'Restaurant',
  'Cafe/Dessert',
  'Bar/Nightlife',
  'Attraction/Landmark',
  'Nature/Viewpoint',
  'Shopping/Market',
  'Museum/Culture',
  'Activity/Experience',
];

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Returns { data, errors }. `partial` allows missing fields (for updates).
function validateSpot(body, { partial = false } = {}) {
  const errors = {};
  const data = {};

  const fields = {
    city: { max: 100 },
    country: { max: 100 },
    name: { max: 120 },
    description: { max: 500 },
    mapUrl: { max: 2000 },
    category: {},
  };

  for (const [key, rules] of Object.entries(fields)) {
    if (partial && body[key] === undefined) continue;
    const value = str(body[key]);
    if (!value) {
      errors[key] = 'Required';
    } else if (rules.max && value.length > rules.max) {
      errors[key] = `Must be ${rules.max} characters or fewer`;
    } else {
      data[key] = value;
    }
  }

  if (data.category && !CATEGORIES.includes(data.category)) {
    errors.category = 'Invalid category';
    delete data.category;
  }

  return { data, errors };
}

function validateProfile(body) {
  const errors = {};
  const data = {};

  if (body.bio !== undefined) {
    const bio = str(body.bio);
    if (bio.length > 200) errors.bio = 'Must be 200 characters or fewer';
    else data.bio = bio || null;
  }
  if (body.homeCity !== undefined) {
    const homeCity = str(body.homeCity);
    if (homeCity.length > 100) errors.homeCity = 'Must be 100 characters or fewer';
    else data.homeCity = homeCity || null;
  }
  if (body.avatarUrl !== undefined) {
    const avatarUrl = str(body.avatarUrl);
    if (avatarUrl && !isHttpUrl(avatarUrl)) errors.avatarUrl = 'Must be a valid http(s) URL';
    else data.avatarUrl = avatarUrl || null;
  }

  return { data, errors };
}

module.exports = { CATEGORIES, USERNAME_RE, EMAIL_RE, str, isHttpUrl, validateSpot, validateProfile };
