// Convert snake_case DB rows into the camelCase JSON the frontend uses.

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    bio: row.bio,
    homeCity: row.home_city,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}

function privateUser(row) {
  return { ...publicUser(row), email: row.email };
}

function spot(row) {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    city: row.city,
    country: row.country,
    category: row.category,
    name: row.name,
    description: row.description,
    mapUrl: row.map_url,
    createdAt: row.created_at,
    bookmarked: Boolean(row.bookmarked),
    bookmarkCount: Number(row.bookmark_count || 0),
  };
}

module.exports = { publicUser, privateUser, spot };
