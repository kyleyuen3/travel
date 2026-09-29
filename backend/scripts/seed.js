// Inserts a demo user and a handful of spots so the browse page isn't empty.
// Usage: npm run db:seed   (login: demo / password123)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');
const pool = require('../db');

const SPOTS = [
  ['Hong Kong', 'Hong Kong', 'Restaurant', 'Kau Kee Beef Brisket', 'Legendary beef brisket noodles in Central. Expect a queue at lunch, but it moves fast. Get the curry brisket e-fu noodles.', 'https://maps.google.com/?q=Kau+Kee+Restaurant+Hong+Kong'],
  ['Hong Kong', 'Hong Kong', 'Nature/Viewpoint', 'Dragon\'s Back Trail', 'Easy ridge hike with ocean views that ends at Big Wave Bay beach. Go early to beat the heat.', 'https://maps.google.com/?q=Dragon%27s+Back+Hong+Kong'],
  ['Hong Kong', 'Hong Kong', 'Bar/Nightlife', 'Bar Leone', 'Relaxed Roman-style bar in Central. Great cocktails without the pretense.', 'https://maps.google.com/?q=Bar+Leone+Hong+Kong'],
  ['Taipei', 'Taiwan', 'Shopping/Market', 'Raohe Night Market', 'Pepper buns at the entrance are a must. Less chaotic than Shilin.', 'https://maps.google.com/?q=Raohe+Street+Night+Market'],
  ['Taipei', 'Taiwan', 'Cafe/Dessert', 'Smoothie House', 'Huge mango shaved ice near Yongkang Street. Split one with a friend.', 'https://maps.google.com/?q=Smoothie+House+Taipei'],
  ['Tokyo', 'Japan', 'Museum/Culture', 'teamLab Planets', 'Immersive digital art where you walk through water. Book tickets ahead and wear shorts.', 'https://maps.google.com/?q=teamLab+Planets+Tokyo'],
  ['Tokyo', 'Japan', 'Activity/Experience', 'Tsukiji Outer Market Food Walk', 'Wander stalls for tamagoyaki, uni and fresh oysters. Best before 10am.', 'https://maps.google.com/?q=Tsukiji+Outer+Market'],
];

async function main() {
  let [[user]] = await pool.query('SELECT id FROM users WHERE username = ?', ['demo']);
  if (!user) {
    user = { id: uuid() };
    await pool.query(
      'INSERT INTO users (id, username, email, password_hash, bio, home_city) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, 'demo', 'demo@citypins.dev', await bcrypt.hash('password123', 10), 'Eats first, sightseeing second.', 'Hong Kong']
    );
  }

  for (const [city, country, category, name, description, mapUrl] of SPOTS) {
    const [[exists]] = await pool.query('SELECT id FROM spots WHERE user_id = ? AND name = ?', [user.id, name]);
    if (exists) continue;
    await pool.query(
      `INSERT INTO spots (id, user_id, city, country, category, name, description, map_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid(), user.id, city, country, category, name, description, mapUrl]
    );
  }

  console.log('Seeded. Log in with demo / password123');
  await pool.end();
}

main().catch((err) => {
  console.error('seed failed:', err.message);
  process.exit(1);
});
