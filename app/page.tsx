"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Building2, 
  Users, 
  MapPin, 
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Shield,
  UserPlus,
  LogIn
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewDashboard } from "@/components/overview-dashboard"

const features = [
  { 
    name: "Property Management", 
    icon: Building2, 
    description: "Track properties, investments, and portfolio performance with detailed analytics" 
  },
  { 
    name: "Contact Management", 
    icon: Users, 
    description: "Manage agents, sellers, buyers, and all property-related contacts in one place" 
  },
  { 
    name: "Location Tracking", 
    icon: MapPin, 
    description: "Organize properties by location with detailed place information and zoning data" 
  },
  { 
    name: "Financial Tracking", 
    icon: DollarSign, 
    description: "Monitor purchase prices, taxes, financing terms, and investment returns" 
  },
  { 
    name: "Tax Management", 
    icon: FileText, 
    description: "Track property taxes, payments, and important tax-related deadlines" 
  },
  { 
    name: "Transaction History", 
    icon: Calendar, 
    description: "Keep detailed records of closings, contracts, and important dates" 
  },
]

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // If user is authenticated, show the dashboard
  if (session) {
    return <OverviewDashboard />
  }

  // If user is not authenticated, show the landing page
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mr-4 flex"
          >
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">Property Manager</span>
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-1 items-center justify-between space-x-2 md:justify-end"
          >
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Empty for now, could add search later */}
            </div>
            <nav className="flex items-center space-x-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </nav>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Professional Property Management
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Streamline your real estate portfolio with comprehensive property tracking, 
                contact management, and financial analytics all in one place.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Everything You Need</h2>
              <p className="text-muted-foreground">
                Comprehensive tools for managing your real estate investments
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    <Card className="h-full transition-all duration-200 hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{feature.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Trusted by Investors</h2>
              <p className="text-muted-foreground">
                Join property managers who rely on our platform for their success
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Properties Tracked</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">500+</div>
                  <p className="text-xs text-muted-foreground">
                    Active portfolios
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$50M+</div>
                  <p className="text-xs text-muted-foreground">
                    Portfolio value
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contacts</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,500+</div>
                  <p className="text-xs text-muted-foreground">
                    Managed contacts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Locations</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100+</div>
                  <p className="text-xs text-muted-foreground">
                    Cities tracked
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center space-y-6 py-12"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Ready to Get Started?</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Join thousands of property managers who trust our platform to organize 
                their real estate investments and grow their portfolios.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Start Your Free Account
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In to Existing Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}