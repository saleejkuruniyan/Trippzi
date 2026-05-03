import Image from "next/image"
import { LayoutDashboard, FileText, Globe, DollarSign, Users, Lock, LucideIcon, Sparkles } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: LucideIcon
}

export const Sidebar = ({ activeTab, setActiveTab, onLogout }: SidebarProps) => {
  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "itineraries", label: "Itineraries", icon: FileText },
    { id: "custom", label: "Custom Trips", icon: Sparkles },
    { id: "visa", label: "Visa Rules", icon: Globe },
    { id: "sales", label: "Sales", icon: DollarSign },
  ]

  return (
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
          onClick={onLogout}
          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium flex items-center gap-2"
        >
          <Lock className="w-4 h-4" /> Logout Admin
        </button>
      </div>
    </aside>
  )
}
