# UNICAB Travel & Tours Website

A premium, luxury travel website for UNICAB Travel & Tours - offering private transfers and crafted tours across Cape Town and the Western Cape.

## 🌟 Features

- **Multi-page React Application** with routing
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Luxury White Theme** with black and gold accents
- **Tour Details Pages** - Individual pages for each tour
- **Driver Profiles** - With photos, ratings, and expertise
- **WhatsApp Integration** - Floating chat button on all pages
- **Contact Form** - With validation and API integration
- **Membership Plans** - Display and booking options

## 🛠 Tech Stack

- **Frontend:** React 19 + Vite 6
- **Routing:** React Router DOM
- **Backend:** Express.js (Node.js)
- **Styling:** Vanilla CSS with custom luxury theme
- **Build Tool:** Vite

## 📁 Project Structure

```
├── src/
│   ├── pages/
│   │   ├── Home.jsx          # Homepage with hero, about, tours preview
│   │   ├── Tours.jsx         # All tours listing page
│   │   ├── TourDetail.jsx    # Individual tour detail page
│   │   ├── Vehicles.jsx      # Fleet/vehicles page
│   │   ├── Drivers.jsx       # Drivers page with profiles
│   │   ├── Reviews.jsx       # Client reviews page
│   │   └── Membership.jsx    # Membership plans page
│   ├── App.jsx               # Main router component
│   ├── main.jsx              # React entry point
│   ├── data.js               # Tours, vehicles, drivers, reviews data
│   └── styles.css            # Global styles and theme
├── public/                   # Static assets (images, logos)
├── api/                      # API endpoints (Vercel serverless)
├── server.js                 # Express backend server
├── vite.config.mjs           # Vite configuration
└── vercel.json               # Vercel deployment config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Run development server (frontend)
npm run dev

# Run backend server (in separate terminal)
node server.js
```

Visit `http://localhost:5173` for the frontend and `http://localhost:3000` for the backend API.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 Available Pages

- `/` - Homepage
- `/tours` - All tours listing
- `/tours/:id` - Individual tour details
- `/vehicles` - Fleet/vehicles
- `/drivers` - Driver profiles
- `/reviews` - Client reviews
- `/membership` - Membership plans

## 🎨 Design Features

- **Luxury White Theme** - Clean, premium aesthetic
- **Gold Accents** - Elegant highlights throughout
- **Responsive Navigation** - Mobile-friendly menu
- **Smooth Animations** - Polished user experience
- **Professional Typography** - Clear, readable fonts

## 📱 Features

- **WhatsApp Chat** - Floating button on all pages
- **Tour Booking** - Detailed tour pages with booking
- **Driver Profiles** - Photos, ratings, languages, expertise
- **Contact Form** - Validated form with API integration
- **Star Ratings** - Visual ratings for tours and drivers

## 🌐 Deployment

### Vercel (Recommended)

The project is configured for Vercel deployment:

```bash
npm install -g vercel
vercel --prod
```

See [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) for connecting your custom domain.

### Other Platforms

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Netlify
- Railway
- Render

## 📧 Contact

- **Email:** info@unicabtravel.co.za
- **WhatsApp:** +27 82 281 8105
- **Website:** [unicabtraveltours.com](https://unicabtraveltours.com)

## 📝 License

Private - UNICAB Travel & Tours

## 🙏 Acknowledgments

Built with React, Vite, and modern web technologies.
