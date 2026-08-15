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
    name: "Swarna Dhaaga",
    category: "Rakhi Lumba",
    price: 799, originalPrice: 799,
    coverImage: "",
    swatch: "sw-1",
    rating: 5, popularity: 95, limited: false,
    desc: "A hand-finished rakhi lumba in fine golden thread work, with a dangling charm styled after traditional temple jewellery motifs.",
    materials: "Zari (metallic) thread, gold-tone charm, cotton base",
    dimensions: "Lumba: 6 × 3 cm approx.",
    delivery: "3–5 working days",
    designs: [
      { name: "Design 1", image: "", images: [] },
      { name: "Design 2", image: "", images: [] },
      { name: "Design 3", image: "", images: [] },
      { name: "Design 4", image: "", images: [] }
    ]
  },
  {
    id: 2,
    name: "Tejore Suna",
    category: "Tanjore Art",
    price: 2499, originalPrice: 2499,
    coverImage: "",
    swatch: "sw-3",
    rating: 5, popularity: 88, limited: false,
    desc: "A hand-painted Tanjore piece in relief gesso work finished with genuine gold foil — traditional South Indian temple-art style.",
    materials: "Wood base, gesso relief work, 24k gold foil, semi-precious stones",
    dimensions: "12 × 12 in.",
    delivery: "5–8 working days",
    designs: [
      { name: "Design 1", image: "", images: [] },
      { name: "Design 2", image: "", images: [] },
      { name: "Design 3", image: "", images: [] }
    ]
  },
  {
    id: 3,
    name: "Golden Heritage",
    category: "Tanjore Art",
    price: 3499, originalPrice: 3499,
    coverImage: "",
    swatch: "sw-6",
    rating: 5, popularity: 91, limited: true,
    desc: "Our most detailed Tanjore piece — intricate gold-foil relief work on a heavyweight wood base, built to be a centrepiece.",
    materials: "Heavyweight wood base, gesso relief work, 24k gold foil, gemstones",
    dimensions: "18 × 14 in.",
    delivery: "7–10 working days",
    designs: [
      { name: "Design 1", image: "", images: [] }
    ]
  }
];

/* Derived automatically from PRODUCTS — "All" first, then every
   distinct category in the order it first appears. Don't edit
   this by hand; add/change a product's `category` field instead. */
const CATEGORIES = ["All", ...new Set(PRODUCTS.map(p => p.category))];
