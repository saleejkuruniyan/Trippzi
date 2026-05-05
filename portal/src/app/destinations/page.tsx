"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Clock, ArrowRight, Star, Search, Filter, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { fetchDestinations } from "@/lib/api"
import { LoadingScreen } from "@/components/loading-screen"

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDestinations()
        setDestinations(data.results || data)
      } catch (err) {
        console.error("Failed to load destinations", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const destList = Array.isArray(destinations) ? destinations : []
  const filtered = destList.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingScreen message="Finding the best spots..." />

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-white dark:bg-zinc-950 pt-24">
        {/* Page Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
            >
              Explore the <span className="text-blue-600">World</span>
            </motion.h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg mb-10">
              Expertly curated travel guides and itineraries for every budget. Start your journey below.
            </p>

            {/* Search Bar */}
            <div className="flex max-w-2xl mx-auto p-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-blue-500/5">
              <div className="flex-1 flex items-center px-4 gap-3">
                <Search className="w-5 h-5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Where do you want to go?" 
                  className="bg-transparent border-none focus:ring-0 w-full text-sm outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all">
                Find
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((dest, i) => (
              <DestinationCard key={dest.id} dest={dest} index={i} />
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-500 italic">No destinations found matching your search.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function DestinationCard({ dest, index }: { dest: any, index: number }) {
  const initialSrc = (dest.image && typeof dest.image === 'string' && dest.image.length > 10) ? dest.image : 
                   (dest.image_url && typeof dest.image_url === 'string' && dest.image_url.length > 10) ? dest.image_url : 
                   "/placeholder.png";
  
  const [imgSrc, setImgSrc] = useState(initialSrc);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        <Image 
          src={imgSrc} 
          alt={dest.name} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700" 
          onError={() => setImgSrc("/placeholder.png")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-2">
          <Globe className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{dest.itineraries_count || 0} Itineraries</span>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <h3 className="text-3xl font-extrabold text-white mb-2 leading-tight">{dest.name}</h3>
          <p className="text-white/70 text-sm line-clamp-2 mb-4">{dest.description}</p>
          <Link href={`/destinations/${dest.slug}`} className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm hover:text-blue-300 transition-colors">
            View Travel Guide <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
