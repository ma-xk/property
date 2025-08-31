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
- ✅ User authentication (register/login)
- ✅ Responsive design
- ✅ Database integration
- ✅ Production deployment
- ✅ Zero cost hosting

Need help? Check the issues tab or create a new issue for support.