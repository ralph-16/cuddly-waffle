import { cn } from "@/lib/utils"

export function ReviewRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-2.5 text-[13px]", !last && "border-b border-border")}>
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-semibold">{value}</span>
    </div>
  )
}
