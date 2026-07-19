import { StatusBadge } from "./StatusBadge"
import type { Application } from "@/types"
import { cn } from "@/lib/utils"

export function ClaimStub({ app, onClick }: { app: Application; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "stub-notch relative mb-4 ml-0.5 overflow-visible rounded-2xl border border-border bg-card",
        onClick && "cursor-pointer active:scale-[0.99] transition-transform"
      )}
    >
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[14.5px] font-semibold">{app.service}</h3>
          <p className="truncate text-[11.5px] text-muted-foreground">{app.who}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>
      <div className="mx-4 border-t border-dashed border-border" />
      <div className="flex items-center justify-between px-4 py-3 text-[12px]">
        <span className="font-mono font-semibold">{app.track}</span>
        <span className="text-muted-foreground">{app.submitted}</span>
      </div>
    </div>
  )
}
