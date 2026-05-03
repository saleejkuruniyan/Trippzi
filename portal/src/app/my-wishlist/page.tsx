"use client"

import { useEffect, useState } from "react"
import { fetchMyWishlist } from "@/lib/api"
import { motion } from "framer-motion"
import { Heart, MapPin, Calendar, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function MyWishlistPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyWishlist()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <h1 className="text-4xl font-bold">My Wishlist</h1>
          </div>
          <p className="text-zinc-500">Itineraries you've saved for later.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <Heart className="w-16 h-16 text-zinc-300 mx-auto mb-6" />
            <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-zinc-500 mb-8">Browse itineraries and click the ❤️ button to save them here.</p>
            <Link href="/destinations" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all">
              Explore Destinations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((trip, idx) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {trip.image_url || trip.image ? (
                    <Image
                      src={trip.image_url || trip.image}
                      alt={trip.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <Clock className="w-10 h-10 text-zinc-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Heart className="w-5 h-5 text-red-400 fill-current drop-shadow" />
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-bold truncate">{trip.title}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {trip.duration_days} Days</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {trip.destination}</span>
                  </div>
                  <Link
                    href={`/itinerary/${trip.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black py-3 rounded-2xl font-bold hover:scale-[1.02] transition-transform text-sm"
                  >
                    View Itinerary <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
