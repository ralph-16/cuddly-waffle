import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ServiceCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
  disabled,
  pill,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  onClick?: () => void
  disabled?: boolean
  pill?: string
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={cn(
        "relative flex flex-col items-start rounded-2xl border border-border bg-card p-3.5 text-left transition-transform",
        disabled ? "opacity-55" : "active:scale-[0.98]"
      )}
    >
      {pill && (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
          {pill}
        </span>
      )}
      <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
        <Icon className="h-[18px] w-[18px] text-primary" strokeWidth={1.7} />
      </div>
      <h3 className="text-[13.5px] font-semibold leading-tight">{title}</h3>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
    </button>
  )
}
