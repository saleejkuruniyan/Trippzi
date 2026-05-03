import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HomePageContent } from "@/components/home-content"

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HomePageContent />
      <Footer />
    </div>
  )
}
