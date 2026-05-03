"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { fetchProfile, updateProfile } from "@/lib/api"
import { User, Phone, MapPin, Save, ShieldCheck } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProfile()
        setProfile(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const data = await updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        profile: {
          phone_number: profile.profile?.phone_number || "",
          address: profile.profile?.address || "",
          city: profile.profile?.city || "",
          country: profile.profile?.country || "",
          zip_code: profile.profile?.zip_code || "",
        }
      })
      setProfile(data)
      setMessage("Profile updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setMessage("Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-black italic tracking-tighter">My Account</h1>
            <p className="text-zinc-500 mt-2">Manage your personal details and checkout information.</p>
          </header>

          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Account Overview */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-500/20">
                  {profile.email[0].toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">{profile.full_name}</h2>
                <p className="text-sm text-zinc-500">{profile.email}</p>
                <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Account Status</span>
                  <p className="text-green-500 font-bold text-sm">Verified Member</p>
                </div>
              </div>
            </div>

            {/* Right: Form Fields */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 space-y-8">
                
                {/* Personal Info */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600">
                    <User className="w-5 h-5" />
                    <h3 className="font-black uppercase text-xs tracking-widest">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">First Name</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={profile.first_name || ""}
                        onChange={e => setProfile({...profile, first_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">Last Name</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={profile.last_name || ""}
                        onChange={e => setProfile({...profile, last_name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                      Phone Number <Phone className="w-3 h-3" />
                    </label>
                    <input 
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={profile.profile?.phone_number || ""}
                      onChange={e => setProfile({...profile, profile: {...profile.profile, phone_number: e.target.value}})}
                    />
                  </div>
                </section>

                {/* Shipping/Billing Address */}
                <section className="space-y-6 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-blue-600">
                    <MapPin className="w-5 h-5" />
                    <h3 className="font-black uppercase text-xs tracking-widest">Checkout Address</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">Street Address</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={profile.profile?.address || ""}
                        onChange={e => setProfile({...profile, profile: {...profile.profile, address: e.target.value}})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">City</label>
                        <input 
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={profile.profile?.city || ""}
                          onChange={e => setProfile({...profile, profile: {...profile.profile, city: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Zip Code</label>
                        <input 
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={profile.profile?.zip_code || ""}
                          onChange={e => setProfile({...profile, profile: {...profile.profile, zip_code: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Data Encryption
                  </div>
                  <div className="flex items-center gap-4">
                    {message && <span className="text-sm font-bold text-blue-600 animate-pulse">{message}</span>}
                    <button 
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-zinc-950 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl shadow-zinc-500/10 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" /> {saving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
