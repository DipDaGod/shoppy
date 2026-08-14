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
   SITE DATA — comes straight from products.js (loaded before this
   file in index.html). Editing a product there and refreshing is
   all it takes to update the shop.
   ============================================================ */
let SITE_DATA = { categories: CATEGORIES, products: PRODUCTS };

/* ============ STATE (in-memory, no localStorage) ============ */
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

function productCard(p){
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
      </div>
    </div>
  </div>`;
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

function hasActiveFilters(){
  return currentFilter !== "All" || searchTerm.trim() !== "" || currentSort !== "newest";
}

function renderShopStatus(total, shown){
  const el = document.getElementById('shopStatus');
  if(!el) return;
  const countText = total === 0
    ? 'No pieces match your filters'
    : `Showing ${shown} of ${total} piece${total === 1 ? '' : 's'}`;
  el.innerHTML = `
    <span>${countText}</span>
    ${hasActiveFilters() ? `<button class="clear-filters-btn" data-clear-filters>Clear filters</button>` : ''}
  `;
}

const SORT_LABELS = {
  newest: "Newest",
  popular: "Most popular",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low"
};

function setSortValue(value){
  currentSort = value;
  document.getElementById('sortTriggerLabel').textContent = SORT_LABELS[value] || value;
  document.querySelectorAll('#sortOptions .cs-option').forEach(opt=>{
    const active = opt.dataset.value === value;
    opt.classList.toggle('active', active);
    opt.setAttribute('aria-selected', active);
  });
}

function clearShopFilters(){
  currentFilter = "All";
  currentSort = "newest";
  searchTerm = "";
  const searchInput = document.getElementById('shopSearch');
  searchInput.value = "";
  document.getElementById('shopSearchWrap').classList.remove('open');
  setSortValue("newest");
  renderChips();
  renderShop();
}

function renderShop(){
  const grid = document.getElementById('shopGrid');
  const list = getFilteredProducts();
  renderShopStatus(SITE_DATA.products.length, list.length);
  grid.style.opacity = 0;
  setTimeout(()=>{
    grid.innerHTML = list.length ? list.map(productCard).join('') : `
      <div class="shop-empty">
        <p>No pieces match that search — try another name or filter.</p>
        <button class="clear-filters-btn" data-clear-filters>Clear filters</button>
      </div>`;
    grid.style.transition = 'opacity 0.4s ease';
    grid.style.opacity = 1;
  }, 180);
}

function renderChips(){
  document.getElementById('filterChips').innerHTML = SITE_DATA.categories.map(c =>
    `<button class="chip ${c===currentFilter?'active':''}" data-chip="${c}" aria-pressed="${c===currentFilter}">${c}</button>`
  ).join('');
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
      <div><span style="display:block; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:var(--ink-soft); margin-bottom:8px;">Colour — <span id="qvColorName">${p.colors[0].name}</span></span>
        <div class="color-dots">
          ${p.colors.map((c,i)=>`<div class="color-dot ${i===0?'active':''}" style="background:${c.hex}" data-color="${c.name}" title="${c.name}"></div>`).join('')}
        </div>
      </div>
      <div class="qv-note">Estimated delivery: ${p.delivery}. Handmade piece — slight variation in paint, foil, and paper grain is part of the charm.</div>
    </div>`;
  document.getElementById('qvModal').classList.add('open');
  document.body.style.overflow = 'hidden';

  box.querySelectorAll('[data-color]').forEach(d=>d.onclick=()=>{
    box.querySelectorAll('[data-color]').forEach(x=>x.classList.remove('active'));
    d.classList.add('active');
    document.getElementById('qvColorName').textContent = d.dataset.color;
  });
  document.getElementById('qvCloseBtn').onclick = closeQuickView;
}
function closeQuickView(){
  document.getElementById('qvModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ============ EVENT WIRING ============ */
function attachGlobalCardDelegation(){
  document.body.addEventListener('click', (e)=>{
    const qvBtn = e.target.closest('[data-quickview]');
    if(qvBtn){ e.stopPropagation(); openQuickView(+qvBtn.dataset.quickview); return; }
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

document.addEventListener('DOMContentLoaded', ()=>{
  applyStoreName();
  // renderFeatured(); — Featured section is temporarily hidden (see index.html)
  renderChips();
  renderShop();
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

  // shop filters/search/sort
  document.getElementById('filterChips').addEventListener('click', (e)=>{
    const chip = e.target.closest('[data-chip]');
    if(!chip) return;
    currentFilter = chip.dataset.chip;
    renderChips();
    renderShop();
  });

  // shop search — a closed icon button that expands cleanly into the
  // search box on click, and collapses again on close/outside-click/Escape
  const shopSearchInput = document.getElementById('shopSearch');
  const shopSearchWrap = document.getElementById('shopSearchWrap');
  const shopSearchToggle = document.getElementById('shopSearchToggle');
  const shopSearchClose = document.getElementById('shopSearchClose');
  let shopSearchDebounce;

  function openShopSearch(){
    shopSearchWrap.classList.add('open');
    shopSearchToggle.setAttribute('aria-expanded', 'true');
    setTimeout(()=>shopSearchInput.focus(), 200);
  }
  function closeShopSearch(){
    shopSearchWrap.classList.remove('open');
    shopSearchToggle.setAttribute('aria-expanded', 'false');
    shopSearchInput.blur();
  }
  shopSearchToggle.addEventListener('click', (e)=>{
    e.stopPropagation();
    shopSearchWrap.classList.contains('open') ? closeShopSearch() : openShopSearch();
  });
  shopSearchClose.addEventListener('click', (e)=>{ e.stopPropagation(); closeShopSearch(); });
  document.addEventListener('click', (e)=>{
    if(shopSearchWrap.classList.contains('open') && !shopSearchWrap.contains(e.target)) closeShopSearch();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && shopSearchWrap.classList.contains('open')) closeShopSearch();
  });
  shopSearchInput.addEventListener('input', (e)=>{
    searchTerm = e.target.value;
    clearTimeout(shopSearchDebounce);
    shopSearchDebounce = setTimeout(renderShop, 150);
  });
  shopSearchInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') closeShopSearch();
  });

  // custom sort dropdown — replaces the native <select> so the open
  // state is our own styled panel instead of the browser's default list
  const sortSelectWrap = document.getElementById('sortSelect');
  const sortTrigger = document.getElementById('sortTrigger');
  const sortOptionsList = document.getElementById('sortOptions');
  const sortOptions = Array.from(sortOptionsList.querySelectorAll('.cs-option'));

  function openSort(){
    sortSelectWrap.classList.add('open');
    sortTrigger.setAttribute('aria-expanded', 'true');
    const active = sortOptions.find(o => o.classList.contains('active')) || sortOptions[0];
    active.setAttribute('tabindex', '0');
    active.focus();
  }
  function closeSort(returnFocus){
    sortSelectWrap.classList.remove('open');
    sortTrigger.setAttribute('aria-expanded', 'false');
    sortOptions.forEach(o => o.setAttribute('tabindex', '-1'));
    if(returnFocus) sortTrigger.focus();
  }
  function chooseSort(value){
    setSortValue(value);
    renderShop();
    closeSort(true);
  }

  sortTrigger.addEventListener('click', (e)=>{
    e.stopPropagation();
    sortSelectWrap.classList.contains('open') ? closeSort(false) : openSort();
  });
  sortOptions.forEach(opt=>{
    opt.setAttribute('tabindex', '-1');
    opt.addEventListener('click', ()=> chooseSort(opt.dataset.value));
    opt.addEventListener('keydown', (e)=>{
      const idx = sortOptions.indexOf(opt);
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        chooseSort(opt.dataset.value);
      } else if(e.key === 'ArrowDown'){
        e.preventDefault();
        const next = sortOptions[Math.min(idx + 1, sortOptions.length - 1)];
        opt.setAttribute('tabindex', '-1');
        next.setAttribute('tabindex', '0');
        next.focus();
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        const prev = sortOptions[Math.max(idx - 1, 0)];
        opt.setAttribute('tabindex', '-1');
        prev.setAttribute('tabindex', '0');
        prev.focus();
      } else if(e.key === 'Escape'){
        closeSort(true);
      } else if(e.key === 'Tab'){
        closeSort(false);
      }
    });
  });
  document.addEventListener('click', (e)=>{
    if(sortSelectWrap.classList.contains('open') && !sortSelectWrap.contains(e.target)) closeSort(false);
  });
  document.getElementById('shopGrid').addEventListener('click', (e)=>{
    if(e.target.closest('[data-clear-filters]')) clearShopFilters();
  });
  document.getElementById('shopStatus').addEventListener('click', (e)=>{
    if(e.target.closest('[data-clear-filters]')) clearShopFilters();
  });

  // quickview modal close on backdrop
  document.getElementById('qvModal').addEventListener('click', (e)=>{
    if(e.target.id === 'qvModal') closeQuickView();
  });

  // ripple buttons
  document.querySelectorAll('.ripple').forEach(b=>b.addEventListener('click', ripple));

  // loader
  setTimeout(()=>{ document.getElementById('loader').classList.add('hide'); }, 700);
});
