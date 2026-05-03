"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchItineraryById } from "@/lib/api"
import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Clock, Sparkles, Zap, ArrowLeft, ShieldCheck } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"

export default function ItineraryPreviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const [itinerary, setItinerary] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchItineraryById(id as string).then(data => {
        setItinerary(data)
        setLoading(false)
      })
    }
  }, [id])

  const handlePurchase = () => {
    const token = localStorage.getItem('trippzi-token')
    if (!token) {
      setIsAuthModalOpen(true)
    } else {
      router.push(`/itinerary/${id}`)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )

  if (!itinerary) return <div>Itinerary not found.</div>

  const day1 = (itinerary.content || itinerary.days)?.[0]
  const day1Images = itinerary.day_details?.filter((d: any) => d.day_number === 1) || []

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans pb-20">
      {/* Premium Header/Hero */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <Image 
          src={itinerary.image || itinerary.image_url || "/destinations/bali.png"} 
          alt={itinerary.title}
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        
        <div className="absolute inset-x-0 bottom-0 max-w-5xl mx-auto px-6 pb-12">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to details
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-500/30">
            <Sparkles className="w-3 h-3" /> Exclusive Preview
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-4">
            {itinerary.title}
          </h1>
          <div className="flex items-center gap-6 text-zinc-400 font-medium">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {itinerary.destination}</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {itinerary.duration_days} Days</div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-5xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-3xl font-black italic border-b border-zinc-800 pb-4">A Sneak Peek: Day 01</h2>
            
            {day1 && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-blue-500">Theme: {day1.theme}</h3>
                
                {day1Images.length > 0 && (
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl">
                    <Image 
                      src={day1Images[0].image || day1Images[0].image_url} 
                      alt="Day 1 Preview" 
                      fill 
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="space-y-6">
                  {day1.activities?.map((act: any, i: number) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="text-blue-600 font-black text-sm pt-1 shrink-0">{act.time}</div>
                      <div>
                        <h4 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{act.activity}</h4>
                        <p className="text-zinc-400 leading-relaxed font-light">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* The Fade Out / Paywall */}
            <div className="relative pt-20">
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent to-zinc-950 z-10" />
              <div className="relative z-20 text-center space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] shadow-2xl">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
                    <Zap className="w-8 h-8 text-white fill-current" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 uppercase italic">Unlock the full experience</h3>
                  <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                    Get access to all {itinerary.duration_days} days of curated planning, offline PDF booklet, and local secrets.
                  </p>
                  <button 
                    onClick={handlePurchase}
                    className="w-full max-w-sm bg-blue-600 text-white py-6 rounded-[2rem] text-xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    BUY FULL BOOKLET — Rs. {itinerary.sale_price}
                  </button>
                  <p className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
                    <ShieldCheck className="w-4 h-4 text-green-600" /> Instant Digital Delivery • Lifetime Access
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-8">
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem]">
            <h4 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-6">What's Included</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center gap-3"><span className="text-blue-500">✓</span> Full Day-by-Day Plan</li>
              <li className="flex items-center gap-3"><span className="text-blue-500">✓</span> High-Res Magazine PDF</li>
              <li className="flex items-center gap-3"><span className="text-blue-500">✓</span> Budget Breakdown</li>
              <li className="flex items-center gap-3"><span className="text-blue-500">✓</span> Visa Information</li>
              <li className="flex items-center gap-3"><span className="text-blue-500">✓</span> Pro Travel Tips</li>
            </ul>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => router.push(`/itinerary/${id}`)}
      />
    </div>
  )
}
