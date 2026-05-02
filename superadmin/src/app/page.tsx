"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LayoutDashboard, FileText, Globe, DollarSign, Users, Clock, Lock } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchStats, fetchTransactions, fetchUsers, fetchItineraries, fetchVisaRules, login } from "@/lib/api"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authData, setAuthData] = useState({ username: "", password: "" })
  const [authError, setAuthError] = useState("")
  
  const [stats, setStats] = useState([
    { name: "Total Sales", value: "...", icon: DollarSign, color: "text-green-600", key: 'total_sales' },
    { name: "Itineraries", value: "...", icon: FileText, color: "text-blue-600", key: 'total_itineraries' },
    { name: "Active Users", value: "...", icon: Users, color: "text-purple-600", key: 'total_users' },
    { name: "Visa Rules", value: "...", icon: Globe, color: "text-orange-600", key: 'total_visa_rules' },
  ])

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAuthError("")
    
    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    if (!username || !password) {
      setAuthError("Please enter both username and password.")
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
        setAuthError("Invalid credentials or access denied.")
      }
    } catch (err) {
      setAuthError("Login failed. Please check your connection.")
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await fetchStats()
      if (statsData) {
        setStats(prev => prev.map(s => ({
          ...s,
          value: s.name === "Total Sales" ? `$${statsData[s.key] || 0}` : (statsData[s.key] || 0).toString()
        })))
      }
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    const token = localStorage.getItem('trippzi-token')
    if (token) {
      setIsAuthenticated(true)
      loadStats()
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    async function loadTabData() {
      setLoading(true)
      try {
        let res: any
        if (activeTab === 'users') res = await fetchUsers()
        else if (activeTab === 'itineraries') res = await fetchItineraries()
        else if (activeTab === 'visa') res = await fetchVisaRules()
        else if (activeTab === 'sales') res = await fetchTransactions()
        else if (activeTab === 'dashboard') {
          const txns = await fetchTransactions()
          setData(txns.results || [])
          setLoading(false)
          return
        }
        setData(Array.isArray(res?.results) ? res.results : (Array.isArray(res) ? res : []))
      } catch (err) {
        console.error("Failed to load tab data", err)
      }
      setLoading(false)
    }
    loadTabData()
  }, [activeTab, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo.png" alt="Logo" width={64} height={64} className="mb-4" />
            <h1 className="text-2xl font-bold">Trippzi Superadmin</h1>
            <p className="text-zinc-500 text-sm">Enter your superuser credentials</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Username</label>
              <input 
                name="username"
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={authData.username}
                onChange={e => setAuthData({...authData, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Password</label>
              <input 
                name="password"
                type="password" 
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={authData.password}
                onChange={e => setAuthData({...authData, password: e.target.value})}
              />
            </div>
            {authError && <p className="text-red-500 text-xs ml-1">{authError}</p>}
            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "itineraries", label: "Itineraries", icon: FileText },
    { id: "visa", label: "Visa Rules", icon: Globe },
    { id: "sales", label: "Sales", icon: DollarSign },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2">
          <Image src="/logo.png" alt="Trippzi Logo" width={32} height={32} className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl tracking-tight">Trippzi Admin</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === item.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={() => {
              localStorage.removeItem('trippzi-token')
              setIsAuthenticated(false)
            }}
            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium flex items-center gap-2"
          >
            <Lock className="w-4 h-4" /> Logout Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 capitalize">{activeTab}</h1>
              <p className="text-zinc-500">Managing Trippzi Platform Data</p>
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={stat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-zinc-500 text-sm font-medium mb-1">{stat.name}</h3>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="font-bold text-lg">Recent Transactions</h2>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {data.slice(0, 5).map((t) => (
                    <div key={t.id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold">
                          {t.user?.email?.[0].toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold">{t.itinerary?.title}</p>
                          <p className="text-xs text-zinc-500">{t.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-bold text-green-600">${t.amount}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab !== 'dashboard' && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-64 text-zinc-500">Loading data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-sm">ID</th>
                        <th className="px-6 py-4 font-semibold text-sm">Details</th>
                        <th className="px-6 py-4 font-semibold text-sm">Status/Meta</th>
                        <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-zinc-500">#{item.id}</td>
                          <td className="px-6 py-4">
                            <p className="font-medium">
                              {item.first_name || item.last_name 
                                ? `${item.first_name || ""} ${item.last_name || ""}`.trim()
                                : item.username || item.title || item.destination_country || `Record ${item.id}`}
                            </p>
                            <p className="text-xs text-zinc-500">{item.email || item.destination || item.source_country}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 uppercase font-bold">
                              {item.status || (item.is_premium ? 'Premium' : 'Standard') || (item.visa_required ? 'Required' : 'Free')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-blue-600 text-sm font-bold hover:underline">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.length === 0 && <div className="p-12 text-center text-zinc-500 italic">No records found.</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
