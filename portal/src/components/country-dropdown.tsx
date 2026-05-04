"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, MapPin, Zap } from "lucide-react"

interface Country {
  id: number;
  name: string;
  flag_url?: string;
  slug: string;
}

interface CountryDropdownProps {
  label: string;
  icon: React.ReactNode;
  selectedCountryName?: string;
  countries: Country[];
  onSelect: (country: Country) => void;
  placeholder?: string;
}

export function CountryDropdown({ 
  label, 
  icon, 
  selectedCountryName, 
  countries, 
  onSelect,
  placeholder = "Select a country"
}: CountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const selectedCountry = countries.find(c => c.name === selectedCountryName)

  // Move India to top and filter by search
  const filteredCountries = countries
    .sort((a, b) => {
      if (a.name === "India") return -1;
      if (b.name === "India") return 1;
      return a.name.localeCompare(b.name);
    })
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="space-y-4" ref={dropdownRef}>
      <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full pl-14 pr-12 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-transparent text-left font-sans font-bold flex items-center justify-between transition-all hover:bg-white dark:hover:bg-zinc-700 shadow-sm"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            {selectedCountry?.flag_url ? (
              <Image src={selectedCountry.flag_url} alt="Flag" width={32} height={32} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                {label.includes("Passport") ? <ShieldCheck className="w-4 h-4 text-blue-600" /> : <MapPin className="w-4 h-4 text-zinc-400" />}
              </div>
            )}
          </div>
          <span className="truncate">{selectedCountry?.name || placeholder}</span>
          <Zap className={`w-4 h-4 text-blue-500 transition-transform duration-300 ${isOpen ? 'rotate-180 scale-125' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-h-72 overflow-hidden flex flex-col p-2 ring-4 ring-black/5"
            >
              <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                <input 
                  autoFocus
                  type="text"
                  placeholder="Search country..."
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-sm font-sans font-bold outline-none border border-transparent focus:border-blue-500"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="overflow-y-auto no-scrollbar flex-1 py-2">
                {filteredCountries.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { onSelect(c); setIsOpen(false); setSearch(""); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left font-sans text-sm font-medium ${
                      selectedCountry?.id === c.id 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/20">
                      <Image src={c.flag_url || "/flags/default.png"} alt={c.name} width={24} height={24} className="object-cover w-full h-full" />
                    </div>
                    {c.name}
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-zinc-400 italic">No countries found</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
