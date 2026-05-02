"use client"

import { useEffect, useState, use } from "react"
import { motion } from "framer-motion"
import { 
  ArrowLeft, ShoppingCart, Zap, Star, ShieldCheck, 
  Clock, MapPin, Share2, Heart, Plus, Minus
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { fetchItineraries } from "@/lib/api"
import { useGoogleLogin } from '@react-oauth/google'

export default function ItineraryProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [itinerary, setItinerary] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('trippzi-token')
    if (token) setIsAuthenticated(true)

    async function load() {
      try {
        const all = await fetchItineraries()
        const current = all.find((item: any) => item.id.toString() === id)
        setItinerary(current)
        setRelated(all.filter((item: any) => item.id.toString() !== id).slice(0, 4))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // Mock Google Login for Demo / Authentication Gate
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Login Success", tokenResponse)
      localStorage.setItem('trippzi-token', tokenResponse.access_token)
      setIsAuthenticated(true)
      handlePurchase()
    },
  })

  const handlePurchase = () => {
    if (!isAuthenticated) {
      login()
      return
    }
    alert("Redirecting to Secure Checkout...")
    // Integration with Payment Service would go here
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Product...</div>
  if (!itinerary) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs / Back */}
          <Link href="/destinations" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Destinations
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Left: Product Images */}
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl"
              >
                <Image 
                  src={itinerary.image_url || "/destinations/bali.png"} 
                  alt={itinerary.title} 
                  fill 
                  className="object-cover" 
                />
              </motion.div>
            </div>

            {/* Right: Product Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">SALE</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                    <span className="text-xs text-zinc-400 ml-2">(4.9/5 based on 128 reviews)</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{itinerary.title}</h1>
                <div className="flex items-center gap-2 text-zinc-500 font-medium">
                  <MapPin className="w-4 h-4" /> {itinerary.destination}
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4" /> {itinerary.duration_days} Days
                </div>
              </div>

              <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex items-end gap-4">
                  <div className="space-y-1">
                    <span className="text-zinc-400 line-through text-sm italic">Regular price Rs. {itinerary.regular_price}</span>
                    <div className="text-5xl font-black text-blue-600 italic">Rs. {itinerary.sale_price}</div>
                  </div>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-lg text-xs font-bold mb-2">Save 20%</span>
                </div>

                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {itinerary.description}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <span className="font-bold text-sm">Quantity</span>
                    <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"><Minus className="w-4 h-4" /></button>
                      <span className="font-black w-4 text-center">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <button 
                      onClick={handlePurchase}
                      className="group flex items-center justify-center gap-3 bg-zinc-950 text-white p-5 rounded-[1.5rem] font-black hover:bg-blue-600 transition-all shadow-xl shadow-zinc-500/10 active:scale-95"
                    >
                      <Zap className="w-5 h-5 fill-current text-blue-400" /> BUY IT NOW
                    </button>
                    <button 
                      onClick={handlePurchase}
                      className="group flex items-center justify-center gap-3 border-2 border-zinc-950 dark:border-white p-5 rounded-[1.5rem] font-black hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
                    >
                      <ShoppingCart className="w-5 h-5" /> ADD TO CART
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-center text-xs text-zinc-400 pt-4">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Secure checkout. Instant digital delivery.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <Heart className="w-4 h-4" /> Add to Wishlist
                </button>
                <button className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <Share2 className="w-4 h-4" /> Share Trip
                </button>
              </div>
            </div>

          </div>

          {/* Detailed Content / Day-wise */}
          <div className="mt-32 space-y-12">
            <h2 className="text-4xl font-black text-center italic tracking-tighter">Day-wise Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {itinerary.content?.map((item: any, i: number) => (
                <div key={i} className="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black mb-6">
                    {item.day}
                  </div>
                  <h4 className="text-xl font-bold mb-4">Day {item.day}</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.activity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-40 space-y-12">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-black italic tracking-tighter">YOU MAY ALSO LIKE</h3>
                <p className="text-zinc-500 mt-2">More adventures curated for your soul.</p>
              </div>
              <Link href="/destinations" className="text-sm font-bold text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map((item: any) => (
                <Link key={item.id} href={`/itinerary/${item.id}`} className="group space-y-4">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover:shadow-xl transition-all">
                    <Image src={item.image_url || "/destinations/bali.png"} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h5 className="font-bold group-hover:text-blue-600 transition-colors">{item.title}</h5>
                    <p className="text-sm text-blue-600 font-black italic">Rs. {item.sale_price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
