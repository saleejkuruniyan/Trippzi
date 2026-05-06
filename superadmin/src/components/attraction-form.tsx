"use client"

import { useState, useEffect } from "react"
import { Save, X, Trash2, Clock, Tag, Calendar } from "lucide-react"
import { fetchAllDestinations } from "@/lib/api"

interface AttractionFormProps {
  initialData?: any
  onSave: (data: any) => void
  onCancel: () => void
  onDelete?: (id: number) => void
}

export const AttractionForm = ({ initialData, onSave, onCancel, onDelete }: AttractionFormProps) => {
  const [destinations, setDestinations] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    destination: initialData?.destination || "",
    description: initialData?.description || "",
    opening_time: initialData?.opening_time || "",
    closing_time: initialData?.closing_time || "",
    suggested_duration: initialData?.suggested_duration || "",
    ticket_price: initialData?.ticket_price || "",
    closing_days: initialData?.closing_days || "",
    image_url: initialData?.image_url || "",
  })

  useEffect(() => {
    fetchAllDestinations().then(res => setDestinations(res || []))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 shadow-2xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">
            {initialData ? "Edit Attraction" : "Add New Attraction"}
          </h2>
          <p className="text-zinc-500 text-sm">Managing points of interest and logistics</p>
        </div>
        <div className="flex gap-3">
          {initialData && onDelete && (
            <button onClick={() => onDelete(initialData.id)} className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={onCancel} className="p-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Attraction Name</label>
            <input 
              type="text" 
              required
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Location / Destination</label>
            <select 
              required
              value={formData.destination} 
              onChange={e => setFormData({ ...formData, destination: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium appearance-none"
            >
              <option value="">Select Destination</option>
              {destinations.map(d => <option key={d.id} value={d.id}>{d.name} ({d.country_name})</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Short Description</label>
          <textarea 
            required
            rows={3}
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
              <Clock className="w-3 h-3 text-primary/80" /> Opening Time
            </label>
            <input 
              type="text" 
              placeholder="09:00 AM"
              value={formData.opening_time} 
              onChange={e => setFormData({ ...formData, opening_time: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
              <Clock className="w-3 h-3 text-red-500" /> Closing Time
            </label>
            <input 
              type="text" 
              placeholder="06:00 PM"
              value={formData.closing_time} 
              onChange={e => setFormData({ ...formData, closing_time: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-primary/80" /> Suggested Stay
            </label>
            <input 
              type="text" 
              placeholder="2 hours"
              value={formData.suggested_duration} 
              onChange={e => setFormData({ ...formData, suggested_duration: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
              <Tag className="w-3 h-3 text-green-500" /> Latest Ticket Prices
            </label>
            <input 
              type="text" 
              placeholder="500 THB or Free"
              value={formData.ticket_price} 
              onChange={e => setFormData({ ...formData, ticket_price: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2 text-red-600">
               Weekly Closure Days
            </label>
            <input 
              type="text" 
              placeholder="Mondays, Public Holidays"
              value={formData.closing_days} 
              onChange={e => setFormData({ ...formData, closing_days: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 text-primary">Spot Image URL (Unsplash)</label>
          <input 
            type="url" 
            value={formData.image_url} 
            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
          />
        </div>

        <button type="submit" className="w-full py-6 bg-primary text-white rounded-[2rem] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/80/20 active:scale-[0.98] transition-all mt-10">
          <Save className="w-6 h-6" /> {initialData ? "Update Attraction" : "Save Attraction"}
        </button>
      </form>
    </div>
  )
}
