"use client"

import { useEffect, useState, use } from "react"
import { motion } from "framer-motion"
import { 
  Plane, Calendar, ShieldCheck, Clock, CheckCircle2, 
  Lightbulb, ArrowRight, Star, ShoppingCart, Zap, Globe, MapPin 
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { fetchDestinationBySlug } from "@/lib/api"
import ReactMarkdown from 'react-markdown'

export default function DestinationGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [dest, setDest] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDestinationBySlug(slug)
        setDest(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Guide...</div>
  if (!dest) return <div className="min-h-screen flex items-center justify-center">Guide not found.</div>

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-white dark:bg-zinc-950">
        {/* Hero Section */}
        <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <Image 
            src={dest.image || dest.image_url || "/placeholder.png"} 
            alt={dest.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative z-10 text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase">
                {dest.name}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto italic">
                {dest.description}
              </p>
            </motion.div>
          </div>
        </div>

        {/* The "Stop Scrolling" Header */}
        <div className="bg-blue-600 py-12 text-center text-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-black mb-4 animate-bounce">STOP SCROLLING!</h2>
            <p className="text-xl md:text-2xl font-bold opacity-90">
              Read This Before Your {dest.name} Trip
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">
          
          {/* Guide Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Airports */}
            <motion.div 
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -20 }}
              className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-4 mb-6 text-blue-600">
                <Plane className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Major Airports</h3>
              </div>
              <ul className="space-y-3">
                {(Array.isArray(dest.airports) 
                  ? dest.airports 
                  : (typeof dest.airports === 'string' ? dest.airports.split(',').map(a => a.trim()).filter(Boolean) : [])
                ).map((airport: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> {airport}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Best Time */}
            <motion.div 
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 20 }}
              className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-4 mb-6 text-orange-600">
                <Calendar className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Best Time to Visit</h3>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium text-lg">
                {dest.best_time}
              </p>
            </motion.div>

            {/* Visa Process */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              className="lg:col-span-2 p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900 border-2 border-blue-100 dark:border-blue-900/30 shadow-xl shadow-blue-500/5"
            >
              <div className="flex items-center gap-4 mb-8 text-blue-600">
                <ShieldCheck className="w-10 h-10" />
                <h3 className="text-3xl font-black">Visa & Immigration Process</h3>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="font-medium text-zinc-700 dark:text-zinc-300">
                  <ReactMarkdown>
                    {dest.visa_process}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>

            {/* Duration Recommendations */}
            <div className="lg:col-span-2 space-y-8">
              <h3 className="text-3xl font-black text-center">How many Days do you need to explore?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(dest.days_recommendation || {}).map(([days, desc]: [any, any], i) => (
                  <div key={i} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-start gap-4 border border-zinc-200 dark:border-zinc-800">
                    <div className="bg-blue-600 text-white p-3 rounded-xl font-bold shrink-0">
                      {days}
                    </div>
                    <p className="font-bold text-zinc-700 dark:text-zinc-200">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Things to keep in mind */}
            <motion.div 
              whileInView={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              className="lg:col-span-2 p-10 rounded-[2.5rem] bg-zinc-950 text-white overflow-hidden relative"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8 text-blue-400">
                  <Lightbulb className="w-10 h-10" />
                  <h3 className="text-3xl font-black">Things to keep in mind</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(Array.isArray(dest.tips) 
                    ? dest.tips 
                    : (typeof dest.tips === 'string' ? dest.tips.split(',').map(t => t.trim()).filter(Boolean) : [])
                  ).map((tip: string, i: number) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <p className="text-lg font-medium text-zinc-300 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32" />
            </motion.div>

          </div>

          {/* Available Itineraries Selection */}
          <div className="space-y-12">
            <div className="text-center">
              <h3 className="text-4xl font-black mb-4 tracking-tight">Available Travel Blueprints</h3>
              <p className="text-zinc-500 max-w-2xl mx-auto">Select a pre-planned, optimized itinerary for {dest.name}. No research needed - just download and go.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {dest.itineraries?.map((itinerary: any) => (
                <motion.div 
                  key={itinerary.id}
                  whileHover={{ y: -5 }}
                  className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative aspect-video">
                    <Image 
                      src={itinerary.image || itinerary.image_url || "/placeholder.png"} 
                      alt={itinerary.title} 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {itinerary.duration_days} Days
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-[10px] font-black text-zinc-500 mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 uppercase tracking-widest">
                       <div className="flex items-center gap-2 shrink-0">
                         <Clock className="w-3.5 h-3.5 text-blue-600" />
                         {itinerary.duration_days} Days
                       </div>
                       
                       <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-700 pl-4 shrink-0">
                         <MapPin className="w-3.5 h-3.5 text-orange-600" />
                         {itinerary.destination}
                       </div>

                       <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-700 pl-4 shrink-0">
                         {itinerary.nationality_details ? (
                           <>
                             {itinerary.nationality_details.flag_url && (
                               <Image src={itinerary.nationality_details.flag_url} alt="Flag" width={14} height={14} className="rounded-sm" />
                             )}
                             <span className="text-blue-700 dark:text-blue-300">For {itinerary.nationality_details.name} Nationalities</span>
                           </>
                         ) : (
                           <>
                             <Globe className="w-3.5 h-3.5 text-zinc-400" />
                             <span>Global Travelers</span>
                           </>
                         )}
                       </div>
                    </div>
                    
                    <h4 className="text-2xl font-bold mb-3">{itinerary.title}</h4>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 line-clamp-2">{itinerary.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-400 line-through">₹{itinerary.regular_price}</span>
                        <span className="text-2xl font-black text-blue-600 italic">₹{itinerary.sale_price}</span>
                      </div>
                      <Link 
                        href={`/itinerary/${itinerary.id}`} 
                        className="bg-zinc-950 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        View Itinerary <Zap className="w-4 h-4 fill-current" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!dest.itineraries || dest.itineraries.length === 0) && (
                <div className="col-span-2 text-center p-12 bg-zinc-50 dark:bg-zinc-900 rounded-3xl italic text-zinc-500">
                  New itineraries for {dest.name} are coming soon!
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
