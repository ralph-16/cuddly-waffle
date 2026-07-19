import { Phone } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { hotlines } from "@/data/mock"
import { ICONS } from "@/lib/icon-map"

const CATEGORY_ICON: Record<string, string> = {
  Police: "police",
  Fire: "fire",
  Medical: "medical",
  Disaster: "disaster",
  Barangay: "barangay",
}

export default function Hotlines() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Emergency hotlines" subtitle="City of Malolos, Bulacan" backTo="/home" />
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="mb-4 rounded-2xl border border-adobe/30 bg-adobe/10 p-3.5">
          <p className="text-[12.5px] font-semibold text-adobe-foreground">In a life-threatening emergency, call 911 or the police hotline immediately.</p>
        </div>
        <div className="space-y-2.5">
          {hotlines.map((h) => {
            const Icon = ICONS[CATEGORY_ICON[h.category]] ?? Phone
            const dialable = /[0-9]{3,}/.test(h.number)
            return (
              <a
                key={h.id}
                href={dialable ? `tel:${h.number.replace(/[^0-9+]/g, "")}` : undefined}
                className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.7} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold">{h.name}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{h.category}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 font-mono text-[13px] font-semibold text-primary">
                  {dialable && <Phone className="h-3.5 w-3.5" />}
                  {h.number}
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
