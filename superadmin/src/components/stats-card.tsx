import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  name: string
  value: string | number
  icon: LucideIcon
  color: string
  index: number
  onClick?: () => void
}

export const StatsCard = ({ name, value, icon: Icon, color, index, onClick }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={onClick}
    className={`p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm ${onClick ? 'cursor-pointer hover:border-blue-500/50 hover:shadow-lg transition-all active:scale-[0.98] group' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <h3 className="text-zinc-500 text-sm font-medium mb-1">{name}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </motion.div>
)
