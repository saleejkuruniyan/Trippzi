import { use } from "react"
import ItineraryClient from "./itinerary-client"

export function generateStaticParams() {
  return [{ id: 'preview' }]
}

export default function ItineraryProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ItineraryClient id={id} />
}
