// BrandDigits LocalStorage Database & Session Mockup Engine

const defaultListings = [
  {
    id: "northstar-studio",
    title: "Northstar Studio",
    category: "Design Agency",
    location: "New York",
    description: "Brand identity and product design for ambitious companies.",
    details: "Northstar is an independent brand and digital product studio helping ambitious companies clarify their story and build memorable experiences.",
    badge: "Premium",
    rating: 4.9,
    reviews: 38,
    address: "128 Mercer Street, New York",
    phone: "(212) 555-0148",
    email: "hello@northstar.example",
    website: "https://northstar.example",
    social: { linkedin: "#", facebook: "#", instagram: "#" },
    author: "admin@branddigits.com"
  },
  {
    id: "ledgerwise",
    title: "LedgerWise",
    category: "Accounting",
    location: "Austin",
    description: "Tax strategy and bookkeeping for growing small businesses.",
    details: "Tax strategy and bookkeeping for growing small businesses. We handle compliance, payroll, and consulting so you can focus on scale.",
    badge: "Verified",
    rating: 4.8,
    reviews: 14,
    address: "704 Congress Ave, Austin",
    phone: "(512) 555-0182",
    email: "info@ledgerwise.example",
    website: "https://ledgerwise.example",
    social: { linkedin: "#", facebook: "#", instagram: "#" },
    author: "admin@branddigits.com"
  },
  {
    id: "greenline-dental",
    title: "Greenline Dental",
    category: "Healthcare",
    location: "Portland",
    description: "Modern family dentistry with same-day appointments.",
    details: "Modern family dentistry with same-day appointments. Providing state-of-the-art care in a comfortable environment.",
    badge: "Featured",
    rating: 4.7,
    reviews: 22,
    address: "1420 NW Lovejoy St, Portland",
    phone: "(503) 555-0193",
    email: "care@greenlinedental.example",
    website: "https://greenlinedental.example",
    social: { linkedin: "#", facebook: "#", instagram: "#" },
    author: "admin@branddigits.com"
  },
  {
    id: "pixelcraft-labs",
    title: "PixelCraft Labs",
    category: "Technology",
    location: "San Francisco",
    description: "Web platforms and mobile apps built for measurable growth.",
    details: "Web platforms and mobile apps built for measurable growth. Full-stack software engineering and design for startups.",
    badge: "Verified",
    rating: 4.9,
    reviews: 29,
    address: "548 Market St, San Francisco",
    phone: "(415) 555-0114",
    email: "contact@pixelcraft.example",
    website: "https://pixelcraft.example",
    social: { linkedin: "#", facebook: "#", instagram: "#" },
    author: "admin@branddigits.com"
  },
  {
    id: "cedar-stone",
    title: "Cedar & Stone",
    category: "Home Services",
    location: "Denver",
    description: "Thoughtful interior remodeling and custom cabinetry.",
    details: "Thoughtful interior remodeling and custom cabinetry. Exceptional craft for residential transformations.",
    badge: "Premium",
    rating: 4.6,
    reviews: 19,
    address: "2101 Larimer St, Denver",
    phone: "(303) 555-0177",
    email: "hello@cedarstone.example",
    website: "https://cedarstone.example",
    author: "admin@branddigits.com"
  },
  {
    id: "brightpath-legal",
    title: "BrightPath Legal",
    category: "Legal Services",
    location: "Chicago",
    description: "Practical legal advice for founders and local businesses.",
    details: "Practical legal advice for founders and local businesses. We demystify corporate, contract, and IP law.",
    badge: "Verified",
    rating: 4.8,
    reviews: 26,
    address: "321 N Clark St, Chicago",
    phone: "(312) 555-0155",
    email: "hello@brightpath.example",
    website: "https://brightpath.example",
    author: "admin@branddigits.com"
  }
];

// Initialize Database
if (!localStorage.getItem("branddigits_listings")) {
  localStorage.setItem("branddigits_listings", JSON.stringify(defaultListings));
}
if (!localStorage.getItem("branddigits_users")) {
  localStorage.setItem("branddigits_users", JSON.stringify([
    { email: "admin@branddigits.com", password: "password", name: "Admin User" }
  ]));
}

export const db = {
  // listings database actions
  getListings() {
    return JSON.parse(localStorage.getItem("branddigits_listings")) || [];
  },
  
  getListing(id) {
    return this.getListings().find(l => l.id === id);
  },
  
  saveListing(listingData) {
    const listings = this.getListings();
    const user = this.getCurrentUser();
    
    if (!listingData.id) {
      // Create new listing
      listingData.id = listingData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      // ensure uniqueness
      if (listings.some(l => l.id === listingData.id)) {
        listingData.id += "-" + Math.floor(Math.random() * 1000);
      }
      listingData.rating = listingData.rating || 5.0;
      listingData.reviews = listingData.reviews || 0;
      listingData.author = user ? user.email : "guest@branddigits.com";
      listings.push(listingData);
    } else {
      // Update existing listing
      const index = listings.findIndex(l => l.id === listingData.id);
      if (index !== -1) {
        // preserve rating / reviews
        listingData.rating = listings[index].rating;
        listingData.reviews = listings[index].reviews;
        listingData.author = listings[index].author;
        listings[index] = listingData;
      }
    }
    
    localStorage.setItem("branddigits_listings", JSON.stringify(listings));
    return listingData;
  },
  
  deleteListing(id) {
    const listings = this.getListings();
    const filtered = listings.filter(l => l.id !== id);
    localStorage.setItem("branddigits_listings", JSON.stringify(filtered));
  },
  
  // User authentication actions
  getUsers() {
    return JSON.parse(localStorage.getItem("branddigits_users")) || [];
  },
  
  getCurrentUser() {
    return JSON.parse(localStorage.getItem("branddigits_user")) || null;
  },
  
  registerUser(email, password, name) {
    const users = this.getUsers();
    if (users.some(u => u.email === email)) {
      throw new Error("A user with this email already exists.");
    }
    
    const newUser = { email, password, name };
    users.push(newUser);
    localStorage.setItem("branddigits_users", JSON.stringify(users));
    
    // Login automatically
    this.setCurrentUser({ email, name });
    return { email, name };
  },
  
  loginUser(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    
    this.setCurrentUser({ email: user.email, name: user.name });
    return { email: user.email, name: user.name };
  },
  
  setCurrentUser(user) {
    localStorage.setItem("branddigits_user", JSON.stringify(user));
  },
  
  logout() {
    localStorage.removeItem("branddigits_user");
  }
};
