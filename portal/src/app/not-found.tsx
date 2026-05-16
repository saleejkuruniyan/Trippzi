"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import ItineraryClient from "./itinerary/[[...slug]]/itinerary-client"
import PreviewClient from "./itinerary/[[...slug]]/preview-client"
import DestinationClient from "./destinations/[[...slug]]/destination-client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function NotFound() {
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [routeType, setRouteType] = useState<'itinerary' | 'preview' | 'destination' | '404' | null>(null)
  const [routeId, setRouteId] = useState<string | null>(null)

  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean)

    if (parts[0] === 'itinerary' && parts.length > 1) {
      setRouteId(parts[1])
      setRouteType(parts[2] === 'preview' ? 'preview' : 'itinerary')
    } else if (parts[0] === 'destinations' && parts.length > 1) {
      setRouteId(parts[1])
      setRouteType('destination')
    } else {
      setRouteType('404')
    }
    
    // Small timeout to prevent UI flickering during hydration
    const timer = setTimeout(() => setIsChecking(false), 50)
    return () => clearTimeout(timer)
  }, [pathname])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <LoadingScreen message="Checking the map..." />
      </div>
    )
  }

  // Render the appropriate component based on the detected route
  if (routeType === 'itinerary' && routeId) return <ItineraryClient id={routeId} />
  if (routeType === 'preview' && routeId) return <PreviewClient id={routeId} />
  if (routeType === 'destination' && routeId) return <DestinationClient slug={routeId} />

  // Real 404 UI
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center bg-white dark:bg-zinc-950">
        <h1 className="text-9xl font-black text-primary/10 absolute select-none pointer-events-none">404</h1>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4">Adventure Not Found</h2>
          <p className="text-zinc-500 max-w-md mb-8 font-medium">
            We couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          <Link 
            href="/" 
            className="bg-zinc-950 text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
