"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, ChevronLeft, ChevronRight, Search } from "lucide-react"

interface DataTableProps {
  title: string
  data: any[]
  loading: boolean
  onEdit?: (item: any) => void
  onAdd: () => void
  showAdd?: boolean
  showEdit?: boolean
  currentPage: number
  totalCount: number
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  onClone?: (id: number) => void
}

export const DataTable = ({ 
  title, data, loading, onEdit, onAdd, 
  showAdd = true, showEdit = true,
  currentPage, totalCount, onPageChange, onSearch, onClone
}: DataTableProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const totalPages = Math.ceil(totalCount / 10) 

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px]">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="font-bold text-lg capitalize">{title}</h2>
        
        <div className="flex-1 max-w-md w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder={`Search ${title}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

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
                {title.toLowerCase() === 'sales' && <th className="px-6 py-4 font-semibold text-sm">User</th>}
                <th className="px-6 py-4 font-semibold text-sm">
                  {['countries', 'destinations', 'attractions'].includes(title.toLowerCase()) ? 'Name' : (title.toLowerCase() === 'sales' ? 'Itinerary' : 'Details')}
                </th>
                {title.toLowerCase() === 'users' && (
                  <>
                    <th className="px-6 py-4 font-semibold text-sm">Custom Trips</th>
                    <th className="px-6 py-4 font-semibold text-sm">Purchases</th>
                    <th className="px-6 py-4 font-semibold text-sm">Total Spent</th>
                  </>
                )}
                {['destinations', 'attractions'].includes(title.toLowerCase()) && (
                  <th className="px-6 py-4 font-semibold text-sm">
                    {title.toLowerCase() === 'destinations' ? 'Country' : 'Destination'}
                  </th>
                )}
                {title.toLowerCase() === 'sales' && (
                  <>
                    <th className="px-6 py-4 font-semibold text-sm">Amount</th>
                    <th className="px-6 py-4 font-semibold text-sm">Date & Time</th>
                    <th className="px-6 py-4 font-semibold text-sm">Status</th>
                  </>
                )}
                {!['users', 'countries', 'destinations', 'attractions', 'sales'].includes(title.toLowerCase()) && <th className="px-6 py-4 font-semibold text-sm">Status/Meta</th>}
                {showEdit && <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <th className="px-6 py-4 font-semibold text-sm text-zinc-500">#{item.id}</th>
                        {title.toLowerCase() === 'sales' && (
                          <td className="px-6 py-4">
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.user_full_name}</p>
                            <p className="text-xs text-zinc-500">{item.user_email}</p>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <p className="font-medium">
                            {title.toLowerCase() === 'sales' 
                              ? (item.itinerary_title || "Unknown")
                              : (item.first_name || item.last_name 
                                  ? `${item.first_name || ""} ${item.last_name || ""}`.trim()
                                  : item.name || item.title || item.itinerary_title || item.username || item.destination_country || `Record ${item.id}`)}
                          </p>
                          <div className="text-xs text-zinc-500">
                            {title.toLowerCase() === 'sales'
                              ? (<div className="mt-1 flex items-center gap-1.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${item.itinerary_is_custom ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                      {item.itinerary_is_custom ? 'Custom' : 'Curated'}
                                    </span>
                                    <span className="text-zinc-400 font-bold">#{item.itinerary_id}</span>
                                  </div>)
                              : (item.email || item.user_email || item.destination || item.source_country)}
                          </div>
                        </td>
                        {title.toLowerCase() === 'users' && (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-black ${item.custom_itineraries_count > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`}>
                                  {item.custom_itineraries_count}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">Trips</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm font-black ${item.purchases_count > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                                {item.purchases_count}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm font-black ${item.total_spent > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`}>
                                ₹{item.total_spent}
                              </span>
                            </td>
                          </>
                        )}
                        {['destinations', 'attractions'].includes(title.toLowerCase()) && (
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                               {title.toLowerCase() === 'attractions' ? (
                                 <>
                                   <span className="text-sm font-medium">{item.destination_name}</span>
                                   <span className="text-xs text-zinc-400 font-medium">{item.country_name}</span>
                                 </>
                               ) : (
                                 <span className="text-sm font-medium">{item.country_name}</span>
                               )}
                             </div>
                             {!item.country_name && !item.destination_name && <span className="text-zinc-300 italic text-xs">N/A</span>}
                          </td>
                        )}
                        {title.toLowerCase() === 'sales' && (
                          <>
                            <td className="px-6 py-4">
                              <p className="font-black text-blue-600 dark:text-blue-400">
                                ₹{item.amount}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium">{new Date(item.created_at).toLocaleDateString()}</p>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase">{new Date(item.created_at).toLocaleTimeString()}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {item.status}
                              </span>
                            </td>
                          </>
                        )}
                        {!['users', 'countries', 'destinations', 'attractions', 'sales'].includes(title.toLowerCase()) && (
                          <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {item.is_custom !== undefined && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.is_approved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                {item.is_approved ? 'Approved' : 'Pending'}
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 uppercase font-bold">
                              {item.status || 
                               (item.is_custom ? 'Custom' : (item.is_premium ? 'Premium' : 'Standard')) || 
                               (item.visa_required !== undefined ? (item.visa_required ? 'Required' : 'Free') : 'N/A')}
                            </span>
                          </div>
                        </td>
                        )}
                        {showEdit && (
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                            {item.is_custom && onClone && (
                              <button 
                                onClick={() => onClone(item)}
                                className="text-green-600 text-sm font-bold hover:underline"
                              >
                                Promote
                              </button>
                            )}
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
          
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
              <p className="text-xs text-zinc-500 font-medium">
                Page {currentPage} of {totalPages} <span className="mx-2">•</span> {totalCount} total items
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage <= 1}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
