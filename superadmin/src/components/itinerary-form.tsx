"use client"

import { useState } from "react"
import { ArrowLeft, Save, Trash2 } from "lucide-react"

interface ItineraryFormProps {
  initialData?: any
  onSave: (data: any) => Promise<void>
  onCancel: () => void
  onDelete?: (id: number) => Promise<void>
}

export const ItineraryForm = ({ initialData, onSave, onCancel, onDelete }: ItineraryFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    destination: initialData?.destination || "",
    duration_days: initialData?.duration_days || 5,
    regular_price: initialData?.regular_price || 999,
    sale_price: initialData?.sale_price || 799,
    price: initialData?.price || 799,
    description: initialData?.description || "",
    highlights: initialData?.highlights || "",
    is_premium: initialData?.is_premium || false,
    image_url: initialData?.image_url || "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSave(formData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-lg">{initialData ? "Edit Itinerary" : "Add New Itinerary"}</h2>
        </div>
        {initialData && onDelete && (
          <button 
            onClick={() => onDelete(initialData.id)}
            className="flex items-center gap-2 text-red-500 text-sm font-bold hover:underline"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Itinerary Title</label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination Name</label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.destination}
              onChange={e => setFormData({...formData, destination: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (Days)</label>
            <input 
              type="number"
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.duration_days}
              onChange={e => setFormData({...formData, duration_days: parseInt(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Highlights (Short summary)</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.highlights}
              onChange={e => setFormData({...formData, highlights: e.target.value})}
              placeholder="e.g. Bangkok + Phuket + Pattaya"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sale Price ($)</label>
            <input 
              type="number"
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.sale_price}
              onChange={e => setFormData({...formData, sale_price: parseFloat(e.target.value), price: parseFloat(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Regular Price ($)</label>
            <input 
              type="number"
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.regular_price}
              onChange={e => setFormData({...formData, regular_price: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea 
            rows={4}
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="flex items-center gap-4">
          <input 
            type="checkbox"
            id="is_premium"
            className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            checked={formData.is_premium}
            onChange={e => setFormData({...formData, is_premium: e.target.checked})}
          />
          <label htmlFor="is_premium" className="text-sm font-medium">Mark as Premium Itinerary</label>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-sm font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Itinerary"}
          </button>
        </div>
      </form>
    </div>
  )
}
