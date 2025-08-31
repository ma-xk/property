"use client"

import { useSession, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  User, 
  LogOut
} from "lucide-react"

import { Button } from "@/components/ui/button"

export function Navbar() {
  const { data: session, status } = useSession()

  // Don't show navbar if not authenticated
  if (status !== "loading" && !session) {
    return null
  }

  return (
    <header className="bg-gradient-to-r from-slate-900 to-purple-900 px-6 py-3 flex justify-between items-center backdrop-blur-sm border-b border-white/10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link href="/" className="text-2xl font-bold text-white hover:text-slate-200 transition-colors">
          Property App
        </Link>
      </motion.div>
      
      {session && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-2 text-white">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">Welcome, {session.user?.name}</span>
            <span className="sm:hidden">Hi, {session.user?.name?.split(' ')[0]}</span>
          </div>
          <Button 
            onClick={() => signOut()} 
            variant="outline" 
            className="bg-transparent border-white text-white hover:bg-white hover:text-slate-900"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden sr-only">Sign Out</span>
          </Button>
        </motion.div>
      )}
    </header>
  )
}
