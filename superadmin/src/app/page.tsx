"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Sidebar } from "@/components/sidebar"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/data-table"
import { ItineraryForm } from "@/components/itinerary-form"
import { VisaRuleForm } from "@/components/visa-rule-form"
import { 
  fetchStats, fetchTransactions, fetchUsers, fetchItineraries, fetchVisaRules, login,
  createItinerary, updateItinerary, deleteItinerary,
  createVisaRule, updateVisaRule, deleteVisaRule
} from "@/lib/api"
import { DollarSign, FileText, Users, Globe } from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authData, setAuthData] = useState({ username: "", password: "" })
  const [authError, setAuthError] = useState("")
  const [stats, setStats] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    try {
      const res = await login(authData)
      const token = res.access_token || res.access || res.key
      if (token) {
        localStorage.setItem('trippzi-token', token)
        setIsAuthenticated(true)
        loadStats()
      } else {
        setAuthError("Invalid credentials or access denied.")
      }
    } catch (err) { setAuthError("Login failed.") }
  }

  const loadStats = async () => {
    try {
      const s = await fetchStats()
      if (s) setStats([
        { name: "Total Sales", value: `$${s.total_sales}`, icon: DollarSign, color: "text-green-600" },
        { name: "Itineraries", value: s.total_itineraries, icon: FileText, color: "text-blue-600" },
        { name: "Active Users", value: s.total_users, icon: Users, color: "text-purple-600" },
        { name: "Visa Rules", value: s.total_visa_rules, icon: Globe, color: "text-orange-600" },
      ])
    } catch (err) { console.error(err) }
  }

  const loadTabData = async () => {
    setLoading(true)
    try {
      let res: any
      if (activeTab === 'users') res = await fetchUsers()
      else if (activeTab === 'itineraries') res = await fetchItineraries()
      else if (activeTab === 'visa') res = await fetchVisaRules()
      else if (activeTab === 'sales' || activeTab === 'dashboard') res = await fetchTransactions()
      setData(Array.isArray(res?.results) ? res.results : (Array.isArray(res) ? res : []))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => {
    const token = localStorage.getItem('trippzi-token')
    if (token) { setIsAuthenticated(true); loadStats() }
  }, [])

  useEffect(() => {
    if (isAuthenticated) { loadTabData(); setEditingItem(null); setIsCreating(false) }
  }, [activeTab, isAuthenticated])

  const handleSave = async (formData: any) => {
    try {
      if (activeTab === 'itineraries') {
        editingItem ? await updateItinerary(editingItem.id, formData) : await createItinerary(formData)
      } else if (activeTab === 'visa') {
        editingItem ? await updateVisaRule(editingItem.id, formData) : await createVisaRule(formData)
      }
      setEditingItem(null); setIsCreating(false); loadTabData(); loadStats();
    } catch (err) { alert("Failed to save data") }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      if (activeTab === 'itineraries') await deleteItinerary(id)
      else if (activeTab === 'visa') await deleteVisaRule(id)
      setEditingItem(null); loadTabData(); loadStats();
    } catch (err) { alert("Failed to delete") }
  }

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-8">Trippzi Superadmin</h1>
          <input type="text" placeholder="Username" required className="w-full px-4 py-3 rounded-xl border dark:border-zinc-800 dark:bg-zinc-800" value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full px-4 py-3 rounded-xl border dark:border-zinc-800 dark:bg-zinc-800" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} />
          {authError && <p className="text-red-500 text-xs">{authError}</p>}
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold">Sign In</button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => { localStorage.removeItem('trippzi-token'); setIsAuthenticated(false) }} />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-bold mb-2 capitalize">{activeTab}</h1>
            <p className="text-zinc-500">Managing Trippzi Platform Data</p>
          </header>

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, idx) => <StatsCard key={stat.name} {...stat} index={idx} />)}
            </div>
          )}

          {(editingItem || isCreating) ? (
            activeTab === 'itineraries' ? <ItineraryForm initialData={editingItem} onSave={handleSave} onCancel={() => {setEditingItem(null); setIsCreating(false)}} onDelete={handleDelete} /> :
            <VisaRuleForm initialData={editingItem} onSave={handleSave} onCancel={() => {setEditingItem(null); setIsCreating(false)}} onDelete={handleDelete} />
          ) : (
            <DataTable 
              title={activeTab} 
              data={data} 
              loading={loading} 
              onEdit={setEditingItem} 
              onAdd={() => setIsCreating(true)} 
              showAdd={['itineraries', 'visa'].includes(activeTab)} 
              showEdit={['itineraries', 'visa'].includes(activeTab)} 
            />
          )}
        </div>
      </main>
    </div>
  )
}
