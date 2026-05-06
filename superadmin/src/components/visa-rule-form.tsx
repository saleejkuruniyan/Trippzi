"use client"

import { useState } from "react"
import { ArrowLeft, Trash2 } from "lucide-react"

interface VisaRuleFormProps {
  initialData?: any
  onSave: (data: any) => Promise<void>
  onCancel: () => void
  onDelete?: (id: number) => Promise<void>
}

export const VisaRuleForm = ({ initialData, onSave, onCancel, onDelete }: VisaRuleFormProps) => {
  const [formData, setFormData] = useState({
    source_country: initialData?.source_country || "India",
    destination_country: initialData?.destination_country || "",
    visa_required: initialData?.visa_required ?? true,
    requirements: initialData?.requirements || "",
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
          <h2 className="font-bold text-lg">{initialData ? "Edit Visa Rule" : "Add New Visa Rule"}</h2>
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
            <label className="text-sm font-medium">Source Country</label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-primary/80"
              value={formData.source_country}
              onChange={e => setFormData({...formData, source_country: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination Country</label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-primary/80"
              value={formData.destination_country}
              onChange={e => setFormData({...formData, destination_country: e.target.value})}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input 
            type="checkbox"
            id="visa_required"
            className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary/80"
            checked={formData.visa_required}
            onChange={e => setFormData({...formData, visa_required: e.target.checked})}
          />
          <label htmlFor="visa_required" className="text-sm font-medium">Visa Required for this route</label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Requirements & Process Details</label>
          <textarea 
            rows={6}
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-primary/80"
            value={formData.requirements}
            onChange={e => setFormData({...formData, requirements: e.target.value})}
            placeholder="Detailed visa process, documentation, costs, etc."
          />
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
            className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/80/20 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Visa Rule"}
          </button>
        </div>
      </form>
    </div>
  )
}
