import { use } from "react"
import PreviewClient from "./preview-client"

export function generateStaticParams() {
  return [{ id: 'preview' }]
}

export default function ItineraryPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PreviewClient id={id} />
}
