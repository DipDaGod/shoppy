/* ============================================================
   PRODUCTS — the single source of truth for the shop.
   ------------------------------------------------------------
   This is a plain static file, loaded directly by index.html.
   To add, remove, or edit a product, just edit the PRODUCTS
   array below and refresh the page — nothing else needs to change.

   STRUCTURE: products → designs. You have a small number of real
   products (e.g. "Swarna Dhaaga"), and each product comes in
   several designs/variants (different motifs, layouts, etc.).
   Every design is NOT a separate product — the shop grid shows
   ONE card per product, and Quick View is where a customer
   browses and picks a design.

   Every section on the site (shop grid, filter chips) is
   generated FROM this array, so:
   - Adding a new object to PRODUCTS instantly gets its own
     product card in the shop.
   - Giving a product a `category` that doesn't exist yet
     automatically creates a new filter chip for it — CATEGORIES
     below is derived from PRODUCTS, not hand-maintained.
   - Adding an object to a product's `designs` array instantly
     makes it selectable in that product's Quick View — no other
     changes needed.

   FIELD GUIDE — PRODUCT:
   id            unique number, never reuse one you've deleted
   name          the product's real name, e.g. "Swarna Dhaaga"
   category      groups it under a filter chip (any string works)
   price         the product's base price (number, no currency
                 symbol) — shown on the card and used unless a
                 design overrides it with its own `price`
   originalPrice same as price if not on sale, higher if it is —
                 the difference shows as a struck-through price
   coverImage    optional — the photo used as the shop card
                 thumbnail, e.g. "images/swarna-dhaaga-1.jpg".
                 Leave "" to just use the first design's image
                 instead (the usual case — you don't need to set
                 this unless you want the card to show a design
                 other than the first one).
   swatch        which placeholder swatch to use while a design
                 has no photo yet (sw-1 through sw-6 exist in
                 styles.css; reuse any)
   rating        1–5, shown as filled stars
   popularity    used by the "Most popular" sort — higher = higher
   limited       true shows a "Limited Edition" badge on the card
   desc          shown (truncated) on the card, in full in Quick View
   materials     shown in Quick View
   dimensions    shown in Quick View
   delivery      shown in Quick View as the estimated delivery line
   designs       array of this product's designs — see below.
                 A product should always have at least one.

   FIELD GUIDE — DESIGN (inside a product's `designs` array):
   name    shown in Quick View and in the WhatsApp message, e.g.
           "Design 1", or something more descriptive like
           "Peacock Motif" if that reads better for your catalog
   image   this design's primary photo, e.g. "images/swarna-dhaaga-2.jpg"
           — all images live in the /images folder next to
           index.html. Leave "" to fall back to the CSS placeholder
           swatch.
   images  optional array of ALL photos for this specific design's
           swipeable gallery in Quick View (full piece, angled
           shot, close-up), e.g. ["images/swarna-dhaaga-2.jpg",
           "images/swarna-dhaaga-2b.jpg"]. Leave as [] to just use
           `image` alone with no gallery controls.
   price   optional — only set this if THIS design costs more/less
           than the product's base price above (e.g. a design with
           extra gemstone work). Leave unset to just use the
           product's price for every design.
   ============================================================ */

const PRODUCTS = [
  {
    id: 1,
    name: "Tanjore Soan",
    category: "Soan",
    price: 200, originalPrice: 350,
    coverImage: "",
    swatch: "sw-1",
    rating: 5, popularity: 95, limited: false,
    desc: "A handcrafted Tanjore Soan, hand-painted with traditional motifs and finished with intricate gold detailing for a rich, festive look.",
    materials: "Hand-painted Tanjore artwork, gold-tone detailing, handmade base",
    dimensions: "5x5 cm",
    delivery: "3–5 working days",
    designs: [
      { name: "Swastika", image: "images/soan-1.jpeg", images: [] },
      { name: "Om", image: "images/soan-2.jpeg", images: [] },
      { name: "Swastika Gold", image: "images/soan-3.jpeg", images: [] },
      { name: "Sun", image: "images/soan-4.jpeg", images: [] }
    ]
  },
  {
    id: 2,
    name: "Swarn Dhaga",
    category: "Rakhi",
    price: 100, originalPrice: 200,
    coverImage: "",
    swatch: "sw-3",
    rating: 5, popularity: 94, limited: false,
    desc: "A handcrafted Tanjore rakhi featuring hand-painted traditional motifs, intricate gold detailing, colourful threads, and decorative beads. Each design is individually handmade for a rich and festive finish.",
    materials: "Hand-painted Tanjore artwork, gold-tone detailing, decorative beads, traditional threads, handmade base",
    dimensions: "Approx. 12 × 12 cm",
    delivery: "5–8 working days",
    designs: [
      { name: "Design 1", image: "images/rakhi-1.jpeg", images: [] },
      { name: "Design 2", image: "images/rakhi-2.jpeg", images: [] },
      { name: "Design 3", image: "images/rakhi-3.jpeg", images: [] },
      { name: "Design 4", image: "images/rakhi-4.jpeg", images: [] },
      { name: "Design 5", image: "images/rakhi-5.jpeg", images: [] },
      { name: "Design 6", image: "images/rakhi-6.jpeg", images: [] },
      { name: "Design 7", image: "images/rakhi-7.jpeg", images: [] },
      { name: "Design 8", image: "images/rakhi-8.jpeg", images: [] },
      { name: "Design 9", image: "images/rakhi-9.jpeg", images: [] },
      { name: "Design 10", image: "images/rakhi-10.jpeg", images: [] }
    ]
  },
  {
    id: 3,
    name: "Golden Heritage",
    category: "Lumba",
    price: 800, originalPrice: 1100,
    coverImage: "images/lumba-1.jpeg",
    swatch: "sw-6",
    rating: 5, popularity: 91, limited: true,
    desc: "A handcrafted Tanjore lumba featuring intricate hand-painted detailing, rich gold accents, and traditional Indian motifs, created as an elegant festive statement piece.",
    materials: "Hand-painted Tanjore artwork, gold-tone detailing, decorative beads, handmade base",
    dimensions: "8x8 cm",
    delivery: "5-7 working days",
    designs: [
      { name: "Peacock Heritage", image: "images/lumba-1.jpeg", images: [] },
      { name: "Royal Kalash", image: "images/lumba-2.png", images: [] },
      { name: "Swarna Abhushan", image: "images/lumba-3.png", images: [] }
    ]
  }
];

/* Derived automatically from PRODUCTS — "All" first, then every
   distinct category in the order it first appears. Don't edit
   this by hand; add/change a product's `category` field instead. */
const CATEGORIES = ["All", ...new Set(PRODUCTS.map(p => p.category))];
