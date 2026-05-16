import ItineraryClient from "./itinerary-client"
import PreviewClient from "./preview-client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export function generateStaticParams() {
  return [{ slug: [] }]
}

export default async function ItineraryUnifiedPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  
  // If no slug, show a fallback or redirect
  if (!slug || slug.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pt-24 gap-4">
          <p className="text-zinc-500 font-bold">Please select an itinerary from the destinations page.</p>
          <p className="text-xs text-zinc-400">Path: /itinerary/{slug?.join('/')}</p>
        </main>
        <Footer />
      </div>
    )
  }

  const itineraryId = slug[0]
  const isPreview = slug.length > 1 && slug[1] === 'preview'

  if (isPreview) {
    return <PreviewClient id={itineraryId} />
  }

  return <ItineraryClient id={itineraryId} />
}
