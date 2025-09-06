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
- ✅ **Comprehensive Property Management** - Complete real estate tracking with detailed purchase info, financing terms, closing costs, property specifications (acres, zoning), and legacy rental management features
- ✅ **Advanced Contact Management** - Track people (agents, sellers, buyers, title companies) with roles, contact info, companies, and automatic property relationship linking
- ✅ **Municipal Location Management** - Manage places with comprehensive municipal information including tax office details, zoning office contacts, code enforcement officers, and plumbing inspector information
- ✅ **Advanced Tax Management System** - Comprehensive tax dashboard with consolidated analytics, state-by-state breakdowns, annual tax estimates, state tax stamps tracking, property tax proration analysis, and mill rate calculations
- ✅ **Municipal Tax Information** - Track tax payment addresses, websites, office phone numbers, due dates, late interest rates, assessment schedules, mill rates, and custom tax notes per location
- ✅ **Property Valuation Tracking** - Monitor assessed values, market values, assessment dates, and assessment notes with automatic tax calculations using mill rates
- ✅ **Historical Tax Payment Records** - Track actual tax payments by year with payment dates, amounts, and notes for comprehensive tax history
- ✅ **Tax Calculation Engine** - Automatic calculation of estimated annual taxes using assessed/market values and mill rates with clear breakdowns
- ✅ **Zoning & Code Enforcement** - Store zoning office addresses, phone numbers, website URLs, plus contact details for Code Enforcement Officers and Plumbing Inspectors
- ✅ **Financial Analytics** - Monitor purchase prices, earnest money, comprehensive closing costs breakdown, and investment totals with professional currency formatting
- ✅ **Interactive Property Mapping** - Global map on dashboard showing all properties with location data, clickable markers with property details, and automatic bounds calculation for optimal viewing
- ✅ **Advanced Parcel Viewer** - Detailed parcel maps on property detail pages showing exact property boundaries, parcel information (Map/Lot, State ID, Town, County), area calculations, and LUPC zoning overlays for unorganized territories
- ✅ **Real-Time Parcel Data Integration** - Live integration with Maine GeoLibrary services for accurate parcel boundaries, property details, and zoning information with intelligent geocoding and spatial queries
- ✅ **Global Search & Navigation** - Real-time search across all properties, people, and places with intelligent filtering and quick navigation
- ✅ **Multi-Dashboard Analytics** - Overview dashboard plus specialized dashboards for properties, people, places, and taxes with detailed statistics and visual summaries
- ✅ **Relationship Management** - Advanced linking system connecting properties to people (sellers, agents, title companies) and places with referential integrity
- ✅ **Secure Authentication** - Complete user authentication system with NextAuth.js, registration, and session management
- ✅ **Modern Responsive UI** - Beautiful interface built with shadcn/ui components, Tailwind CSS styling, and smooth Framer Motion animations
- ✅ **Type-Safe Database** - PostgreSQL database with Prisma ORM providing full type safety, migrations, and optimized queries
- ✅ **Production Deployment** - Fully deployed and optimized for production use with proper error handling and loading states

Need help? Check the issues tab or create a new issue for support.