"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, ShieldCheck } from "lucide-react"
import { useGoogleLogin } from '@react-oauth/google'
import { googleLogin } from "@/lib/api"
import Image from "next/image"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (user: any) => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const data = await googleLogin(tokenResponse.access_token)
        const token = data.access_token || data.access
        const userData = data.user
        
        if (token && userData) {
          localStorage.setItem('trippzi-user', JSON.stringify(userData))
          localStorage.setItem('trippzi-token', token)
          window.dispatchEvent(new Event('storage'))
          if (onSuccess) onSuccess(userData)
          onClose()
        }
      } catch (err) {
        console.error("Login failed", err)
      }
    },
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
          >
            {/* Header with Background */}
            <div className="relative h-32 bg-blue-600 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              </div>
              <Image src="/logo.png" alt="Trippzi" width={48} height={48} className="brightness-0 invert relative z-10" />
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-10 text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to Trippzi</h2>
              <p className="text-zinc-500 text-sm mb-10">Sign in to unlock personalized itineraries and manage your purchases.</p>

              <button 
                onClick={() => login()}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 py-4 rounded-2xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all mb-6 group shadow-sm"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3 text-green-500" /> Secure Login
                  <span className="mx-1">•</span>
                  <Sparkles className="w-3 h-3 text-blue-500" /> One-click setup
                </div>
                <p className="text-[10px] text-zinc-400 max-w-[200px] mx-auto">
                  By continuing, you agree to Trippzi's Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
