import { useState } from "react"
import { Check, Upload, RotateCw, Clock, FileWarning } from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { cn } from "@/lib/utils"
import type { WalletDoc } from "@/types"

function StatusPill({ status }: { status: WalletDoc["status"] }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sage/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sage-foreground">
        <Check className="h-3 w-3" /> Verified
      </span>
    )
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-foreground">
        <Clock className="h-3 w-3" /> Pending review
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-adobe/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-adobe-foreground">
      <FileWarning className="h-3 w-3" /> Missing
    </span>
  )
}

function WalletCard({ doc }: { doc: WalletDoc }) {
  const { addWalletDoc, showToast } = useAppData()
  const [uploading, setUploading] = useState(false)

  const handleUpload = () => {
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      addWalletDoc({ name: doc.status === "missing" ? doc.name : doc.name, category: doc.category })
      showToast(doc.status === "missing" ? "Added to your document wallet" : "Document replaced in your wallet")
    }, 700)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{doc.category}</p>
          <h3 className="mt-0.5 truncate font-display text-[14.5px] font-semibold">{doc.name}</h3>
          {doc.updated && <p className="mt-0.5 text-[11px] text-muted-foreground">Updated {doc.updated}</p>}
        </div>
        <StatusPill status={doc.status} />
      </div>
      <button
        onClick={handleUpload}
        disabled={uploading}
        className={cn(
          "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-[12.5px] font-semibold transition-colors",
          doc.status === "verified" ? "border-border text-muted-foreground hover:bg-secondary" : "border-primary/40 text-primary hover:bg-accent"
        )}
      >
        {uploading ? (
          <RotateCw className="h-3.5 w-3.5 animate-spin" />
        ) : doc.status === "verified" ? (
          <RotateCw className="h-3.5 w-3.5" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        {uploading ? "Uploading..." : doc.status === "verified" ? "Replace file" : "Upload file"}
      </button>
    </div>
  )
}

export default function Wallet() {
  const { wallet } = useAppData()
  const verifiedCount = wallet.filter((d) => d.status === "verified").length

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-2 pt-4">
        <h1 className="font-display text-[22px] font-semibold">Document wallet</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Long-term identity documents only - things like your ID that don't change per transaction. Save them once and
          eKaratig fills them in automatically wherever they're needed.
        </p>
        <p className="mt-2 text-[11.5px] text-muted-foreground">
          Permits, clearances, and other per-application documents are attached separately when you file each request.
        </p>

        <div className="my-4 rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="font-display text-[24px] font-semibold leading-none">
            {verifiedCount}
            <span className="text-[15px] font-normal opacity-80"> / {wallet.length}</span>
          </div>
          <div className="mt-1.5 text-[11px] opacity-85">Documents verified and ready to use</div>
        </div>

        <div className="space-y-3 pb-2">
          {wallet.map((doc) => (
            <WalletCard key={doc.id} doc={doc} />
          ))}
        </div>
      </div>
    </div>
  )
}
