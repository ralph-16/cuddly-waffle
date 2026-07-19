import { Smartphone, CreditCard, Landmark } from "lucide-react"
import { cn } from "@/lib/utils"

export const PAYMENT_METHODS = [
  { id: "gcash", label: "GCash", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "bank", label: "Online Banking", icon: Landmark },
] as const

export function PaymentMethodPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2.5">
      {PAYMENT_METHODS.map((m) => {
        const Icon = m.icon
        const active = value === m.id
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors",
              active ? "border-primary bg-accent" : "border-border bg-card"
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                active ? "bg-primary/15" : "bg-secondary"
              )}
            >
              <Icon className="h-[18px] w-[18px] text-primary" strokeWidth={1.7} />
            </div>
            <span className="flex-1 text-[13.5px] font-semibold">{m.label}</span>
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                active ? "border-primary" : "border-border"
              )}
            >
              {active && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}
