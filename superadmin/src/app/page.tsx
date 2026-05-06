"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Sidebar } from "@/components/sidebar"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/data-table"
import { ItineraryForm } from "@/components/itinerary-form"
import {
  fetchStats, fetchTransactions, fetchUsers, fetchItineraries, login,
  createItinerary, updateItinerary, deleteItinerary, cloneItinerary,
  fetchSettings, updateSettings,
  fetchCountries, updateCountry, deleteCountry, createCountry,
  fetchDestinations, updateDestination, deleteDestination, createDestination,
  fetchAttractions, updateAttraction, deleteAttraction, createAttraction
} from "@/lib/api"
import { SettingsForm } from "@/components/settings-form"
import { CountryForm } from "@/components/country-form"
import { DestinationForm } from "@/components/destination-form"
import { AttractionForm } from "@/components/attraction-form"
import { IndianRupee, FileText, Users, Globe, Sparkles, MapPin, Camera } from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [authData, setAuthData] = useState({ username: "", password: "" })
  const [authError, setAuthError] = useState("")
  const [stats, setStats] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [settings, setSettings] = useState<any>(null)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAuthError("")
    
    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string || authData.username
    const password = formData.get('password') as string || authData.password

    if (!username || !password) {
      setAuthError("Username and password are required.")
      return
    }

    try {
      const res = await login({ username, password })
      const token = res.access_token || res.access || res.key
      if (token) {
        localStorage.setItem('trippzi-token', token)
        setIsAuthenticated(true)
        loadStats()
      } else {
        setAuthError(res.detail || res.error || "Invalid credentials or access denied.")
      }
    } catch (err) { setAuthError("Login failed.") }
  }

  const loadStats = async () => {
    try {
      const s = await fetchStats()
      if (s) setStats([
        { name: "Total Sales", value: `₹${s.total_sales}`, icon: IndianRupee, color: "text-green-600", tab: "sales" },
        { name: "Total Itineraries", value: s.total_itineraries, icon: FileText, color: "text-primary" },
        { name: "Standard Trips", value: s.total_standard, icon: FileText, color: "text-indigo-600", tab: "itineraries" },
        { name: "Custom Trips", value: s.total_custom, icon: Sparkles, color: "text-purple-600", tab: "custom" },
        { name: "Active Users", value: s.total_users, icon: Users, color: "text-orange-600", tab: "users" },
        { name: "Countries", value: s.total_countries, icon: Globe, color: "text-emerald-600", tab: "countries" },
        { name: "Destinations", value: s.total_destinations, icon: MapPin, color: "text-pink-600", tab: "destinations" },
        { name: "Attractions", value: s.total_attractions, icon: Camera, color: "text-indigo-600", tab: "attractions" },
      ])
    } catch (err) { console.error(err) }
  }

  const loadTabData = useCallback(async (pageNum = 1, search = "") => {
    setLoading(true)
    try {
      let res: any
      if (activeTab === 'users') res = await fetchUsers(pageNum, search)
      else if (activeTab === 'itineraries') res = await fetchItineraries(pageNum, false, search)
      else if (activeTab === 'custom') res = await fetchItineraries(pageNum, true, search)
      else if (activeTab === 'countries') res = await fetchCountries(pageNum, search)
      else if (activeTab === 'destinations') res = await fetchDestinations(pageNum, search)
      else if (activeTab === 'attractions') res = await fetchAttractions(pageNum, search)
      else if (activeTab === 'sales' || activeTab === 'dashboard') res = await fetchTransactions(pageNum, search)
      else if (activeTab === 'settings') {
        const s = await fetchSettings()
        setSettings(s)
        setLoading(false)
        return
      }

      setData(res?.results || [])
      setTotalCount(res?.count || 0)
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [activeTab])

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    loadTabData(1, q)
  }, [loadTabData])

  useEffect(() => {
    const check = () => {
      try {
        const token = localStorage.getItem('trippzi-token')
        setIsAuthenticated(!!token)
      } catch (e) {
        console.error("Auth check failed", e)
      } finally {
        setHasMounted(true)
      }
    }
    
    check()
    window.addEventListener('pageshow', check)
    return () => window.removeEventListener('pageshow', check)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadStats()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage(1)
      loadTabData(1)
      setEditingItem(null)
      setIsCreating(false)
    }
  }, [activeTab, isAuthenticated])

  const handleSave = async (formData: any) => {
    try {
      if (activeTab === 'itineraries' || activeTab === 'custom') {
        editingItem ? await updateItinerary(editingItem.id, formData) : await createItinerary(formData)
      } else if (activeTab === 'countries') {
        editingItem ? await updateCountry(editingItem.id, formData) : await createCountry(formData)
      } else if (activeTab === 'destinations') {
        editingItem ? await updateDestination(editingItem.id, formData) : await createDestination(formData)
      } else if (activeTab === 'attractions') {
        editingItem ? await updateAttraction(editingItem.id, formData) : await createAttraction(formData)
      }
      setEditingItem(null); 
      setIsCreating(false); 
      loadTabData(currentPage, searchQuery); // Maintain current page and search
      loadStats();
      alert("Changes saved successfully!");
    } catch (err: any) { alert("Failed to save data: " + err.message) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      if (activeTab === 'itineraries' || activeTab === 'custom') await deleteItinerary(id)
      else if (activeTab === 'countries') await deleteCountry(id)
      else if (activeTab === 'destinations') await deleteDestination(id)
      else if (activeTab === 'attractions') await deleteAttraction(id)
      setEditingItem(null); loadTabData(); loadStats();
    } catch (err) { alert("Failed to delete") }
  }

  const handleClone = async (item: any) => {
    let copyPdf = false
    if (item.has_pdf) {
      copyPdf = confirm("An existing PDF Booklet was found for this custom trip. Would you like to copy it to the new standard itinerary?")
    } else {
      if (!confirm("This will create a standard copy for you to review. Proceed?")) return
    }
    
    try {
      const newItem = await cloneItinerary(item.id, copyPdf)
      setActiveTab("itineraries") 
      setEditingItem(newItem) 
      loadStats()
    } catch (err) { alert("Failed to clone") }
  }

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 ${!hasMounted ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}>
      {!isAuthenticated ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex justify-center mb-8">
              <Image src="/logo.png" alt="Trippzi" width={48} height={48} className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-2xl font-black text-center mb-2 italic tracking-tighter uppercase">Superadmin Login</h1>
            <p className="text-center text-zinc-500 text-sm mb-8 font-medium">Enter your credentials to manage Trippzi</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                <input 
                  name="username"
                  type="text" 
                  className="w-full px-5 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  placeholder="admin"
                  value={authData.username}
                  onChange={(e) => setAuthData({...authData, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <input 
                  name="password"
                  type="password" 
                  className="w-full px-5 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={authData.password}
                  onChange={(e) => setAuthData({...authData, password: e.target.value})}
                />
              </div>
              {authError && <p className="text-red-600 text-xs font-bold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{authError}</p>}
              <button 
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex h-screen overflow-hidden">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => { localStorage.removeItem('trippzi-token'); setIsAuthenticated(false); }} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">{activeTab}</h2>
                  <p className="text-zinc-500 font-medium">Manage and monitor {activeTab} activity</p>
                </div>
                
                <div className="flex items-center gap-4">
                </div>
              </header>

              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <StatsCard 
                      key={i} 
                      {...stat} 
                      index={i} 
                      onClick={stat.tab ? () => setActiveTab(stat.tab) : undefined}
                    />
                  ))}
                </div>
              )}

              {activeTab !== 'dashboard' && (
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                  {isCreating ? (
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Create New {activeTab.slice(0, -1)}</h3>
                        <button onClick={() => setIsCreating(false)} className="text-zinc-500 font-bold hover:text-zinc-950">Cancel</button>
                      </div>
                      {activeTab === 'itineraries' || activeTab === 'custom' ? (
                        <ItineraryForm onSave={handleSave} isCustom={activeTab === 'custom'} />
                      ) : activeTab === 'countries' ? (
                        <CountryForm onSave={handleSave} />
                      ) : activeTab === 'destinations' ? (
                        <DestinationForm onSave={handleSave} />
                      ) : activeTab === 'attractions' ? (
                        <AttractionForm onSave={handleSave} />
                      ) : null}
                    </div>
                  ) : editingItem ? (
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Edit {activeTab.slice(0, -1)}</h3>
                        <button onClick={() => setEditingItem(null)} className="text-zinc-500 font-bold hover:text-zinc-950">Cancel</button>
                      </div>
                      {activeTab === 'itineraries' || activeTab === 'custom' ? (
                        <ItineraryForm initialData={editingItem} onSave={handleSave} isCustom={activeTab === 'custom'} />
                      ) : activeTab === 'countries' ? (
                        <CountryForm initialData={editingItem} onSave={handleSave} />
                      ) : activeTab === 'destinations' ? (
                        <DestinationForm initialData={editingItem} onSave={handleSave} />
                      ) : activeTab === 'attractions' ? (
                        <AttractionForm initialData={editingItem} onSave={handleSave} />
                      ) : null}
                    </div>
                  ) : activeTab === 'settings' ? (
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Site Settings</h3>
                      </div>
                      <SettingsForm initialData={settings} onSave={async (val) => {
                        await updateSettings(val)
                        const s = await fetchSettings()
                        setSettings(s)
                        alert("Settings updated")
                      }} />
                    </div>
                  ) : (
                    <DataTable 
                      title={activeTab} 
                      data={data} 
                      loading={loading}
                      onEdit={setEditingItem}
                      onDelete={handleDelete}
                      onAdd={() => { setEditingItem(null); setIsCreating(true); }}
                      onClone={handleClone}
                      currentPage={currentPage}
                      totalCount={totalCount}
                      onPageChange={(p) => {
                          setCurrentPage(p)
                          loadTabData(p)
                      }}
                      onSearch={handleSearch}
                    />
                  )}
                </div>
              )}
              
              {/* Redundant pagination removed */}
            </div>
          </main>
        </div>
      )}
    </div>
  )
}
