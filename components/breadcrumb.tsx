"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<any>
}

export function Breadcrumb() {
  const pathname = usePathname()
  const router = useRouter()

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Dashboard", href: "/", icon: Home }
    ]

    if (segments.length === 0) {
      return breadcrumbs
    }

    // Handle different routes
    if (segments[0] === "properties") {
      breadcrumbs.push({ label: "Properties", href: "/properties" })
      if (segments[1] && segments[1] !== "new") {
        breadcrumbs.push({ label: "Property Details" })
      }
    } else if (segments[0] === "people") {
      breadcrumbs.push({ label: "People", href: "/people" })
      if (segments[1] && segments[1] !== "new") {
        breadcrumbs.push({ label: "Person Details" })
      }
    } else if (segments[0] === "places") {
      breadcrumbs.push({ label: "Places", href: "/places" })
      if (segments[1] && segments[1] !== "new") {
        breadcrumbs.push({ label: "Place Details" })
      }
    } else if (segments[0] === "property") {
      breadcrumbs.push({ label: "Properties", href: "/properties" })
      if (segments[1]) {
        breadcrumbs.push({ label: "Property Details" })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Always show at least the dashboard breadcrumb for continuity
  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          {item.href && pathname !== item.href ? (
            <button
              onClick={() => router.push(item.href!)}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors hover:bg-accent rounded px-2 py-1 cursor-pointer"
            >
              {item.icon && <item.icon className="h-4 w-4 mr-1" />}
              {item.label}
            </button>
          ) : (
            <span className="font-medium px-2 py-1 text-foreground">
              {item.icon && <item.icon className="h-4 w-4 mr-1 inline" />}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
