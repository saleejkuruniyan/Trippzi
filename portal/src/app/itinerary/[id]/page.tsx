"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft, Zap, Star, ShieldCheck,
  Clock, MapPin, Share2, Heart, Download, Sparkles, Eye, Globe
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { fetchItineraries } from "@/lib/api"
import Markdown from 'markdown-to-jsx'
import { googleLogin } from "@/lib/api"
import { AuthModal } from "@/components/auth-modal"
import { AddressModal } from "@/components/address-modal"
import { PaymentStatusModal } from "@/components/payment-status-modal"
import { LoadingScreen } from "@/components/loading-screen"

export default function ItineraryProductPage() {
  const { id } = useParams()
  const [itinerary, setItinerary] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [toast, setToast] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

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

  const handleDownload = async () => {
    if (!itinerary.id) return
    setIsDownloading(true)
    try {
      const { downloadItineraryPDF } = await import("@/lib/api")
      const { pdf_url } = await downloadItineraryPDF(itinerary.id)
      window.open(pdf_url, '_blank')
    } catch (err: any) {
      const msg = err.instructions ? `${err.message}\n\nTIP: ${err.instructions}` : err.message;
      alert(msg || "Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false)
    }
  }

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [pendingPurchaseId, setPendingPurchaseId] = useState<number | null>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean,
    status: 'success' | 'failure' | 'processing',
    message?: string
  }>({ isOpen: false, status: 'processing' })

  const handlePurchase = async (force: any = false) => {
    const isForced = force === true;
    if (!isAuthenticated && !isForced) {
      setIsAuthModalOpen(true)
      return
    }

    try {
      const { fetchProfile } = await import("@/lib/api")
      const profile = await fetchProfile()
      const p = profile.profile || {}
      
      setCurrentUserProfile({
        phone_number: p.phone_number || "",
        address: p.address || "",
        city: p.city || "",
        country: p.country || "",
        zip_code: p.zip_code || ""
      })
      
      if (!p.address || !p.city || !p.country || !p.zip_code || !p.phone_number) {
        setPendingPurchaseId(parseInt(id))
        setIsAddressModalOpen(true)
        return
      }

      await triggerPayment(parseInt(id))
    } catch (err) {
      console.error("Purchase check failed", err)
    }
  }

  const handleAddressSave = async (addressData: any) => {
    try {
      const { updateProfile } = await import("@/lib/api")
      await updateProfile({
        profile: {
          phone_number: addressData.phone_number,
          address: addressData.address,
          city: addressData.city,
          country: addressData.country,
          zip_code: addressData.zip_code
        }
      })
      setIsAddressModalOpen(false)
      if (pendingPurchaseId) {
        await triggerPayment(pendingPurchaseId)
        setPendingPurchaseId(null)
      }
    } catch (err) {
      alert("Failed to update address. Please try again.")
    }
  }

  const triggerPayment = async (itineraryId: number) => {
    setPaymentModal({ isOpen: true, status: 'processing', message: 'Initializing secure payment...' })
    try {
      const { createRazorpayOrder, verifyRazorpayPayment } = await import("@/lib/api")
      const order = await createRazorpayOrder(itineraryId)

      if (order.status === 401) {
        setPaymentModal({ isOpen: false, status: 'processing' })
        localStorage.removeItem('trippzi-token')
        localStorage.removeItem('trippzi-user')
        setIsAuthenticated(false)
        setIsAuthModalOpen(true)
        return
      }

      if (order.error) {
        setPaymentModal({ isOpen: true, status: 'failure', message: order.error })
        return
      }

      if (order.status === 'mock_success') {
        setPaymentModal({ 
          isOpen: true, 
          status: 'success', 
          message: order.message || 'Success! Itinerary unlocked.' 
        })
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
          setPaymentModal({ isOpen: true, status: 'processing', message: 'Verifying your payment...' })
          const verify = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })

          if (verify.status === "success") {
            setPaymentModal({ isOpen: true, status: 'success' })
          } else {
            setPaymentModal({ isOpen: true, status: 'failure', message: 'Payment verification failed.' })
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentModal(prev => prev.status === 'processing' ? { isOpen: false, status: 'processing' } : prev)
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
      console.error("Payment failed", err)
      setPaymentModal({ isOpen: true, status: 'failure', message: 'Something went wrong with the payment process.' })
    }
  }

  if (loading) return <LoadingScreen message="Unpacking your adventure..." />
  if (!itinerary) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>

  const isTeaser = !itinerary.is_purchased_by_user;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <Link href="/destinations" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Destinations
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl"
              >
                <Image
                  src={
                    (itinerary.image && typeof itinerary.image === 'string' && itinerary.image.length > 5) ? itinerary.image : 
                    (itinerary.image_url && typeof itinerary.image_url === 'string' && itinerary.image_url.length > 5) ? itinerary.image_url : 
                    "/placeholder.png"
                  }
                  alt={itinerary.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </motion.div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">SALE</span>
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
                  {itinerary.nationality_details ? (
                    <>
                      <span className="mx-2">•</span>
                      <div className="flex items-center gap-1.5">
                        {itinerary.nationality_details.flag_url && (
                          <Image src={itinerary.nationality_details.flag_url} alt="Flag" width={14} height={14} className="rounded-sm" />
                        )}
                        <span className="text-primary dark:text-primary/70 font-bold uppercase text-[11px] tracking-tight">
                          For {itinerary.nationality_details.name} Nationalities
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="mx-2">•</span>
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4" /> 
                        <span>Global Travelers</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                {!itinerary.is_purchased_by_user && (
                  <div className="flex items-end gap-4">
                    <div className="space-y-1">
                      <span className="text-zinc-400 line-through text-sm italic">Regular price ₹{itinerary.regular_price}</span>
                      <div className="text-5xl font-black text-primary italic">₹{itinerary.sale_price}</div>
                    </div>
                    {itinerary.regular_price && itinerary.sale_price && (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-lg text-xs font-bold mb-2">
                        Save {Math.round((1 - itinerary.sale_price / itinerary.regular_price) * 100)}%
                      </span>
                    )}
                  </div>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  <Markdown>
                    {itinerary.description}
                  </Markdown>
                </div>

                <div className="space-y-4">
                  <div className="pt-4">
                    {itinerary.is_purchased_by_user ? (
                      <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="group w-full flex items-center justify-center gap-3 bg-green-600 text-white p-6 rounded-[2rem] text-xl font-black hover:bg-green-700 transition-all shadow-2xl shadow-green-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className={`w-6 h-6 ${isDownloading ? 'animate-bounce' : ''}`} />
                        {isDownloading ? 'GENERATING BOOKLET...' : 'DOWNLOAD ITINERARY'}
                      </button>
                    ) : (
                      <button
                        onClick={handlePurchase}
                        className="group w-full flex items-center justify-center gap-3 bg-zinc-950 text-white p-6 rounded-[2rem] text-xl font-black hover:bg-primary transition-all shadow-2xl shadow-primary/80/20 active:scale-95"
                      >
                        <Zap className="w-6 h-6 fill-current text-primary/70" /> UNLOCK FULL BOOKLET
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-center text-xs text-zinc-400 pt-4">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Secure checkout. Instant digital delivery.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link
                  href={`/itinerary/${id}/preview`}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors col-span-2 bg-zinc-50 dark:bg-zinc-900"
                >
                  <Eye className="w-4 h-4" /> Quick Preview
                </Link>
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
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <h2 className="text-4xl font-black italic tracking-tighter">Day-wise Breakdown</h2>
              {isTeaser && (
                <div className="bg-primary/5 dark:bg-primary/20/20 text-primary dark:text-primary/70 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-primary/10 dark:border-primary/20/30">
                  <Sparkles className="w-4 h-4" /> Unlock to see all {itinerary.duration_days} days
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(itinerary.content || itinerary.days)?.slice(0, isTeaser ? 1 : undefined).map((item: any, i: number) => {
                  const dayImages = itinerary.day_details?.filter((d: any) => d.day_number === (item.day || item.day_number)) || []
                  
                  // Slice activities if teaser
                  let activities = item.activities || [];
                  if (isTeaser) {
                    activities = activities.slice(0, Math.max(1, Math.ceil(activities.length / 2)));
                  }

                  return (
                    <div key={i} className="group bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all flex flex-col relative">
                      {dayImages.length > 0 && (
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={dayImages[0].image || dayImages[0].image_url}
                            alt={item.theme || item.activity}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-8 flex-1 flex flex-col">
                        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black mb-6">
                          {item.day || item.day_number}
                        </div>
                        <h4 className="text-xl font-bold mb-4">Day {item.day || item.day_number}: {item.theme}</h4>
                        
                        <div className="space-y-6 flex-1">
                          {activities.map((act: any, idx: number) => (
                            <div key={idx} className="space-y-3">
                              <div className="flex gap-4">
                                <span className="font-black text-primary shrink-0 text-xs w-16">{act.time}</span>
                                <div className="space-y-2 flex-1">
                                  <h5 className="font-bold text-lg leading-tight">{act.activity}</h5>
                                  {act.image_url && (
                                    <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                      <Image src={act.image_url} alt={act.activity} fill className="object-cover" />
                                    </div>
                                  )}
                                  <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{act.description}</p>
                                  
                                  <div className="flex flex-wrap gap-3 pt-1">
                                    {(act.opening_time || act.closing_time) && (
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                                        <Clock className="w-3 h-3" /> {act.opening_time} - {act.closing_time}
                                      </div>
                                    )}
                                    {act.duration_at_spot && (
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary/80 uppercase tracking-tighter bg-primary/5 dark:bg-primary/20/20 px-2 py-1 rounded-md">
                                        ⏱ {act.duration_at_spot}
                                      </div>
                                    )}
                                    {act.ticket_price && (
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-tighter bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                                        🎫 {(() => {
                                          if (typeof act.ticket_price === 'object' && act.ticket_price !== null) {
                                            return `${act.ticket_price.adult || act.ticket_price.amount || ''} ${act.ticket_price.currency || ''}`.trim() || JSON.stringify(act.ticket_price);
                                          }
                                          return act.ticket_price;
                                        })()}
                                      </div>
                                    )}
                                    {act.closing_days && (
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-tighter bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                                        ⚠️ Closed: {act.closing_days}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {isTeaser && (
                           <div className="relative pt-12 mt-auto">
                              <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none" />
                              <div className="flex flex-col items-center gap-2 opacity-40">
                                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                              </div>
                           </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Destination Overviews */}
            {itinerary.destinations_details && itinerary.destinations_details.length > 0 && (
              <div className="mt-32 space-y-12">
                <div className="text-center">
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase">Destination Highlights</h2>
                  <p className="text-zinc-500 mt-2">Deeper look into the cities you'll explore</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {itinerary.destinations_details.map((dest: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 space-y-4">
                      <h4 className="text-2xl font-black text-primary italic">{dest.name}</h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        <Markdown>
                          {dest.description}
                        </Markdown>
                      </div>
                      {dest.culture && (
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border-l-4 border-primary">
                          <h5 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Culture & Heritage</h5>
                          <p className="text-xs italic text-zinc-500">{dest.culture}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Country Guide Section (Optimized cached data) */}
            {itinerary.country_details && (
              <div className="mt-32 space-y-12">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <h2 className="text-4xl font-black italic tracking-tighter">Country Essentials</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Visa Process */}
                  <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-primary">
                        <ShieldCheck className="w-6 h-6" />
                        <h4 className="text-2xl font-black italic uppercase tracking-tight">Visa Process</h4>
                      </div>
                      <div className="prose prose-blue dark:prose-invert max-w-none">
                        <div className="font-medium text-zinc-700 dark:text-zinc-300">
                          <div className="prose prose-blue dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-2">
                            <Markdown options={{ 
                              overrides: {
                                h1: { props: { className: 'text-2xl font-black mb-4' } },
                                h2: { props: { className: 'text-xl font-bold mt-8 mb-3' } },
                                h3: { props: { className: 'text-lg font-bold mt-6 mb-2' } }
                              }
                            }}>
                              {(() => {
                                let text = (itinerary.visa_requirements || itinerary.country_details?.visa_process || "").replace(/\\n/g, '\n');
                                // Strip ```markdown and ``` markers if present
                                return text.replace(/^```markdown\n?/, '').replace(/```$/, '').trim();
                              })()}
                            </Markdown>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Best Time to Visit</h5>
                          <p className="text-sm font-medium leading-relaxed">{itinerary.country_details.best_time}</p>
                       </div>
                       <div className="space-y-4">
                          <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Major Hubs</h5>
                          <div className="flex flex-wrap gap-2">
                             {(() => {
                               const airports = itinerary.country_details.airports;
                               const list = Array.isArray(airports) 
                                 ? airports 
                                 : (typeof airports === 'string' ? airports.split(',').map(a => a.trim()).filter(Boolean) : []);
                               return list.map((apt: string, idx: number) => (
                                 <span key={idx} className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg text-[10px] font-bold">{apt}</span>
                               ));
                             })()}
                          </div>
                       </div>
                    </div>

                    {itinerary.country_details.days_recommendation && Object.keys(itinerary.country_details.days_recommendation).length > 0 && (
                      <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
                        <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Recommended Duration</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(itinerary.country_details.days_recommendation).map(([days, desc]: [any, any], idx: number) => (
                            <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                              <span className="text-sm font-black text-primary block mb-1">{days} Days</span>
                              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pro Tips Side Card */}
                  <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8 flex flex-col">
                    <div className="flex items-center gap-3 text-primary">
                      <Sparkles className="w-6 h-6" />
                      <h4 className="text-2xl font-black italic uppercase tracking-tight">Pro Tips</h4>
                    </div>
                    <ul className="space-y-4 flex-1">
                      {itinerary.country_details.tips?.map((tip: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed group">
                          <span className="text-primary font-black mt-0.5 opacity-30 group-hover:opacity-100 transition-opacity">0{idx+1}</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-40 space-y-12">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-black italic tracking-tighter">YOU MAY ALSO LIKE</h3>
                <p className="text-zinc-500 mt-2">More adventures curated for your soul.</p>
              </div>
              <Link href="/destinations" className="text-sm font-bold text-primary hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map((item: any) => (
                <Link key={item.id} href={`/itinerary/${item.id}`} className="group space-y-4">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover:shadow-xl transition-all">
                    <Image
                      src={
                        (item.image && typeof item.image === 'string' && item.image.length > 5) ? item.image : 
                        (item.image_url && typeof item.image_url === 'string' && item.image_url.length > 5) ? item.image_url : 
                        "/placeholder.png"
                      }
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold group-hover:text-primary transition-colors">{item.title}</h5>
                    <p className="text-sm text-primary font-black italic">₹{item.sale_price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleAddressSave}
        initialData={currentUserProfile}
      />

      <PaymentStatusModal
        isOpen={paymentModal.isOpen}
        status={paymentModal.status}
        message={paymentModal.message}
        onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(userData) => {
          setIsAuthModalOpen(false) // Close it first
          setIsAuthenticated(true)
          setUser(userData)
          // Small timeout to allow state propagation before triggering next modal
          setTimeout(() => handlePurchase(true), 100)
        }}
      />
    </div>
  )
}
