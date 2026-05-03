"use client"

import { useEffect, useState, use } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft, Zap, Star, ShieldCheck,
  Clock, MapPin, Share2, Heart, Download, Sparkles
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { fetchItineraries } from "@/lib/api"
import { googleLogin } from "@/lib/api"
import { AuthModal } from "@/components/auth-modal"

export default function ItineraryProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [itinerary, setItinerary] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  useEffect(() => {
    const token = localStorage.getItem('trippzi-token')
    const savedUser = localStorage.getItem('trippzi-user')
    const isValidToken = token && token !== 'undefined' && token !== 'null'
    if (isValidToken) setIsAuthenticated(true)
    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') setUser(JSON.parse(savedUser))

    async function load() {
      try {
        const { fetchItineraryById, fetchMyWishlist } = await import("@/lib/api")
        const current = await fetchItineraryById(id)
        setItinerary(current)

        const publicTrips = await fetchItineraries()
        setRelated(publicTrips.filter((item: any) => item.id.toString() !== id).slice(0, 4))

        // Check wishlist status if logged in
        if (isValidToken) {
          const wl = await fetchMyWishlist()
          setWishlisted(wl.some((item: any) => item.id.toString() === id))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleWishlist = async () => {
    if (!isAuthenticated) { setIsAuthModalOpen(true); return }
    const { toggleWishlist } = await import("@/lib/api")
    const res = await toggleWishlist(parseInt(id))
    if (res !== null) {
      setWishlisted(res.wishlisted)
      showToast(res.wishlisted ? '❤️ Added to Wishlist' : 'Removed from Wishlist')
    }
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => showToast('🔗 Link copied to clipboard!'))
  }

  const handlePurchase = async (force = false) => {
    if (!isAuthenticated && !force) {
      setIsAuthModalOpen(true)
      return
    }

    try {
      const { createRazorpayOrder, verifyRazorpayPayment } = await import("@/lib/api")
      const order = await createRazorpayOrder(parseInt(id))

      if (order.status === 401) {
        localStorage.removeItem('trippzi-token')
        localStorage.removeItem('trippzi-user')
        setIsAuthenticated(false)
        setIsAuthModalOpen(true)
        return
      }

      if (order.error) {
        alert("Failed to create order: " + order.error)
        return
      }

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Trippzi",
        description: `Itinerary: ${order.itinerary_title}`,
        order_id: order.order_id,
        handler: async (response: any) => {
          const verify = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })

          if (verify.status === "success") {
            alert("Payment successful! Your itinerary is now available in your account.")
            window.location.href = "/profile"
          } else {
            alert("Payment verification failed.")
          }
        },
        prefill: {
          email: order.user_email,
          contact: order.user_phone
        },
        theme: {
          color: "#2563eb"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Purchase failed", err)
      alert("Something went wrong with the payment process.")
    }
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
                  src={itinerary.image || itinerary.image_url || "/destinations/bali.png"}
                  alt={itinerary.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
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
                  <div className="pt-4">
                    {itinerary.is_owned ? (
                      <button
                        onClick={() => alert("Starting PDF Download...")}
                        className="group w-full flex items-center justify-center gap-3 bg-green-600 text-white p-6 rounded-[2rem] text-xl font-black hover:bg-green-700 transition-all shadow-2xl shadow-green-500/20 active:scale-95"
                      >
                        <Download className="w-6 h-6" /> DOWNLOAD ITINERARY
                      </button>
                    ) : (
                      <button
                        onClick={handlePurchase}
                        className="group w-full flex items-center justify-center gap-3 bg-zinc-950 text-white p-6 rounded-[2rem] text-xl font-black hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/20 active:scale-95"
                      >
                        <Zap className="w-6 h-6 fill-current text-blue-400" /> BUY IT NOW
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-center text-xs text-zinc-400 pt-4">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Secure checkout. Instant digital delivery.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleWishlist}
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border text-sm font-bold transition-all ${
                    wishlisted
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                  {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share Trip
                </button>
              </div>
            </div>

          </div>

          {/* Detailed Content / Day-wise */}
          <div className="mt-32 space-y-12">
            <h2 className="text-4xl font-black text-center italic tracking-tighter">Day-wise Breakdown</h2>
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(itinerary.content || itinerary.days)?.slice(0, (itinerary.is_custom && !itinerary.is_owned) ? 1 : undefined).map((item: any, i: number) => (
                  <div key={i} className="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black mb-6">
                      {item.day || item.day_number}
                    </div>
                    <h4 className="text-xl font-bold mb-4">Day {item.day || item.day_number}</h4>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {item.activity || item.theme}
                      {item.activities && (
                        <span className="block mt-2 text-xs opacity-70">
                          {item.activities.length} activities planned
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {(itinerary.is_custom && !itinerary.is_owned) && (
                <div className="absolute inset-x-0 -bottom-10 h-60 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent flex items-end justify-center pb-12">
                  <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 px-6 py-3 rounded-full text-sm font-bold text-zinc-500 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" /> Unlock to see all {itinerary.duration_days} days
                  </div>
                </div>
              )}
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
                    <Image
                      src={item.image || item.image_url || "/destinations/bali.png"}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(userData) => {
          setIsAuthenticated(true)
          setUser(userData)
          handlePurchase(true)
        }}
      />
    </div>
  )
}
