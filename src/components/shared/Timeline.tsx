import { cn } from "@/lib/utils"
import type { ApplicationStage } from "@/types"

export function Timeline({ stages }: { stages: ApplicationStage[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {stages.map((s, i) => (
        <div key={s.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full ring-2",
                s.done ? "bg-primary ring-primary" : "bg-secondary ring-border"
              )}
            />
            {i < stages.length - 1 && (
              <div className={cn("my-0.5 w-0.5 flex-1", s.done && stages[i + 1].done ? "bg-primary" : "bg-border")} />
            )}
          </div>
          <div className="pb-5">
            <h4 className={cn("text-[13.5px] font-bold", s.done ? "text-foreground" : "text-muted-foreground")}>{s.label}</h4>
            {s.note && <p className="text-[11.5px] text-muted-foreground">{s.note}</p>}
            {s.date && <p className="text-[11.5px] text-muted-foreground">{s.date}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
