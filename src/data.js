export const tours = [
  {
    id: "ct-city-table-mountain",
    name: "Cape Town & Table Mountain City Tour",
    duration: "Full Day (8–9 hours)",
    rating: 4.9,
    priceFrom: "From RXXXX",
    promotion: "Festive Special",
    image: "/bokaap.jpg",
    highlights: [
      "Ride the cableway up Table Mountain for sweeping city and ocean views (weather permitting)",
      "Guided drive through the City Bowl, Company's Garden, and historic landmarks",
      "Stroll through Bo-Kaap and capture its iconic colourful houses",
      "Visit the V&A Waterfront with optional harbour cruise or shopping time"
    ],
    description:
      "An essential introduction to Cape Town, this privately guided city tour blends world-famous viewpoints with hidden local stories. Ideal for first-time visitors and cruise passengers seeking a comprehensive overview in a single, curated day."
  },
  {
    id: "cape-peninsula",
    name: "Cape Peninsula Tour with Boulders Beach Penguins",
    duration: "Full Day (8–9 hours)",
    rating: 5.0,
    priceFrom: "From RXXXX",
    promotion: "Holiday Favourite",
    image: "/boulders-beach.jpg",
    highlights: [
      "Scenic Chapman's Peak Drive (weather and road permitting)",
      "Cape Point and the Cape of Good Hope Nature Reserve",
      "Visit Boulders Beach to view the African penguin colony",
      "Explore Kalk Bay, Simon's Town or Hout Bay fishing harbours"
    ],
    description:
      "Trace one of the world's most beautiful coastlines on a private peninsula tour. From dramatic sea cliffs to charming fishing villages and the famous Boulders Beach penguin colony, this route showcases the very best of the Cape Peninsula at your own pace."
  },
  {
    id: "garden-route-short",
    name: "Garden Route Tour (3–4 Days)",
    duration: "3–4 Days (Customisable)",
    rating: 4.8,
    priceFrom: "From RXXXX",
    promotion: null,
    image: "/garden-route.jpg",
    highlights: [
      "Overnight in key Garden Route towns such as Knysna or Wilderness",
      "Visit ancient forests, lagoons, and pristine beaches",
      "Optional activities: elephant encounters, boat cruises, or canopy tours",
      "Flexible routing tailored to your travel schedule"
    ],
    description:
      "Designed for travellers with limited time, this private multi-day journey captures the essence of the Garden Route. Enjoy comfortable driving stages, handpicked stops, and curated experiences that can be adapted to families, couples, or small groups."
  },
  {
    id: "garden-route-extended",
    name: "Garden Route Extended Tour (5–6 Days)",
    duration: "5–6 Days (Customisable)",
    rating: 5.0,
    priceFrom: "From RXXXX",
    promotion: "Extended Stay Offer",
    image: "/garden-route.jpg",
    highlights: [
      "Deeper exploration of towns like Knysna, Plettenberg Bay, and Oudtshoorn",
      "Time for wine tasting, artisanal markets, and coastal walks",
      "Optional add-ons: game drives, adventure sports, or spa days",
      "Ideal for slow travel, families, and honeymooners"
    ],
    description:
      "For guests who prefer to settle into a gentler rhythm, this extended Garden Route itinerary allows for unhurried exploration, added experiences, and more downtime at boutique guest houses along the way."
  },
  {
    id: "wine-tour",
    name: "Franschhoek Wine Tram & Winelands Tour",
    duration: "Full Day (8–9 hours)",
    rating: 4.9,
    priceFrom: "From RXXXX",
    promotion: "Wine Lover's Choice",
    image: "/wine-tour.jpg",
    highlights: [
      "Experience the iconic Franschhoek Wine Tram through scenic vineyards",
      "Visit multiple award-winning wine estates for tastings",
      "Explore charming Franschhoek village with its French heritage",
      "Optional gourmet lunch at a renowned wine estate restaurant"
    ],
    description:
      "Journey through the heart of the Cape Winelands on this exclusive private tour. Ride the vintage Franschhoek Wine Tram, sample world-class wines, and discover the rich history and stunning landscapes of South Africa's premier wine region."
  },
  {
    id: "aquila-safari",
    name: "Aquila Private Game Reserve Safari",
    duration: "Full Day (8–9 hours)",
    rating: 5.0,
    priceFrom: "From RXXXX",
    promotion: "Exclusive Partner",
    image: "/safari.jpg",
    highlights: [
      "Exclusive access to Aquila Private Game Reserve",
      "Game drive to spot the Big 5: lion, elephant, buffalo, rhino, and leopard",
      "Professional ranger-guided safari experience",
      "Optional lunch at the reserve's restaurant with mountain views"
    ],
    description:
      "Experience an authentic African safari just two hours from Cape Town. We exclusively partner with Aquila Private Game Reserve, offering you a premium wildlife experience with the Big 5 in a malaria-free environment. Perfect for families and first-time safari-goers."
  },
  {
    id: "west-coast",
    name: "West Coast Coastal & Wildflower Tour",
    duration: "Full Day (8–9 hours)",
    rating: 4.7,
    priceFrom: "From RXXXX",
    promotion: "Seasonal Bloom",
    image: "/westcoast.jpg",
    highlights: [
      "Explore charming fishing villages along the West Coast",
      "Seasonal wildflower displays (typically Aug–Sep, weather dependent)",
      "Visit nature reserves, lagoons, and quiet coastal viewpoints",
      "Optional seafood lunches at local favourites"
    ],
    description:
      "A more off-the-beaten-path journey, this tour celebrates the rugged beauty and authentic character of the Cape West Coast. In flower season, the region bursts into colour—creating unforgettable photographic opportunities."
  },
  {
    id: "overland-custom",
    name: "Overland Custom Multi-Day Tour",
    duration: "2–10 Days (Fully Bespoke)",
    rating: 4.9,
    priceFrom: "From RXXXX",
    promotion: "Tailor-Made",
    image: "/overland.jpg",
    highlights: [
      "Design your own route across the Western Cape and beyond",
      "Combine wine regions, coastal towns, Aquila Private Game Reserve, and landmarks",
      "Perfect for incentive groups, families, and special occasions",
      "Dedicated travel planning support from our expert team"
    ],
    description:
      "When you'd like a journey completely shaped around your interests, our team collaborates with you to build a custom overland itinerary. From discreet executive roadshows to once-in-a-lifetime family adventures, every detail is handled with precision."
  }
];

export const vehicles = [
  {
    name: "Executive Sedan",
    tag: "Ideal for solo & couples",
    capacity: "1–3 passengers",
    luggage: "2 large + 2 carry-on",
    image: "/luxury-sedan-mercedes.jpg",
    features: [
      "Leather seating & dual-zone climate control",
      "Bottled water and onboard USB charging",
      "Discreet exterior finish for executive transfers"
    ]
  },
  {
    name: "Luxury SUV",
    tag: "Comfort with extra space",
    capacity: "1–4 passengers",
    luggage: "3 large + 3 carry-on",
    image: "/luxury-suv.jpg",
    features: [
      "Elevated seating for improved sightseeing",
      "Enhanced luggage capacity and legroom",
      "Ideal for Winelands and Peninsula touring"
    ]
  },
  {
    name: "Premium Minivan",
    tag: "Perfect for families",
    capacity: "3–7 passengers",
    luggage: "5 large + 5 carry-on",
    image: "/premium-minivan.jpg",
    features: [
      "Individual seating configurations",
      "Sliding doors for easy hotel and airport access",
      "Child seats available on request (pre-booking required)"
    ]
  },
  {
    name: "Mini Coach / Group Shuttle",
    tag: "Groups & incentive travel",
    capacity: "8–22 passengers",
    luggage: "Trailer or underfloor storage on request",
    image: "/mini-coach-22-seater.jpg",
    features: [
      "Ideal for conference shuttles and group tours",
      "Microphone and PA system on selected vehicles",
      "Professional group-handling and luggage coordination"
    ]
  }
];

export const drivers = [
  {
    name: "Thabo M.",
    experience: "12 years with UNICAB",
    languages: ["English", "isiXhosa", "Afrikaans"],
    skills: ["City & Peninsula specialist", "South African History", "Cruise passenger handling", "Airport meet & greet"],
    rating: 4.9,
    image: "/Thabo.png",
    quote:
      "Thabo met us at arrivals and looked after our family the entire week. Calm, knowledgeable, and always on time."
  },
  {
    name: "Leah K.",
    experience: "9 years with UNICAB",
    languages: ["English", "French"],
    skills: ["Winelands & culinary touring", "Wine Expert", "Concierge liaison", "Corporate roadshows"],
    rating: 5.0,
    image: "/Leah.png",
    quote:
      "Leah curated the perfect wine day for our clients. Her restaurant and tasting recommendations were spot on."
  },
  {
    name: "Andre V.",
    experience: "15 years with UNICAB",
    languages: ["English", "Afrikaans", "German (conversational)"],
    skills: ["Garden Route overlands", "South African History", "Golf logistics", "Photographic stops"],
    rating: 4.8,
    image: "/Andre.jpg",
    quote:
      "Andre guided us along the Garden Route with incredible local insight. We always felt safe and unhurried."
  },
  {
    name: "Zinhle P.",
    experience: "7 years with UNICAB",
    languages: ["English", "isiZulu"],
    skills: ["Events & shuttles", "VIP handling", "Night transfers"],
    rating: 4.9,
    image: "/Zinhle.jpg",
    quote:
      "Professional, friendly and discreet—Zinhle handled multiple event transfers seamlessly throughout our stay."
  },
  {
    name: "Ahmed S.",
    experience: "10 years with UNICAB",
    languages: ["English", "Arabic", "Afrikaans"],
    skills: ["Islamic History", "Cultural Tours", "City & Peninsula specialist", "Airport transfers"],
    rating: 4.9,
    image: "/Ahmed.png",
    quote:
      "Ahmed provided incredible insights into Cape Town's Islamic heritage. His knowledge of Bo-Kaap and local history was exceptional."
  }
];

export const reviews = [
  {
    tourId: "cape-peninsula",
    tourName: "Cape Peninsula Tour",
    name: "James & Emma, UK",
    rating: 5,
    text:
      "A world-class experience from start to finish. Our driver adjusted the route to avoid crowds and still included every highlight."
  },
  {
    tourId: "ct-city-table-mountain",
    tourName: "Cape Town & Table Mountain City Tour",
    name: "Patel Family, India",
    rating: 4.9,
    text:
      "Perfect first day in Cape Town. The city felt immediately familiar and safe, and we received excellent restaurant tips."
  },
  {
    tourId: "garden-route-extended",
    tourName: "Garden Route Extended",
    name: "H. Muller, Germany",
    rating: 5,
    text:
      "Six days, no stress. Hotels, timings and stops were all beautifully organised. We could simply enjoy the journey."
  },
  {
    tourId: "overland-custom",
    tourName: "Custom Overland Tour",
    name: "Corporate Incentive Group",
    rating: 4.8,
    text:
      "UNICAB handled complex logistics for our incentive trip flawlessly. Our guests commented repeatedly on the professionalism of the drivers."
  }
];

export const membershipPlans = [
  {
    id: "explorer",
    name: "Explorer",
    price: "RXXXX / month",
    tagline: "For repeat leisure guests",
    popular: false,
    benefits: [
      "Priority booking during peak season (subject to availability)",
      "Preferred rates on selected private day tours",
      "Complimentary bottled water and Wi‑Fi where available"
    ]
  },
  {
    id: "frequent",
    name: "Frequent Traveller",
    price: "RXXXX / month",
    tagline: "Most Popular",
    popular: true,
    benefits: [
      "Guaranteed vehicle allocation for pre-booked dates",
      "Enhanced discounts on transfers and full-day touring",
      "Complimentary airport fast-track coordination where available",
      "Dedicated point-of-contact for itinerary adjustments"
    ]
  },
  {
    id: "elite",
    name: "Elite Partner",
    price: "RXXXX / month",
    tagline: "For corporate & hospitality partners",
    popular: false,
    benefits: [
      "Contracted corporate or concierge rates",
      "Priority access to premium vehicles and senior drivers",
      "Consolidated monthly reporting and billing support",
      "Co-branded service options for VIP guests and delegations"
    ]
  }
];

