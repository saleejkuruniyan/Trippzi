"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin, Phone, Home, Globe, Hash, Zap } from "lucide-react"

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  initialData?: any
}

export function AddressModal({ isOpen, onClose, onSave, initialData }: AddressModalProps) {
  const [formData, setFormData] = useState({
    phone_number: "",
    address: "",
    city: "",
    country: "",
    zip_code: ""
  })
  const [loading, setLoading] = useState(false)

  // Sync with initialData when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        phone_number: initialData.phone_number || "",
        address: initialData.address || "",
        city: initialData.city || "",
        country: initialData.country || "",
        zip_code: initialData.zip_code || ""
      })
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Billing Details</h2>
                  <p className="text-sm text-zinc-500">Required for booklet delivery & tax</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/80 transition-all"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Home className="w-3 h-3" /> Street Address
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/80 transition-all"
                    placeholder="123 Luxury Lane, Apt 4B"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      City
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/80 transition-all"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      Country
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/80 transition-all"
                      placeholder="India"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Pincode / ZIP Code
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/80 transition-all"
                    placeholder="400001"
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-primary text-white p-5 rounded-3xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/80/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Save & Continue to Payment <Zap className="w-5 h-5 fill-current" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
