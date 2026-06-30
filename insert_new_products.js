const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env variables
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = (match[2] || '').replace(/(^['"]|['"]$)/g, '');
    }
  });
}
loadEnv();

// Category IDs mapping from original schema:
// - Streetwear (parent): c4c23f72-7cb6-49a3-a7a2-f674681643ab
// - Streetwear Accessories (sub): c4c23f72-7cb6-49a3-a7a2-f674681643ad
// - Room Decor (parent): d10b7f8c-cbde-4e3a-b8ff-54a880f83d22
// - Gaming Setup (parent): b09d0e2e-bfba-40a1-8d2a-a9cb84f67c3b

const localSupabase = createClient('http://127.0.0.1:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');
const remoteSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const newProductsData = [
  // 1. Jawdrobe Skirt
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000101',
    slug: 'jawdrobe-georgette-lightweight-skirt',
    name: 'Jawdrobe Georgette Lightweight Ruffle Skirt',
    brand: 'Jawdrobe',
    price: 799,
    description: 'An ultra-lightweight georgette high-waisted ruffle skirt with delicate tiers. Perfect for creating that airy, whimsical look.',
    category_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ab', // Streetwear
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', alt: 'Jawdrobe Ruffle Skirt', order: 0 }],
    features: ['High-waisted fit', 'Delicate ruffle tiers', 'Georgette fabric', 'Breathable and flowy'],
    pros: ['Lightweight', 'Flattering silhouette', 'Matches multiple styles'],
    cons: ['Requires delicate washing', 'Slightly sheer (needs slip)'],
    is_featured: true,
    is_trending: true,
    trending_score: 9540,
    trend_theme: ['doily-era']
  },
  // 2. PINKHUB Skirt
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000102',
    slug: 'pinkhub-womens-summer-pleated-skirt',
    name: "PINKHUB Women's Summer Pleated Skirt",
    brand: 'PINKHUB',
    price: 699,
    description: 'A pleated flowy skirt designed for summer comfort and styling. High-waisted with a vintage flare.',
    category_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ab',
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80', alt: 'PINKHUB Pleated Skirt', order: 0 }],
    features: ['Pleated design', 'Elasticated waistband', 'Soft summer fabric'],
    pros: ['Breathable', 'Easy to style', 'Stretchy waist'],
    cons: ['Fabric prone to wrinkling'],
    is_featured: false,
    is_trending: true,
    trending_score: 8740,
    trend_theme: ['doily-era']
  },
  // 3. Sahaj Paridhan Skirt
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000103',
    slug: 'sahaj-paridhan-rajasthani-wrap-skirt',
    name: 'Sahaj Paridhan Rajasthani Cotton Wrap Skirt',
    brand: 'Sahaj Paridhan',
    price: 499,
    description: 'Authentic Rajasthani hand-block printed cotton wrap skirt. Combines rich folk patterns with a relaxed bohemian fit.',
    category_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ab',
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&auto=format&fit=crop&q=80', alt: 'Rajasthani Wrap Skirt', order: 0 }],
    features: ['100% Cotton', 'Hand-block prints', 'Adjustable tie wrap'],
    pros: ['Vibrant colors', 'Adjustable waist', 'Pure breathable cotton'],
    cons: ['Colors may bleed in first wash'],
    is_featured: true,
    is_trending: true,
    trending_score: 9320,
    trend_theme: ['afrohemian-decor']
  },
  // 4. ICW Two-Piece Crochet Set
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000104',
    slug: 'icw-crochet-backless-vacation-set',
    name: 'ICW Crochet Backless Vacation Two-Piece Set',
    brand: 'ICW',
    price: 1299,
    description: 'Delicately hand-knitted crochet two-piece set featuring a backless crop top and matching mini skirt. The ultimate vacation look.',
    category_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ab',
    subcategory_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ad', // Streetwear Accessories (treating as items)
    images: [{ url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80', alt: 'Crochet Vacation Set', order: 0 }],
    features: ['Hand-knit crochet pattern', 'Backless crop top halter design', 'Matching elasticated skirt'],
    pros: ['Intricate stitch details', 'Perfect for beach holidays', 'Breathable open-work design'],
    cons: ['Requires hand washing', 'Delicate material prone to snagging'],
    is_featured: true,
    is_trending: true,
    trending_score: 9810,
    trend_theme: ['doily-era']
  },
  // 5. SANNIDHI Crochet Swimwear
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000105',
    slug: 'sannidhi-crochet-swimwear-coverup',
    name: 'SANNIDHI Crochet Swimwear Cover-up Skirt',
    brand: 'SANNIDHI',
    price: 899,
    description: 'Hollow-out crochet swimwear cover-up skirt with drawstrings. Perfect for poolside lounges and beach walks.',
    category_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ab',
    subcategory_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ad',
    images: [{ url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80', alt: 'Crochet Cover-up', order: 0 }],
    features: ['Adjustable drawstring waist', 'Hollow-out knit', 'Soft cotton-blend yarn'],
    pros: ['Dries quickly', 'Flattering side slits', 'Lightweight design'],
    cons: ['Fragile hollow stitching'],
    is_featured: false,
    is_trending: true,
    trending_score: 8910,
    trend_theme: ['doily-era']
  },
  // 6. SANNIDHI Crochet Cropped Top
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000106',
    slug: 'sannidhi-crochet-cropped-hollowout-top',
    name: 'SANNIDHI Crochet Cropped Hollow-Out Top',
    brand: 'SANNIDHI',
    price: 599,
    description: 'A long-sleeve cropped crochet top with wide flare sleeves and hollow-out detailing. Retro festival vibes.',
    category_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ab',
    subcategory_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ad',
    images: [{ url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80', alt: 'Cropped Crochet Top', order: 0 }],
    features: ['Cropped length', 'Wide bell sleeves', 'Retro floral square patterns'],
    pros: ['Stunning retro look', 'Very breathable', 'Lightweight layering piece'],
    cons: ['Requires careful storage to avoid stretching'],
    is_featured: true,
    is_trending: true,
    trending_score: 9410,
    trend_theme: ['doily-era']
  },
  // 7. Aahwan Hollow Backless Top
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000107',
    slug: 'aahwan-hollow-backless-crochet-top',
    name: 'Aahwan Hollow Backless Crochet Top',
    brand: 'Aahwan',
    price: 699,
    description: 'A stylish knit crop top featuring a criss-cross halter neckline and open hollow-out details.',
    category_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ab',
    subcategory_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ad',
    images: [{ url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80', alt: 'Aahwan Crochet Top', order: 0 }],
    features: ['Criss-cross halter', 'Open back design', 'Soft ribbed knit lower band'],
    pros: ['Very stylish and modern', 'Fits securely', 'Neutral beige color matches everything'],
    cons: ['Dry clean or gentle hand wash only'],
    is_featured: false,
    is_trending: true,
    trending_score: 8610,
    trend_theme: ['doily-era']
  },
  // 8. ICW Knitted Crochet Top
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000108',
    slug: 'icw-knitted-crochet-openwork-top',
    name: 'ICW Knitted Crochet Openwork Top',
    brand: 'ICW',
    price: 799,
    description: 'Openwork knitted top featuring intricate lace embroidery details around the collar and cuffs.',
    category_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ab',
    subcategory_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ad',
    images: [{ url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80', alt: 'ICW Openwork Top', order: 0 }],
    features: ['Embroidered lace details', 'Soft cotton knit yarn', 'Relaxed fit silhouette'],
    pros: ['Premium lace detailing', 'Very comfortable', 'Unique look'],
    cons: ['Snags easily on jewelry'],
    is_featured: false,
    is_trending: true,
    trending_score: 8430,
    trend_theme: ['doily-era']
  },
  // 9. KE Exports Printed Crochet Top
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000109',
    slug: 'ke-exports-printed-crochet-pattern-top',
    name: 'KE Exports Printed Crochet Pattern Top',
    brand: 'KE Exports',
    price: 599,
    description: 'A lightweight top with faux crochet detailing and patterns. Offers the crochet look with a smooth fabric feel.',
    category_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ab',
    subcategory_id: 'c4c23f72-7cb6-49a3-a7a2-f674681643ad',
    images: [{ url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80', alt: 'KE Exports Printed Top', order: 0 }],
    features: ['Faux crochet print', 'Smooth lightweight fabric', 'Regular fit design'],
    pros: ['Easy machine wash', 'No snagging issues', 'Comfortable for all-day wear'],
    cons: ['Not actual hand-knit yarn'],
    is_featured: false,
    is_trending: false,
    trending_score: 5120,
    trend_theme: ['doily-era']
  },
  // 10. imsid Jute Rug
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000110',
    slug: 'imsid-handwoven-natural-jute-rug',
    name: 'imsid Handwoven Natural Jute Rug',
    brand: 'imsid',
    price: 1499,
    description: 'Eco-friendly, handwoven natural braided jute rug. Reversible design brings natural warmth and texture to living spaces.',
    category_id: 'd10b7f8c-cbde-4e3a-b8ff-54a880f83d22', // Room Decor
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&auto=format&fit=crop&q=80', alt: 'Natural Jute Rug', order: 0 }],
    features: ['100% Organic Jute fibers', 'Hand-braided in India', 'Reversible for double wear'],
    pros: ['Highly durable', 'Biodegradable materials', 'Rich earthy texture'],
    cons: ['Slightly rough underfoot', 'Initial natural jute fiber shedding'],
    is_featured: true,
    is_trending: true,
    trending_score: 9120,
    trend_theme: ['afrohemian-decor']
  },
  // 11. Natural Braided Rug
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000111',
    slug: 'natural-braided-stylish-jute-rug',
    name: 'Natural Braided Stylish Jute Rug',
    brand: 'Handwoven',
    price: 1299,
    description: 'Handwoven circular jute rug with black braided accents. A perfect center statement for modern bohemian layouts.',
    category_id: 'd10b7f8c-cbde-4e3a-b8ff-54a880f83d22',
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80', alt: 'Circular Jute Rug', order: 0 }],
    features: ['Circular braided design', 'Black trim accent', 'Eco-friendly jute'],
    pros: ['Unique circular shape', 'Modern boho style', 'Sturdy construction'],
    cons: ['Hard to vacuum because of braids'],
    is_featured: false,
    is_trending: true,
    trending_score: 8320,
    trend_theme: ['afrohemian-decor']
  },
  // 12. Ambadi Home Rug
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000112',
    slug: 'ambadi-home-cotton-wool-boho-rug',
    name: 'Ambadi Home Cotton-Wool Boho Rug',
    brand: 'Ambadi Home',
    price: 1899,
    description: 'Luxury hand-tufted cotton and wool rug. Features neutral tones and geometric tribal patterns.',
    category_id: 'd10b7f8c-cbde-4e3a-b8ff-54a880f83d22',
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80', alt: 'Cotton Wool Rug', order: 0 }],
    features: ['Premium cotton-wool blend', 'Geometric tribal patterns', 'Hand-tufted details'],
    pros: ['Extremely soft to touch', 'Heavyweight warmth', 'Bohemian pattern detailing'],
    cons: ['Requires professional dry cleaning'],
    is_featured: true,
    is_trending: true,
    trending_score: 9020,
    trend_theme: ['afrohemian-decor']
  },
  // 13. HandmadeTM Boho Runner
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000113',
    slug: 'handmadetm-handwoven-boho-runner',
    name: 'HandmadeTM Handwoven Boho Runner',
    brand: 'HandmadeTM',
    price: 999,
    description: 'A long flat-weave runner rug woven with cotton and wool yarns. Perfect for bedroom pathways or kitchen borders.',
    category_id: 'd10b7f8c-cbde-4e3a-b8ff-54a880f83d22',
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600&auto=format&fit=crop&q=80', alt: 'Boho Runner Rug', order: 0 }],
    features: ['Flat-weave construction', 'Runner size (2x6 ft)', 'Tassel ends detailing'],
    pros: ['Fits narrow hallways', 'Easy to shake out', 'Soft underfoot'],
    cons: ['Requires a rug pad to prevent slipping'],
    is_featured: false,
    is_trending: true,
    trending_score: 8110,
    trend_theme: ['afrohemian-decor']
  },
  // 14. HandmadeTM Area Rug
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000114',
    slug: 'handmadetm-handwoven-boho-area-rug',
    name: 'HandmadeTM Handwoven Boho Area Rug',
    brand: 'HandmadeTM',
    price: 1599,
    description: 'A mid-sized handwoven area rug featuring classic Moroccan trellis patterns in cream and charcoal.',
    category_id: 'd10b7f8c-cbde-4e3a-b8ff-54a880f83d22',
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80', alt: 'Morpho Trellis Rug', order: 0 }],
    features: ['Classic trellis pattern', 'Cream and charcoal colors', 'Handmade fringe borders'],
    pros: ['Hides dirt well', 'Very cozy aesthetic', 'Sturdily woven'],
    cons: ['Fringes can tangle in vacuums'],
    is_featured: false,
    is_trending: false,
    trending_score: 6540,
    trend_theme: ['afrohemian-decor']
  },
  // 15. SITOVI Oil Sprayer
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000115',
    slug: 'sitovi-glass-oil-sprayer-bottle',
    name: 'SITOVI Glass Oil Sprayer Bottle',
    brand: 'SITOVI',
    price: 499,
    description: 'Modern glass sprayer bottle with a soft-press pump head. Gives a fine, even mist of oil or vinegar for healthy cooking.',
    category_id: 'd10b7f8c-cbde-4e3a-b8ff-54a880f83d22', // Room Decor
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', alt: 'SITOVI Oil Sprayer', order: 0 }],
    features: ['Premium glass body', 'Soft-press pump head', 'Fine mist nozzle', 'Easy-to-clean design'],
    pros: ['Saves oil usage', 'Consistent misting', 'Durable glass build'],
    cons: ['Clogs if using very thick liquids'],
    is_featured: true,
    is_trending: true,
    trending_score: 9340,
    trend_theme: ['gimme-gummy']
  },
  // 16. Continuous Spray Dispenser
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000116',
    slug: 'continuous-spray-oil-dispenser',
    name: 'Continuous Spray Oil Dispenser',
    brand: 'Sprayer',
    price: 599,
    description: 'High-pressure continuous spray dispenser with a soft, rubberized handle grip. Delivers an even mist under any angle.',
    category_id: 'd10b7f8c-cbde-4e3a-b8ff-54a880f83d22',
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', alt: 'Continuous Spray Dispenser', order: 0 }],
    features: ['High-pressure pump action', 'Soft rubberized handle', 'Continuous mist mechanism'],
    pros: ['Ergonomic handle', 'Works at 360 degrees', 'Large capacity'],
    cons: ['Hard to wash inside corners'],
    is_featured: false,
    is_trending: true,
    trending_score: 8450,
    trend_theme: ['gimme-gummy']
  },
  // 17. 100ml Glass Sprayer
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000117',
    slug: 'aesthetic-100ml-glass-sprayer',
    name: 'Aesthetic 100ml Glass Sprayer',
    brand: 'Glass Sprayer',
    price: 399,
    description: 'Compact 100ml glass spray bottle with silver-finish pump. Ideal for dressing salads and air frying.',
    category_id: 'd10b7f8c-cbde-4e3a-b8ff-54a880f83d22',
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', alt: '100ml Glass Sprayer', order: 0 }],
    features: ['100ml compact size', 'Silver-finish pump top', 'Transparent volume scale'],
    pros: ['Pocket-sized convenience', 'Very easy to carry', 'Clear glass scale'],
    cons: ['Requires frequent refills'],
    is_featured: false,
    is_trending: false,
    trending_score: 4120,
    trend_theme: ['gimme-gummy']
  },
  // 18. Mini Sealing Machine
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000118',
    slug: 'portable-handheld-sealing-machine',
    name: 'Portable Handheld Sealing Machine',
    brand: 'Portable Sealer',
    price: 799,
    description: 'Mini handheld bag sealer with a cute pastel pink rubberized casing. Keeps snacks fresh with thermal seal technology.',
    category_id: 'd10b7f8c-cbde-4e3a-b8ff-54a880f83d22',
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80', alt: 'Pastel Bag Sealer', order: 0 }],
    features: ['Pastel rubberized casing', 'Thermal micro-heating element', 'Integrated magnetic base'],
    pros: ['Fits in pocket', 'Magnet sticks to fridge', 'Instant heat-up'],
    cons: ['Requires 2 AA batteries (not included)'],
    is_featured: true,
    is_trending: true,
    trending_score: 9510,
    trend_theme: ['gimme-gummy']
  },
  // 19. Faucet Extender
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000119',
    slug: 'misamo-flexible-faucet-extender',
    name: 'Misamo Flexible Faucet Extender',
    brand: 'Misamo',
    price: 499,
    description: 'A flexible, bendy faucet extender with orange food-grade silicone casing. Swivels 360 degrees for convenient washing.',
    category_id: 'd10b7f8c-cbde-4e3a-b9ff-54b880f85e02', // Keep under Tech/Gaming Setup as extender gadget
    category_id: 'b09d0e2e-bfba-40a1-8d2a-a9cb84f67c3b', // Gaming Setup parent
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80', alt: 'Silicone Faucet Extender', order: 0 }],
    features: ['Food-grade silicone casing', '360° flexible bending', 'Anti-splash aerator nozzle'],
    pros: ['Extremely bendy and tactile', 'Prevents splashing', 'Easy to install'],
    cons: ["Doesn't fit square faucets"],
    is_featured: false,
    is_trending: true,
    trending_score: 8320,
    trend_theme: ['gimme-gummy']
  },
  // 20. Ninja Portable Blender
  {
    id: 'a3c8e42f-7c1a-47a2-bd32-000000000120',
    slug: 'ninja-blast-portable-cordless-blender',
    name: 'Ninja Blast Portable Cordless Blender',
    brand: 'Ninja',
    price: 4999,
    description: 'A premium portable cordless blender with a soft, rubberized carry strap and tactile push buttons. Blends smoothies on the go.',
    category_id: 'b09d0e2e-bfba-40a1-8d2a-a9cb84f67c3b', // Gaming Setup
    subcategory_id: null,
    images: [{ url: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&auto=format&fit=crop&q=80', alt: 'Ninja Portable Blender', order: 0 }],
    features: ['USB-C rechargeable battery', 'Leak-proof sip lid', 'Rubberized carry strap', 'Tactile pulse buttons'],
    pros: ['Powerful ice crushing', 'Extremely portable', 'Whisper-quiet motor'],
    cons: ['Cannot blend hot liquids'],
    is_featured: true,
    is_trending: true,
    trending_score: 9910,
    trend_theme: ['gimme-gummy']
  }
];

const affiliateLinksData = [
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000101', retailer: 'amazon', raw_url: 'https://www.amazon.in/Jawdrobe-Georgette-Lightweight-High-Waisted-Ruffle-Skirt-White-m/dp/B0FD3VKG6H?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000102', retailer: 'amazon', raw_url: 'https://www.amazon.in/PINKHUB-Womens-Summer-Pleated-Regular/dp/B0DJ172HQV?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000103', retailer: 'amazon', raw_url: 'https://www.amazon.in/Sahaj-Paridhan-Wrapskirt-Rajasthani-Multicolour/dp/B0B3GN9C5F?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000104', retailer: 'amazon', raw_url: 'https://www.amazon.in/ICW-Backless-Vacation-Two-Piece-Beachwear/dp/B0DNFWDJ2K?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000105', retailer: 'amazon', raw_url: 'https://www.amazon.in/SANNIDHI%C2%AE-Crochet-Swimwear-Vacation-Poolside/dp/B0GH66GDW4?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000106', retailer: 'amazon', raw_url: 'https://www.amazon.in/SANNIDHI%C2%AE-Crochet-Cropped-Hollow-Out-Vacation/dp/B0GF7W5529?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000107', retailer: 'amazon', raw_url: 'https://www.amazon.in/Aahwan-Hollow-Backless-Crochet-242-Beige-M/dp/B0CJFC1FBZ?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000108', retailer: 'amazon', raw_url: 'https://www.amazon.in/ICW-Knitted-Crochet-Openwork-Embroidery/dp/B0FGCRJBJ7?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000109', retailer: 'amazon', raw_url: 'https://www.amazon.in/KE-Exports-Womens-Women`s-Printed/dp/B0B5RMBDLT?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000110', retailer: 'amazon', raw_url: 'https://www.amazon.in/imsid-Handwoven-Natural-Braided-Reversible/dp/B081B5J3GP?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000111', retailer: 'amazon', raw_url: 'https://www.amazon.in/Handwoven-Natural-Braided-Reversible-Stylish/dp/B09Z75X518?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000112', retailer: 'amazon', raw_url: 'https://www.amazon.in/Ambadi-Home-Handwoven-Cotton-Wool-Boho/dp/B0CNK3PHDT?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000113', retailer: 'amazon', raw_url: 'https://www.amazon.in/HandmadeTM-Handwoven-Cotton-Wool-Bedroom-Kitchen/dp/B09QKQKZDH?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000114', retailer: 'amazon', raw_url: 'https://www.amazon.in/HandmadeTM-Handwoven-Cotton-Wool-Bedroom-Kitchen/dp/B09QKQKZDH?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000115', retailer: 'amazon', raw_url: 'https://www.amazon.in/SITOVI-Glass-Sprayer-Dispenser-Bottle/dp/B0FH6N2NVT?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000116', retailer: 'amazon', raw_url: 'https://www.amazon.in/Sprayer-Cooking-Dispenser-Continuous-Portion/dp/B0DB5NGRCM?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000117', retailer: 'amazon', raw_url: 'https://www.amazon.in/100ml-Glass-Sprayer-Bottle-Cooking/dp/B08D2Z1Y5Z?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000118', retailer: 'amazon', raw_url: 'https://www.amazon.in/Portable-Sealing-Machine-Handheld-Warranty/dp/B0CZ23FJJT?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000119', retailer: 'amazon', raw_url: 'https://www.amazon.in/Misamo-Enterprise-Extender-Flexible-Extension/dp/B0FHWCZQBV?tag=homedecor0f75-21' },
  { product_id: 'a3c8e42f-7c1a-47a2-bd32-000000000120', retailer: 'amazon', raw_url: 'https://www.amazon.in/Ninja-Portable-Cordless-Blender-BC151INCR/dp/B0FWY6WH7Z?tag=homedecor0f75-21' }
];

async function run() {
  console.log("Upserting new products and links to databases...");
  try {
    // 1. Insert locally
    console.log("--> Local Database:");
    const { error: lpErr } = await localSupabase.from('products').upsert(newProductsData);
    if (lpErr) console.error("Local Products Error:", lpErr.message);
    else console.log("   ✅ Local Products upserted");

    const { error: llErr } = await localSupabase.from('affiliate_links').upsert(affiliateLinksData);
    if (llErr) console.error("Local Links Error:", llErr.message);
    else console.log("   ✅ Local Links upserted");

    // 2. Insert remotely
    console.log("--> Remote Database:");
    const { error: rpErr } = await remoteSupabase.from('products').upsert(newProductsData);
    if (rpErr) {
      console.error("Remote Products Error:", rpErr.message);
      console.log("⚠️ If this error is about column 'trend_theme' not existing, please run the ALTER TABLE statement in Supabase SQL editor.");
    }
    else console.log("   ✅ Remote Products upserted");

    const { error: rlErr } = await remoteSupabase.from('affiliate_links').upsert(affiliateLinksData);
    if (rlErr) console.error("Remote Links Error:", rlErr.message);
    else console.log("   ✅ Remote Links upserted");

    console.log("\nDone database insertions.");
  } catch (err) {
    console.error("Database operation failed:", err);
  }
}

run();
