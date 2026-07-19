import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

export function Header({ title, subtitle, backTo }: { title: string; subtitle?: string; backTo?: string | (() => void) }) {
  const navigate = useNavigate()
  const handleBack = () => {
    if (typeof backTo === "function") return backTo()
    if (typeof backTo === "string") return navigate(backTo)
    navigate(-1)
  }
  return (
    <div className="flex flex-shrink-0 items-center gap-3 px-5 pb-3 pt-1">
      <button
        onClick={handleBack}
        aria-label="Go back"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>
      <div className="min-w-0">
        <h1 className="truncate font-display text-[19px] font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}
