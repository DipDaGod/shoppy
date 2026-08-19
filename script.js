/* ============================================================
   STORE NAME — edit this one line and the whole site updates:
   navbar logo, footer logo, page title, "Why ___" heading,
   about-section mentions, copyright line, the @handle in the
   gallery section, the contact email, and the gold-medallion
   monogram in the hero all update automatically.

   STORE_INITIALS controls the monogram shown on the hero's
   gold medallion. Leave it as "" to auto-generate from
   STORE_NAME (first letter of each word), or set it directly
   like below to force an exact monogram regardless of the
   name's words.
   ============================================================ */
const STORE_NAME = "SD Creations";
const STORE_INITIALS = "SD";

// Digits only, country code first, no "+" or spaces — used to build the
// "Enquire on WhatsApp" link in Quick View. Matches the footer phone number.
const WHATSAPP_PHONE = "919836960841";


function storeSlug(){
  return STORE_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '');
}
function storeInitials(){
  if(STORE_INITIALS) return STORE_INITIALS.toUpperCase();
  const letters = STORE_NAME.trim().split(/\s+/).filter(w => /^[A-Za-z]/.test(w));
  return letters.map(w => w[0].toUpperCase()).slice(0, 2).join('');
}
function applyStoreName(){
  document.title = `${STORE_NAME} — Handmade Tanjore Creations`;

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

// Mirrors the --ease CSS variable — the site's one signature motion
// curve, kept in one place instead of retyped at every call site.
const EASE = 'cubic-bezier(.22,.61,.36,1)';

// Respect the OS-level "reduce motion" setting for anything JS-driven
// and non-essential (autoplaying carousels, the cursor-tilt parallax).
// CSS handles its own animations via the matching @media query.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

function productDesigns(p){
  return (Array.isArray(p.designs) && p.designs.length) ? p.designs : [{ name: p.name, image: "", images: [] }];
}

function designSlides(design){
  if(Array.isArray(design.images) && design.images.length) return design.images;
  return design.image ? [design.image] : [];
}

function cardCarouselSlides(p){
  // Pulls one representative photo per design (skipping empty/duplicate
  // ones) so the card can auto-cycle through what's actually available,
  // rather than a single static "cover" photo.
  const seen = new Set();
  const slides = [];
  if(p.coverImage && !seen.has(p.coverImage)){ seen.add(p.coverImage); slides.push(p.coverImage); }
  productDesigns(p).forEach(d=>{
    const src = designSlides(d)[0];
    if(src && !seen.has(src)){ seen.add(src); slides.push(src); }
  });
  return slides;
}

function cardMediaMarkup(p){
  const slides = cardCarouselSlides(p);
  if(slides.length === 0){
    return `<div class="card-slide-track"><div class="card-slide"><div class="swatch ${p.swatch}"><div class="sw-icon">${iconFor(p.category)}</div></div></div></div>`;
  }
  const slidesHTML = slides.map(src => `
    <div class="card-slide">
      <img class="product-img" src="${src}" alt="${p.name}">
      <div class="swatch ${p.swatch}" style="display:none;"><div class="sw-icon">${iconFor(p.category)}</div></div>
    </div>`).join('');
  return `<div class="card-slide-track">${slidesHTML}</div>`;
}

function productCard(p){
  const hasDiscount = p.originalPrice && p.originalPrice > p.price;
  const designCount = productDesigns(p).length;
  return `
  <div class="product-card" data-id="${p.id}">
    <div class="card-media ${p.swatch}" data-quickview="${p.id}" role="button" tabindex="0" aria-label="View ${p.name}">
      ${cardMediaMarkup(p)}
      <div class="stitch-frame"></div>
      <div class="badges">
        <span class="badge handmade">Handmade</span>
        ${p.limited ? '<span class="badge limited">Limited Edition</span>' : ''}
      </div>
      ${designCount > 1 ? `<span class="badge designs-badge">${designCount} Designs</span>` : ''}
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

let cardCarouselTimers = [];
function clearCardCarousels(){
  cardCarouselTimers.forEach(t => clearInterval(t));
  cardCarouselTimers = [];
}
function initCardCarousels(){
  clearCardCarousels();
  document.querySelectorAll('.card-slide-track').forEach(track=>{
    const slides = Array.from(track.children);
    const slideCount = slides.length;
    if(slideCount <= 1 || prefersReducedMotion) return;
    // Start at a random image
    let index = Math.floor(Math.random() * slideCount);
    // Clone the first slide for a seamless loop
    const firstClone = slides[0].cloneNode(true);
    track.appendChild(firstClone);
    track.style.transition = 'none';
    track.style.transform = `translateX(-${index * 100}%)`;
    let timer = null;
    const advance = ()=>{
      index++;
      track.style.transition = `transform 1.8s ${EASE}`;
      track.style.transform = `translateX(-${index * 100}%)`;
      // Seamless reset after reaching the clone
      if(index === slideCount){
        setTimeout(()=>{
          track.style.transition = 'none';
          index = 0;
          track.style.transform = 'translateX(0)';
          requestAnimationFrame(()=>{
            track.style.transition =
              `transform 1.8s ${EASE}`;
          });
        }, 1800);
      }
    };
    const start = ()=>{
      clearInterval(timer);
      timer = setInterval(advance, 6500);
      cardCarouselTimers.push(timer);
    };
    const stop = ()=>{
      clearInterval(timer);
      timer = null;
    };
    start();
    const card = track.closest('.product-card');
    card.addEventListener('mouseenter', stop);
    card.addEventListener('mouseleave', start);
  });
}

function renderShop(){
  const grid = document.getElementById('shopGrid');
  const list = getFilteredProducts();
  renderShopStatus(SITE_DATA.products.length, list.length);
  grid.style.opacity = 0;
  clearCardCarousels();
  setTimeout(()=>{
    grid.innerHTML = list.length ? list.map(productCard).join('') : `
      <div class="shop-empty">
        <p>No pieces match that search — try another name or filter.</p>
        <button class="clear-filters-btn" data-clear-filters>Clear filters</button>
      </div>`;
    grid.style.transition = 'opacity 0.4s ease';
    grid.style.opacity = 1;
    initCardCarousels();
  }, 180);
}

function renderChips(){
  document.getElementById('filterChips').innerHTML = SITE_DATA.categories.map(c =>
    `<button class="chip ${c===currentFilter?'active':''}" data-chip="${c}" aria-pressed="${c===currentFilter}">${c}</button>`
  ).join('');
}

/* ============ QUICK VIEW ============ */
function buildGalleryMarkup(p, slides){
  if(slides.length === 0){
    return `<div class="qv-slide-track"><div class="qv-slide"><div class="swatch ${p.swatch}"><div class="sw-icon">${iconFor(p.category)}</div></div></div></div>`;
  }

  const slidesHTML = slides.map(src => `
    <div class="qv-slide">
      <img class="product-img" src="${src}" alt="${p.name}" draggable="false">
      <div class="swatch ${p.swatch}" style="display:none;"><div class="sw-icon">${iconFor(p.category)}</div></div>
    </div>`).join('');

  if(slides.length === 1){
    return `<div class="qv-slide-track">${slidesHTML}</div>`;
  }

  // No ids here on purpose — with the drag carousel below, this markup can
  // be mounted up to three times at once (prev/current/next design), and
  // wirePhotoSubGallery() always scopes its lookups to the current slide.
  const navHTML = `
    <button class="qv-nav qv-prev" type="button" aria-label="Previous photo">
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button class="qv-nav qv-next" type="button" aria-label="Next photo">
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <div class="qv-dots" role="tablist" aria-label="Product photos">
      ${slides.map((_,i)=>`<button class="qv-dot ${i===0?'active':''}" data-slide="${i}" type="button" role="tab" aria-selected="${i===0}" aria-label="Photo ${i+1} of ${slides.length}"></button>`).join('')}
    </div>`;

  return `<div class="qv-slide-track">${slidesHTML}</div>${navHTML}`;
}

let qvModalKeyHandler = null;  // Escape-to-close, active for the whole Quick View session
let qvGalleryKeyHandler = null; // arrow-key photo nav, re-bound whenever the current design's slide changes
let qvProduct = null;
let qvActiveDesignIndex = 0;
let qvGalleryJustSwiped = false; // true briefly after a real drag, so the resulting tap doesn't also open the fullscreen viewer
let qvDesignCarousel = null;   // the drag carousel driving the main design-switch image
let imgViewerCarousel = null;  // the drag carousel driving the fullscreen mobile viewer

/* ============================================================
   DRAG CAROUSEL — a small reusable "Apple Photos"-style slider.
   Three slides live in the DOM at once (previous / current / next).
   Dragging translates the whole track in real time so the image
   physically follows the finger/cursor; releasing either completes
   the transition (swipe far enough) or snaps back. Button/thumbnail
   navigation animates through the exact same settle step, so every
   trigger — swipe, arrow, thumbnail — feels identical. Used by the
   Quick View design switcher and the fullscreen mobile viewer.
   ============================================================ */
function createDragCarousel({ container, count, startIndex = 0, renderSlide, onSettle, onDragEnd, threshold = 0.18 }){
  const mod = (n, m) => ((n % m) + m) % m;
  let index = mod(startIndex, count);

  container.innerHTML = '';
  container.classList.add('dc-viewport');

  if(count <= 1){
    container.innerHTML = renderSlide(index);
    return {
      goTo(){}, next(){}, prev(){},
      get index(){ return index; },
      getCurrentSlideEl(){ return container.firstElementChild; },
      destroy(){}
    };
  }

  const track = document.createElement('div');
  track.className = 'dc-track';
  container.appendChild(track);

  let width = container.clientWidth || 1;
  let animating = false;
  let dragging = false;
  let pendingIndex = null;
  let startX = 0, deltaX = 0, pointerId = null;

  function makeSlide(i){
    const el = document.createElement('div');
    el.className = 'dc-slide';
    el.style.width = width + 'px';
    el.innerHTML = renderSlide(i);
    return el;
  }

  function layout(){
    width = container.clientWidth || width || 1;
    Array.from(track.children).forEach(c => c.style.width = width + 'px');
  }

  function build(){
    track.innerHTML = '';
    track.appendChild(makeSlide(mod(index - 1, count)));
    track.appendChild(makeSlide(index));
    track.appendChild(makeSlide(mod(index + 1, count)));
    layout();
    setTransition(false);
    track.style.transform = `translate3d(-${width}px,0,0)`;
    void track.offsetWidth; // force reflow so the next transition actually animates
  }

  function setTransition(on){
    track.style.transition = on ? `transform 0.4s ${EASE}` : 'none';
  }

  build();

  function onTransitionEnd(){
    animating = false;
    if(pendingIndex != null){ index = pendingIndex; pendingIndex = null; }
    build();
    onSettle && onSettle(index);
  }

  function finishNow(){
    // A new gesture/nav started mid-transition — jump straight to the end
    // state instead of letting the new slide slide "over" the old one.
    if(!animating) return;
    track.removeEventListener('transitionend', onTransitionEnd);
    onTransitionEnd();
  }

  function animateTo(px, newIndex){
    animating = true;
    pendingIndex = newIndex; // null = snap back, no index change
    setTransition(true);
    track.style.transform = `translate3d(${-px}px,0,0)`;
    track.addEventListener('transitionend', onTransitionEnd, { once:true });
  }

  const settleNext = ()=> animateTo(width * 2, mod(index + 1, count));
  const settlePrev = ()=> animateTo(0, mod(index - 1, count));
  const snapBack   = ()=> animateTo(width, null);

  function goTo(newIndex){
    newIndex = mod(newIndex, count);
    if(animating) finishNow();
    if(newIndex === index) return;
    const forward = mod(newIndex - index, count) <= mod(index - newIndex, count);
    const direction = forward ? 1 : -1;
    const adjacent = mod(index + direction, count);
    if(adjacent !== newIndex){
      // Long jump (e.g. a thumbnail several designs away) — patch the
      // incoming slot with the real target before sliding to it.
      const slot = direction > 0 ? track.children[2] : track.children[0];
      slot.innerHTML = renderSlide(newIndex);
    }
    if(direction > 0) animateTo(width * 2, newIndex);
    else animateTo(0, newIndex);
  }

  function onPointerDown(e){
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    if(animating) finishNow();
    dragging = true;
    pointerId = e.pointerId;
    startX = e.clientX; deltaX = 0;
    setTransition(false);
    if(e.cancelable) e.preventDefault();
    try{ container.setPointerCapture(pointerId); }catch(err){}
  }
  function onPointerMove(e){
    if(!dragging || e.pointerId !== pointerId) return;
    deltaX = e.clientX - startX;
    track.style.transform = `translate3d(${-(width - deltaX)}px,0,0)`;
  }
  function endDrag(e){
    if(!dragging || (pointerId != null && e.pointerId !== pointerId)) return;
    dragging = false;
    try{ container.releasePointerCapture(pointerId); }catch(err){}
    pointerId = null;
    const dx = deltaX;
    if(Math.abs(dx) > Math.max(40, width * threshold)){
      if(dx < 0) settleNext(); else settlePrev();
    } else {
      snapBack();
    }
    deltaX = 0;
    onDragEnd && onDragEnd(dx);
  }

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', endDrag);

  function onResize(){
    if(dragging || animating) return;
    layout();
    setTransition(false);
    track.style.transform = `translate3d(-${width}px,0,0)`;
  }
  window.addEventListener('resize', onResize);

  return {
    goTo,
    next(){ goTo(index + 1); },
    prev(){ goTo(index - 1); },
    get index(){ return index; },
    getCurrentSlideEl(){ return track.children[1] || null; },
    destroy(){
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', endDrag);
      container.removeEventListener('pointercancel', endDrag);
    }
  };
}

// Wires the (rare) case of a single design having several of its own
// photos — dots/arrows/drag scoped to whichever slide element currently
// holds this markup, since the design carousel can mount it 3x at once.
function wirePhotoSubGallery(scopeEl){
  if(qvGalleryKeyHandler){ document.removeEventListener('keydown', qvGalleryKeyHandler); qvGalleryKeyHandler = null; }
  if(!scopeEl) return;
  const track = scopeEl.querySelector('.qv-slide-track');
  if(!track) return;
  const count = track.children.length;
  if(count <= 1) return;

  const dots = Array.from(scopeEl.querySelectorAll('.qv-dot'));
  const prevBtn = scopeEl.querySelector('.qv-prev');
  const nextBtn = scopeEl.querySelector('.qv-next');
  let slideIndex = 0;

  function goTo(i){
    slideIndex = ((i % count) + count) % count;
    track.style.transform = `translateX(-${slideIndex * 100}%)`;
    dots.forEach((d, idx)=>{
      d.classList.toggle('active', idx === slideIndex);
      d.setAttribute('aria-selected', idx === slideIndex);
    });
  }

  if(prevBtn) prevBtn.onclick = (e)=>{ e.stopPropagation(); goTo(slideIndex - 1); };
  if(nextBtn) nextBtn.onclick = (e)=>{ e.stopPropagation(); goTo(slideIndex + 1); };
  dots.forEach(d => d.onclick = (e)=>{ e.stopPropagation(); goTo(+d.dataset.slide); });
  // Stop these controls from also starting/confusing the outer
  // design-switch drag, which listens on an ancestor of this track.
  [prevBtn, nextBtn, ...dots].filter(Boolean).forEach(el => {
    el.addEventListener('pointerdown', ev => ev.stopPropagation());
  });

  let startX = 0, deltaX = 0, dragging = false, pid = null;
  track.addEventListener('pointerdown', (e)=>{
    e.stopPropagation();
    dragging = true; pid = e.pointerId; startX = e.clientX; deltaX = 0;
    track.style.transition = 'none';
    try{ track.setPointerCapture(pid); }catch(err){}
  });
  track.addEventListener('pointermove', (e)=>{
    if(!dragging || e.pointerId !== pid) return;
    e.stopPropagation();
    deltaX = e.clientX - startX;
    track.style.transform = `translateX(calc(-${slideIndex * 100}% + ${deltaX}px))`;
  });
  const endDrag = (e)=>{
    if(!dragging || e.pointerId !== pid) return;
    e.stopPropagation();
    dragging = false;
    track.style.transition = '';
    if(Math.abs(deltaX) > 50) goTo(slideIndex + (deltaX < 0 ? 1 : -1));
    else goTo(slideIndex);
    if(Math.abs(deltaX) > 10){
      qvGalleryJustSwiped = true;
      setTimeout(()=>{ qvGalleryJustSwiped = false; }, 300);
    }
    deltaX = 0;
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  qvGalleryKeyHandler = (e)=>{
    if(e.key === 'ArrowRight') goTo(slideIndex + 1);
    else if(e.key === 'ArrowLeft') goTo(slideIndex - 1);
  };
  document.addEventListener('keydown', qvGalleryKeyHandler);
}

function designSlideMarkup(p, i){
  const designs = productDesigns(p);
  const design = designs[i];
  return buildGalleryMarkup(p, designSlides(design));
}

// Updates everything driven by the currently-active design: price
// (falls back to the product's price if the design doesn't override
// it), the "Design — X" label, the active thumbnail, and a WhatsApp
// message that names the exact design so enquiries arrive specific.
function applyDesignMetaUI(){
  const p = qvProduct;
  const designs = productDesigns(p);
  const design = designs[qvActiveDesignIndex];
  const effectivePrice = (design.price != null) ? design.price : p.price;
  const hasDiscount = p.originalPrice && p.originalPrice > effectivePrice;
  document.getElementById('qvPrice').textContent = `₹${effectivePrice.toLocaleString('en-IN')}`;
  const originalEl = document.getElementById('qvOriginal');
  if(originalEl){
    if(hasDiscount){ originalEl.textContent = `₹${p.originalPrice.toLocaleString('en-IN')}`; originalEl.style.display = ''; }
    else { originalEl.style.display = 'none'; }
  }
  const nameEl = document.getElementById('qvDesignName');
  if(nameEl) nameEl.textContent = design.name;
  document.querySelectorAll('#designThumbs .design-thumb').forEach((t, i)=>{
    t.classList.toggle('active', i === qvActiveDesignIndex);
    t.setAttribute('aria-selected', i === qvActiveDesignIndex);
  });
  const message = designs.length > 1
    ? `Hi! I'm interested in the ${p.name} — ${design.name}. Could you please share more details?`
    : `Hi! I'm interested in "${p.name}" (₹${effectivePrice.toLocaleString('en-IN')}). Could you tell me more about it?`;
  document.getElementById('whatsappEnquire').href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/* ============ MOBILE FULLSCREEN IMAGE VIEWER ============
   Tapping the Quick View photo on mobile opens a true fullscreen
   overlay (separate from the qv-modal box) so the image isn't
   constrained by the modal's max-height/columns. Desktop is
   untouched — the gallery there has no click-to-expand behavior.
   Swiping here pages through the same designs as the main Quick
   View image, and stays in sync with it. */
const MOBILE_IMG_VIEWER_QUERY = '(max-width:760px)';

function imgViewerSlideMarkup(p, i){
  const designs = productDesigns(p);
  const design = designs[i];
  const src = designSlides(design)[0] || '';
  if(!src) return `<div class="swatch ${p.swatch}"><div class="sw-icon">${iconFor(p.category)}</div></div>`;
  return `<img class="img-viewer-img" src="${src}" alt="${p.name} — ${design.name}" draggable="false">`;
}

function openImgViewer(startIndex){
  if(!qvProduct) return;
  const designs = productDesigns(qvProduct);
  if(!designs.length) return;

  const viewer = document.getElementById('imgViewer');
  const gallery = document.getElementById('imgViewerGallery');
  if(imgViewerCarousel){ imgViewerCarousel.destroy(); imgViewerCarousel = null; }
  gallery.innerHTML = '';

  if(designs.length > 1){
    imgViewerCarousel = createDragCarousel({
      container: gallery,
      count: designs.length,
      startIndex,
      renderSlide: (i)=> imgViewerSlideMarkup(qvProduct, i),
      onSettle: (i)=>{
        // Keep the Quick View card behind this overlay in sync, so
        // closing it doesn't reveal a stale design.
        qvActiveDesignIndex = i;
        applyDesignMetaUI();
        if(qvDesignCarousel) qvDesignCarousel.goTo(i);
      }
    });
    const navHTML = `
      <button class="img-viewer-nav img-viewer-prev" id="imgViewerPrev" type="button" aria-label="Previous design">
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="img-viewer-nav img-viewer-next" id="imgViewerNext" type="button" aria-label="Next design">
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>`;
    gallery.insertAdjacentHTML('beforeend', navHTML);
    document.getElementById('imgViewerPrev').onclick = ()=> imgViewerCarousel.prev();
    document.getElementById('imgViewerNext').onclick = ()=> imgViewerCarousel.next();
  } else {
    gallery.innerHTML = imgViewerSlideMarkup(qvProduct, 0);
  }

  viewer.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeImgViewer(){
  const viewer = document.getElementById('imgViewer');
  viewer.classList.remove('open');
  if(imgViewerCarousel){ imgViewerCarousel.destroy(); imgViewerCarousel = null; }
  // Only release the scroll lock if the Quick View modal underneath
  // isn't still open — it manages its own lock independently.
  const qvModal = document.getElementById('qvModal');
  if(!qvModal.classList.contains('open')) document.body.style.overflow = '';
}

// Shares whichever design is currently showing in the fullscreen viewer.
// Tries, in order: (1) the native share sheet with the actual photo
// attached, so it drops straight into WhatsApp/Messages/Mail as an image;
// (2) the share sheet with just a title/link, for browsers that support
// Web Share but not file attachments; (3) copying a link to the
// clipboard, for the rare browser with neither.
async function shareCurrentDesign(){
  const shareBtn = document.getElementById('qvShareBtn');
  if(!qvProduct) return;
  const designs = productDesigns(qvProduct);
  const i = imgViewerCarousel ? imgViewerCarousel.index : qvActiveDesignIndex;
  const design = designs[i] || designs[0];
  const src = designSlides(design)[0];
  const effectivePrice = (design.price != null) ? design.price : qvProduct.price;
  const shareTitle = designs.length > 1 ? `${qvProduct.name} — ${design.name}` : qvProduct.name;
  const shareText = `${shareTitle} · ₹${effectivePrice.toLocaleString('en-IN')} · ${STORE_NAME}`;
  const shareUrl = window.location.href;

  try{
    if(src && navigator.canShare){
      const res = await fetch(new URL(src, shareUrl).href);
      const blob = await res.blob();
      const filename = src.split('/').pop() || 'design.jpg';
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
      if(navigator.canShare({ files: [file] })){
        await navigator.share({ files: [file], title: shareTitle, text: shareText });
        return;
      }
    }
    if(navigator.share){
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      return;
    }
    throw new Error('Web Share API unavailable');
  }catch(err){
    if(err && err.name === 'AbortError') return; // person cancelled the share sheet — not an error
    try{
      await navigator.clipboard.writeText(shareUrl);
      flashShareFeedback(shareBtn, 'Link copied');
    }catch(copyErr){
      flashShareFeedback(shareBtn, "Couldn't share");
    }
  }
}

function flashShareFeedback(btn, label){
  if(!btn) return;
  btn.dataset.feedback = label;
  btn.classList.add('share-feedback');
  setTimeout(()=>{ btn.classList.remove('share-feedback'); }, 1600);
}

function openQuickView(id){
  const p = SITE_DATA.products.find(x=>x.id===id);
  qvProduct = p;
  qvActiveDesignIndex = 0;
  if(qvDesignCarousel){ qvDesignCarousel.destroy(); qvDesignCarousel = null; }
  const designs = productDesigns(p);
  const box = document.getElementById('qvBox');

  box.innerHTML = `
    <button class="qv-close" id="qvCloseBtn"><svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg></button>
    <button class="qv-share" id="qvShareBtn" type="button" aria-label="Share this design">
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/></svg>
    </button>
    <div class="qv-name">
      <span class="eyebrow">${p.category}</span>
      <h3>${p.name}</h3>
    </div>
    <div class="qv-media ${p.swatch}">
      <div class="qv-media-frame">
        <div class="qv-gallery" id="qvGallery"></div>
        ${designs.length > 1 ? `
        <button class="qv-design-side-nav qv-design-side-prev" id="qvDesignPrev" type="button" aria-label="Previous design">
          <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="qv-design-side-nav qv-design-side-next" id="qvDesignNext" type="button" aria-label="Next design">
          <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>` : ''}
      </div>
    </div>
    <div class="qv-info">
      <div class="qv-info-scroll" id="qvInfoScroll">
        <p class="qv-desc">${p.desc}</p>
        ${designs.length > 1 ? `
        <div class="qv-design-picker">
          <div class="qv-design-tag">Design — <span id="qvDesignName">${designs[0].name}</span></div>
          <span class="qv-designs-label">Choose a design — ${designs.length} available</span>
          <div class="design-thumbs" id="designThumbs" role="tablist" aria-label="Available designs">
            ${designs.map((d,i)=>`
              <button class="design-thumb ${i===0?'active':''}" data-design="${i}" type="button" role="tab" aria-selected="${i===0}" aria-label="${d.name}">
                ${designSlides(d)[0] ? `<img src="${designSlides(d)[0]}" alt="${d.name}" draggable="false">` : `<div class="swatch ${p.swatch}"><div class="sw-icon">${iconFor(p.category)}</div></div>`}
              </button>`).join('')}
          </div>
        </div>` : ''}
        <div class="qv-price-group">
          <div class="qv-price" id="qvPrice"></div>
          <div class="qv-original" id="qvOriginal" style="display:none;"></div>
        </div>
        <div class="stars">${Array(p.rating).fill(starSVG()).join('')}</div>
        <div class="qv-meta">
          <div><span>Materials</span>${p.materials}</div>
          <div><span>Dimensions</span>${p.dimensions}</div>
        </div>
        <div class="qv-note">Estimated delivery: ${p.delivery}. Handmade piece — slight variation in paint, foil, and paper grain is part of the charm.</div>
      </div>
      <div class="qv-cta-bar">
        <a id="whatsappEnquire" class="whatsapp-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5C11 9.2 10.6 8 10.4 7.6c-.2-.4-.3-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1 0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5.1-1.3c1.4.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3C4 14.9 3.6 13.5 3.6 12c0-4.6 3.8-8.4 8.4-8.4s8.4 3.8 8.4 8.4-3.8 8.2-8.4 8.2z"/></svg>
          Enquire on WhatsApp
        </a>
      </div>
    </div>`;

  document.getElementById('qvModal').classList.add('open');
  document.body.style.overflow = 'hidden';

  qvModalKeyHandler = (e)=>{
    if(e.key === 'Escape') closeQuickView();
    else if(designs.length > 1 && e.key === 'ArrowRight') qvDesignCarousel && qvDesignCarousel.next();
    else if(designs.length > 1 && e.key === 'ArrowLeft') qvDesignCarousel && qvDesignCarousel.prev();
  };
  document.addEventListener('keydown', qvModalKeyHandler);

  const qvGalleryEl = document.getElementById('qvGallery');
  if(designs.length > 1){
    qvDesignCarousel = createDragCarousel({
      container: qvGalleryEl,
      count: designs.length,
      startIndex: 0,
      renderSlide: (i)=> designSlideMarkup(p, i),
      onSettle: (i)=>{
        qvActiveDesignIndex = i;
        applyDesignMetaUI();
        wirePhotoSubGallery(qvDesignCarousel.getCurrentSlideEl());
      },
      onDragEnd: (dx)=>{
        if(Math.abs(dx) > 10){
          qvGalleryJustSwiped = true;
          setTimeout(()=>{ qvGalleryJustSwiped = false; }, 300);
        }
      }
    });
    document.getElementById('qvDesignPrev').onclick = ()=> qvDesignCarousel.prev();
    document.getElementById('qvDesignNext').onclick = ()=> qvDesignCarousel.next();
  } else {
    qvGalleryEl.innerHTML = designSlideMarkup(p, 0);
  }
  applyDesignMetaUI();
  wirePhotoSubGallery(qvDesignCarousel ? qvDesignCarousel.getCurrentSlideEl() : qvGalleryEl);

  document.querySelectorAll('#designThumbs .design-thumb').forEach(t=>{
    t.onclick = ()=>{
      if(qvDesignCarousel) qvDesignCarousel.goTo(+t.dataset.design);
      // On the mobile stacked layout the image sits above the scrolling
      // info panel — jump back up so the newly-selected design is visible
      // instead of leaving the shopper looking at a photo that didn't change.
      if(window.matchMedia(MOBILE_IMG_VIEWER_QUERY).matches){
        document.getElementById('qvInfoScroll')?.scrollTo({ top:0, behavior:'smooth' });
      }
    };
  });

  document.getElementById('qvCloseBtn').onclick = closeQuickView;
  document.getElementById('qvShareBtn').onclick = shareCurrentDesign;
}
function closeQuickView(){
  document.getElementById('qvModal').classList.remove('open');
  document.body.style.overflow = '';
  if(qvModalKeyHandler){ document.removeEventListener('keydown', qvModalKeyHandler); qvModalKeyHandler = null; }
  if(qvGalleryKeyHandler){ document.removeEventListener('keydown', qvGalleryKeyHandler); qvGalleryKeyHandler = null; }
  if(qvDesignCarousel){ qvDesignCarousel.destroy(); qvDesignCarousel = null; }
  qvProduct = null;
  // If the fullscreen image viewer was left open on top, close it too
  // rather than leaving it stranded with the page scroll now unlocked.
  closeImgViewer();
}

/* ============ EVENT WIRING ============ */
function attachGlobalCardDelegation(){
  document.body.addEventListener('click', (e)=>{
    const qvBtn = e.target.closest('[data-quickview]');
    if(qvBtn){ e.stopPropagation(); openQuickView(+qvBtn.dataset.quickview); return; }
  });
  // The whole card image is now the trigger (div[role="button"], not a
  // real <button>), so Enter/Space need to be wired up by hand for
  // keyboard users.
  document.body.addEventListener('keydown', (e)=>{
    if(e.key !== 'Enter' && e.key !== ' ') return;
    const qvTarget = e.target.closest('[data-quickview]');
    if(qvTarget){ e.preventDefault(); openQuickView(+qvTarget.dataset.quickview); }
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

  // Mobile-only: tap the Quick View photo to open it fullscreen.
  // Delegated on document since #qvGallery is re-created every time
  // Quick View opens.
  document.body.addEventListener('click', (e)=>{
    if(!window.matchMedia(MOBILE_IMG_VIEWER_QUERY).matches) return;
    if(qvGalleryJustSwiped) return;
    const img = e.target.closest('#qvGallery img.product-img');
    if(!img) return;
    openImgViewer(qvActiveDesignIndex);
  });
  document.getElementById('imgViewerClose').onclick = closeImgViewer;

  // In-page navigation (nav links, hero button, footer links) scrolls
  // smoothly without ever writing a "#section" fragment into the URL bar.
  document.body.addEventListener('click', (e)=>{
    const link = e.target.closest('a[href^="#"]');
    if(!link) return;
    e.preventDefault();
    const hash = link.getAttribute('href');
    if(hash.length > 1){
      const target = document.querySelector(hash);
      if(target) target.scrollIntoView({ behavior:'smooth' });
    }
  });

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
  if(heroSection && tiltWrap && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches){
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
