import { use } from "react"
import DestinationClient from "./destination-client"

export function generateStaticParams() {
  return [{ slug: 'guide' }]
}

export default function DestinationGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <DestinationClient slug={slug} />
}
