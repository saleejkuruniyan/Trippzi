"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchItineraryById, fetchItineraries } from "@/lib/api"
import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Clock, Sparkles, Zap, ArrowLeft, ShieldCheck, Download, Globe } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import Link from "next/link"
import { LoadingScreen } from "@/components/loading-screen"

export default function ItineraryPreviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const [itinerary, setItinerary] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (id) {
      async function load() {
        try {
          const data = await fetchItineraryById(id as string)
          setItinerary(data)
          
          const publicTrips = await fetchItineraries()
          setRelated(publicTrips.filter((item: any) => item.id.toString() !== id).slice(0, 4))
        } catch (err) {
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
      load()
    }
  }, [id])

  const handleDownload = async () => {
    if (!itinerary.id) return
    setIsDownloading(true)
    try {
      const { downloadItineraryPDF } = await import("@/lib/api")
      const { pdf_url } = await downloadItineraryPDF(itinerary.id)
      window.open(pdf_url, '_blank')
    } catch (err: any) {
      alert(err.message || "Failed to download PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePurchase = () => {
    const token = localStorage.getItem('trippzi-token')
    if (!token) {
      setIsAuthModalOpen(true)
    } else {
      router.push(`/itinerary/${id}`)
    }
  }

  if (loading) return <LoadingScreen message="Preparing your sneak peek..." />

  if (!itinerary) return <div>Itinerary not found.</div>

  const day1 = (itinerary.content || itinerary.days)?.[0]
  const day1Images = itinerary.day_details?.filter((d: any) => d.day_number === 1) || []

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans pb-20">
      {/* Premium Header/Hero */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <Image 
          src={itinerary.image || itinerary.image_url || "/placeholder.png"} 
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
          
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary/70 text-[10px] font-black uppercase tracking-widest border border-primary/80/30">
              <Sparkles className="w-3 h-3" /> Exclusive Preview
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">
            {itinerary.title}
          </h1>
          <div className="flex items-center gap-6 text-zinc-400 font-medium">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {itinerary.destination}</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {itinerary.duration_days} Days</div>
            {itinerary.nationality_details ? (
              <div className="flex items-center gap-2">
                {itinerary.nationality_details.flag_url && (
                  <Image src={itinerary.nationality_details.flag_url} alt="Flag" width={14} height={14} className="rounded-sm" />
                )}
                <span className="text-primary/70 font-bold uppercase text-[11px] tracking-tight">For {itinerary.nationality_details.name} Nationalities</span>
              </div>
            ) : (
              <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> Global Travelers</div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-5xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-3xl font-black border-b border-zinc-800 pb-4">A Sneak Peek: Day 01</h2>
            
            {day1 && (
              <div className="space-y-8 relative">
                <h3 className="text-2xl font-bold text-primary/80">Theme: {day1.theme}</h3>
                
                <div className="space-y-12 relative">
                    {(() => {
                      let activities = day1.activities || [];
                      if (!itinerary.is_purchased_by_user) {
                        activities = activities.slice(0, Math.max(1, Math.ceil(activities.length / 2)));
                      }
                      return activities.map((act: any, i: number) => {
                        const spotImage = day1Images.find((img: any) => img.caption === act.activity);
                        const imgUrl = act.image_url || spotImage?.image || spotImage?.image_url;
                        
                        return (
                          <div key={i} className="flex flex-col md:flex-row gap-8 group">
                            {imgUrl && (
                              <div className="w-full md:w-64 h-40 relative rounded-2xl overflow-hidden shrink-0 border border-zinc-800">
                                <Image 
                                  src={imgUrl} 
                                  alt={act.activity}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                            )}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="text-primary font-black text-xs uppercase tracking-widest">{act.time}</div>
                                <div className="flex gap-2">
                                  {act.duration_at_spot && (
                                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">⏱ {act.duration_at_spot}</span>
                                  )}
                                </div>
                              </div>
                              <h4 className="text-2xl font-bold group-hover:text-primary/70 transition-colors leading-tight">{act.activity}</h4>
                              <p className="text-zinc-400 leading-relaxed font-light text-sm">{act.description}</p>
                              
                              {act.transport_to_next && (
                                <div className="flex items-center gap-3 pt-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                  <span className="h-px flex-1 bg-zinc-900"></span>
                                  <span>Travel: {act.transport_to_next} ({act.time_to_next})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                    
                    {/* Fade out effect and Continuation dots below the list */}
                    {!itinerary.is_purchased_by_user && (
                      <div className="relative flex flex-col items-center gap-3 pt-12 pb-8 animate-pulse">
                         <div className="absolute inset-x-0 -top-32 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                         <div className="w-2 h-2 rounded-full bg-primary/80/40" />
                         <div className="w-2 h-2 rounded-full bg-primary/80/60" />
                         <div className="w-2 h-2 rounded-full bg-primary/80/80" />
                      </div>
                    )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* What's Included */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem]">
            <h4 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-6">What's Included</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center gap-3"><span className="text-primary/80">✓</span> Full Day-by-Day Plan</li>
              <li className="flex items-center gap-3"><span className="text-primary/80">✓</span> High-Res Magazine PDF</li>
              <li className="flex items-center gap-3"><span className="text-primary/80">✓</span> Budget Breakdown</li>
              <li className="flex items-center gap-3"><span className="text-primary/80">✓</span> Visa Information</li>
              <li className="flex items-center gap-3"><span className="text-primary/80">✓</span> Pro Travel Tips</li>
            </ul>
          </div>

          {/* The Paywall / Unlock Section (Now in Sidebar) */}
          {!itinerary.is_purchased_by_user && (
            <div className="relative">
              <div className="relative z-20 text-center space-y-6">
                <div className="bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/80/20">
                    <Zap className="w-8 h-8 text-white fill-current" />
                  </div>
                  <h3 className="text-xl font-black mb-4 uppercase">Unlock the full experience</h3>
                  <p className="text-zinc-500 mb-8 text-sm">
                    Get access to all {itinerary.duration_days} days of curated planning, offline PDF booklet, and local secrets.
                  </p>
                  <button 
                    onClick={handlePurchase}
                    className="w-full bg-primary text-white py-4 rounded-2xl text-lg font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/80/20 active:scale-95"
                  >
                    UNLOCK — ₹{itinerary.sale_price}
                  </button>
                  <p className="mt-6 flex items-center justify-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-green-600" /> Instant Access
                  </p>
                </div>
              </div>
            </div>
          )}

          {itinerary.is_purchased_by_user && (
            <div className="bg-zinc-900 border border-green-500/30 p-8 rounded-[2.5rem] text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-500/20">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black uppercase">You own this trip</h3>
              <button 
                onClick={() => router.push(`/itinerary/${id}`)}
                className="w-full bg-white text-black py-4 rounded-2xl text-lg font-black hover:bg-zinc-200 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                VIEW FULL ITINERARY
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-40 space-y-12">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-3xl font-black tracking-tighter">YOU MAY ALSO LIKE</h3>
            <p className="text-zinc-500 mt-2">More adventures curated for your soul.</p>
          </div>
          <Link href="/destinations" className="text-sm font-bold text-primary hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {related.map((item: any) => (
            <Link key={item.id} href={`/itinerary/${item.id}`} className="group space-y-4">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-zinc-800 shadow-sm group-hover:shadow-xl transition-all">
                <Image
                  src={item.image || item.image_url || "/placeholder.png"}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <h5 className="font-bold group-hover:text-primary/70 transition-colors">{item.title}</h5>
                <p className="text-sm text-primary font-black">₹{item.sale_price}</p>
              </div>
            </Link>
          ))}
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
