"use client"

import { useEffect, useState } from "react"
import { fetchMyTrips, createRazorpayOrder, verifyRazorpayPayment } from "@/lib/api"
import { motion } from "framer-motion"
import { MapPin, Calendar, ArrowRight, Zap, Download, Sparkles, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useRouter } from "next/navigation"
import { AddressModal } from "@/components/address-modal"
import { PaymentStatusModal } from "@/components/payment-status-modal"

export default function MyTripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const data = await fetchMyTrips()
      setTrips(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [pendingUnlockId, setPendingUnlockId] = useState<number | null>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean,
    status: 'success' | 'failure' | 'processing',
    message?: string
  }>({ isOpen: false, status: 'processing' })

  const handleUnlock = async (itineraryId: number) => {
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
        setPendingUnlockId(itineraryId)
        setIsAddressModalOpen(true)
        return
      }

      await triggerPayment(itineraryId)
    } catch (err) {
      console.error("Unlock check failed", err)
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
      if (pendingUnlockId) {
        await triggerPayment(pendingUnlockId)
        setPendingUnlockId(null)
      }
    } catch (err) {
      alert("Failed to update address. Please try again.")
    }
  }

  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async (itineraryId: number) => {
    setIsDownloading(true)
    try {
      const { downloadItineraryPDF } = await import("@/lib/api")
      const { pdf_url } = await downloadItineraryPDF(itineraryId)
      window.open(pdf_url, '_blank')
    } catch (err: any) {
      const msg = err.instructions ? `${err.message}\n\nTIP: ${err.instructions}` : err.message;
      alert(msg || "Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false)
    }
  }

  const triggerPayment = async (itineraryId: number) => {
    setPaymentModal({ isOpen: true, status: 'processing', message: 'Initializing secure payment...' })
    try {
      const order = await createRazorpayOrder(itineraryId)
      
      if (order.status === 'mock_success') {
        setPaymentModal({ isOpen: true, status: 'success', message: 'Mock payment successful!' })
        return
      }

      if (order.error) {
        setPaymentModal({ isOpen: true, status: 'failure', message: order.error })
        return
      }

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Trippzi",
        description: `Unlock Itinerary: ${order.itinerary_title}`,
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
        theme: { color: "#2563eb" }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error(err)
      setPaymentModal({ isOpen: true, status: 'failure', message: 'Payment failed to initialize' })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-3">My Itineraries</h1>
            <p className="text-zinc-500">All your AI-generated and curated itineraries in one place.</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : trips.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
              <Sparkles className="w-16 h-16 text-zinc-300 mx-auto mb-6" />
              <h2 className="text-xl font-bold mb-2">No itineraries yet</h2>
              <p className="text-zinc-500 mb-8">Generate your first custom trip or explore curated ones.</p>
              <Link href="/destinations" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all">
                Explore Destinations
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip, idx) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="group bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col"
                >
                  <div 
                    onClick={() => router.push(trip.is_owned ? `/itinerary/${trip.id}` : `/itinerary/${trip.id}/preview`)}
                    className="cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <Image 
                          src={trip.image_url || trip.image || "/placeholder.png"} 
                          alt={trip.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                          {trip.is_custom ? 'Custom AI Trip' : 'Curated Plan'}
                        </p>
                        <h3 className="text-xl font-bold truncate">{trip.title}</h3>
                      </div>
                    </div>

                    <div className="p-6 pb-0">
                      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {trip.duration_days} Days
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {trip.destination}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-auto" onClick={e => e.stopPropagation()}>
                    <div className="pt-4 space-y-3">
                      {trip.is_owned ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => router.push(`/itinerary/${trip.id}`)}
                            className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black py-3 rounded-2xl font-bold hover:scale-[1.02] transition-transform"
                          >
                            <Sparkles className="w-4 h-4" />
                            View
                          </button>
                          <button 
                            onClick={() => handleDownload(trip.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white py-3 rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                          >
                            <Download className="w-4 h-4" />
                            Booklet
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleUnlock(trip.id)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                          <Zap className="w-4 h-4 fill-current" /> Unlock Full Plan (₹{trip.sale_price})
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
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
      <Footer />
    </div>
  )
}
