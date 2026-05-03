"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"

interface DataTableProps {
  title: string
  data: any[]
  loading: boolean
  onEdit?: (item: any) => void
  onAdd: () => void
  showAdd?: boolean
  showEdit?: boolean
}

export const DataTable = ({ title, data, loading, onEdit, onAdd, showAdd = true, showEdit = true }: DataTableProps) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px]">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <h2 className="font-bold text-lg capitalize">{title}</h2>
        {showAdd && (
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

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
                {showEdit && <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <th className="px-6 py-4 font-semibold text-sm text-zinc-500">#{item.id}</th>
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
                            {item.status || (item.is_premium ? 'Premium' : 'Standard') || (item.visa_required !== undefined ? (item.visa_required ? 'Required' : 'Free') : 'N/A')}
                          </span>
                        </td>
                        {showEdit && (
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => onEdit?.(item)}
                              className="text-blue-600 text-sm font-bold hover:underline"
                            >
                              Edit
                            </button>
                          </td>
                        )}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && <div className="p-12 text-center text-zinc-500 italic">No records found.</div>}
        </div>
      )}
    </div>
  )
}
