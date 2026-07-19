import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Flag, Phone, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/shared/StatCard"
import { ServiceCard } from "@/components/shared/ServiceCard"
import { QuickAction } from "@/components/shared/QuickAction"
import { useAppData } from "@/context/useAppData"
import { requestTypes } from "@/data/mock"
import { ICONS } from "@/lib/icon-map"

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning, Juan"
  if (h < 18) return "Good afternoon, Juan"
  return "Good evening, Juan"
}

export default function Home() {
  const navigate = useNavigate()
  const { applications, wallet } = useAppData()
  const [query, setQuery] = useState("")

  const activeCount = applications.filter((a) => a.status !== "released").length
  const filtered = useMemo(
    () => requestTypes.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()) || r.shortLabel.toLowerCase().includes(query.toLowerCase())),
    [query]
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-2 pt-4">
        <div className="mb-4">
          <h1 className="font-display text-[22px] font-semibold">{greeting()}</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">What would you like to file today?</p>
        </div>

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
          <Input placeholder="Search services" className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="mb-5 flex gap-2.5">
          <QuickAction icon={Flag} label="Report an issue" onClick={() => navigate("/report")} />
          <QuickAction icon={Phone} label="Hotlines" onClick={() => navigate("/hotlines")} />
          <QuickAction icon={Sparkles} label="Ask eKa" onClick={() => navigate("/assistant")} />
        </div>

        <div className="mb-5 flex gap-2.5">
          <StatCard value={activeCount} label="Active applications" />
          <StatCard value={wallet.filter((w) => w.status === "verified").length} label="Documents on file" tone="alt" />
        </div>

        <div className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">City services</div>
        <div className="grid grid-cols-2 gap-2.5 pb-2">
          {filtered.map((r) => {
            const Icon = ICONS[r.icon] ?? ICONS.home
            return (
              <ServiceCard
                key={r.slug}
                icon={Icon}
                title={r.title}
                subtitle={r.description}
                onClick={() => navigate(r.flowType === "cart" ? `/${r.slug}` : `/request/${r.slug}`)}
              />
            )
          })}
          <ServiceCard icon={ICONS.road} title="Barangay clearance" subtitle="Coming soon" disabled pill="Soon" />
          <ServiceCard icon={ICONS["paw-print"]} title="Health certificate" subtitle="Coming soon" disabled pill="Soon" />
        </div>
        {filtered.length === 0 && (
          <p className="pt-6 text-center text-[13px] text-muted-foreground">No services match your search.</p>
        )}
      </div>
    </div>
  )
}
