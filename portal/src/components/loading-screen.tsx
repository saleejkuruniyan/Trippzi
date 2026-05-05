"use client"

import { motion } from "framer-motion"

interface LoadingScreenProps {
  message?: string;
  color?: string;
}

export function LoadingScreen({ message, color = "blue-600" }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div className={`w-16 h-16 rounded-full border-4 border-zinc-200 dark:border-zinc-800 border-t-${color} animate-spin`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full bg-${color} animate-pulse`} />
        </div>
      </motion.div>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-sm font-bold text-zinc-500 uppercase tracking-widest animate-pulse"
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}
