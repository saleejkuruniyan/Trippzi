import DestinationClient from "./destination-client"
import DestinationsList from "./destinations-list"

export function generateStaticParams() {
  return [{ slug: [] }]
}

export default async function DestinationsUnifiedPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  
  // If no slug, show the destinations list
  if (!slug || slug.length === 0) {
    return <DestinationsList />
  }

  const destSlug = slug[0]
  return <DestinationClient slug={destSlug} />
}
