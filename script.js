/* ============================================================
   STORE NAME — edit this one line and the whole site updates:
   navbar logo, footer logo, page title, "Why ___" heading,
   about-section mentions, copyright line, the @handle in the
   gallery section, the contact email, and the wax-seal
   monogram in the hero all update automatically.

   STORE_INITIALS controls the monogram shown on the hero's
   wax seal. Leave it as "" to auto-generate from STORE_NAME
   (first letter of each word), or set it directly like below
   to force an exact monogram regardless of the name's words.
   ============================================================ */
const STORE_NAME = "SD Creations";
const STORE_INITIALS = "SD";

function storeSlug(){
  return STORE_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '');
}
function storeInitials(){
  if(STORE_INITIALS) return STORE_INITIALS.toUpperCase();
  const letters = STORE_NAME.trim().split(/\s+/).filter(w => /^[A-Za-z]/.test(w));
  return letters.map(w => w[0].toUpperCase()).slice(0, 2).join('');
}
function applyStoreName(){
  document.title = `${STORE_NAME} — Handmade Shagun Envelopes`;

  // Logo: last word shown in gold (matches the two-tone logo style), rest in ink.
  const words = STORE_NAME.trim().split(/\s+/);
  let logoHTML = STORE_NAME;
  if(words.length > 1){
    const last = words.pop();
    logoHTML = `${words.join(' ')} <span>${last}</span>`;
  }
  document.querySelectorAll('[data-store-logo]').forEach(el => el.innerHTML = logoHTML);

  document.querySelectorAll('[data-store-name]').forEach(el => el.textContent = STORE_NAME);
  document.querySelectorAll('[data-store-handle]').forEach(el => el.textContent = '@' + storeSlug());

  const emailEl = document.getElementById('contactEmail');
  if(emailEl){
    const email = `hello@${storeSlug()}.com`;
    emailEl.textContent = email;
    emailEl.href = `mailto:${email}`;
  }

  const waxSeal = document.getElementById('waxSeal');
  if(waxSeal) waxSeal.setAttribute('data-initials', storeInitials());

  const loaderMark = document.getElementById('loaderMark');
  if(loaderMark) loaderMark.innerHTML = STORE_NAME.toUpperCase().replace(/\s+/g, '&nbsp;');
}

/* ============================================================
   BACKEND API — wired to your Cloudflare Worker.
   ------------------------------------------------------------
   /site-data and /checkout are real, implemented endpoints (see
   worker.js). The rest (cart/wishlist/newsletter/coupon sync)
   aren't implemented on the Worker yet — calls to them will just
   log a 404 warning in the console until you add matching routes
   in worker.js. Nothing else breaks in the meantime.
   ============================================================ */
const API = {
  baseURL: 'https://myshop.dhairyaplayz97.workers.dev/api',

  async request(path, method = 'GET', body = null){
    try {
      const res = await fetch(`${this.baseURL}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      if(!res.ok){
        console.warn(`[API] ${method} ${path} responded ${res.status}`);
        return null;
      }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch(err){
      console.warn(`[API] ${method} ${path} failed —`, err.message);
      return null;
    }
  },

  // Real: pulls the authoritative product catalog (with real prices) from the Worker.
  getSiteData(){ return this.request('/site-data', 'GET'); },

  // Real: the Worker recomputes the total itself from its own price list,
  // so a price edited in the browser's devtools never reaches the charge.
  checkout(cart){
    const payload = { cart: cart.map(i => ({ id: i.id, qty: i.qty })) };
    return this.request('/checkout', 'POST', payload);
  },

  // Not implemented on the Worker yet — see worker.js for where to add them.
  addToCart(item){ return this.request('/cart/add', 'POST', item); },
  removeFromCart(id){ return this.request('/cart/remove', 'POST', { id }); },
  updateCartQty(id, qty){ return this.request('/cart/update', 'POST', { id, qty }); },
  addToWishlist(id){ return this.request('/wishlist/add', 'POST', { id }); },
  removeFromWishlist(id){ return this.request('/wishlist/remove', 'POST', { id }); },
  subscribeNewsletter(email){ return this.request('/newsletter/subscribe', 'POST', { email }); },
  applyCoupon(code){ return this.request('/coupon/apply', 'POST', { code }); }
};

async function loadSiteData(){
  const remote = await API.getSiteData();
  if(remote && Array.isArray(remote.products) && remote.products.length){
    SITE_DATA = remote;
  } else {
    console.warn('Could not reach the Worker at', API.baseURL, '— using the local fallback catalog instead.');
    SITE_DATA = FALLBACK_SITE_DATA;
  }
}

/* ============================================================
   FALLBACK SITE DATA — used only if the Worker can't be reached
   (offline, Worker not deployed yet, network hiccup). Real prices
   now live in worker.js on Cloudflare, not here — editing this
   object no longer changes what customers are actually charged;
   it only changes what shows up if the Worker is unreachable.
   ============================================================ */
let SITE_DATA = { categories: [], products: [], why: [], testimonials: [] };

const FALLBACK_SITE_DATA = {

  categories: ["All", "Wedding", "Festive", "Baby Shower"],

  products: [
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
  ],

  why: [
    { title:"Handmade with Care", desc:"Every envelope is hand-painted or hand-foiled, one piece at a time.", icon:'<path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/>' },
    { title:"Premium Materials", desc:"Thick handmade paper, real gold foil, and pigments chosen to hold their colour.", icon:'<path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>' },
    { title:"Secure Payments", desc:"Encrypted checkout, every time, on every device.", icon:'<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' },
    { title:"Fast Shipping", desc:"Dispatched within 48 hours, tracked door to door.", icon:'<path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="1.6"/><circle cx="18" cy="19" r="1.6"/>' },
    { title:"Custom Designs", desc:"Request a bespoke motif, monogram, or name to be hand-painted on.", icon:'<path d="M3 21l4-1 11-11-3-3L4 17z"/><path d="M13 5l3 3"/>' },
    { title:"Quality Guaranteed", desc:"Replacement guarantee on any envelope that arrives damaged.", icon:'<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/>' }
  ],

  testimonials: [
    { name:"Ananya R.", loc:"Mumbai", quote:"Used the Peacock Zari envelope for my cousin's wedding shagun — guests kept asking where I got it.", initial:"A", color:"#8296ab" },
    { name:"Priya K.", loc:"Bengaluru", quote:"Bought a stack of the Marigold Foil ones for Diwali. They look far more expensive than what I paid.", initial:"P", color:"#e6c9c1" },
    { name:"Meera S.", loc:"Delhi", quote:"The Lotus Mandala envelope was so pretty my mother-in-law kept it instead of throwing it away.", initial:"M", color:"#b8975f" },
    { name:"Ishita D.", loc:"Kolkata", quote:"Ordered the Little Stork ones for a baby shower — the pastel colours and stork print were perfect.", initial:"I", color:"#9fae8e" }
  ]
};

/* ============ STATE (in-memory, no localStorage) ============ */
let cart = [];
let wishlist = new Set();
let currentFilter = "All";
let currentSort = "newest";
let searchTerm = "";

/* ============ RENDER HELPERS ============ */
function iconFor(cat){
  const icons = {
    Wedding:'<svg viewBox="0 0 24 24" stroke="#fff" fill="none" stroke-width="1.3"><circle cx="9" cy="15" r="5"/><circle cx="15" cy="15" r="5"/><path d="M12 4v4"/></svg>',
    Festive:'<svg viewBox="0 0 24 24" stroke="#fff" fill="none" stroke-width="1.3"><path d="M4 18c0-4 3-6 8-6s8 2 8 6"/><path d="M12 12V4"/><path d="M9 4c0 2 1.5 3 3 3s3-1 3-3"/></svg>',
    "Baby Shower":'<svg viewBox="0 0 24 24" stroke="#fff" fill="none" stroke-width="1.3"><circle cx="12" cy="9" r="5"/><path d="M9 14l-2 6M15 14l2 6M7 9a5 5 0 0 1 10 0"/></svg>'
  };
  return icons[cat] || icons.Wedding;
}

function starSVG(){
  return '<svg viewBox="0 0 24 24"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z"/></svg>';
}

// Broken product image links fall back to the built-in swatch illustration.
// This replaces an inline onerror="" attribute (which a strict CSP blocks) —
// "error" events don't bubble, so this listener needs the capture flag.
document.addEventListener('error', (e)=>{
  const img = e.target;
  if(img.tagName === 'IMG' && img.classList.contains('product-img')){
    img.style.display = 'none';
    const fallback = img.nextElementSibling;
    if(fallback) fallback.style.display = 'flex';
  }
}, true);

function mediaMarkup(p){
  return p.image
    ? `<img class="product-img" src="${p.image}" alt="${p.name}"><div class="swatch ${p.swatch}" style="display:none;"><div class="sw-icon">${iconFor(p.category)}</div></div>`
    : `<div class="swatch ${p.swatch}"><div class="sw-icon">${iconFor(p.category)}</div></div>`;
}

function cardControlHTML(p){
  const item = cart.find(c=>c.id===p.id);
  if(!item){
    return `<button class="add-btn" data-add="${p.id}">Add to Cart</button>`;
  }
  return `
    <div class="card-stepper">
      <button class="qty-btn" data-card-minus="${p.id}" aria-label="Decrease quantity">−</button>
      <span>${item.qty}</span>
      <button class="qty-btn" data-card-plus="${p.id}" aria-label="Increase quantity">+</button>
    </div>
    <button class="card-remove-btn" data-card-remove="${p.id}" aria-label="Remove from cart">
      <svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13"/></svg>
    </button>`;
}

function productCard(p){
  const isFav = wishlist.has(p.id);
  const hasDiscount = p.originalPrice && p.originalPrice > p.price;
  return `
  <div class="product-card" data-id="${p.id}">
    <div class="card-media ${p.swatch}">
      ${mediaMarkup(p)}
      <div class="stitch-frame"></div>
      <div class="badges">
        <span class="badge handmade">Handmade</span>
        ${p.limited ? '<span class="badge limited">Limited Edition</span>' : ''}
      </div>
      <button class="fav-btn ${isFav ? 'active':''}" data-fav="${p.id}">
        <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
      <button class="quickview-btn" data-quickview="${p.id}">Quick View</button>
    </div>
    <div class="card-body">
      <div class="card-top"><h3>${p.name}</h3></div>
      <div class="stars">${Array(p.rating).fill(starSVG()).join('')}</div>
      <p class="card-desc">${p.desc.slice(0,72)}...</p>
      <div class="card-bottom">
        <div class="price-group">
          <span class="price">₹${p.price.toLocaleString('en-IN')}</span>
          ${hasDiscount ? `<span class="price-original">₹${p.originalPrice.toLocaleString('en-IN')}</span>` : ''}
        </div>
        <div class="card-control" data-pid="${p.id}">${cardControlHTML(p)}</div>
      </div>
    </div>
  </div>`;
}

function refreshCardControls(){
  document.querySelectorAll('.card-control').forEach(el=>{
    const id = +el.dataset.pid;
    const p = SITE_DATA.products.find(x=>x.id===id);
    if(p) el.innerHTML = cardControlHTML(p);
  });
}

function renderFeatured(){
  document.getElementById('featuredGrid').innerHTML = SITE_DATA.products.slice(0,6).map(productCard).join('');
}

function getFilteredProducts(){
  let list = SITE_DATA.products.slice();
  if(currentFilter !== "All") list = list.filter(p => p.category === currentFilter);
  if(searchTerm.trim()) list = list.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  if(currentSort === "price-asc") list.sort((a,b)=>a.price-b.price);
  else if(currentSort === "price-desc") list.sort((a,b)=>b.price-a.price);
  else if(currentSort === "popular") list.sort((a,b)=>b.popularity-a.popularity);
  else list.sort((a,b)=>b.id-a.id);
  return list;
}

function renderShop(){
  const grid = document.getElementById('shopGrid');
  const list = getFilteredProducts();
  grid.style.opacity = 0;
  setTimeout(()=>{
    grid.innerHTML = list.length ? list.map(productCard).join('') : `<p style="grid-column:1/-1; text-align:center; color:var(--ink-soft); padding:40px 0;">No pieces match that search — try another name or filter.</p>`;
    grid.style.transition = 'opacity 0.4s ease';
    grid.style.opacity = 1;
  }, 180);
}

function renderChips(){
  document.getElementById('filterChips').innerHTML = SITE_DATA.categories.map(c =>
    `<button class="chip ${c===currentFilter?'active':''}" data-chip="${c}">${c}</button>`
  ).join('');
}

function renderWhy(){
  document.getElementById('whyGrid').innerHTML = SITE_DATA.why.map(w => `
    <div class="why-card">
      <div class="why-icon">${w.icon.replace('stroke="#fff"','stroke="var(--gold)"')}</div>
      <h4>${w.title}</h4>
      <p>${w.desc}</p>
    </div>`).join('');
}

function renderTestimonials(){
  document.getElementById('testimonialTrack').innerHTML = SITE_DATA.testimonials.map(t => `
    <div class="t-card">
      <div class="t-head">
        <div class="t-avatar" style="background:${t.color}">${t.initial}</div>
        <div><div class="t-name">${t.name}</div><div class="t-loc">${t.loc}</div></div>
      </div>
      <div class="t-stars">${Array(5).fill(starSVG()).join('')}</div>
      <p class="t-quote">"${t.quote}"</p>
    </div>`).join('');
}

function renderGallery(){
  const swatches = ["sw-1","sw-2","sw-3","sw-4","sw-5","sw-6","sw-2","sw-4"];
  const heights = [220,280,240,300,260,230,290,250];
  document.getElementById('masonryGrid').innerHTML = swatches.map((s,i) => `
    <div class="masonry-item">
      <div class="mimg ${s}" style="height:${heights[i]}px;"></div>
      <div class="overlay"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
    </div>`).join('');
}

/* ============ CART LOGIC ============ */
function flyToCart(sourceEl){
  if(!sourceEl) return;
  const cartIcon = document.getElementById('cartBtn');
  const startRect = sourceEl.getBoundingClientRect();
  const endRect = cartIcon.getBoundingClientRect();
  if(startRect.width === 0) return;

  const clone = sourceEl.cloneNode(true);
  clone.classList.add('fly-clone');
  clone.style.left = startRect.left + 'px';
  clone.style.top = startRect.top + 'px';
  clone.style.width = startRect.width + 'px';
  clone.style.height = startRect.height + 'px';
  clone.style.margin = '0';
  clone.style.borderRadius = '14px';
  clone.style.opacity = '1';
  document.body.appendChild(clone);

  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      clone.style.left = (endRect.left + endRect.width/2 - 9) + 'px';
      clone.style.top = (endRect.top + endRect.height/2 - 9) + 'px';
      clone.style.width = '18px';
      clone.style.height = '18px';
      clone.style.borderRadius = '50%';
      clone.style.opacity = '0.15';
    });
  });

  setTimeout(()=>{
    clone.remove();
    cartIcon.classList.add('cart-bump');
    document.getElementById('cartCount').classList.add('badge-pop');
    setTimeout(()=>{
      cartIcon.classList.remove('cart-bump');
      document.getElementById('cartCount').classList.remove('badge-pop');
    }, 500);
  }, 700);
}

function addToCart(id, btn, sourceEl){
  const p = SITE_DATA.products.find(x=>x.id===id);
  const existing = cart.find(x=>x.id===id);
  if(existing) existing.qty++;
  else cart.push({...p, qty:1, selectedColor: p.colors[0].name});
  updateCartUI();

  flyToCart(sourceEl);
  API.addToCart({id: p.id, name: p.name, price: p.price}); // fire-and-forget stub, see API block below

  if(btn){
    btn.classList.add('added','pulsing');
    btn.textContent = 'Added ✓';
    setTimeout(()=>btn.classList.remove('pulsing'), 400);
    setTimeout(()=>{ btn.classList.remove('added'); btn.textContent = 'Add to Cart'; }, 1400);
  }
}

function changeQty(id, delta){
  const item = cart.find(x=>x.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){
    cart = cart.filter(x=>x.id!==id);
    API.removeFromCart(id);
  } else {
    API.updateCartQty(id, item.qty);
  }
  updateCartUI();
}

function removeFromCart(id){
  cart = cart.filter(x=>x.id!==id);
  API.removeFromCart(id);
  updateCartUI();
}

function updateCartUI(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartCount').textContent = count;
  const itemsEl = document.getElementById('cartItems');

  if(cart.length===0){
    itemsEl.innerHTML = `<div class="cart-empty">Your bag is empty.<br>Time to find a favorite.</div>`;
  } else {
    itemsEl.innerHTML = cart.map(i => {
      const hasDiscount = i.originalPrice && i.originalPrice > i.price;
      return `
      <div class="cart-item">
        <div class="mini-media ${i.swatch}">${mediaMarkup(i)}</div>
        <div class="ci-info">
          <div class="ci-top">
            <div>
              <h5>${i.name}</h5>
              <p class="ci-desc">${i.desc.slice(0,42)}...</p>
              <div class="ci-variant">Paper <strong>${i.selectedColor || i.colors[0].name}</strong></div>
            </div>
            <div class="ci-actions">
              <button class="ci-icon-btn" data-remove="${i.id}" aria-label="Remove item">
                <svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13"/></svg>
              </button>
              <button class="ci-icon-btn" data-edit="${i.id}" aria-label="Edit item">
                <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
              </button>
            </div>
          </div>
          <div class="ci-bottom">
            <div class="qty-row">
              <button class="qty-btn" data-qty-minus="${i.id}">−</button>
              <span>${i.qty}</span>
              <button class="qty-btn" data-qty-plus="${i.id}">+</button>
            </div>
            <div class="ci-price-group">
              <span class="ci-price">₹${(i.price*i.qty).toLocaleString('en-IN')}</span>
              ${hasDiscount ? `<span class="ci-original">₹${(i.originalPrice*i.qty).toLocaleString('en-IN')}</span>` : ''}
            </div>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // order summary — subtotal / discount / tax / shipping / total, like the reference cart page
  const subtotal = cart.reduce((s,i)=>s + (i.originalPrice||i.price) * i.qty, 0);
  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  const discount = Math.max(0, subtotal - total);
  const tax = 0;
  const grandTotal = total + tax;

  document.getElementById('summaryRows').innerHTML = `
    <div class="summary-row"><span>Sub Total</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
    <div class="summary-row"><span>Discount</span><span>−₹${discount.toLocaleString('en-IN')}</span></div>
    <div class="summary-row"><span>Tax</span><span>₹${tax.toLocaleString('en-IN')}</span></div>
    <div class="summary-row"><span>Shipping</span><span class="free">Free</span></div>
    <div class="summary-row total"><span>Total</span><span>₹${grandTotal.toLocaleString('en-IN')}</span></div>
  `;

  itemsEl.querySelectorAll('[data-qty-minus]').forEach(b=>b.onclick=()=>changeQty(+b.dataset.qtyMinus,-1));
  itemsEl.querySelectorAll('[data-qty-plus]').forEach(b=>b.onclick=()=>changeQty(+b.dataset.qtyPlus,1));
  itemsEl.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>removeFromCart(+b.dataset.remove));
  itemsEl.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{ closeCartFn(); openQuickView(+b.dataset.edit); });

  const checkoutBtn = document.getElementById('checkoutBtn');
  if(checkoutBtn) checkoutBtn.disabled = cart.length === 0;

  refreshCardControls();
}

function toggleWish(id, btn){
  if(wishlist.has(id)){ wishlist.delete(id); API.removeFromWishlist(id); }
  else { wishlist.add(id); API.addToWishlist(id); }
  btn.classList.toggle('active');
  document.getElementById('wishCount').textContent = wishlist.size;
}

/* ============ QUICK VIEW ============ */
function openQuickView(id){
  const p = SITE_DATA.products.find(x=>x.id===id);
  const box = document.getElementById('qvBox');
  const hasDiscount = p.originalPrice && p.originalPrice > p.price;
  box.innerHTML = `
    <div class="qv-media ${p.swatch}">
      ${mediaMarkup(p)}
      <button class="qv-close" id="qvCloseBtn"><svg viewBox="0 0 24 24" stroke="#332c24" fill="none"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg></button>
    </div>
    <div class="qv-info">
      <span class="eyebrow">${p.category}</span>
      <h3>${p.name}</h3>
      <div class="qv-price-group">
        <div class="qv-price">₹${p.price.toLocaleString('en-IN')}</div>
        ${hasDiscount ? `<div class="qv-original">₹${p.originalPrice.toLocaleString('en-IN')}</div>` : ''}
      </div>
      <div class="stars">${Array(p.rating).fill(starSVG()).join('')}</div>
      <p class="qv-desc" style="margin-top:14px;">${p.desc}</p>
      <div class="qv-meta">
        <div><span>Materials</span>${p.materials}</div>
        <div><span>Dimensions</span>${p.dimensions}</div>
      </div>
      <div><span style="display:block; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:var(--ink-soft); margin-bottom:8px;">Paper Colour — <span id="qvColorName">${p.colors[0].name}</span></span>
        <div class="color-dots">
          ${p.colors.map((c,i)=>`<div class="color-dot ${i===0?'active':''}" style="background:${c.hex}" data-color="${c.name}" title="${c.name}"></div>`).join('')}
        </div>
      </div>
      <div class="qty-selector">
        <button class="qty-btn" id="qvMinus">−</button>
        <span id="qvQty">1</span>
        <button class="qty-btn" id="qvPlus">+</button>
      </div>
      <div class="qv-btns">
        <button class="btn-primary ripple" id="qvAddCart">Add to Cart</button>
        <button class="btn-secondary" id="qvBuyNow">Buy Now</button>
      </div>
      <div class="qv-note">Estimated delivery: ${p.delivery}. Handmade piece — slight variation in paint, foil, and paper grain is part of the charm.</div>
    </div>`;
  document.getElementById('qvModal').classList.add('open');
  document.body.style.overflow = 'hidden';

  let qty = 1;
  let selectedColor = p.colors[0].name;
  box.querySelectorAll('[data-color]').forEach(d=>d.onclick=()=>{
    box.querySelectorAll('[data-color]').forEach(x=>x.classList.remove('active'));
    d.classList.add('active');
    selectedColor = d.dataset.color;
    document.getElementById('qvColorName').textContent = selectedColor;
  });
  document.getElementById('qvMinus').onclick = ()=>{ if(qty>1) qty--; document.getElementById('qvQty').textContent = qty; };
  document.getElementById('qvPlus').onclick = ()=>{ qty++; document.getElementById('qvQty').textContent = qty; };
  document.getElementById('qvAddCart').onclick = ()=>{
    const media = box.querySelector('.qv-media');
    for(let i=0;i<qty;i++) addToCart(p.id, null, i===0 ? media : null);
    const item = cart.find(c=>c.id===p.id);
    if(item) item.selectedColor = selectedColor;
    updateCartUI();
    closeQuickView();
  };
  document.getElementById('qvBuyNow').onclick = ()=>{
    const media = box.querySelector('.qv-media');
    for(let i=0;i<qty;i++) addToCart(p.id, null, i===0 ? media : null);
    const item = cart.find(c=>c.id===p.id);
    if(item) item.selectedColor = selectedColor;
    updateCartUI();
    closeQuickView(); openCart();
  };
  document.getElementById('qvCloseBtn').onclick = closeQuickView;
}
function closeQuickView(){
  document.getElementById('qvModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ============ CART DRAWER ============ */
function openCart(){
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('overlayBg').classList.add('show');
}
function closeCartFn(){
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('overlayBg').classList.remove('show');
}

/* ============ TOAST ============ */
let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ============ EVENT WIRING ============ */
function attachGlobalCardDelegation(){
  document.body.addEventListener('click', (e)=>{
    const addBtn = e.target.closest('[data-add]');
    if(addBtn){
      e.stopPropagation();
      const media = addBtn.closest('.product-card')?.querySelector('.card-media');
      addToCart(+addBtn.dataset.add, addBtn, media);
      return;
    }
    const favBtn = e.target.closest('[data-fav]');
    if(favBtn){ e.stopPropagation(); toggleWish(+favBtn.dataset.fav, favBtn); return; }

    const qvBtn = e.target.closest('[data-quickview]');
    if(qvBtn){ e.stopPropagation(); openQuickView(+qvBtn.dataset.quickview); return; }

    const cardMinus = e.target.closest('[data-card-minus]');
    if(cardMinus){ e.stopPropagation(); changeQty(+cardMinus.dataset.cardMinus, -1); return; }

    const cardPlus = e.target.closest('[data-card-plus]');
    if(cardPlus){ e.stopPropagation(); changeQty(+cardPlus.dataset.cardPlus, 1); return; }

    const cardRemove = e.target.closest('[data-card-remove]');
    if(cardRemove){ e.stopPropagation(); removeFromCart(+cardRemove.dataset.cardRemove); return; }
  });
}

function ripple(e){
  const btn = e.currentTarget;
  const circle = document.createElement('span');
  const d = Math.max(btn.clientWidth, btn.clientHeight);
  circle.style.width = circle.style.height = d+'px';
  circle.style.left = (e.clientX - btn.getBoundingClientRect().left - d/2)+'px';
  circle.style.top = (e.clientY - btn.getBoundingClientRect().top - d/2)+'px';
  circle.classList.add('ripple-circle');
  btn.appendChild(circle);
  setTimeout(()=>circle.remove(), 650);
}

document.addEventListener('DOMContentLoaded', async ()=>{
  applyStoreName();
  await loadSiteData();
  renderFeatured();
  renderChips();
  renderShop();
  renderWhy();
  renderTestimonials();
  renderGallery();
  updateCartUI();
  attachGlobalCardDelegation();

  // navbar scroll
  const navbar = document.getElementById('navbar');
  function syncNavHeight(){
    document.documentElement.style.setProperty('--nav-h', navbar.offsetHeight + 'px');
  }
  syncNavHeight();
  window.addEventListener('resize', syncNavHeight);
  window.addEventListener('scroll', ()=>{
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    syncNavHeight();
  });

  // mobile hamburger menu
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinksEl = document.querySelector('.nav-links');
  hamburgerBtn.onclick = (e)=>{
    e.stopPropagation();
    hamburgerBtn.classList.toggle('active');
    navLinksEl.classList.toggle('open');
    hamburgerBtn.setAttribute('aria-expanded', navLinksEl.classList.contains('open'));
  };
  navLinksEl.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
    hamburgerBtn.classList.remove('active');
    navLinksEl.classList.remove('open');
  }));
  document.addEventListener('click', (e)=>{
    if(navLinksEl.classList.contains('open') && !navLinksEl.contains(e.target) && !hamburgerBtn.contains(e.target)){
      hamburgerBtn.classList.remove('active');
      navLinksEl.classList.remove('open');
    }
  });

  // hero envelope tilts toward the cursor
  const heroSection = document.querySelector('.hero');
  const tiltWrap = document.getElementById('tiltWrap');
  if(heroSection && tiltWrap && window.matchMedia('(hover: hover)').matches){
    heroSection.addEventListener('mousemove', (e)=>{
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotY = x * 16;
      const rotX = -y * 12;
      tiltWrap.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate(${x*12}px, ${y*8}px)`;
    });
    heroSection.addEventListener('mouseleave', ()=>{
      tiltWrap.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translate(0,0)';
    });
  }

  // reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('in'); });
  }, {threshold:0.12});
  revealEls.forEach(el=>io.observe(el));

  // search: sleek expand/collapse
  const searchWrap = document.getElementById('searchWrap');
  const searchToggle = document.getElementById('searchToggle');
  const searchBox = document.getElementById('searchBox');
  const searchInput = document.getElementById('shopSearchNav');
  const searchClose = document.getElementById('searchClose');

  function openSearch(){
    searchWrap.classList.add('open');
    searchBox.classList.add('open');
    searchToggle.setAttribute('aria-expanded','true');
    setTimeout(()=>searchInput.focus(), 200);
  }
  function closeSearch(){
    searchWrap.classList.remove('open');
    searchBox.classList.remove('open');
    searchToggle.setAttribute('aria-expanded','false');
    searchInput.blur();
  }
  searchToggle.onclick = (e)=>{
    e.stopPropagation();
    searchBox.classList.contains('open') ? closeSearch() : openSearch();
  };
  searchClose.onclick = (e)=>{ e.stopPropagation(); closeSearch(); };
  document.addEventListener('click', (e)=>{
    if(searchBox.classList.contains('open') && !searchWrap.contains(e.target)) closeSearch();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && searchBox.classList.contains('open')) closeSearch();
  });
  searchInput.addEventListener('input', (e)=>{
    searchTerm = e.target.value;
    document.getElementById('shopSearch').value = e.target.value;
    renderShop();
  });
  searchInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      document.getElementById('shop').scrollIntoView({behavior:'smooth'});
      closeSearch();
    }
  });

  // shop filters/search/sort
  document.getElementById('filterChips').addEventListener('click', (e)=>{
    const chip = e.target.closest('[data-chip]');
    if(!chip) return;
    currentFilter = chip.dataset.chip;
    renderChips();
    renderShop();
  });
  document.getElementById('shopSearch').addEventListener('input', (e)=>{
    searchTerm = e.target.value;
    renderShop();
  });
  document.getElementById('sortSelect').addEventListener('change', (e)=>{
    currentSort = e.target.value;
    renderShop();
  });

  // cart drawer
  document.getElementById('cartBtn').onclick = openCart;
  document.getElementById('closeCart').onclick = closeCartFn;
  document.getElementById('checkoutBtn').onclick = async ()=>{
    if(cart.length === 0) return;
    const checkoutBtn = document.getElementById('checkoutBtn');
    const originalLabel = checkoutBtn.textContent;
    checkoutBtn.textContent = 'Confirming with server…';
    checkoutBtn.disabled = true;

    const result = await API.checkout(cart);

    checkoutBtn.textContent = originalLabel;
    checkoutBtn.disabled = false;

    if(result && typeof result.total === 'number'){
      showToast(`Server-verified total: ₹${result.total.toLocaleString('en-IN')}. Wire this into real payment next.`);
    } else {
      showToast("Couldn't reach the order server — please try again in a moment.");
    }
  };
  const couponInput = document.getElementById('couponInput');
  const applyCouponBtn = document.getElementById('applyCoupon');

  function submitCoupon(){
    const code = couponInput.value.trim();
    if(!code){
      couponInput.classList.remove('nudge-shake');
      void couponInput.offsetWidth; // restart the animation if triggered twice in a row
      couponInput.classList.add('nudge-shake');
      couponInput.focus();
      return;
    }
    API.applyCoupon(code);
    showToast(`Coupon "${code}" sent — wire this up to your server to apply it.`);
  }

  applyCouponBtn.disabled = true;
  couponInput.addEventListener('input', ()=>{
    applyCouponBtn.disabled = !couponInput.value.trim();
    couponInput.classList.remove('nudge-shake');
  });
  couponInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') submitCoupon(); });
  applyCouponBtn.onclick = submitCoupon;
  document.getElementById('overlayBg').onclick = ()=>{ closeCartFn(); closeQuickView(); };

  // quickview modal close on backdrop
  document.getElementById('qvModal').addEventListener('click', (e)=>{
    if(e.target.id === 'qvModal') closeQuickView();
  });

  // ripple buttons
  document.querySelectorAll('.ripple').forEach(b=>b.addEventListener('click', ripple));

  // newsletter
  document.getElementById('newsletterForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    API.subscribeNewsletter(email);
    showToast(`You're on the list — welcome to ${STORE_NAME}.`);
    e.target.reset();
  });

  // wishlist icon click -> scroll to shop, just a nice touch
  document.getElementById('wishlistBtn').onclick = ()=>{
    document.getElementById('shop').scrollIntoView({behavior:'smooth'});
  };

  // loader
  setTimeout(()=>{ document.getElementById('loader').classList.add('hide'); }, 700);
});
