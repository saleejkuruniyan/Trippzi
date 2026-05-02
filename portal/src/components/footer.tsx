import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 py-12 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-900 dark:text-zinc-50">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Trippzi Logo" width={24} height={24} className="w-6 h-6 object-contain" />
          <span className="text-lg font-bold">Trippzi</span>
        </div>
        <p className="text-zinc-500 text-sm text-center md:text-left">
          © {new Date().getFullYear()} Trippzi. Built with AI for modern explorers.
        </p>
        <div className="flex gap-6 text-sm text-zinc-500">
          <Link href="/about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">About</Link>
          <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
