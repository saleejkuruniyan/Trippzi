"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldCheck, Sparkles, Zap, Globe } from "lucide-react"
import { fetchCountries, updateProfile } from "@/lib/api"
import { CountryDropdown } from "./country-dropdown"

interface NationalityModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
}

export function NationalityModal({ isOpen, onClose, onSuccess }: NationalityModalProps) {
  const [countries, setCountries] = useState<any[]>([])
  const [selectedCountry, setSelectedCountry] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCountries().then(data => {
        const raw = Array.isArray(data) ? data : data.results || []
        const sorted = [...raw].sort((a, b) => {
          if (a.name === "India") return -1
          if (b.name === "India") return 1
          return a.name.localeCompare(b.name)
        })
        setCountries(sorted)
        // Default to India if available
        const india = sorted.find(c => c.name === "India")
        if (india) setSelectedCountry(india)
      })
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!selectedCountry) return
    setLoading(true)
    try {
      const updatedUser = await updateProfile({ 
        profile: { nationality: selectedCountry.id } 
      })
      if (updatedUser && updatedUser.email) {
        localStorage.setItem('trippzi-user', JSON.stringify(updatedUser))
        window.dispatchEvent(new Event('storage'))
        onSuccess(updatedUser)
        onClose()
      }
    } catch (err) {
      console.error("Failed to save nationality", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
          >
            <div className="relative h-48 bg-gradient-to-br from-primary to-indigo-700 flex flex-col items-center justify-center text-center p-8">
              <div className="absolute inset-0 opacity-10">
                 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 border border-white/30">
                <Globe className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">One Last Step</h2>
              <p className="text-primary/10 text-sm font-medium">To provide accurate visa intelligence, we need your passport country.</p>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <CountryDropdown 
                  label="Select Your Passport Country"
                  icon={<ShieldCheck className="w-4 h-4 text-primary/80" />}
                  selectedCountryName={selectedCountry?.name}
                  countries={countries}
                  onSelect={(c) => setSelectedCountry(c)}
                  placeholder="Which passport do you hold?"
                />

                <div className="p-6 bg-primary/5 dark:bg-primary/20/20 rounded-3xl border border-primary/10 dark:border-primary/20/30 flex items-start gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-primary/20 dark:text-primary/10">Personalized Visa IQ</h4>
                    <p className="text-xs text-primary/90 dark:text-primary/40 leading-relaxed">
                      We'll automatically calculate visa requirements, costs, and processing times specifically for your nationality.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={!selectedCountry || loading}
                className="w-full flex items-center justify-center gap-3 bg-zinc-950 dark:bg-primary text-white py-6 rounded-[2rem] font-black text-xl tracking-tighter hover:bg-primary dark:hover:bg-primary/90 transition-all shadow-xl shadow-primary/80/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Zap className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                {loading ? "SAVING..." : "START EXPLORING"}
              </button>

              <div className="text-center">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                   <ShieldCheck className="w-3 h-3" /> Securely saved to your profile
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
