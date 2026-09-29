// Sample data for the demo build. Newest spots first.
export const SEED_USERS = [
  { id: 'u-demo', username: 'demo', email: 'demo@citypins.dev', password: 'password123', bio: 'Eats first, sightseeing second.', homeCity: 'Hong Kong', avatarUrl: null },
  { id: 'u-maya', username: 'maya_eats', email: 'maya@example.com', password: 'password123', bio: 'Noodle hunter. Will queue for anything with a Michelin Bib.', homeCity: 'Taipei', avatarUrl: null },
  { id: 'u-jun', username: 'jun_walks', email: 'jun@example.com', password: 'password123', bio: 'Hikes, viewpoints and the cafés at the bottom of them.', homeCity: 'Tokyo', avatarUrl: null },
];

const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const SEED_SPOTS = [
  { userId: 'u-demo', city: 'Hong Kong', country: 'Hong Kong', category: 'Restaurant', name: 'Kau Kee Beef Brisket', description: 'Legendary beef brisket noodles on Gough Street. Expect a queue at lunch, but it moves fast. Get the curry brisket with e-fu noodles and a cold milk tea.', mapUrl: maps('Kau Kee Restaurant Hong Kong') },
  { userId: 'u-jun', city: 'Hong Kong', country: 'Hong Kong', category: 'Nature/Viewpoint', name: "Dragon's Back Trail", description: 'Easy ridge hike with ocean views on both sides, ending at Big Wave Bay beach. Take bus 9 from Shau Kei Wan. Go early to beat the heat and bring water.', mapUrl: maps("Dragon's Back Hong Kong") },
  { userId: 'u-maya', city: 'Taipei', country: 'Taiwan', category: 'Shopping/Market', name: 'Raohe Night Market', description: 'The black-pepper buns at the entrance by the temple are a must. Smaller and less chaotic than Shilin, and the food is better.', mapUrl: maps('Raohe Street Night Market') },
  { userId: 'u-maya', city: 'Taipei', country: 'Taiwan', category: 'Cafe/Dessert', name: 'Smoothie House', description: 'Huge mango shaved ice near Yongkang Street. One bowl feeds two people. Summer mango season (May to Sept) is when it is best.', mapUrl: maps('Smoothie House Taipei') },
  { userId: 'u-demo', city: 'Hong Kong', country: 'Hong Kong', category: 'Bar/Nightlife', name: 'Bar Leone', description: 'Relaxed Roman-style bar in Central. Great cocktails without the pretense, and walk-ins usually get a spot before 8pm.', mapUrl: 'https://www.instagram.com/barleonehk/' },
  { userId: 'u-jun', city: 'Tokyo', country: 'Japan', category: 'Museum/Culture', name: 'teamLab Planets', description: 'Immersive digital art where you walk barefoot through water. Book tickets ahead and wear shorts or pants you can roll up.', mapUrl: maps('teamLab Planets Tokyo') },
  { userId: 'u-jun', city: 'Tokyo', country: 'Japan', category: 'Activity/Experience', name: 'Tsukiji Outer Market food walk', description: 'Wander the stalls for tamagoyaki, uni and fresh oysters. Best before 10am; many shops close by early afternoon.', mapUrl: maps('Tsukiji Outer Market') },
  { userId: 'u-maya', city: 'Taipei', country: 'Taiwan', category: 'Restaurant', name: 'Fuhang Soy Milk', description: 'Classic Taiwanese breakfast upstairs in the Hua Shan market. The thick egg flatbread with savory soy milk is the order. The line wraps around the building on weekends.', mapUrl: maps('Fuhang Soy Milk Taipei') },
  { userId: 'u-jun', city: 'Tokyo', country: 'Japan', category: 'Nature/Viewpoint', name: 'Shibuya Sky', description: 'Open-air rooftop deck over the scramble crossing. Book the sunset slot about two weeks out. Bags go in lockers, so only phones are allowed on the roof.', mapUrl: maps('Shibuya Sky') },
  { userId: 'u-demo', city: 'Hong Kong', country: 'Hong Kong', category: 'Attraction/Landmark', name: 'Victoria Peak via the Peak Tram', description: 'Take the tram up and walk the Lugard Road loop for the best free skyline view. Skip the paid Sky Terrace.', mapUrl: maps('The Peak Tram Hong Kong') },
  { userId: 'u-maya', city: 'Taipei', country: 'Taiwan', category: 'Bar/Nightlife', name: 'Bar Pun', description: 'Tiny cocktail bar that uses Taiwanese ingredients like oolong, plum and sweet potato. Reserve on their Instagram.', mapUrl: 'https://www.instagram.com/barpun.taipei/' },
  { userId: 'u-jun', city: 'Tokyo', country: 'Japan', category: 'Cafe/Dessert', name: 'Onibus Coffee Nakameguro', description: 'Small roaster next to the train tracks. Take your latte down to the Meguro River walk. It gets packed during cherry blossom season.', mapUrl: maps('Onibus Coffee Nakameguro') },
];
