"use client"

import { useState, useEffect } from "react"
import { Save, X, Trash2, MapPin, Sparkles } from "lucide-react"
import { fetchAllCountries } from "@/lib/api"

interface DestinationFormProps {
  initialData?: any
  onSave: (data: any) => void
  onCancel: () => void
  onDelete?: (id: number) => void
}

export const DestinationForm = ({ initialData, onSave, onCancel, onDelete }: DestinationFormProps) => {
  const [countries, setCountries] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    country: initialData?.country || "",
    description: initialData?.description || "",
    culture: initialData?.culture || "",
    image_url: initialData?.image_url || "",
  })

  useEffect(() => {
    fetchAllCountries().then(res => setCountries(res || []))
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
            {initialData ? "Edit Destination" : "Add New Destination"}
          </h2>
          <p className="text-zinc-500 text-sm">Managing specific tourist hubs and heritage</p>
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
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Destination Name</label>
            <input 
              type="text" 
              required
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Parent Country</label>
            <select 
              required
              value={formData.country} 
              onChange={e => setFormData({ ...formData, country: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium appearance-none"
            >
              <option value="">Select Country</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Short Introduction</label>
          <textarea 
            required
            rows={2}
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary/80" /> Culture & Heritage Deep-Dive
          </label>
          <textarea 
            rows={6}
            value={formData.culture} 
            onChange={e => setFormData({ ...formData, culture: e.target.value })}
            placeholder="Describe the unique traditions, food, and local life..."
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 text-primary">Primary Image URL</label>
          <input 
            type="url" 
            value={formData.image_url} 
            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
          />
        </div>

        <button type="submit" className="w-full py-6 bg-primary text-white rounded-[2rem] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/80/20 active:scale-[0.98] transition-all mt-10">
          <Save className="w-6 h-6" /> {initialData ? "Update Destination" : "Save Destination"}
        </button>
      </form>
    </div>
  )
}
