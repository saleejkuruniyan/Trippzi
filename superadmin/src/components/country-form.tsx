"use client"

import { useState } from "react"
import { Save, X, Trash2, Globe, Plane, Clock, Info, Calendar, Plus } from "lucide-react"

interface CountryFormProps {
  initialData?: any
  onSave: (data: any) => void
  onCancel: () => void
  onDelete?: (id: number) => void
}

export const CountryForm = ({ initialData, onSave, onCancel, onDelete }: CountryFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    best_time: initialData?.best_time || "",
    visa_process: initialData?.visa_process || "",
    airports: Array.isArray(initialData?.airports) ? initialData.airports.join(", ") : "",
    tips: Array.isArray(initialData?.tips) ? initialData.tips.join("\n") : "",
    image_url: initialData?.image_url || "",
    flag_url: initialData?.flag_url || "",
  })

  // Days recommendation is a dict { "3": "Short stay", "5": "Ideal" }
  const [daysRec, setDaysRec] = useState<any[]>(
    initialData?.days_recommendation 
      ? Object.entries(initialData.days_recommendation).map(([days, desc]: [string, any]) => ({ days, desc }))
      : [{ days: "", desc: "" }]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert daysRec array back to object
    const days_recommendation: any = {}
    daysRec.forEach(item => {
      if (item.days && item.desc) {
        days_recommendation[item.days] = item.desc
      }
    })

    const submissionData = {
      ...formData,
      airports: formData.airports.split(",").map((s: string) => s.trim()).filter(Boolean),
      tips: formData.tips.split("\n").map((s: string) => s.trim()).filter(Boolean),
      days_recommendation
    }
    onSave(submissionData)
  }

  const addDayRec = () => setDaysRec([...daysRec, { days: "", desc: "" }])
  const removeDayRec = (index: number) => setDaysRec(daysRec.filter((_, i) => i !== index))
  const updateDayRec = (index: number, field: string, value: string) => {
    const newRec = [...daysRec]
    newRec[index] = { ...newRec[index], [field]: value }
    setDaysRec(newRec)
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 shadow-2xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">
            {initialData ? "Edit Country" : "Add New Country"}
          </h2>
          <p className="text-zinc-500 text-sm">Managing global travel guide content</p>
        </div>
        <div className="flex gap-3">
          {initialData && onDelete && (
            <button type="button" onClick={() => onDelete(initialData.id)} className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button type="button" onClick={onCancel} className="p-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Country Name</label>
            <input 
              type="text" 
              required
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Major Airports (comma separated)</label>
            <input 
              type="text" 
              value={formData.airports} 
              onChange={e => setFormData({ ...formData, airports: e.target.value })}
              placeholder="BKK, DMK, HKT"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Engaging Description</label>
          <textarea 
            required
            rows={3}
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
              <Clock className="w-3 h-3 text-primary/80" /> Best Time to Visit
            </label>
            <textarea 
              rows={4}
              value={formData.best_time} 
              onChange={e => setFormData({ ...formData, best_time: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
              <Globe className="w-3 h-3 text-primary/80" /> Visa Process Overview
            </label>
            <textarea 
              rows={4}
              value={formData.visa_process} 
              onChange={e => setFormData({ ...formData, visa_process: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium resize-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
            <Calendar className="w-3 h-3 text-primary/80" /> Duration Recommendations
          </label>
          <div className="space-y-3">
            {daysRec.map((rec, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <input 
                  type="text" 
                  placeholder="Days (e.g. 3)"
                  value={rec.days}
                  onChange={e => updateDayRec(idx, 'days', e.target.value)}
                  className="w-24 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/80 transition-all font-bold text-sm"
                />
                <input 
                  type="text" 
                  placeholder="Recommendation description..."
                  value={rec.desc}
                  onChange={e => updateDayRec(idx, 'desc', e.target.value)}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/80 transition-all text-sm font-medium"
                />
                <button type="button" onClick={() => removeDayRec(idx)} className="p-3 text-zinc-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={addDayRec}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/90 ml-1"
            >
              <Plus className="w-3 h-3" /> Add Recommendation
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
            <Info className="w-3 h-3 text-primary/80" /> Pro Tips (one per line)
          </label>
          <textarea 
            rows={4}
            value={formData.tips} 
            onChange={e => setFormData({ ...formData, tips: e.target.value })}
            placeholder="Respect local customs&#10;Carry cash for markets"
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 text-primary">Hero Image URL (Unsplash)</label>
            <input 
              type="url" 
              value={formData.image_url} 
              onChange={e => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Flag Icon URL</label>
            <input 
              type="url" 
              value={formData.flag_url} 
              onChange={e => setFormData({ ...formData, flag_url: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
          </div>
        </div>

        <button type="submit" className="w-full py-6 bg-primary text-white rounded-[2rem] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/80/20 active:scale-[0.98] transition-all mt-10">
          <Save className="w-6 h-6" /> {initialData ? "Update Country Data" : "Initialize Country"}
        </button>
      </form>
    </div>
  )
}
