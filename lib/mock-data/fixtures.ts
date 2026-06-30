export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  role: 'user' | 'admin';
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  parent_id: string | null;
}

export interface ProductImage {
  url: string;
  alt: string;
  order: number;
}

export interface AffiliateLink {
  id: string;
  product_id: string;
  retailer: 'amazon' | 'flipkart' | 'myntra' | 'nike' | 'keychron';
  raw_url: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string;
  subcategory_id: string;
  price: number; // Stored in INR as the base currency
  brand: string;
  images: ProductImage[];
  features: string[];
  pros: string[];
  cons: string[];
  is_featured: boolean;
  is_trending: boolean;
  trending_score: number;
  view_count: number;
  save_count: number;
  share_count: number;
  click_count: number;
  created_at: string;
}

export interface BoardItem {
  id: string;
  board_id: string;
  product_id: string;
  note: string;
  added_at: string;
}

export interface Board {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string;
  is_public: boolean;
  cover_image: string;
  created_at: string;
  items: BoardItem[];
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  cover_image: string;
  product_ids: string[];
  created_at: string;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  body_markdown: string;
  cover_image: string;
  related_product_ids: string[];
  seo_title: string;
  seo_description: string;
  published_at: string;
}

// ----------------------------------------------------
// 1. Curated Users
// ----------------------------------------------------
export const users: User[] = [
  {
    id: "user-1",
    username: "retrocurator",
    display_name: "Aidan Vance",
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    bio: "Scouting minimalist tech and vintage streetwear setups. 90s aesthetic enthusiast.",
    role: "admin"
  },
  {
    id: "user-2",
    username: "streetwear_guru",
    display_name: "Karan Sen",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Fashion coordinator. Curating the best oversized fits, luxury on a budget, and sneaker drops.",
    role: "user"
  },
  {
    id: "user-3",
    username: "cozyspaces",
    display_name: "Elena Rostova",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "Cozy workspace developer. Sunset lamps, indoor plants, and soft ambient vibes are my jam.",
    role: "user"
  }
];

// ----------------------------------------------------
// 2. Categories
// ----------------------------------------------------
export const categories: Category[] = [
  // Parent Categories
  { id: "cat-1", slug: "streetwear", name: "Streetwear", description: "Oversized fits, sneakers, and hype pieces.", parent_id: null },
  { id: "cat-2", slug: "gaming-setup", name: "Gaming Setup", description: "Minimalist desk setups, mechanical keyboards, and ambient light.", parent_id: null },
  { id: "cat-3", slug: "anime-aesthetics", name: "Anime Aesthetics", description: "Collectibles, anime-inspired apparel, and wall art.", parent_id: null },
  { id: "cat-4", slug: "room-decor", name: "Room Decor", description: "Sunset lamps, vines, floating shelves, and cozy vibes.", parent_id: null },
  { id: "cat-5", slug: "fitness", name: "Fitness & Athleisure", description: "Premium pump covers, gym gear, and sleek water bottles.", parent_id: null },

  // Streetwear Subcategories
  { id: "sub-11", slug: "hoodies", name: "Hoodies & Sweats", description: "Heavyweight hoodies and comfortable loungewear.", parent_id: "cat-1" },
  { id: "sub-12", slug: "sneakers", name: "Sneakers", description: "Classics and trending kicks.", parent_id: "cat-1" },
  { id: "sub-13", slug: "tees", name: "Graphic Tees", description: "Vintage wash and graphic streetwear tops.", parent_id: "cat-1" },
  { id: "sub-14", slug: "accessories", name: "Streetwear Accessories", description: "Caps, beanies, socks, and bags.", parent_id: "cat-1" },

  // Gaming Setup Subcategories
  { id: "sub-21", slug: "keyboards", name: "Keyboards & Switches", description: "Custom mechanical keyboards, keycaps, and switches.", parent_id: "cat-2" },
  { id: "sub-22", slug: "desk-mats", name: "Desk Mats", description: "Premium felt, cork, and design-print desk pads.", parent_id: "cat-2" },
  { id: "sub-23", slug: "audio", name: "Audio & Headsets", description: "Studio monitors, audiophile headphones, and microphones.", parent_id: "cat-2" },
  { id: "sub-24", slug: "lighting", name: "Setup Lighting", description: "Lightbars, ambient light panels, and neon accents.", parent_id: "cat-2" },

  // Anime Subcategories
  { id: "sub-31", slug: "apparel", name: "Anime Apparel", description: "Subtle, streetwear-focused anime clothing.", parent_id: "cat-3" },
  { id: "sub-32", slug: "figures", name: "Figures & Models", description: "Highly-detailed anime scale figures and models.", parent_id: "cat-3" },
  { id: "sub-33", slug: "room-art", name: "Anime Room Art", description: "Canvas prints, desk widgets, and manga panels.", parent_id: "cat-3" },

  // Room Decor Subcategories
  { id: "sub-41", slug: "ambient-lighting", name: "Ambient Lights", description: "Sunset projection lamps, lava lamps, and smart bulbs.", parent_id: "cat-4" },
  { id: "sub-42", slug: "shelves-organizers", name: "Shelves & Organizers", description: "Floating wooden shelves, pegboards, and cable management.", parent_id: "cat-4" },
  { id: "sub-43", slug: "plants-pots", name: "Plants & Greenery", description: "Faux vines, indoor planters, and succulents.", parent_id: "cat-4" },

  // Fitness Subcategories
  { id: "sub-51", slug: "gym-apparel", name: "Gym Apparel", description: "Oversized pump covers, compression wear, and shorts.", parent_id: "cat-5" },
  { id: "sub-52", slug: "gear", name: "Gym Gear", description: "Shaker cups, lifting belts, straps, and bags.", parent_id: "cat-5" },
];

// ----------------------------------------------------
// 3. Programmatic & Curated Products (~90 Products)
// ----------------------------------------------------
// Base template list to generate high-quality items with premium feel
const unsplashAssets = {
  hoodies: [
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop&q=80",
  ],
  sneakers: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80",
  ],
  tees: [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80",
  ],
  keyboards: [
    "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1626908013351-800ddd734b8a?w=600&auto=format&fit=crop&q=80",
  ],
  deskMats: [
    "https://images.unsplash.com/photo-1632292224971-0d45778b3002?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&auto=format&fit=crop&q=80",
  ],
  setupLighting: [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
  ],
  audio: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80",
  ],
  figures: [
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
  ],
  roomDecor: [
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80",
  ],
  fitness: [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80",
  ]
};

// Raw list of details to expand mock items programmatically
const templates = [
  // 1. STREETWEAR (cat-1)
  {
    name: "Heavyweight Boxy Hoodie",
    brand: "AESTHETIX",
    category_id: "cat-1",
    subcategory_id: "sub-11",
    price: 1899,
    description: "450GSM ultra-thick loopback cotton hoodie. Slightly cropped body with dropped shoulders and double-lined hood for the perfect slouchy silhouette.",
    features: ["450GSM Organic Cotton", "Preshrunk vintage wash", "No drawstring hood design", "Ribbed side panels"],
    images: unsplashAssets.hoodies,
    pros: ["Thick structured drape", "Excellent warmth", "Premium heavy feel"],
    cons: ["Slightly short fit for tall people", "Takes longer to dry due to density"],
    is_featured: true,
  },
  {
    name: "Vintage Wash Utility Tee",
    brand: "NO-SIGNAL",
    category_id: "cat-1",
    subcategory_id: "sub-13",
    price: 999,
    description: "Relaxed fit 280GSM heavy tee featuring a distressed screenprint logo and double-stitched collar. Hand-faded charcoal dye makes each shirt unique.",
    features: ["280GSM Cotton", "Distressed neck detailing", "Pigment-dyed for vintage look", "Eco-friendly screen-printing"],
    images: unsplashAssets.tees,
    pros: ["Extremely soft feel", "Durable thick collar", "Unique custom wash color"],
    cons: ["Hand-wash recommended to keep print", "Slight color run on first wash"],
    is_featured: false,
  },
  {
    name: "Retro Runner Sneakers V2",
    brand: "HYPELAB",
    category_id: "cat-1",
    subcategory_id: "sub-12",
    price: 4999,
    description: "Crafted with suede overlays, open-cell mesh underlays, and a distressed pre-yellowed midsole for that retro 90s aesthetic.",
    features: ["Premium calf suede", "Breathable nylon mesh panels", "EVA shock-absorbing sole", "Reflective 3M safety piping"],
    images: unsplashAssets.sneakers,
    pros: ["Extremely comfortable for walking", "Perfect aesthetic retro shape", "Breathable mesh"],
    cons: ["Suede gets ruined in the rain", "Expensive price point"],
    is_featured: true,
  },
  {
    name: "Oversized Cargo Sweatpants",
    brand: "AESTHETIX",
    category_id: "cat-1",
    subcategory_id: "sub-11",
    price: 1599,
    description: "Thick fleece pants with a wide leg opening, utility side pockets, and toggle cuffs to shift between straight leg and cinched style.",
    features: ["380GSM fleece-lined cotton", "Dual cargo side flap pockets", "Toggle hem drawstrings", "Embroidered tonal branding"],
    images: [unsplashAssets.hoodies[2], ...unsplashAssets.hoodies],
    pros: ["Warm fleece interior", "Very versatile hem styling", "Deep pockets"],
    cons: ["Runs quite large", "Fleece sheds slightly inside during initial wear"],
    is_featured: false,
  },
  
  // 2. GAMING SETUP (cat-2)
  {
    name: "Q1 Pro Custom Keyboard",
    brand: "Keychron",
    category_id: "cat-2",
    subcategory_id: "sub-21",
    price: 16499,
    description: "75% layout QMK/VIA wireless mechanical keyboard with full CNC aluminum body, double-gasket design, and hot-swappable switches.",
    features: ["Full CNC aluminum body", "Wireless Bluetooth & 2.4G", "Hot-swappable keys (3pin/5pin)", "Screw-in PCB stabilizers"],
    images: unsplashAssets.keyboards,
    pros: ["Immaculate heavy build quality", "Satisfying deep 'thocky' acoustic profile", "Fully customizable keymap via VIA"],
    cons: ["Very heavy to carry around", "High price barrier"],
    is_featured: true,
  },
  {
    name: "Minimal Felt Desk Pad (Medium)",
    brand: "GRAIN & COLO",
    category_id: "cat-2",
    subcategory_id: "sub-22",
    price: 1299,
    description: "Made of 100% natural Merino wool felt with a non-slip cork base. Prevents desk scratches while adding acoustic dampening and a clean workspace texture.",
    features: ["100% Merino Wool felt", "4mm thickness", "Eco-friendly non-slip cork backing", "Stitched anti-fray borders"],
    images: unsplashAssets.deskMats,
    pros: ["Very clean visual look", "Dampens keyboard typing sounds", "Comfortable skin contact"],
    cons: ["Wool is scratchy for sensitive skin", "Cannot wash in washing machine"],
    is_featured: false,
  },
  {
    name: "Retro RGB LED Monitor Lightbar",
    brand: "LUMEX",
    category_id: "cat-2",
    subcategory_id: "sub-24",
    price: 2499,
    description: "Asymmetric screen lighting that eliminates glare. Features a smart wireless dial to control brightness and color temperature on the fly.",
    features: ["Asymmetric optical design", "USB-C powered", "Wireless desktop controller dial", "Backlight ambient RGB projector"],
    images: unsplashAssets.setupLighting,
    pros: ["Saves desk space", "No direct light shines on screen", "Wireless dial is very smooth"],
    cons: ["Struggles to fit on curved monitors", "Dial batteries need replacement yearly"],
    is_featured: true,
  },
  {
    name: "Studio Sound Pro Headphones",
    brand: "AUDIO-TECH",
    category_id: "cat-2",
    subcategory_id: "sub-23",
    price: 11990,
    description: "Closed-back studio monitoring headphones with flat response curves, 45mm drivers, and plush memory foam earcups for long audio editing sessions.",
    features: ["45mm large-aperture drivers", "90-degree swiveling earcups", "Detachable cables included", "Plush memory foam pads"],
    images: unsplashAssets.audio,
    pros: ["Accurate, non-colored sound profile", "Comfortable head clamping pressure", "Foldable travel design"],
    cons: ["Sound is analytical (not bass-boosted)", "Plastic build feels slightly squeaky"],
    is_featured: false,
  },

  // 3. ANIME AESTHETICS (cat-3)
  {
    name: "Neo-Tokyo Cyberpunk Bomber Jacket",
    brand: "TOKYO-DRIP",
    category_id: "cat-3",
    subcategory_id: "sub-31",
    price: 3499,
    description: "Sleek water-resistant bomber featuring kanji embroidery, neon interior lining, and heavy-duty utility clips. Cyberpunk vibes for street fashion.",
    features: ["Nylon outer shell", "Embroidered back kanji", "Dual utility metal clip straps", "Insulated neon orange lining"],
    images: [unsplashAssets.hoodies[1], ...unsplashAssets.tees],
    pros: ["Water-resistant utility outer", "Bold premium embroidery", "Inside zip pockets"],
    cons: ["Quite warm, not suitable for hot summers", "Embroidery needs care while washing"],
    is_featured: true,
  },
  {
    name: "Limited Edition Mecha Action Figure",
    brand: "BANDAI",
    category_id: "cat-3",
    subcategory_id: "sub-32",
    price: 8999,
    description: "Highly articulated 1/144 scale metal composite action figure. Incredible paint detail, customizable weapon loadouts, and a custom display stand.",
    features: ["Diecast metal and ABS build", "1/144 custom scale", "20+ articulation joints", "LED eye illumination"],
    images: unsplashAssets.figures,
    pros: ["Metal joints ensure solid posing", "Incredible museum-grade paintwork", "Exquisite collectors packaging"],
    cons: ["Very small delicate parts", "Fragile antennas"],
    is_featured: true,
  },
  {
    name: "Manga Panels Acrylic Wall Frame",
    brand: "TOKYO-DRIP",
    category_id: "cat-3",
    subcategory_id: "sub-33",
    price: 799,
    description: "High-resolution printed acrylic glass displaying classic retro manga pages. Double-layered float design for a sleek 3D shadow effect.",
    features: ["Premium optical acrylic glass", "Floating metal wall standoffs", "UV-resistant print ink", "Scratch-resistant backing"],
    images: [unsplashAssets.roomDecor[3], ...unsplashAssets.roomDecor],
    pros: ["Sleek modern floating look", "Vibrant black & white print contrast", "Very easy to mount"],
    cons: ["Glossy screen attracts fingerprint smudges", "Smaller size than expected"],
    is_featured: false,
  },

  // 4. ROOM DECOR (cat-4)
  {
    name: "Sunset Projection Lamp v3",
    brand: "AURA-HOME",
    category_id: "cat-4",
    subcategory_id: "sub-41",
    price: 899,
    description: "Project a warm sunset glow onto walls. Features a magnetic 360-degree rotating head, 16 color modes, and remote-controlled gradient speeds.",
    features: ["16 RGB color modes", "360-degree rotating dome head", "USB power adaptor", "Wireless remote control"],
    images: unsplashAssets.roomDecor,
    pros: ["Creates cozy vibes instantly", "High quality optical glass dome", "Magnetic head is fun to adjust"],
    cons: ["Requires being close to the wall for crisp circles", "Short USB cable included"],
    is_featured: true,
  },
  {
    name: "Modular Pegboard Wall Organizer",
    brand: "GRAIN & COLO",
    category_id: "cat-4",
    subcategory_id: "sub-42",
    price: 1899,
    description: "Natural Birch wood pegboard with modular shelves, pegs, and containers. Customize your setup wall to store keyboards, controllers, or plants.",
    features: ["Nordic Birch plywood", "4 modular shelves", "8 wooden peg hooks", "Includes heavy-duty wall anchors"],
    images: [unsplashAssets.roomDecor[1], ...unsplashAssets.roomDecor],
    pros: ["Beautiful wooden grain aesthetic", "Sturdy peg fittings", "Endless configuration options"],
    cons: ["Installation requires drilling", "Max load limit is 12kg"],
    is_featured: false,
  },
  {
    name: "Premium Faux Ivy Vine Strings (12-pack)",
    brand: "COZY-PLANTS",
    category_id: "cat-4",
    subcategory_id: "sub-43",
    price: 499,
    description: "Add a soft touch of greenery to your bedroom. 12 strands of realistic silk ivy vines, perfect for hanging over curtains, LED lights, or bedframes.",
    features: ["Silk leaves with plastic stems", "84 feet total length", "High-fidelity texture printing", "Comes with cable ties"],
    images: [unsplashAssets.roomDecor[1], ...unsplashAssets.roomDecor],
    pros: ["Low cost room upgrade", "Realistic leaf textures", "No watering needed!"],
    cons: ["Initial plastic smell when unboxed", "Leaves can fall off if handled roughly"],
    is_featured: false,
  },

  // 5. FITNESS & ATHLEISURE (cat-5)
  {
    name: "Oversized 'Heavy Iron' Pump Cover",
    brand: "IRON-CRAFT",
    category_id: "cat-5",
    subcategory_id: "sub-51",
    price: 1199,
    description: "320GSM heavy interlock cotton drop-shoulder tee. Designed to fit extra large to retain warmth at the start of workouts, and hold its boxy shape.",
    features: ["320GSM Interlock Cotton", "Acid washed charcoal", "Durable double-stitched hem", "Cracked-print graphic logo"],
    images: unsplashAssets.fitness,
    pros: ["Durable thick fabric", "Flattering oversized drape", "Excellent sweat absorption"],
    cons: ["Feels heavy in peak summer heat", "Takes up space in gym bags"],
    is_featured: true,
  },
  {
    name: "Matte Black Stainless Shaker",
    brand: "IRON-CRAFT",
    category_id: "cat-5",
    subcategory_id: "sub-52",
    price: 899,
    description: "Double-walled vacuum insulated shaker cup. Keeps pre-workouts ice cold for 12 hours. Zero leakage, odor-resistant steel interior.",
    features: ["Double-wall vacuum insulation", "Food-grade 304 Stainless steel", "Leaking-proof flip cap", "Embossed internal measurements"],
    images: [unsplashAssets.fitness[2], ...unsplashAssets.fitness],
    pros: ["Keeps drinks cold forever", "Zero plastic protein smell buildup", "Satisfying snap lid closure"],
    cons: ["Not microwave or dishwasher safe", "Outer paint can scratch against keys"],
    is_featured: false,
  }
];

// Generate about 90 products using templates, shuffling and adjusting prices/names/slugs
export const products: Product[] = [];

// Helper to shuffle array
const shuffle = <T>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Generate 90 items by iterating and modifying base templates
let productCounter = 1;
for (let i = 0; i < 7; i++) {
  templates.forEach((tpl) => {
    const id = `prod-${productCounter}`;
    const namePrefixes = ["Signature", "Premium", "Core", "Essential", "Vibe", "Studio", "Pro"];
    const suffix = i > 0 ? ` (Gen ${i + 1})` : "";
    const name = `${namePrefixes[i % namePrefixes.length]} ${tpl.name}${suffix}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    // Adjust prices slightly to avoid exact duplicates
    const priceModifier = 0.85 + (i * 0.05); // slightly varying prices
    const price = Math.round((tpl.price * priceModifier) / 10) * 10;
    
    // Vary scores to create realistic sorting
    const views = Math.floor(100 + Math.random() * 5000);
    const saves = Math.floor(10 + Math.random() * (views / 4));
    const shares = Math.floor(1 + Math.random() * (saves / 3));
    const clicks = Math.floor(5 + Math.random() * (views / 8));
    
    const trending_score = views * 1 + saves * 3 + shares * 4 + clicks * 5;
    
    // Select image sequence
    const tplImages = tpl.images || [unsplashAssets.hoodies[0]];
    const rotatedImages = [...tplImages];
    const shift = i % rotatedImages.length;
    for (let s = 0; s < shift; s++) {
      const first = rotatedImages.shift();
      if (first) rotatedImages.push(first);
    }
    
    const images: ProductImage[] = rotatedImages.map((url, index) => ({
      url,
      alt: `${name} Image ${index + 1}`,
      order: index
    }));
    
    products.push({
      id,
      slug,
      name,
      description: tpl.description,
      category_id: tpl.category_id,
      subcategory_id: tpl.subcategory_id,
      price,
      brand: tpl.brand,
      images,
      features: tpl.features,
      pros: tpl.pros,
      cons: tpl.cons,
      is_featured: tpl.is_featured && i === 0,
      is_trending: trending_score > 3000,
      trending_score,
      view_count: views,
      save_count: saves,
      share_count: shares,
      click_count: clicks,
      created_at: new Date(Date.now() - (i * 4 + Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString()
    });
    
    productCounter++;
  });
}

// Ensure first few items in products list have high trending scores for testing the trending pages
products.sort((a, b) => b.trending_score - a.trending_score);

// ----------------------------------------------------
// 4. Prebuilt Curated Collections
// ----------------------------------------------------
export const collections: Collection[] = [
  {
    id: "coll-1",
    slug: "minimal-setup-essentials",
    name: "Minimalist Workspace Essentials",
    description: "Clean wood textures, wool-felt pads, and sleek custom mechanical keyboards to make your desk look like a Pinterest layout.",
    cover_image: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?w=800&auto=format&fit=crop&q=80",
    product_ids: ["prod-5", "prod-6", "prod-7", "prod-8"],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "coll-2",
    slug: "cozy-anime-vibes",
    name: "Cozy Anime Bedroom Aesthetics",
    description: "Sleek lighting combined with subtle manga wall art and collectors action figures for a premium display vibe.",
    cover_image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    product_ids: ["prod-9", "prod-10", "prod-11", "prod-12"],
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "coll-3",
    slug: "gym-wear-heavy-rotation",
    name: "Gym Pump Covers & Accessories",
    description: "Heavyweight drop-shoulder graphic tees and insulated steel shakers to level up your workout outfits.",
    cover_image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    product_ids: ["prod-14", "prod-15", "prod-29"],
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// ----------------------------------------------------
// 5. User-Created Pinterest-Style Boards
// ----------------------------------------------------
export const boards: Board[] = [
  {
    id: "board-1",
    user_id: "user-1",
    name: "Retro Desk setup dream",
    slug: "retro-desk-setup-dream",
    description: "Planning my next upgrade with vintage monitors, felt desk pads, and linear custom switches.",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: "bi-1", board_id: "board-1", product_id: "prod-5", note: "Need this custom keyboard with red switches!", added_at: new Date().toISOString() },
      { id: "bi-2", board_id: "board-1", product_id: "prod-6", note: "The felt surface helps dampen keyboard ping.", added_at: new Date().toISOString() },
      { id: "bi-3", board_id: "board-1", product_id: "prod-7", note: "Great back lighting lightbar to reduce eyestrain.", added_at: new Date().toISOString() },
    ]
  },
  {
    id: "board-2",
    user_id: "user-2",
    name: "Cozy Winter Oversized Rotation",
    slug: "cozy-winter-oversized-rotation",
    description: "Cozy boxy fits, heavy loopback cotton sweats, and neutral kicks for layering.",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: "bi-4", board_id: "board-2", product_id: "prod-1", note: "The drape on this Aesthetix hoodie looks incredible.", added_at: new Date().toISOString() },
      { id: "bi-5", board_id: "board-2", product_id: "prod-2", note: "Perfect charcoal vintage tee to wear underneath.", added_at: new Date().toISOString() },
      { id: "bi-6", board_id: "board-2", product_id: "prod-3", note: "Retro runners to pair with oversized sweats.", added_at: new Date().toISOString() },
    ]
  }
];

// ----------------------------------------------------
// 6. SEO-Engine Articles / Guides
// ----------------------------------------------------
export const guides: Guide[] = [
  {
    id: "guide-1",
    slug: "best-oversized-hoodies-under-2000",
    title: "Best Oversized Heavyweight Hoodies Under ₹2000",
    cover_image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80",
    related_product_ids: ["prod-1", "prod-4", "prod-16"],
    seo_title: "Best Heavyweight Oversized Hoodies Under ₹2000 in India — Curated Streetwear",
    seo_description: "Looking for high-quality boxy hoodies? We review the best 350+ GSM hoodies from local independent streetwear brands under ₹2000.",
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    body_markdown: `
Finding the perfect oversized hoodie that has a premium drape, doesn't shrink in the first wash, and actually keeps its shape is surprisingly difficult. Most mainstream brands offer thin, polyester-blend hoodies that look limp.

For Gen-Z streetwear silhouettes, the magic number is **GSM (Grams per Square Meter)**. You want at least 350-450GSM for that thick, structured drape. Here, we analyze the top choices currently trending that won't break the bank.

---

### The Slouchy Pick: AESTHETIX Heavyweight Boxy Hoodie

The [AESTHETIX Heavyweight Boxy Hoodie](file:///product/signature-heavyweight-boxy-hoodie) is the current gold standard. At 450GSM, it features a 100% loopback cotton construction that gives it an immediate structured fall. The hood is double-lined, meaning it stands upright instead of flopping flat against your back.

- **GSM:** 450
- **Fit:** Cropped body, wide chest, dropped shoulders
- **Price:** ₹1,899

#### Why We Vouch For It:
The lack of a drawcord gives it a super clean look. It looks like a high-end designer piece but costs a fraction of the price. Pair it with cargo sweatpants for the ultimate relaxed outfit.

---

### The Workwear Pick: AESTHETIX Cargo Sweats Pairing

If you want a full cozy fit, we recommend pairing the hoodie with [Oversized Cargo Sweatpants](file:///product/premium-oversized-cargo-sweatpants). They are lined with a soft fleece backing that makes them comfortable for both airport looks and study sessions.

#### Styling Tips:
1. **Contrast colors:** Pair a light cream hoodie with washed black cargo sweats.
2. **Footwear:** Retro chunky runners like the [Retro Runner Sneakers](file:///product/signature-retro-runner-sneakers-v2) tie the wide leg hems together nicely.
    `
  },
  {
    id: "guide-2",
    slug: "minimal-desk-setup-essentials-for-students",
    title: "Minimalist Desk Setup Essentials for Students",
    cover_image: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?w=1000&auto=format&fit=crop&q=80",
    related_product_ids: ["prod-5", "prod-6", "prod-7", "prod-8"],
    seo_title: "How to Build a Minimalist Desk Setup: Keyboard, Felt Mats, and Lightbars",
    seo_description: "Maximize productivity and improve your workspace look. Here are the core minimalist setup items for students and remote workers.",
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    body_markdown: `
A clean desk leads to a clean mind. When your workspace feels curated, you actually want to sit down and get things done. Building a modern, aesthetic setup doesn't require thousands of dollars. It requires focusing on texture, lighting, and layout.

Here is the step-by-step blueprint to build a clean aesthetic desk setup.

---

### Step 1: Establish Texture with a Felt Desk Mat

Instead of a generic black rubber mousepad, opt for a [Minimal Felt Desk Pad](file:///product/premium-minimal-felt-desk-pad-medium). Wool felt creates a warm, premium texture. It acts as an acoustic absorber that dampens typing noises and defines your main workspace area.

- **Tip:** Get a light grey or charcoal mat. It contrasts beautifully with wooden desks.

---

### Step 2: The Core Interface — Custom Mechanical Keyboards

A great keyboard is the center of any setup. The [Keychron Q1 Pro](file:///product/signature-q1-pro-custom-keyboard) features a full CNC aluminum body and a gasket design that makes typing feel incredibly soft and sound extremely deep.

- **Why it matters:** Good acoustics make typing satisfying. The wireless layout also keeps cable clutter to zero.

---

### Step 3: Layer Your Lighting

Overhead ceiling lights are harsh and cast shadows. To create that cozy evening vibe, mount a [RGB LED Monitor Lightbar](file:///product/signature-retro-rgb-led-monitor-lightbar) to the top of your screen. It projects light downward directly onto your desk without reflecting off the screen, protecting your eyes.
    `
  }
];

// Helper to look up active links for products
export const getAffiliateLink = (productId: string, retailer: string): string => {
  // Mock tracking generation. Returns a clean redirect path inside our API
  return `/api/redirect/${productId}?retailer=${retailer}`;
};
