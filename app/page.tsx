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
  LogIn,
  Calculator,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  Zap
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewDashboard } from "@/components/overview-dashboard"

const features = [
  { 
    name: "Deal Tracking", 
    icon: Target, 
    description: "Track every land deal from acquisition to exit with detailed financials, closing costs, and holding periods" 
  },
  { 
    name: "Tax Management", 
    icon: Calculator, 
    description: "Never miss a tax deadline. Track assessed values, mill rates, and payment history across all municipalities" 
  },
  { 
    name: "Contact Network", 
    icon: Users, 
    description: "Build and maintain relationships with agents, title companies, contractors, and municipal contacts" 
  },
  { 
    name: "Location Intelligence", 
    icon: MapPin, 
    description: "Store zoning info, tax rates, and municipal contacts for each location you invest in" 
  },
  { 
    name: "Portfolio Analytics", 
    icon: BarChart3, 
    description: "See your true returns with detailed ROI calculations, cash flow analysis, and performance metrics" 
  },
  { 
    name: "Due Diligence", 
    icon: CheckCircle, 
    description: "Organize all your research, inspections, and documentation in one centralized system" 
  },
]

const benefits = [
  {
    icon: Zap,
    title: "Stop Using Spreadsheets",
    description: "Replace messy Excel files with a professional system built for land investors"
  },
  {
    icon: Clock,
    title: "Save Hours Per Week",
    description: "Automated calculations and organized data means less time on admin, more time on deals"
  },
  {
    icon: Shield,
    title: "Never Miss Deadlines",
    description: "Track tax due dates, assessment periods, and important municipal deadlines"
  },
  {
    icon: TrendingUp,
    title: "Make Better Decisions",
    description: "Clear ROI tracking and portfolio analytics help you identify your best performing investments"
  }
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-40 right-20 w-32 h-32 bg-primary/3 rounded-full blur-2xl"
        animate={{
          y: [0, 30, 0],
          x: [0, -15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-24 h-24 bg-primary/4 rounded-full blur-xl"
        animate={{
          y: [0, -25, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
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
              <span className="hidden font-bold sm:inline-block">LandTracker</span>
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors duration-300">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </motion.div>
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
              <motion.h1 
                className="text-4xl font-bold tracking-tight sm:text-6xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                The Land Investor's
                <motion.span 
                  className="text-primary"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {" "}Command Center
                </motion.span>
              </motion.h1>
              <motion.p 
                className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Stop juggling spreadsheets. Track deals, manage taxes, and analyze returns 
                with the only platform built specifically for land investors.
              </motion.p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <UserPlus className="h-4 w-4 mr-2 relative z-10" />
                    <span className="relative z-10">Get Started Free</span>
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </motion.div>
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
              <h2 className="text-3xl font-bold tracking-tight">Built for Land Investors</h2>
              <p className="text-muted-foreground">
                Everything you need to track deals, manage taxes, and grow your land portfolio
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.1 * index,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Card className="h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 border-2 hover:border-primary/20 bg-gradient-to-br from-background to-background/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300"
                            whileHover={{ rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon className="h-5 w-5 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                          </motion.div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                            {feature.name}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Why Land Investors Choose Us</h2>
              <p className="text-muted-foreground">
                Stop struggling with spreadsheets and start making better investment decisions
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.7, 
                      delay: 0.1 * index,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.03,
                      transition: { duration: 0.2 }
                    }}
                    className="group"
                  >
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 border-2 hover:border-primary/30 bg-gradient-to-br from-background to-background/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300"
                            whileHover={{ 
                              rotate: [0, -5, 5, 0],
                              scale: 1.1
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <Icon className="h-6 w-6 text-primary group-hover:text-primary/90 transition-colors duration-300" />
                          </motion.div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                            {benefit.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">
                          {benefit.description}
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
              <h2 className="text-3xl font-bold tracking-tight">Trusted by Land Investors</h2>
              <p className="text-muted-foreground">
                Join investors who've replaced spreadsheets with professional land tracking
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: "Land Deals", value: "1,200+", subtitle: "Deals tracked", icon: Target },
                { title: "Tax Payments", value: "3,500+", subtitle: "Payments managed", icon: Calculator },
                { title: "Municipalities", value: "200+", subtitle: "Cities tracked", icon: MapPin },
                { title: "Time Saved", value: "10+", subtitle: "Hours per week", icon: Clock }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.1 * index,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border-2 hover:border-primary/20 bg-gradient-to-br from-background to-background/50">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors duration-300">
                          {stat.title}
                        </CardTitle>
                        <motion.div
                          whileHover={{ 
                            rotate: 360,
                            scale: 1.2
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </motion.div>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="text-2xl font-bold"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 0.2 + 0.1 * index,
                            ease: "easeOut"
                          }}
                        >
                          {stat.value}
                        </motion.div>
                        <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                          {stat.subtitle}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Pricing Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground">
                No hidden fees, no complicated tiers. Just what you need to track your land investments.
              </p>
            </div>
            <motion.div 
              className="max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="border-2 border-primary hover:border-primary/80 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 bg-gradient-to-br from-background to-background/50">
                <CardHeader className="text-center pb-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      LandTracker Pro
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Everything you need to manage your land portfolio
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      $29
                    </div>
                    <div className="text-muted-foreground">per month</div>
                  </motion.div>
                  <div className="space-y-3">
                    {[
                      "Unlimited land deals",
                      "Tax payment tracking", 
                      "Contact management",
                      "Portfolio analytics",
                      "Municipal data storage",
                      "Export to Excel/PDF"
                    ].map((feature, index) => (
                      <motion.div 
                        key={feature}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + 0.1 * index }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </motion.div>
                        <span className="text-sm">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div 
                    className="pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <Link href="/auth/signup">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className="w-full" size="lg">
                          Start Free Trial
                        </Button>
                      </motion.div>
                    </Link>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      14-day free trial • Cancel anytime
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center space-y-6 py-12"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Ready to Ditch the Spreadsheets?</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Join land investors who've replaced messy Excel files with professional 
                deal tracking, tax management, and portfolio analytics.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Start Your Free Account
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In to Existing Account
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}