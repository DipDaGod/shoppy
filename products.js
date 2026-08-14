/* ============================================================
   PRODUCTS — the single source of truth for the shop.
   ------------------------------------------------------------
   This is a plain static file, loaded directly by index.html.
   To add, remove, or edit a product, just edit the PRODUCTS
   array below and refresh the page — nothing else needs to change.

   Every section on the site (shop grid, filter chips, the
   hidden Featured section) is generated FROM this array, so:
   - Adding a new object to PRODUCTS instantly gets its own
     product card in the shop.
   - Giving a product a `category` that doesn't exist yet
     automatically creates a new filter chip for it — CATEGORIES
     below is derived from PRODUCTS, not hand-maintained.

   FIELD GUIDE:
   id            unique number, never reuse one you've deleted
   name          product title shown on the card
   category      groups it under a filter chip (any string works)
   price         current selling price (number, no currency symbol)
   originalPrice same as price if not on sale, higher if it is —
                 the difference is what shows as a struck-through
                 price and a "Limited Edition"-style discount
   image         path to the product photo, e.g. "images/peacock-1.jpg"
                 — all images live in the /images folder next to
                 index.html. Leave as "" to fall back to the CSS
                 placeholder swatch instead.
   swatch        which placeholder swatch to use when image is ""
                 (sw-1 through sw-6 exist in styles.css; reuse any)
   rating        1–5, shown as filled stars
   popularity    used by the "Most popular" sort — higher = higher
   limited       true shows a "Limited Edition" badge on the card
   desc          shown (truncated) on the card, in full in Quick View
   materials     shown in Quick View
   dimensions    shown in Quick View
   colors        array of { name, hex } — shown as swatch dots in
                 Quick View (display only, no cart/variant logic)
   delivery      shown in Quick View as the estimated delivery line
   ============================================================ */

const PRODUCTS = [
  {
    id: 1, name: "Peacock Zari Shagun Envelope", category: "Wedding",
    price: 129, originalPrice: 149,
    image: "", swatch: "sw-1",
    rating: 5, popularity: 98, limited: true,
    desc: "Hand-painted peacock motif finished with real zari (metallic) threadwork on handmade cotton paper, edged in gold foil.",
    materials: "Handmade cotton paper, zari thread, gold foil",
    dimensions: "20 × 9 cm",
    colors: [
      { name: "Ivory Gold", hex: "#efe6d3" },
      { name: "Emerald Zari", hex: "#5c7a68" },
      { name: "Rosewood Blush", hex: "#e6c9c1" }
    ],
    delivery: "3–5 working days"
  },
  {
    id: 2, name: "Marigold Foil Envelope", category: "Festive",
    price: 89, originalPrice: 89,
    image: "", swatch: "sw-2",
    rating: 4, popularity: 80, limited: false,
    desc: "A festive favourite — hand-stamped marigold pattern in warm gold foil on saffron-toned handmade paper, perfect for Diwali gifting.",
    materials: "Handmade paper, gold foil stamping",
    dimensions: "18 × 8.5 cm",
    colors: [
      { name: "Saffron Gold", hex: "#d8a355" },
      { name: "Marigold Orange", hex: "#e08a4b" },
      { name: "Antique Gold", hex: "#d8c6a5" }
    ],
    delivery: "2–4 working days"
  },
  {
    id: 3, name: "Rose Gold Bandhani Envelope", category: "Wedding",
    price: 109, originalPrice: 129,
    image: "", swatch: "sw-3",
    rating: 5, popularity: 91, limited: false,
    desc: "Bandhani-inspired dot pattern hand-foiled in rose gold across ivory handmade paper — a modern take on a traditional motif.",
    materials: "Handmade paper, rose-gold foil, cotton thread tie",
    dimensions: "20 × 9 cm",
    colors: [
      { name: "Ivory", hex: "#f4ede1" },
      { name: "Rose Gold", hex: "#d9a9a0" },
      { name: "Blush Pink", hex: "#e6c9c1" }
    ],
    delivery: "3–5 working days"
  },
  {
    id: 4, name: "Little Stork Baby Shower Envelope", category: "Baby Shower",
    price: 79, originalPrice: 79,
    image: "", swatch: "sw-4",
    rating: 4, popularity: 64, limited: false,
    desc: "A soft hand-painted stork-and-clouds design in pastel tones — sized for baby shower and naming-ceremony gifting.",
    materials: "Handmade paper, watercolour pigment, silver foil accent",
    dimensions: "18 × 8.5 cm",
    colors: [
      { name: "Powder Blue", hex: "#aac2d4" },
      { name: "Blush Pink", hex: "#e6c9c1" },
      { name: "Soft Sage", hex: "#c3d0af" }
    ],
    delivery: "3–5 working days"
  },
  {
    id: 5, name: "Diya Glow Festive Envelope", category: "Festive",
    price: 99, originalPrice: 99,
    image: "", swatch: "sw-5",
    rating: 5, popularity: 87, limited: false,
    desc: "A hand-painted diya (lamp) illustration with radiating gold-foil rays on deep maroon handmade paper — made for Diwali and festive gifting.",
    materials: "Handmade paper, gold foil, hand-painted pigment",
    dimensions: "18 × 8.5 cm",
    colors: [
      { name: "Deep Maroon", hex: "#7a2f30" },
      { name: "Antique Gold", hex: "#d8c6a5" },
      { name: "Saffron Gold", hex: "#d8a355" }
    ],
    delivery: "2–4 working days"
  },
  {
    id: 6, name: "Lotus Mandala Envelope", category: "Wedding",
    price: 149, originalPrice: 169,
    image: "", swatch: "sw-6",
    rating: 5, popularity: 93, limited: true,
    desc: "Our most detailed piece — an intricate hand-block-printed lotus mandala with a gold-foil centre, on our thickest handmade paper stock.",
    materials: "Heavyweight handmade paper, hand-block print, gold foil",
    dimensions: "20 × 9 cm",
    colors: [
      { name: "Ivory", hex: "#f4ede1" },
      { name: "Dusty Rose", hex: "#dcc7cd" },
      { name: "Antique Gold", hex: "#d8c6a5" }
    ],
    delivery: "4–6 working days"
  }
];

/* Derived automatically from PRODUCTS — "All" first, then every
   distinct category in the order it first appears. Don't edit
   this by hand; add/change a product's `category` field instead. */
const CATEGORIES = ["All", ...new Set(PRODUCTS.map(p => p.category))];
