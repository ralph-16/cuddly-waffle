import { ShieldCheck } from "lucide-react"

export function WalletBanner() {
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-accent/60 p-3.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
        <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-primary">Using your verified Identity Wallet</p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          Your verified personal information has been filled in automatically where applicable.
        </p>
      </div>
    </div>
  )
}
