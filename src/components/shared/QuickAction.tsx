import type { LucideIcon } from "lucide-react"

export function QuickAction({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl border border-border bg-card py-3 active:scale-[0.98] transition-transform">
      <Icon className="h-5 w-5 text-primary" strokeWidth={1.7} />
      <span className="text-center text-[10.5px] font-semibold leading-tight px-1">{label}</span>
    </button>
  )
}
