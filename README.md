# Property Management App

A modern property management application built with Next.js, NextAuth.js, Prisma, and PostgreSQL.

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
# Install PostgreSQL 15
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Add PostgreSQL to your PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
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

- **Production**: PostgreSQL (Vercel Postgres)
- **Development**: PostgreSQL (local)
- **ORM**: Prisma

### Useful Prisma Commands

```bash
# View your database in Prisma Studio
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Apply schema changes
npx prisma db push
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings

3. **Add PostgreSQL Database**
   - In Vercel dashboard → Storage → Create Database → Postgres
   - This automatically adds `DATABASE_URL` to your environment variables

4. **Add Environment Variables**
   In Vercel project settings → Environment Variables:
   ```
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

5. **Deploy!**
   - Vercel automatically builds and deploys
   - Your app will be live at `https://your-app.vercel.app`

### Cost: $0/month for personal use
- Vercel: Free tier (100GB bandwidth, 1000 function calls)
- PostgreSQL: Free tier (256MB storage, 60 compute hours)

## 🛠️ Development

### Daily Development Workflow

```bash
# Start PostgreSQL (if not auto-starting)
brew services start postgresql@15

# Start development server
npm run dev
```

### Adding New Features

1. **Database changes**: Edit `prisma/schema.prisma`
2. **Apply changes**: `npx prisma db push` or create migration
3. **Regenerate client**: `npx prisma generate`

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
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Vercel

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make your changes
3. Test locally
4. Create a pull request

## 📄 License

This project is licensed under the MIT License.

---

Need help? Check the issues tab or create a new issue for support.