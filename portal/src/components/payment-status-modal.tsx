"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface PaymentStatusModalProps {
  isOpen: boolean
  status: 'success' | 'failure' | 'processing'
  message?: string
  onClose: () => void
}

export function PaymentStatusModal({ isOpen, status, message, onClose }: PaymentStatusModalProps) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isOpen && (status === 'success' || status === 'failure')) {
      setCountdown(3)
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            onClose()
            window.location.reload()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isOpen, status, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-10 max-w-md w-full text-center shadow-2xl"
          >
            <div className="mb-6 flex justify-center">
              {status === 'processing' && (
                <div className="w-20 h-20 bg-primary/5 dark:bg-primary/20/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              )}
              {status === 'failure' && (
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              )}
            </div>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">
              {status === 'processing' ? 'Processing Payment' : 
               status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
            </h2>
            
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium">
              {message || (status === 'success' 
                ? 'Your itinerary has been unlocked. Get ready for your next adventure!' 
                : 'There was an issue processing your payment. Please try again.')}
            </p>

            {(status === 'success' || status === 'failure') && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="h-full bg-primary"
                  />
                </div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">
                  Refreshing in {countdown}s...
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
