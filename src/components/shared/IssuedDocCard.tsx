import { useState } from "react"
import { ReceiptText, FileCheck2, Award, ShieldCheck, Eye, Printer } from "lucide-react"
import { useAppData } from "@/context/useAppData"
import type { IssuedDocument } from "@/types"

const TYPE_ICON: Record<IssuedDocument["type"], typeof ReceiptText> = {
  "Official Receipt": ReceiptText,
  Certificate: FileCheck2,
  Permit: Award,
  Clearance: ShieldCheck,
}

export function IssuedDocCard({ doc }: { doc: IssuedDocument }) {
  const { showToast } = useAppData()
  const [claimTab, setClaimTab] = useState<"digital" | "printed">("digital")
  const Icon = TYPE_ICON[doc.type]

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
          <Icon className="h-5 w-5 text-primary" strokeWidth={1.7} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{doc.type}</p>
          <h3 className="truncate font-display text-[14.5px] font-semibold">{doc.title}</h3>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">Issued {doc.issuedDate}</p>
        </div>
      </div>
      <div className="mx-1 my-3 border-t border-dashed border-border" />
      <div className="flex items-center justify-between px-1 pb-2 text-[12px]">
        <span className="font-mono font-semibold">{doc.track}</span>
        <span className="text-muted-foreground">{doc.service}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setClaimTab("digital")
            showToast("Digital copy preview not available in this prototype")
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-[12px] font-semibold transition-colors ${
            claimTab === "digital" ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground"
          }`}
        >
          <Eye className="h-3.5 w-3.5" /> View digital
        </button>
        <button
          onClick={() => {
            setClaimTab("printed")
            showToast("Claim slip: bring a valid ID to City Hall, Window 2")
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-[12px] font-semibold transition-colors ${
            claimTab === "printed" ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground"
          }`}
        >
          <Printer className="h-3.5 w-3.5" /> Claim printed
        </button>
      </div>
    </div>
  )
}
