import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Newspaper, TrendingUp, Clock, History } from "lucide-react"
import { NewsCard } from "@/components/shared/NewsCard"
import { cn } from "@/lib/utils"
import { news } from "@/data/mock"

const FILTERS = [
  { id: "latest", label: "Latest", icon: Clock },
  { id: "popular", label: "Popular", icon: TrendingUp },
  { id: "oldest", label: "Oldest", icon: History },
] as const

export default function News() {
    const navigate = useNavigate()
    const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("latest")

    const list = useMemo(() => {
        const entries = Object.entries(news)

        return [...entries].sort(([, a], [, b]) => {
            if (filter === "popular") return b.views - a.views
            if (filter === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime()
            return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
    }, [filter])

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
                <h1 className="font-display text-[22px] font-semibold">News</h1>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                    Always in the loop - official city announcements and updates are posted here automatically, so you never have to go looking for them.
                </p>

                <div className="mb-4 mt-4 flex gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                                filter === f.id ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"
                            )}
                        >
                            <f.icon className="h-3.5 w-3.5" />
                            {f.label}
                        </button>
                    ))}
                </div>

                {list.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
                        <Newspaper className="h-10 w-10 opacity-40" strokeWidth={1.4} />
                        <p className="text-[13.5px]">No news yet. Check back later.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {list.map(([slug, item]) => (
                            <NewsCard key={slug} news={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}