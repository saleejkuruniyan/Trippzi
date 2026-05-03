"use client"

import Link from "next/link"
import Image from "next/image"
import { Sun, Moon, ShoppingBag, Bookmark, UserCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { googleLogin } from "@/lib/api"
import { AuthModal } from "./auth-modal"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkUser = () => {
      const savedUser = localStorage.getItem('trippzi-user')
      if (savedUser) setUser(JSON.parse(savedUser))
      else setUser(null)
    }
    checkUser()
    window.addEventListener('storage', checkUser)
    return () => window.removeEventListener('storage', checkUser)
  }, [])

  return (
    <>
    <nav className="fixed top-0 w-full z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center text-zinc-900 dark:text-zinc-50">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Trippzi Logo" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="text-xl font-sans font-bold tracking-tight">Trippzi</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/destinations" className="hover:text-blue-600 transition-colors">Destinations</Link>
            <Link href="/how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            {mounted && (
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            
            {mounted && (
              user ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowUserModal(!showUserModal)}
                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white dark:border-zinc-800 shadow-md hover:scale-105 transition-transform"
                  >
                    {user.email[0].toUpperCase()}
                  </button>

                  {showUserModal && (
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {user.first_name || user.last_name 
                            ? `${user.first_name} ${user.last_name}`.trim() 
                            : user.username || user.email.split('@')[0]}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                        <Link 
                          href="/profile"
                          onClick={() => setShowUserModal(false)}
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                        >
                          <UserCircle className="w-4 h-4" /> My Profile
                        </Link>
                        <Link 
                          href="/my-wishlist"
                          onClick={() => setShowUserModal(false)}
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                        >
                          <Bookmark className="w-4 h-4" /> My Wishlist
                        </Link>
                        <Link 
                          href="/my-trips"
                          onClick={() => setShowUserModal(false)}
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                        >
                          <ShoppingBag className="w-4 h-4" /> My Purchases
                        </Link>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setUser(null)
                            setShowUserModal(false)
                            localStorage.removeItem('trippzi-user')
                            localStorage.removeItem('trippzi-token')
                            window.dispatchEvent(new Event('storage'))
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign In
                </button>
              )
            )}

            <Link href="/generate" className="hidden sm:block bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </div>

    </nav>

    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
