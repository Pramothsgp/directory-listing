import { db } from "./db.js";
import "./theme-toggle.js";
import "./navigation.js";
import "./filters.js";
import "./forms.js";
import "./dashboard.js";

// ==========================================
// 1. GLOBAL HEADER AUTH STATE MANAGER
// ==========================================
function updateHeaderAuth() {
  const headerActions = document.querySelector(".site-header .actions");
  if (!headerActions) return;

  const user = db.getCurrentUser();
  
  if (user) {
    // Generate logged-in actions menu
    headerActions.innerHTML = `
      <button class="icon-btn" data-theme-toggle aria-label="Switch theme">
        ${document.documentElement.dataset.theme === "dark" ? "☀" : "☾"}
      </button>
      <span class="desktop user-badge" style="font-weight:700; color:var(--primary); font-size:0.9rem; margin-right:0.5rem; background:var(--primary-soft); padding:0.4rem 0.8rem; border-radius:99px;">
        👤 ${user.name.split(' ')[0]}
      </span>
      <a class="btn btn-ghost btn-small" href="dashboard.html">Dashboard</a>
      <button id="global-logout-btn" class="btn btn-primary btn-small">Log out</button>
    `;
    
    // Add logout listener
    const logoutBtn = document.getElementById("global-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        db.logout();
        window.location.href = "index.html";
      });
    }

    // Reinitialize theme toggle in new elements
    import("./theme-toggle.js");
  }
}

// ==========================================
// 2. DYNAMIC HOMEPAGE RENDERER (index.html)
// ==========================================
function renderIndexListings() {
  const cardsGrid = document.querySelector("main#main .grid.cards");
  if (!cardsGrid) return;

  const listings = db.getListings().slice(0, 4); // Take first 4 listings
  cardsGrid.innerHTML = "";

  listings.forEach((listing) => {
    const card = document.createElement("article");
    card.className = "card listing";
    
    // Autogenerate listing logo color index
    card.innerHTML = `
      <div class="listing__top">
        <b class="listing__logo">${listing.title.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</b>
        <div>
          <h3><a href="listing-detail.html?id=${listing.id}">${listing.title}</a></h3>
          <span class="meta">${listing.category} · ${listing.location}</span>
        </div>
      </div>
      <p>${listing.description}</p>
      <div class="listing__foot">
        <span class="badge ${listing.badge === 'Premium' ? 'badge-orange' : ''}">${listing.badge || 'Verified'}</span>
        <a class="meta" href="listing-detail.html?id=${listing.id}">View profile →</a>
      </div>
    `;
    cardsGrid.appendChild(card);
  });
}

// ==========================================
// 3. DYNAMIC DIRECTORY & FILTER ENGINE (listings.html)
// ==========================================
function setupDirectoryEngine() {
  const listingsGrid = document.querySelector("main .filter-layout .grid.cards");
  if (!listingsGrid) return;

  const searchForm = document.querySelector(".page-head .search, main .search");
  const searchInput = document.querySelector(".page-head .search .field, main .search .field");
  const locationSelect = document.querySelector(".page-head .search select, main .search select");
  const sidebarFilters = document.querySelector("[data-filters]");

  const renderDirectory = () => {
    let listings = db.getListings();

    // 1. Title/Search Query filter
    if (searchInput && searchInput.value.trim() !== "") {
      const q = searchInput.value.toLowerCase();
      listings = listings.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
      );
    }

    // 2. Location filter (from Search Bar)
    if (locationSelect && locationSelect.value !== "All locations" && locationSelect.value !== "Any location") {
      const loc = locationSelect.value.toLowerCase();
      listings = listings.filter(l => l.location.toLowerCase() === loc);
    }

    // 3. Category sidebar checkboxes
    if (sidebarFilters) {
      const checkedCategories = Array.from(sidebarFilters.querySelectorAll("section:nth-of-type(1) input[type='checkbox']:checked"))
        .map(cb => cb.parentNode.textContent.trim().toLowerCase());
      
      if (checkedCategories.length > 0) {
        listings = listings.filter(l => checkedCategories.some(cat => l.category.toLowerCase().includes(cat)));
      }

      // 4. Sidebar Location select
      const sideLocSelect = sidebarFilters.querySelector("section:nth-of-type(2) select");
      if (sideLocSelect && sideLocSelect.value !== "Any location") {
        const sideLoc = sideLocSelect.value.toLowerCase();
        listings = listings.filter(l => l.location.toLowerCase() === sideLoc);
      }

      // 5. Listing Type checkboxes
      const checkedTypes = Array.from(sidebarFilters.querySelectorAll("section:nth-of-type(3) input[type='checkbox']:checked"))
        .map(cb => cb.parentNode.textContent.trim().toLowerCase());
      
      if (checkedTypes.length > 0) {
        listings = listings.filter(l => checkedTypes.some(type => l.badge.toLowerCase().includes(type)));
      }
    }

    // Update Toolbar details
    const countEl = document.querySelector(".toolbar span.muted");
    if (countEl) {
      countEl.textContent = `Showing 1–${listings.length} of ${listings.length} businesses`;
    }

    // Render filtered items
    listingsGrid.innerHTML = "";
    if (listings.length === 0) {
      listingsGrid.innerHTML = `
        <div class="card content" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem;">
          <p class="muted" style="font-size: 1.1rem; margin: 0;">No businesses match your search filters.</p>
        </div>
      `;
      return;
    }

    listings.forEach((listing) => {
      const card = document.createElement("article");
      card.className = "card listing";
      card.innerHTML = `
        <div class="listing__top">
          <b class="listing__logo">${listing.title.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</b>
          <div>
            <h3><a href="listing-detail.html?id=${listing.id}">${listing.title}</a></h3>
            <span class="meta">${listing.category} · ${listing.location}</span>
          </div>
        </div>
        <p>${listing.description}</p>
        <div class="listing__foot">
          <span class="badge ${listing.badge === 'Premium' ? 'badge-orange' : ''}">${listing.badge || 'Verified'}</span>
          <a class="meta" href="listing-detail.html?id=${listing.id}">View profile →</a>
        </div>
      `;
      listingsGrid.appendChild(card);
    });
  };

  // Attach search listeners
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      renderDirectory();
    });
    
    if (searchInput) searchInput.addEventListener("input", renderDirectory);
    if (locationSelect) locationSelect.addEventListener("change", renderDirectory);
  }

  // Attach sidebar filter listeners
  if (sidebarFilters) {
    sidebarFilters.querySelectorAll("input[type='checkbox']").forEach(cb => {
      cb.addEventListener("change", renderDirectory);
    });
    
    const sideLocSelect = sidebarFilters.querySelector("section:nth-of-type(2) select");
    if (sideLocSelect) {
      sideLocSelect.addEventListener("change", renderDirectory);
    }
  }

  // Run initial render
  renderDirectory();
}

// ==========================================
// 4. DYNAMIC PROFILE DETAIL RENDERER (listing-detail.html)
// ==========================================
function renderListingDetails() {
  const detailContainer = document.querySelector("main .container.split");
  if (!detailContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  
  // default to first listing if no ID specified
  const listing = id ? db.getListing(id) : db.getListings()[0];

  if (!listing) {
    detailContainer.innerHTML = `
      <div class="card content" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
        <h1>Listing not found</h1>
        <p class="muted">The business listing you are trying to view does not exist or has been deleted.</p>
        <a href="listings.html" class="btn btn-primary" style="margin-top: 1rem;">Back to Directory</a>
      </div>
    `;
    return;
  }

  // Render breadcrumbs
  const crumbEl = document.querySelector(".crumb");
  if (crumbEl) {
    crumbEl.innerHTML = `<a href="index.html">Home</a> / <a href="listings.html">Directory</a> / ${listing.title}`;
  }

  // Populate dynamic detail layout
  detailContainer.innerHTML = `
    <div class="stack">
      <article class="card content">
        <div class="listing__top">
          <b class="listing__logo" style="width:70px; height:70px; font-size:1.6rem;">${listing.title.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</b>
          <div>
            <span class="badge ${listing.badge === 'Premium' ? 'badge-orange' : ''}">${listing.badge || 'Verified'} listing</span>
            <h1 style="font-size:2.5rem; margin: 0.35rem 0;">${listing.title}</h1>
            <div class="meta" style="font-size:0.95rem;">${listing.category} · ${listing.location}</div>
            <div class="rating">
              ★★★★★ <span class="meta">${listing.rating || '5.0'} · ${listing.reviews || 0} reviews</span>
            </div>
          </div>
        </div>
        <p class="muted" style="font-size:1.05rem; line-height:1.7; margin: 1.5rem 0;">${listing.details || listing.description}</p>
        <div class="cluster">
          <a class="btn btn-primary" href="${listing.website || '#'}" target="_blank">Visit website ↗</a>
          <button class="btn btn-ghost" id="save-listing-btn">Save listing</button>
        </div>
      </article>

      <article class="card content">
        <h2>About ${listing.title}</h2>
        <p>${listing.details || 'We partner with teams at pivotal stages of growth. Our custom systems span development, visual strategy, design, and continuous launch campaigns.'}</p>
        <div class="gallery">
          <b></b>
          <b></b>
          <b></b>
        </div>
      </article>

      <div class="ad">Advertisement · In-content unit</div>

      <article class="card content">
        <h2>Related listings</h2>
        <div class="grid cards" id="related-listings-grid">
          <!-- Dynamic Related Listings -->
        </div>
      </article>
    </div>

    <aside class="stack">
      <article class="card content">
        <h3>Contact information</h3>
        <div class="contact">
          <span>⌖ ${listing.address || '100 Main Street, New York, NY'}</span>
          <span>☏ ${listing.phone || '(555) 010-0000'}</span>
          <span>✉ ${listing.email || 'info@example.com'}</span>
        </div>
        <h3>Follow ${listing.title}</h3>
        <div class="social">
          <a href="#">in</a>
          <a href="#">f</a>
          <a href="#">◎</a>
        </div>
      </article>
      <div class="ad ad-side">Advertisement · Sidebar</div>
    </aside>
  `;

  // Render related listings (same category, excluding current)
  const relatedGrid = document.getElementById("related-listings-grid");
  if (relatedGrid) {
    const related = db.getListings()
      .filter(l => l.category === listing.category && l.id !== listing.id)
      .slice(0, 2);

    if (related.length === 0) {
      // Fallback related listings if no same-category matches
      const fallback = db.getListings()
        .filter(l => l.id !== listing.id)
        .slice(0, 2);
      
      fallback.forEach(r => renderRelatedCard(relatedGrid, r));
    } else {
      related.forEach(r => renderRelatedCard(relatedGrid, r));
    }
  }

  // Interactive Save Listing
  const saveBtn = document.getElementById("save-listing-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      saveBtn.textContent = "Saved ✓";
      saveBtn.style.color = "var(--primary)";
      saveBtn.style.borderColor = "var(--primary)";
    });
  }
}

function renderRelatedCard(container, r) {
  const card = document.createElement("article");
  card.className = "card listing";
  card.innerHTML = `
    <h3><a href="listing-detail.html?id=${r.id}">${r.title}</a></h3>
    <p class="meta">${r.category} · ${r.location}</p>
    <span class="badge ${r.badge === 'Premium' ? 'badge-orange' : ''}">${r.badge || 'Verified'}</span>
  `;
  container.appendChild(card);
}

// ==========================================
// 5. BOOTSTRAP INTERACTIVE APPLICATIONS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  updateHeaderAuth();
  
  const path = window.location.pathname;
  if (path.endsWith("index.html") || path.endsWith("/") || path === "") {
    renderIndexListings();
  } else if (path.endsWith("listings.html")) {
    setupDirectoryEngine();
  } else if (path.endsWith("listing-detail.html")) {
    renderListingDetails();
  }
});
