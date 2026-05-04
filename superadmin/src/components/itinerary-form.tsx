"use client"

import { useState } from "react"
import { ArrowLeft, Save, Trash2, Plus, X, Clock, MapPin, Image as ImageIcon, Navigation, Ruler, CreditCard, Search } from "lucide-react"

interface Activity {
  time: string
  activity: string
  location: string
  description: string
  image_url?: string
  opening_time?: string
  closing_time?: string
  duration_at_spot?: string
  cost_estimate?: string
  transport_to_next?: string
  time_to_next?: string
  distance_to_next?: string
  unsplash_query?: string
}

interface Day {
  day: number
  day_number?: number
  theme: string
  activities: Activity[]
}

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
    is_custom: initialData?.is_custom || false,
    is_approved: initialData?.is_approved ?? (!initialData?.is_custom),
    image_url: initialData?.image_url || "",
    content: initialData?.content || initialData?.days || []
  })
  const [submitting, setSubmitting] = useState(false)
  const [activeDayIndex, setActiveDayIndex] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSave(formData)
    } finally {
      setSubmitting(false)
    }
  }

  const addDay = () => {
    const newDay: Day = {
      day: formData.content.length + 1,
      day_number: formData.content.length + 1,
      theme: "New Day Theme",
      activities: []
    }
    setFormData({ ...formData, content: [...formData.content, newDay] })
    setActiveDayIndex(formData.content.length)
  }

  const removeDay = (index: number) => {
    const newContent = formData.content.filter((_: any, i: number) => i !== index)
      .map((day: any, i: number) => ({ ...day, day: i + 1, day_number: i + 1 }))
    setFormData({ ...formData, content: newContent })
    if (activeDayIndex >= newContent.length) setActiveDayIndex(Math.max(0, newContent.length - 1))
  }

  const updateDayTheme = (index: number, theme: string) => {
    const newContent = [...formData.content]
    newContent[index] = { ...newContent[index], theme }
    setFormData({ ...formData, content: newContent })
  }

  const addActivity = (dayIndex: number) => {
    const newActivity: Activity = {
      time: "09:00 AM",
      activity: "New Activity",
      location: "",
      description: ""
    }
    const newContent = [...formData.content]
    newContent[dayIndex] = { 
      ...newContent[dayIndex], 
      activities: [...newContent[dayIndex].activities, newActivity] 
    }
    setFormData({ ...formData, content: newContent })
  }

  const removeActivity = (dayIndex: number, actIndex: number) => {
    const newContent = [...formData.content]
    newContent[dayIndex] = {
      ...newContent[dayIndex],
      activities: newContent[dayIndex].activities.filter((_: any, i: number) => i !== actIndex)
    }
    setFormData({ ...formData, content: newContent })
  }

  const updateActivity = (dayIndex: number, actIndex: number, field: keyof Activity, value: string) => {
    const newContent = [...formData.content]
    const newActivities = [...newContent[dayIndex].activities]
    newActivities[actIndex] = { ...newActivities[actIndex], [field]: value }
    newContent[dayIndex] = { ...newContent[dayIndex], activities: newActivities }
    setFormData({ ...formData, content: newContent })
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[85vh]">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-lg">{initialData ? `Edit: ${formData.title}` : "Add New Itinerary"}</h2>
        </div>
        <div className="flex items-center gap-4">
          {initialData && onDelete && (
            <button 
              onClick={() => onDelete(initialData.id)}
              className="flex items-center gap-2 text-red-500 text-sm font-bold hover:underline px-4"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-12">
        {/* Basic Info Section */}
        <section className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Itinerary Title</label>
                  <input required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <input required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (Days)</label>
                  <input type="number" required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sale Price (₹)</label>
                  <input type="number" required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: parseFloat(e.target.value), price: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Regular Price (₹)</label>
                  <input type="number" required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.regular_price} onChange={e => setFormData({...formData, regular_price: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
               <label className="text-sm font-medium">Cover Image URL</label>
               <div className="aspect-[4/3] rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden relative group">
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <span className="text-xs">No image provided</span>
                    </div>
                  )}
               </div>
               <input 
                  className="w-full px-4 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none" 
                  value={formData.image_url} 
                  onChange={e => setFormData({...formData, image_url: e.target.value})} 
                  placeholder="https://images.unsplash.com/..."
               />
            </div>
          </div>
        </section>

        {/* Visibility & Flags */}
        <section className="p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="flex items-center gap-3">
              <input type="checkbox" id="is_approved" className="w-5 h-5 rounded border-zinc-300 text-blue-600" checked={formData.is_approved} onChange={e => setFormData({...formData, is_approved: e.target.checked})} />
              <label htmlFor="is_approved" className="text-sm font-bold text-green-600">Approved / Publicly Visible</label>
           </div>
           <div className="flex items-center gap-3">
              <input type="checkbox" id="is_premium" className="w-5 h-5 rounded border-zinc-300 text-blue-600" checked={formData.is_premium} onChange={e => setFormData({...formData, is_premium: e.target.checked})} />
              <label htmlFor="is_premium" className="text-sm font-medium">Premium Destination</label>
           </div>
           <div className="flex items-center gap-3">
              <input type="checkbox" id="is_custom" className="w-5 h-5 rounded border-zinc-300 text-blue-600" checked={formData.is_custom} onChange={e => setFormData({...formData, is_custom: e.target.checked})} />
              <label htmlFor="is_custom" className="text-sm font-medium text-amber-600">Custom User Generated</label>
           </div>
        </section>

        {/* Description & Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-medium">Marketing Description</label>
            <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Highlights Summary</label>
            <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.highlights} onChange={e => setFormData({...formData, highlights: e.target.value})} placeholder="e.g. Bangkok + Phuket + Pattaya" />
          </div>
        </section>

        {/* Day-by-Day Editor */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Day-by-Day Itinerary</h3>
            <button type="button" onClick={addDay} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Day
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {formData.content.map((day: any, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveDayIndex(i)}
                className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeDayIndex === i 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                Day {day.day || day.day_number || i + 1}
                {activeDayIndex === i && (
                  <X className="w-3 h-3 hover:text-red-200" onClick={(e) => { e.stopPropagation(); removeDay(i); }} />
                )}
              </button>
            ))}
          </div>

          {formData.content[activeDayIndex] && (
            <div className="p-8 bg-zinc-50 dark:bg-zinc-800/20 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-400">Day {activeDayIndex + 1} Theme / Location</label>
                  <input 
                    className="text-2xl font-bold bg-transparent border-b border-zinc-200 dark:border-zinc-700 w-full outline-none focus:border-blue-500 pb-2"
                    value={formData.content[activeDayIndex].theme}
                    onChange={(e) => updateDayTheme(activeDayIndex, e.target.value)}
                    placeholder="Enter day theme..."
                  />
               </div>

               <div className="space-y-6">
                  {formData.content[activeDayIndex].activities.map((act: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative group">
                      <button 
                        type="button" 
                        onClick={() => removeActivity(activeDayIndex, idx)}
                        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-zinc-400">Time & Location</label>
                              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                 <Clock className="w-3 h-3 shrink-0" />
                                 <input className="text-xs font-bold bg-transparent outline-none w-full" value={act.time} onChange={e => updateActivity(activeDayIndex, idx, 'time', e.target.value)} />
                              </div>
                              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                 <MapPin className="w-3 h-3 shrink-0" />
                                 <input className="text-xs bg-transparent outline-none w-full" value={act.location || ""} onChange={e => updateActivity(activeDayIndex, idx, 'location', e.target.value)} placeholder="Specific location..." />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-zinc-400">Activity Image URL</label>
                              <input className="text-[10px] bg-zinc-50 dark:bg-zinc-800 p-2 rounded w-full outline-none" value={act.image_url || ""} onChange={e => updateActivity(activeDayIndex, idx, 'image_url', e.target.value)} placeholder="https://..." />
                              {act.image_url && <img src={act.image_url} className="w-full aspect-video object-cover rounded-lg mt-2" />}
                           </div>
                        </div>
                        
                        <div className="md:col-span-3 space-y-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-zinc-400">Activity Name</label>
                              <input className="text-lg font-bold w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 outline-none focus:border-blue-500" value={act.activity} onChange={e => updateActivity(activeDayIndex, idx, 'activity', e.target.value)} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-zinc-400">Description</label>
                              <textarea rows={2} className="text-sm text-zinc-500 dark:text-zinc-400 w-full bg-transparent outline-none resize-none" value={act.description} onChange={e => updateActivity(activeDayIndex, idx, 'description', e.target.value)} placeholder="What will happen during this activity?" />
                           </div>
                           
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[9px] font-bold uppercase text-zinc-400">Opening</label>
                                 <input className="text-[10px] w-full p-1 border rounded dark:bg-zinc-800 outline-none" value={act.opening_time || ""} onChange={e => updateActivity(activeDayIndex, idx, 'opening_time', e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-bold uppercase text-zinc-400">Closing</label>
                                 <input className="text-[10px] w-full p-1 border rounded dark:bg-zinc-800 outline-none" value={act.closing_time || ""} onChange={e => updateActivity(activeDayIndex, idx, 'closing_time', e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-bold uppercase text-zinc-400">Duration</label>
                                 <input className="text-[10px] w-full p-1 border rounded dark:bg-zinc-800 outline-none" value={act.duration_at_spot || ""} onChange={e => updateActivity(activeDayIndex, idx, 'duration_at_spot', e.target.value)} placeholder="2 hours" />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-bold uppercase text-zinc-400 flex items-center gap-1"><CreditCard className="w-2.5 h-2.5" /> Cost</label>
                                 <input className="text-[10px] w-full p-1 border rounded dark:bg-zinc-800 outline-none" value={act.cost_estimate || ""} onChange={e => updateActivity(activeDayIndex, idx, 'cost_estimate', e.target.value)} placeholder="300 THB" />
                              </div>
                           </div>

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                              <div className="space-y-1">
                                 <label className="text-[9px] font-bold uppercase text-zinc-400 flex items-center gap-1"><Navigation className="w-2.5 h-2.5" /> Transport</label>
                                 <input className="text-[10px] w-full p-1 border rounded dark:bg-zinc-800 outline-none" value={act.transport_to_next || ""} onChange={e => updateActivity(activeDayIndex, idx, 'transport_to_next', e.target.value)} placeholder="Taxi/Grab" />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-bold uppercase text-zinc-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Time Next</label>
                                 <input className="text-[10px] w-full p-1 border rounded dark:bg-zinc-800 outline-none" value={act.time_to_next || ""} onChange={e => updateActivity(activeDayIndex, idx, 'time_to_next', e.target.value)} placeholder="20 mins" />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-bold uppercase text-zinc-400 flex items-center gap-1"><Ruler className="w-2.5 h-2.5" /> Distance</label>
                                 <input className="text-[10px] w-full p-1 border rounded dark:bg-zinc-800 outline-none" value={act.distance_to_next || ""} onChange={e => updateActivity(activeDayIndex, idx, 'distance_to_next', e.target.value)} placeholder="5km" />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-bold uppercase text-zinc-400 flex items-center gap-1"><Search className="w-2.5 h-2.5" /> Image Query</label>
                                 <input className="text-[10px] w-full p-1 border rounded dark:bg-zinc-800 outline-none" value={act.unsplash_query || ""} onChange={e => updateActivity(activeDayIndex, idx, 'unsplash_query', e.target.value)} placeholder="Search query..." />
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={() => addActivity(activeDayIndex)} className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-blue-500 hover:border-blue-500 transition-all flex items-center justify-center gap-2 font-bold text-sm">
                    <Plus className="w-4 h-4" /> Add Activity to Day {activeDayIndex + 1}
                  </button>
               </div>
            </div>
          )}
          
          {formData.content.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] text-zinc-400">
               <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p className="font-medium">No days added yet. Click "Add Day" to start building the itinerary.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
