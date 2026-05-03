"use client"

import { useEffect, useState } from "react"
import { fetchMyTrips, createRazorpayOrder, verifyRazorpayPayment } from "@/lib/api"
import { motion } from "framer-motion"
import { MapPin, Calendar, ArrowRight, Zap, Download, Sparkles, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function MyTripsPage() {
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

  const handleUnlock = async (itineraryId: number) => {
    try {
      const order = await createRazorpayOrder(itineraryId)
      
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Trippzi",
        description: "Unlock AI Itinerary",
        order_id: order.order_id,
        handler: async (response: any) => {
          const verify = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
          
          if (verify.status === "success") {
            alert("Payment successful! Full itinerary unlocked.")
            loadTrips()
          }
        },
        prefill: {
          email: order.user_email,
          contact: order.user_phone
        },
        theme: { color: "#2563eb" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed", err)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-3">My Purchases</h1>
          <p className="text-zinc-500">All your curated and custom itineraries in one place.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">No trips found</h2>
            <p className="text-zinc-500 mb-8">You haven't purchased or generated any itineraries yet.</p>
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
                transition={{ delay: idx * 0.1 }}
                className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
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
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                      {trip.is_custom ? 'Custom AI Trip' : 'Curated Plan'}
                    </p>
                    <h3 className="text-xl font-bold truncate">{trip.title}</h3>
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    {trip.is_approved ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-500 text-white">
                        Approved
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {trip.duration_days} Days
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {trip.destination}
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    {(!trip.is_custom || trip.is_owned) ? (
                      <Link 
                        href={`/itinerary/${trip.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black py-3 rounded-2xl font-bold hover:scale-[1.02] transition-transform"
                      >
                        <Sparkles className="w-4 h-4" />
                        View Itinerary
                      </Link>
                    ) : (
                      <button 
                        onClick={() => handleUnlock(trip.id)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                      >
                        <Zap className="w-4 h-4 fill-current" /> Unlock Full Plan (Rs. 99)
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
