# Property Management App

A modern property management application built with Next.js, NextAuth.js, Prisma, and PostgreSQL.

🌐 **Live Demo:** [https://property-eta-two.vercel.app](https://property-eta-two.vercel.app)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** (we'll install this below)
- **Git**

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd property
npm install
```

### 2. Database Setup

#### Install PostgreSQL (macOS)
```bash
# Install PostgreSQL 16
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Add PostgreSQL to your PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Create development database
createdb property_dev
```

#### For other operating systems:
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Linux**: Use your package manager (e.g., `sudo apt install postgresql`)

### 3. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://[username]@localhost:5432/property_dev"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret-here"
```

**Note**: Replace `[username]` with your system username (usually your macOS username).

### 4. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 🏗️ Project Structure

```
property/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── property/          # Property pages
├── components/            # Reusable UI components
├── lib/                   # Utilities (auth, database, etc.)
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🔐 Authentication

This app uses **NextAuth.js** with:
- **Email/Password** authentication
- **Prisma adapter** for database sessions
- **bcryptjs** for password hashing

### Create your first account:
1. Go to `/auth/signup`
2. Register with email and password
3. Sign in at `/auth/signin`

## 🗄️ Database

- **Production**: PostgreSQL (Neon via Vercel)
- **Development**: PostgreSQL (local)
- **ORM**: Prisma

### Useful Prisma Commands

```bash
# View your database in Prisma Studio
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Apply schema changes without creating migration
npx prisma db push
```

## 🚀 Deployment

### Deploy to Vercel with Neon PostgreSQL

#### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Create Vercel Project
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Vercel auto-detects Next.js settings

#### 3. Add Neon PostgreSQL Database
- In Vercel dashboard → **Storage** → **Browse Storage**
- Select **Neon** from Marketplace Database Providers
- Create database (e.g., "property-db")
- This automatically adds all database environment variables

#### 4. Add Authentication Environment Variables
In Vercel project settings → Environment Variables:
```bash
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-app.vercel.app
```

#### 5. Deploy Database Schema
After your first deployment, run this locally to set up production database:
```bash
# Use the POSTGRES_PRISMA_URL from your Vercel dashboard
export DATABASE_URL="postgresql://user:pass@host/db?connect_timeout=15&sslmode=require"
npx prisma migrate deploy
```

**Your app is now live!** 🎉

### Cost: $0/month for personal use
- **Vercel**: Free tier (100GB bandwidth, 1000 function calls)
- **Neon**: Free tier (512MB storage, 3GB data transfer)

## 🔄 Database Schema Updates Workflow

When you make changes to your Prisma schema in the future:

### 1. Local Development
```bash
# 1. Edit prisma/schema.prisma with your changes
# 2. Create and apply migration locally
npx prisma migrate dev --name descriptive-name

# 3. Test your changes
npm run dev
```

### 2. Deploy to Production
```bash
# 1. Commit and push your changes
git add .
git commit -m "Add new feature with schema changes"
git push origin main

# 2. Wait for Vercel to deploy (automatic)

# 3. Apply migration to production database
# Get POSTGRES_PRISMA_URL from Vercel → Storage → your database
export DATABASE_URL="postgresql://user:pass@host/db?connect_timeout=15&sslmode=require"
npx prisma migrate deploy
```

### Important Notes:
- **Vercel doesn't auto-run migrations** (for safety)
- **Always test migrations locally first**
- **Use `POSTGRES_PRISMA_URL`** for production migrations (not `DATABASE_URL`)
- **Migration files are committed to git** (they're like version control for your DB)

### Example Schema Change Workflow:
```bash
# 1. Add a new model to prisma/schema.prisma
model Property {
  id        String   @id @default(cuid())
  name      String
  address   String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

# 2. Run migration locally
npx prisma migrate dev --name add-property-model

# 3. Test locally
npm run dev

# 4. Deploy
git add . && git commit -m "Add Property model" && git push

# 5. Apply to production (after Vercel deploys)
export DATABASE_URL="your-postgres-prisma-url"
npx prisma migrate deploy
```

## 🛠️ Development

### Daily Development Workflow

```bash
# Start PostgreSQL (if not auto-starting)
brew services start postgresql@16

# Start development server
npm run dev
```

### Environment Variables in Development

For convenience, add these to your shell profile (`~/.zshrc`):

```bash
export DATABASE_URL="postgresql://[username]@localhost:5432/property_dev"
export NEXTAUTH_URL="http://localhost:3000"
export NEXTAUTH_SECRET="your-development-secret-here"
```

## 🧰 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Production DB**: Neon (serverless PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Forms**: React Hook Form with Zod validation
- **Mapping**: Leaflet with React-Leaflet for interactive maps
- **Geospatial Data**: Integration with Maine GeoLibrary services
- **Deployment**: Vercel

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Neon Documentation](https://neon.tech/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make your changes
3. Test locally (including database changes)
4. Create a pull request
5. After merge, run production migrations if needed

## 📄 License

This project is licensed under the MIT License.

---

**🌟 App Features:**

**🏠 Property Management**
- ✅ **Comprehensive Property Management** - Complete real estate tracking with detailed purchase info, financing terms, closing costs, property specifications (acres, zoning), and legacy rental management features
- ✅ **Hierarchical Location System** - Advanced STATE → COUNTY → (TOWN | UT | CITY) hierarchy ensuring every property rolls up to a proper region with automatic place creation and relationship management
- ✅ **Smart Property Creation** - Streamlined property creation with state/county/place type dropdowns, automatic hierarchical place creation, and intelligent data validation
- ✅ **Financial Analytics** - Monitor purchase prices, earnest money, comprehensive closing costs breakdown, and investment totals with professional currency formatting

**👥 Contact & Relationship Management**
- ✅ **Advanced Contact Management** - Track people (agents, sellers, buyers, title companies) with roles, contact info, companies, and automatic property relationship linking
- ✅ **Relationship Management** - Advanced linking system connecting properties to people (sellers, agents, title companies) and places with referential integrity

**🏛️ Municipal & Location Management**
- ✅ **Hierarchical Place Management** - Manage places with STATE/COUNTY/TOWN-UT-CITY hierarchy, comprehensive municipal information including tax office details, zoning office contacts, code enforcement officers, and plumbing inspector information
- ✅ **Complete Maine Municipal Database** - Pre-configured with all 14 Maine counties and 440+ municipalities (Towns, Cities, Plantations) with automatic hierarchy creation and comprehensive coverage
- ✅ **Municipal Mill Rate Database** - Historical mill rate data for 33 years (1991-2023) covering 440+ Maine municipalities with percentage changes and state weighted averages
- ✅ **County Historical Data** - Complete mill rate history for all Maine counties (1990-2022) enabling comprehensive tax analysis and trend visualization
- ✅ **Progressive Disclosure System** - Smart filtering showing only counties and municipalities with associated properties, keeping the interface clean while maintaining comprehensive data coverage
- ✅ **Municipal Tax Information** - Track tax payment addresses, websites, office phone numbers, due dates, late interest rates, assessment schedules, mill rates, and custom tax notes per location
- ✅ **Zoning & Code Enforcement** - Store zoning office addresses, phone numbers, website URLs, plus contact details for Code Enforcement Officers and Plumbing Inspectors

**💰 Tax Management & Analytics**
- ✅ **Advanced Tax Management System** - Comprehensive tax dashboard with consolidated analytics, state-by-state breakdowns, annual tax estimates, state tax stamps tracking, property tax proration analysis, and mill rate calculations
- ✅ **Property Valuation Tracking** - Monitor assessed values, market values, assessment dates, and assessment notes with automatic tax calculations using mill rates
- ✅ **Historical Tax Payment Records** - Track actual tax payments by year with payment dates, amounts, and notes for comprehensive tax history
- ✅ **Tax Calculation Engine** - Automatic calculation of estimated annual taxes using assessed/market values and mill rates with clear breakdowns
- ✅ **Comprehensive Mill Rate Database** - 33 years of municipal mill rate data (1991-2023) with automatic population for new properties and historical trend analysis
- ✅ **County-Level Tax Analytics** - Complete mill rate history for all Maine counties (1990-2022) enabling comprehensive tax burden analysis and investment decision support
- ✅ **Property Valuation Time Series** - Comprehensive historical valuation tracking with assessed value, market value, and assessment date progression over time with trend analysis and percentage change calculations
- ✅ **Automatic Tax Information Population** - New properties automatically inherit current mill rates and tax information from their municipality, eliminating manual lookup

**🗺️ Advanced Mapping & Geographic Features**
- ✅ **Unified Interactive Mapping System** - Comprehensive mapping solution with dynamic layer controls, real-time data loading, and intelligent bounds calculation supporting both single property and multi-property views
- ✅ **Multi-Layer Data Visualization** - Toggleable layers for property markers, parcel boundaries, LUPC zoning overlays, and wetlands data with real-time loading states and feature counts
- ✅ **Advanced Parcel Data Integration** - Live integration with Maine GeoLibrary services providing accurate parcel boundaries, detailed property information (Map/Lot, State ID, Town, County, area, perimeter), and automatic geocoding
- ✅ **LUPC Zoning Overlays** - Specialized zoning visualization for unorganized territories with distinct styling, detailed popup information, and zone classification data
- ✅ **National Wetlands Inventory Integration** - Real-time wetlands data from USFWS with comprehensive wetland classification, area calculations, and official NWI styling matching government standards
- ✅ **Intelligent Map Bounds** - Automatic bounds calculation that adapts to single property (detailed view) vs. multi-property (overview) scenarios with appropriate zoom levels and padding
- ✅ **Interactive Popups & Details** - Rich popup information for properties (address, purchase price, status, parcel count), parcels (boundary details, measurements), and wetlands (classification codes, area, system types)
- ✅ **Responsive Layer Controls** - User-friendly layer toggle system with loading states, feature counts, and disabled states for unavailable data
- ✅ **Error Handling & Fallbacks** - Robust error handling with graceful degradation, test data fallbacks, and informative error messages

**📊 Advanced Analytics & Data Visualization**
- ✅ **Municipal Mill Rate Analytics** - Interactive line charts showing historical mill rate trends by county with revenue tracker-style visualizations
- ✅ **Maine Data Coverage Analytics** - Comprehensive overview of data coverage including total counties, municipalities, and years of historical data
- ✅ **Tax Trend Analysis** - Year-over-year mill rate analysis with percentage change calculations and trend identification
- ✅ **County Comparison Tools** - Side-by-side comparison of mill rates across Maine counties with visual trend analysis
- ✅ **Municipality-Level Insights** - Granular analysis of municipal tax rates with automatic mill rate population for new properties

**🔍 Search & Navigation**
- ✅ **Global Search & Navigation** - Real-time search across all properties, people, and places with intelligent filtering and quick navigation
- ✅ **Multi-Dashboard Analytics** - Overview dashboard plus specialized dashboards for properties, people, places, taxes, and analytics with detailed statistics and visual summaries

**🌱 Data Management & Seeding**
- ✅ **Comprehensive Maine Data Seeding** - Automated scripts to populate the database with complete Maine municipal data including all counties, municipalities, and historical mill rates
- ✅ **Sample Property Portfolio** - Pre-configured sample properties with realistic data for testing and demonstration purposes
- ✅ **Historical Data Integration** - Seamless import of CSV-based historical data including mill rates, municipal information, and tax records
- ✅ **Smart Data Relationships** - Automatic creation of hierarchical relationships between states, counties, and municipalities with referential integrity

**🔐 Security & Infrastructure**
- ✅ **Secure Authentication** - Complete user authentication system with NextAuth.js, registration, and session management
- ✅ **Modern Responsive UI** - Beautiful interface built with shadcn/ui components, Tailwind CSS styling, and smooth Framer Motion animations
- ✅ **Type-Safe Database** - PostgreSQL database with Prisma ORM providing full type safety, migrations, and optimized queries with hierarchical relationships
- ✅ **Production Deployment** - Fully deployed and optimized for production use with proper error handling and loading states

Need help? Check the issues tab or create a new issue for support.