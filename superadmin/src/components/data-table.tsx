"use client"

import { useState, useEffect } from "react"
import { Search, Plus, ChevronLeft, ChevronRight, Filter, MoreHorizontal, Globe, MapPin, Camera, Star, CheckCircle2, Clock } from "lucide-react"

interface DataTableProps {
  title: string
  data: any[]
  loading?: boolean
  onEdit?: (item: any) => void
  onDelete?: (id: number) => void
  onAdd?: () => void
  onClone?: (item: any) => void
  onPageChange?: (page: number) => void
  onSearch?: (query: string) => void
  currentPage?: number
  totalCount?: number
}

export const DataTable = ({ 
  title, 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  onAdd,
  onClone,
  onPageChange,
  onSearch,
  currentPage = 1,
  totalCount = 0
}: DataTableProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const showEdit = !!onEdit
  const pageSize = 10
  const totalPages = Math.ceil(totalCount / pageSize)

  // Internal search effect with debounce
  useEffect(() => {
    if (!onSearch) return
    const timer = setTimeout(() => {
      onSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, onSearch])

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
      {/* Table Header with Search and Add */}
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            {title.toLowerCase().includes('itineraries') ? <Globe className="w-5 h-5 text-blue-600" /> :
             title.toLowerCase().includes('destinations') ? <MapPin className="w-5 h-5 text-blue-600" /> :
             title.toLowerCase().includes('attractions') ? <Camera className="w-5 h-5 text-blue-600" /> :
             <Filter className="w-5 h-5 text-blue-600" />}
          </div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter">{title}</h3>
          <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black px-2 py-0.5 rounded-full">
            {totalCount} RECORDS
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onSearch && (
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder={`Search ${title}...`}
                className="pl-11 pr-6 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-transparent focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 rounded-xl outline-none text-sm transition-all w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          {onAdd && (
            <button 
              onClick={onAdd}
              className="bg-zinc-950 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl font-black italic text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add New
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-400 uppercase text-[10px] font-black tracking-widest">
              <th className="px-6 py-4 font-semibold text-sm">ID</th>
              {title.toLowerCase() === 'sales' && <th className="px-6 py-4 font-semibold text-sm">Customer</th>}
              {['itineraries', 'custom'].includes(title.toLowerCase()) && <th className="px-6 py-4 font-semibold text-sm">Country</th>}
              <th className="px-6 py-4 font-semibold text-sm">Name/Details</th>
              {title.toLowerCase() === 'users' && (
                <>
                  <th className="px-6 py-4 font-semibold text-sm">Trips</th>
                  <th className="px-6 py-4 font-semibold text-sm">Purchases</th>
                  <th className="px-6 py-4 font-semibold text-sm">Total Spent</th>
                </>
              )}
              {title.toLowerCase() === 'countries' && (
                <>
                  <th className="px-6 py-4 font-semibold text-sm text-center">Itineraries</th>
                  <th className="px-6 py-4 font-semibold text-sm text-center">Destinations</th>
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
              {['itineraries', 'custom'].includes(title.toLowerCase()) && (
                <th className="px-6 py-4 font-semibold text-sm text-center">Price</th>
              )}
              {['itineraries', 'custom'].includes(title.toLowerCase()) && (
                <th className="px-6 py-4 font-semibold text-sm">Status/Meta</th>
              )}
              {showEdit && title.toLowerCase() !== 'users' && <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>}
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

                      {['itineraries', 'custom'].includes(title.toLowerCase()) && (
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium">{item.country_details?.name || item.country_name || 'N/A'}</span>
                        </td>
                      )}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {title.toLowerCase() === 'countries' && item.flag_url && (
                             <img src={item.flag_url} className="w-6 h-4 object-cover rounded shadow-sm" alt="" />
                          )}
                          <div>
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
                          </div>
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

                      {title.toLowerCase() === 'countries' && (
                        <>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-black text-blue-600">{item.itineraries_count || 0}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-black text-zinc-400">{item.destinations?.length || 0}</span>
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

                      {['itineraries', 'custom'].includes(title.toLowerCase()) && (
                        <td className="px-6 py-4 text-center">
                           <p className="text-sm font-black text-blue-600">₹{item.price}</p>
                           {item.sale_price < item.regular_price && (
                             <p className="text-[9px] text-zinc-400 line-through">₹{item.regular_price}</p>
                           )}
                        </td>
                      )}

                      {['itineraries', 'custom'].includes(title.toLowerCase()) && (
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {item.is_approved !== undefined && (
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 ${item.is_approved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                {item.is_approved ? <CheckCircle2 className="w-2 h-2" /> : <Clock className="w-2 h-2" />}
                                {item.is_approved ? 'Approved' : 'Pending'}
                              </span>
                            )}
                            {item.is_premium && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase font-black italic tracking-tighter flex items-center gap-1">
                                <Star className="w-2 h-2 fill-current" /> Premium
                              </span>
                            )}
                            {item.is_custom && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 uppercase font-bold">
                                Custom
                              </span>
                            )}
                            {!item.is_premium && !item.is_custom && item.is_approved !== undefined && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase font-bold">
                                Standard
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {showEdit && title.toLowerCase() !== 'users' && (
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                          {item.is_custom && onClone && (
                            <button 
                              onClick={() => onClone(item)}
                              className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-green-100 transition-colors"
                            >
                              Promote
                            </button>
                          )}
                          <button 
                            onClick={() => onEdit?.(item)}
                            className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition-colors"
                          >
                            Edit
                          </button>
                          {onDelete && (
                            <button 
                              onClick={() => onDelete(item.id)}
                              className="text-red-400 hover:text-red-600 p-2 transition-colors"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          )}
                        </td>
                      )}
              </tr>
            ))}
            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={10} className="px-6 py-20 text-center text-zinc-400 font-medium italic">
                  No records found in {title}...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Pagination */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-800/10">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
