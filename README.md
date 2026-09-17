# PGNearMe - PG & Hostel Finder Platform

India's trusted platform to find paying guest (PG) and hostel accommodations. Search by city, locality, price, and amenities. Direct owner contact, no brokerage.

## Features

### Public / Student Facing
- Location-based search with city filters
- PG detail pages with pricing, amenities, photos, and reviews
- Direct owner contact (call / WhatsApp)
- Gender and price filters

### PG Owner Dashboard
- Authentication with role-based access
- Listing management (add, edit, delete PGs)
- Upload photos and set dynamic pricing
- Analytics on views, inquiries, and occupancy
- Promote listing as "Featured"

### Admin Panel
- User management
- Approve / reject PG listings to prevent spam
- Featured listings control
- Platform analytics & activity log

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- **Backend:** Next.js API Routes (Route Handlers)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (JWT strategy)
- **Icons:** Lucide React
- **Maps:** Google Maps API / Mapbox (future integration)
- **Image Storage:** Cloudinary / AWS S3 (future integration)

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (or use SQLite for local development)

### Installation

```bash
cd pgnearme
npm install
```

### Configure Environment

Copy the values in `.env` and update:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/pgnearme?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret"
NEXT_PUBLIC_GOOGLE_MAPS_KEY=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### Setup Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
pgnearme/
├── prisma/
│   └── schema.prisma          # Database models (User, Listing, Pricing, Review, Inquiry)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── search/page.tsx    # Search results with filters
│   │   ├── pg/[id]/page.tsx   # PG detail page
│   │   ├── owner/             # Owner dashboard & listing management
│   │   ├── admin/             # Admin panel
│   │   ├── auth/              # Login & register pages
│   │   └── api/               # API routes (auth, pgs)
│   ├── components/            # Header, Footer, PGCard, SearchBar
│   ├── lib/prisma.ts          # Prisma client singleton
│   └── types/                 # TypeScript types
└── .env                       # Environment variables
```

## Routes

| Route | Description |
|---|---|
| `/` | Landing page with hero search |
| `/search?city=...` | PG listings with filters |
| `/pg/[id]` | PG details, amenities, pricing, contact |
| `/owner` | Owner dashboard |
| `/owner/listings/new` | Create new PG listing |
| `/owner/listings/[id]/edit` | Edit existing listing |
| `/admin` | Admin panel (approve/reject, analytics, users) |
| `/auth/login` | Login |
| `/auth/register` | Register |
| `/api/pgs` | PG listing API |
| `/api/auth/[...nextauth]` | Auth endpoints |

## Production Build

```bash
npm run build
npm run start
```

## Next Steps / Future Enhancements

1. Connect API routes to Prisma (replace mock data)
2. Implement Cloudinary for image uploads
3. Add Google Maps for geo-location
4. WhatsApp/call inquiry tracking
5. Review submission & rating system
6. Owner subscription/promotion payments
7. Push notifications for new inquiries