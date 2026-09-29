// Shared SELECT for spots: joins the poster's username, bookmark count,
// and whether the current viewer (if any) has bookmarked it.
// `viewerId` fills the first placeholder; pass null for anonymous viewers.
const SPOT_SELECT = `
  SELECT s.*, u.username,
    (SELECT COUNT(*) FROM bookmarks b WHERE b.spot_id = s.id) AS bookmark_count,
    EXISTS(SELECT 1 FROM bookmarks b2 WHERE b2.spot_id = s.id AND b2.user_id = ?) AS bookmarked
  FROM spots s
  JOIN users u ON u.id = s.user_id
`;

module.exports = { SPOT_SELECT };
