import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ClipboardList, FileStack } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ClaimStub } from "@/components/shared/ClaimStub"
import { IssuedDocCard } from "@/components/shared/IssuedDocCard"
import { cn } from "@/lib/utils"
import { useAppData } from "@/context/useAppData"
import { issuedDocuments } from "@/data/mock"

const FILTERS = [
  { id: "all", label: "All" },
  { id: "progress", label: "In progress" },
  { id: "done", label: "Completed" },
] as const

export default function Applications() {
  const navigate = useNavigate()
  const { applications } = useAppData()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all")

  const list = applications.filter((a) => {
    if (filter === "all") return true
    if (filter === "progress") return a.status !== "released"
    return a.status === "released"
  })

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-2 pt-4">
        <h1 className="font-display text-[22px] font-semibold">Applications</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Track requests in progress and view what's been issued.</p>

        <Tabs defaultValue="applications" className="mt-4">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="applications">
              <ClipboardList className="mr-1.5 h-3.5 w-3.5" /> Applications
            </TabsTrigger>
            <TabsTrigger value="issued">
              <FileStack className="mr-1.5 h-3.5 w-3.5" /> Issued documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <div className="mb-4 flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "rounded-full border border-border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                    filter === f.id ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {list.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
                <ClipboardList className="h-10 w-10 opacity-40" strokeWidth={1.4} />
                <p className="text-[13.5px]">No applications yet. Start one from Home.</p>
              </div>
            ) : (
              list.map((a) => <ClaimStub key={a.id} app={a} onClick={() => navigate(`/applications/${a.id}`)} />)
            )}
          </TabsContent>

          <TabsContent value="issued" className="space-y-3">
            {issuedDocuments.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
                <FileStack className="h-10 w-10 opacity-40" strokeWidth={1.4} />
                <p className="text-[13.5px]">Nothing issued yet. This fills in once an application is approved.</p>
              </div>
            ) : (
              issuedDocuments.map((d) => <IssuedDocCard key={d.id} doc={d} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
