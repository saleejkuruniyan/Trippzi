"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { generateItinerary, fetchDestinations, fetchSubDestinations } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Sparkles, MapPin, Calendar, Wallet, Zap, Check, ShieldCheck, Heart } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { CountryDropdown } from "@/components/country-dropdown"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function GeneratePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState<any[]>([])
  const [availableDestinations, setAvailableDestinations] = useState<any[]>([])

  const [selectedCountry, setSelectedCountry] = useState<any>(null)
  const [selectedDestinations, setSelectedDestinations] = useState<number[]>([])

  const [formData, setFormData] = useState({
    duration: 5,
    budget: "Budget",
    style: "Backpacking",
    interests: "",
    source_country: "India",
    custom_destination: ""
  })

  const [isOtherOpen, setIsOtherOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    const initData = async () => {
      try {
        const data = await fetchDestinations(true)
        const raw = Array.isArray(data) ? data : data.results || []

        // Get user nationality from profile
        let userNationality = "";
        const userJson = localStorage.getItem('trippzi-user')
        if (userJson) {
          try {
            const u = JSON.parse(userJson)
            // Handle both structure variations
            userNationality = u.profile?.nationality_details?.name || u.nationality_details?.name || "";
          } catch (e) { console.error(e) }
        }

        const sorted = [...raw].sort((a, b) => {
          if (userNationality) {
            if (a.name === userNationality) return -1
            if (b.name === userNationality) return 1
          }
          if (a.name === "India") return -1
          if (b.name === "India") return 1
          return a.name.localeCompare(b.name)
        })

        setCountries(sorted)

        if (userNationality) {
          setFormData(prev => ({ ...prev, source_country: userNationality }))
        }
      } catch (err) {
        console.error("Failed to init generation page", err)
      }
    }

    initData()

    // Listen for storage changes (login/profile updates)
    const handleStorage = () => initData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [])

  const handleCountryChange = async (country: any) => {
    setSelectedCountry(country)
    setSelectedDestinations([])
    setAvailableDestinations([])
    setLoading(true)
    try {
      const data = await fetchSubDestinations(country.slug)
      setAvailableDestinations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleDestination = (id: number) => {
    setSelectedDestinations(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent, force = false) => {
    if (e) e.preventDefault()
    setError(null)
    if (!selectedCountry || (selectedDestinations.length === 0 && !formData.custom_destination)) {
      setError("Please select a destination or enter a custom one")
      return
    }

    const token = localStorage.getItem('trippzi-token')
    if (!token && !force) {
      setIsAuthModalOpen(true)
      return
    }

    setLoading(true)
    try {
      // If we just logged in, save the selected passport country to profile
      if (token && force) {
        const sourceCountryObj = countries.find(c => c.name === formData.source_country)
        if (sourceCountryObj) {
          const { updateProfile } = await import("@/lib/api")
          await updateProfile({ profile: { nationality: sourceCountryObj.id } })
          const userJson = localStorage.getItem('trippzi-user')
          if (userJson) {
            const user = JSON.parse(userJson)
            if (user.profile) {
              user.profile.nationality = sourceCountryObj.id
              localStorage.setItem('trippzi-user', JSON.stringify(user))
              window.dispatchEvent(new Event('storage'))
            }
          }
        }
      }

      const data = await generateItinerary({
        ...formData,
        country_id: selectedCountry.id,
        destination_ids: selectedDestinations
      })
      router.push(`/itinerary/${data.itinerary_id}/preview`)
    } catch (err: any) {
      setError(err.message || "Failed to generate itinerary. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-8 md:p-12 space-y-10">
            <HeaderSection />

            <form onSubmit={handleSubmit} className="space-y-8">
              <CountryDropdown
                label="1. Your Passport Country"
                icon={<ShieldCheck className="w-4 h-4 text-primary/80" />}
                selectedCountryName={formData.source_country}
                countries={countries}
                onSelect={(c) => setFormData({ ...formData, source_country: c.name })}
              />

              <CountryDropdown
                label="2. Select Target Country"
                icon={<MapPin className="w-4 h-4 text-primary/80" />}
                selectedCountryName={selectedCountry?.name}
                countries={countries}
                onSelect={handleCountryChange}
                placeholder="Where are you heading?"
              />

              <AnimatePresence>
                {selectedCountry && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <DestinationSection
                      destinations={availableDestinations}
                      selected={selectedDestinations}
                      onToggle={toggleDestination}
                      isOtherOpen={isOtherOpen}
                      onOtherToggle={() => setIsOtherOpen(!isOtherOpen)}
                      customValue={formData.custom_destination}
                      onCustomChange={(val: string) => setFormData({ ...formData, custom_destination: val })}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <FormInput label="Duration" icon={<Calendar className="w-4 h-4 text-primary/80" />} type="number" value={formData.duration} onChange={(val: string) => setFormData({ ...formData, duration: parseInt(val) || 0 })} />
                      <FormSelect label="Budget" icon={<Wallet className="w-4 h-4 text-primary/80" />} value={formData.budget} options={["Budget", "Mid-range", "Luxury"]} onChange={(val: string) => setFormData({ ...formData, budget: val })} />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500" /> Your Interests</label>
                      <textarea
                        className="w-full px-6 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-transparent focus:border-primary/80 outline-none font-sans font-bold h-24 transition-all"
                        placeholder="e.g. Anime, street food, temples, nightlife..."
                        value={formData.interests}
                        onChange={e => setFormData({ ...formData, interests: e.target.value })}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-6 rounded-[2rem] bg-primary text-white font-black text-xl tracking-tighter hover:bg-primary/90 transition-all shadow-2xl shadow-primary/80/20 active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? <Zap className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                {loading ? "GENERATING..." : "GENERATE ITINERARY"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={() => handleSubmit(undefined, true)} />
    </div>
  )
}

function HeaderSection() {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Trippzi Logo" width={180} height={70} className="h-16 w-auto object-contain logo-primary" />
      </div>
      <h1 className="text-4xl font-black tracking-tighter uppercase">Smart Trip Planner</h1>
      <p className="text-zinc-500 font-medium max-w-sm mx-auto">Create a personalized, high-end itinerary in seconds.</p>
    </div>
  )
}

function DestinationSection({ destinations, selected, onToggle, isOtherOpen, onOtherToggle, customValue, onCustomChange }: any) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary/80" /> 3. Select Destinations
      </label>
      <div className="flex flex-wrap gap-2">
        {destinations.map((dest: any) => (
          <button
            key={dest.id} type="button" onClick={() => onToggle(dest.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${selected.includes(dest.id) ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
          >
            {selected.includes(dest.id) && <Check className="w-4 h-4" />}
            {dest.name}
          </button>
        ))}
        <button
          type="button" onClick={onOtherToggle}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 border-dashed ${isOtherOpen ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}
        >
          Other +
        </button>
      </div>
      {isOtherOpen && (
        <motion.input
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          type="text" placeholder="Enter custom destination name..."
          className="w-full px-6 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 outline-none font-bold"
          value={customValue} onChange={e => onCustomChange(e.target.value)}
        />
      )}
    </div>
  )
}

function FormInput({ label, icon, type, value, onChange }: any) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold flex items-center gap-2">{icon} {label}</label>
      <input
        type={type} className="w-full px-6 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 font-bold"
        value={value} onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function FormSelect({ label, icon, value, options, onChange }: any) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold flex items-center gap-2">{icon} {label}</label>
      <select
        className="w-full px-6 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 font-sans font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/80"
        value={value} onChange={e => onChange(e.target.value)}
      >
        {options.map((opt: string) => <option key={opt} className="font-sans">{opt}</option>)}
      </select>
    </div>
  )
}
