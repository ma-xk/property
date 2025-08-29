"use client"

import { useSession, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Home, 
  Database, 
  Palette, 
  Code, 
  Zap, 
  User, 
  LogOut, 
  UserPlus,
  LogIn
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dashboard } from "@/components/dashboard"

const technologies = [
  { name: "Next.js", icon: Zap, description: "React framework for production" },
  { name: "TypeScript", icon: Code, description: "Type-safe JavaScript" },
  { name: "Tailwind CSS", icon: Palette, description: "Utility-first CSS framework" },
  { name: "Prisma", icon: Database, description: "Modern database toolkit" },
  { name: "SQLite", icon: Database, description: "Lightweight database" },
  { name: "shadcn/ui", icon: Palette, description: "Beautiful UI components" },
  { name: "Lucide", icon: Home, description: "Beautiful icons" },
  { name: "Framer Motion", icon: Zap, description: "Animation library" },
]

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // If user is authenticated, show the dashboard
  if (session) {
    return (
      <div>
        {/* Header for authenticated users */}
        <header className="bg-gradient-to-r from-slate-900 to-purple-900 p-6 flex justify-between items-center">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            Property App
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 text-white">
              <User className="h-5 w-5" />
              <span>Welcome, {session.user?.name}</span>
            </div>
            <Button 
              onClick={() => signOut()} 
              variant="outline" 
              className="bg-transparent border-white text-white hover:bg-white hover:text-slate-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </header>
        
        {/* Dashboard */}
        <Dashboard />
      </div>
    )
  }

  // If user is not authenticated, show the landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white"
        >
          Property App
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-2"
        >
          <Link href="/auth/signin">
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-slate-900">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-white text-slate-900 hover:bg-slate-200">
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up
            </Button>
          </Link>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Welcome to Your Property App
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              A modern, full-stack application built with the latest technologies. 
              Sign up or sign in to access your property management dashboard!
            </p>
          </motion.div>

          {/* Technology Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h3 className="text-3xl font-bold text-white text-center mb-8">
              Built with Modern Technologies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {technologies.map((tech, index) => {
                const Icon = tech.icon
                return (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    className="group"
                  >
                    <Card className="h-full bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-6 w-6 text-white group-hover:text-purple-300 transition-colors" />
                          <CardTitle className="text-white">{tech.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-slate-300">
                          {tech.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <h3 className="text-3xl font-bold text-white mb-6">
              What's Included
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <Database className="h-8 w-8 text-white mx-auto mb-2" />
                  <CardTitle className="text-white">Database Ready</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300">
                    SQLite database with Prisma ORM for type-safe data access
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <User className="h-8 w-8 text-white mx-auto mb-2" />
                  <CardTitle className="text-white">Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300">
                    Complete auth system with NextAuth.js for secure user management
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <Palette className="h-8 w-8 text-white mx-auto mb-2" />
                  <CardTitle className="text-white">Beautiful UI</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300">
                    Stunning interface with shadcn/ui, Tailwind CSS, and Framer Motion
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}