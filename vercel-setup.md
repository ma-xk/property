# Vercel Deployment Setup

Your app is now ready for Vercel deployment! Here's your step-by-step guide:

## 📋 Pre-deployment Checklist
✅ PostgreSQL setup for local and production  
✅ Updated dependencies (pg instead of sqlite3)  
✅ Added Prisma build scripts  
✅ Configured Next.js for production  
✅ Updated NextAuth configuration  

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 3. Add Database (Vercel Postgres)
1. In your Vercel project dashboard, go to "Storage" tab
2. Click "Create Database" → "Postgres"
3. Choose a database name (e.g., "property-db")
4. Click "Create"
5. Vercel will automatically add `DATABASE_URL` to your environment variables

### 4. Add Environment Variables
In your Vercel project settings → Environment Variables, add:

- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Will be your Vercel domain (e.g., `https://your-app.vercel.app`)

Note: `DATABASE_URL` will be automatically added when you create the Postgres database.

### 5. Deploy!
Click "Deploy" - Vercel will:
- Install dependencies (`npm install`)
- Generate Prisma client (`prisma generate`)
- Build your Next.js app
- Deploy to global CDN

## 🎯 After Deployment

### First-time Database Setup
Your database will be empty after deployment. You'll need to:
1. Run Prisma migrations in production
2. Create your first user account

### Automatic Features You Get
- ✅ HTTPS certificate
- ✅ Global CDN
- ✅ Automatic deployments on git push
- ✅ Preview deployments for branches
- ✅ Zero-downtime deployments

## 💰 Cost Estimate
**For single user: $0/month**
- Vercel: Free tier (100GB bandwidth, 1000 function invocations)
- Postgres: Free tier (256MB storage, 60 compute hours)

## 🔧 Local Development
Your local PostgreSQL setup is ready! To continue developing:

```bash
# Make sure PostgreSQL is running
brew services start postgresql@15

# Export environment variables (or add to your shell profile)
export DATABASE_URL="postgresql://max@localhost:5432/property_dev"
export NEXTAUTH_URL="http://localhost:3000"
export NEXTAUTH_SECRET="your-local-development-secret-key"

# Start development server
npm run dev
```

**Pro tip:** Add these exports to your `~/.zshrc` file to avoid typing them each time!

Your app is ready to deploy! 🎉
