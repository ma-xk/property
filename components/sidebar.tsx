"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Home,
  Building2,
  User,
  MapPin,
  Plus,
  LogOut,
  Settings,
  ChevronUp,
  Receipt,
  BarChart3
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreatePropertyForm } from "@/components/create-property-form"
import { CreatePersonForm } from "@/components/create-person-form"
import { CreatePlaceForm } from "@/components/create-place-form"
import { Breadcrumb } from "@/components/breadcrumb"

// Menu items for the main navigation
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Properties",
    url: "/properties",
    icon: Building2,
  },
  {
    title: "People",
    url: "/people",
    icon: User,
  },
  {
    title: "Places",
    url: "/places",
    icon: MapPin,
  },
  {
    title: "Taxes",
    url: "/taxes",
    icon: Receipt,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
]

// Quick action items
const quickActions = [
  {
    title: "Add Property",
    action: "property",
    icon: Plus,
  },
  {
    title: "Add Person",
    action: "person",
    icon: User,
  },
  {
    title: "Add Place",
    action: "place",
    icon: MapPin,
  },
]

function AppSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [openModal, setOpenModal] = useState<string | null>(null)

  const handleQuickAction = (action: string) => {
    setOpenModal(action)
  }

  const handleModalClose = () => {
    setOpenModal(null)
  }

  const handleFormSuccess = () => {
    setOpenModal(null)
    router.refresh() // Refresh to show new data
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Property App</span>
            <span className="truncate text-xs">Property Management</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => (
                <SidebarMenuItem key={action.title}>
                  <SidebarMenuButton 
                    onClick={() => handleQuickAction(action.action)}
                    className="cursor-pointer"
                  >
                    <action.icon />
                    <span>{action.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        {session && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <User className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{session.user?.name}</span>
                      <span className="truncate text-xs">{session.user?.email}</span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>

      {/* Modals */}
      <Dialog open={openModal === "property"} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <CreatePropertyForm onSuccess={handleFormSuccess} onCancel={handleModalClose} showCard={false} />
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === "person"} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Person</DialogTitle>
          </DialogHeader>
          <CreatePersonForm onSuccess={handleFormSuccess} onCancel={handleModalClose} showCard={false} />
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === "place"} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Place</DialogTitle>
          </DialogHeader>
          <CreatePlaceForm onSuccess={handleFormSuccess} onCancel={handleModalClose} showCard={false} />
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}

export function AppSidebarProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  // Don't show sidebar if not authenticated
  if (status !== "loading" && !session) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border" />
          <Breadcrumb />
          <div className="flex-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
