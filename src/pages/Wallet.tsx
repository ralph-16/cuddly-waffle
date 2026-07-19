import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Check,
  UploadCloud,
  RotateCw,
  Clock,
  FileWarning,
  ShieldCheck,
  Lock,
  RefreshCw,
  ChevronRight,
  Plus,
  X,
  Fingerprint,
  Car,
  BookOpen,
  Home as HomeIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { requestTypes, ID_CATEGORIES, getValidId } from "@/data/mock"
import { ICONS } from "@/lib/icon-map"
import type { WalletDoc } from "@/types"

/** Presentation metadata for each wallet category. Purely visual/informational - not part of the data model. */
const CATEGORY_META: Record<string, { icon: LucideIcon; issuer: string; description: string; swatch: string }> = {
  "National ID": {
    icon: Fingerprint,
    issuer: "Philippine Statistics Authority",
    description:
      "Your primary proof of identity. Confirms your name, birth date, and citizenship so it can be reused across every city and national government transaction.",
    swatch: "bg-accent text-primary",
  },
  "Driver's license": {
    icon: Car,
    issuer: "Land Transportation Office",
    description:
      "An alternate valid government ID. Keep it on file in case a service is easier to complete with this instead of your National ID.",
    swatch: "bg-azure/15 text-azure-foreground",
  },
  Passport: {
    icon: BookOpen,
    issuer: "Department of Foreign Affairs",
    description:
      "Accepted as a valid government ID for city services, and useful for civil registry requests tied to travel.",
    swatch: "bg-sage/15 text-sage-foreground",
  },
  "Proof of address": {
    icon: HomeIcon,
    issuer: "Utility or billing statement",
    description:
      "Confirms your current address. Some permits and clearances ask for this - keeping a recent copy here saves you from digging one up later.",
    swatch: "bg-gold/20 text-gold-foreground",
  },
}

function getDocForCategory(wallet: WalletDoc[], category: string): WalletDoc {
  return wallet.find((w) => w.category === category) ?? { id: category, name: category, category, status: "missing" }
}

function StatusPill({ status }: { status: WalletDoc["status"] }) {
  if (status === "verified")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sage/15 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-sage-foreground">
        <Check className="h-3 w-3" /> Verified
      </span>
    )
  if (status === "pending")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/20 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-gold-foreground">
        <Clock className="h-3 w-3" /> Pending
      </span>
    )
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-adobe/15 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-adobe-foreground">
      <FileWarning className="h-3 w-3" /> Missing
    </span>
  )
}

function TrustPoint({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-1.5 py-3 text-center">
      <Icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
      <span className="text-[10px] font-semibold leading-tight text-muted-foreground">{label}</span>
    </div>
  )
}

function DocRow({ doc, onClick, isLast }: { doc: WalletDoc; onClick: () => void; isLast?: boolean }) {
  const meta = CATEGORY_META[doc.category]
  const Icon = meta?.icon ?? FileWarning
  return (
    <button
      onClick={onClick}
      className={cn("flex w-full items-center gap-3 py-3.5 text-left", !isLast && "border-b border-border")}
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", meta?.swatch)}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold">{doc.category}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {doc.status === "missing" ? "Not added yet" : doc.status === "pending" ? "Pending verification" : doc.name}
        </p>
      </div>
      <StatusPill status={doc.status} />
      {doc.status === "missing" ? (
        <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
    </button>
  )
}

export default function Wallet() {
  const { wallet, applications, addWalletDoc, showToast } = useAppData()
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const primaryDoc = getValidId(wallet)
  const heroPending = primaryDoc?.status === "pending"
  const otherIdCategories = ID_CATEGORIES.filter((c) => c !== primaryDoc?.category)
  const secondaryDocs = [...otherIdCategories.map((c) => getDocForCategory(wallet, c)), getDocForCategory(wallet, "Proof of address")]

  const idRequestTypes = requestTypes.filter((r) => r.identityRequirements.includes("Valid government ID"))
  const idServiceTitles = new Set(idRequestTypes.map((r) => r.title))
  const recentIdApp = [...applications]
    .filter((a) => idServiceTitles.has(a.service))
    .sort((a, b) => new Date(b.submitted).getTime() - new Date(a.submitted).getTime())[0]

  const selectedDoc = selectedCategory ? getDocForCategory(wallet, selectedCategory) : null
  const selectedMeta = selectedDoc ? CATEGORY_META[selectedDoc.category] : null
  const isPrimarySelected = !!selectedDoc && !!primaryDoc && selectedDoc.category === primaryDoc.category

  const closeSheet = () => {
    if (uploading) return
    setSelectedCategory(null)
  }

  // Lock background scroll while the document sheet is open (mobile: prevents the
  // list underneath from scrolling behind the popup).
  useEffect(() => {
    if (!selectedCategory) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [selectedCategory])

  const handleAction = (doc: WalletDoc) => {
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      addWalletDoc({ name: doc.name, category: doc.category })
      showToast(
        doc.status === "missing"
          ? `${doc.category} verified and added to your wallet`
          : `${doc.category} updated in your wallet`
      )
    }, 700)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
        <h1 className="font-display text-[22px] font-semibold">Identity wallet</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Verified once, reused everywhere - government-issued records are added here automatically and filled in for
          you wherever they're needed.
        </p>

        <div className="mt-4">
          {primaryDoc ? (
            <button
              onClick={() => setSelectedCategory(primaryDoc.category)}
              className="group relative w-full overflow-hidden rounded-3xl p-5 text-left text-primary-foreground shadow-lg transition-transform active:scale-[0.99]"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(2 40% 18%) 100%)" }}
            >
              <ShieldCheck
                className="pointer-events-none absolute -right-7 -top-7 h-32 w-32 text-primary-foreground/10"
                strokeWidth={1}
              />
              <div className="relative flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground/75">
                  {heroPending ? <Clock className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  {heroPending ? "Verification in progress" : "Government-verified identity"}
                </span>
                <span className="shrink-0 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide">
                  Primary ID
                </span>
              </div>

              <div className="relative mt-4">
                <p className="font-display text-[19px] font-semibold leading-tight">Juan Dela Cruz</p>
                <p className="mt-1 font-mono text-[13px] tracking-[0.2em] text-primary-foreground/80">
                  •••• •••• •••• 4821
                </p>
              </div>

              <div className="relative mt-5 flex items-end justify-between gap-3 border-t border-primary-foreground/15 pt-3">
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold">{primaryDoc.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-primary-foreground/70">
                    {CATEGORY_META[primaryDoc.category]?.issuer}
                    {primaryDoc.updated ? ` · ${heroPending ? "Submitted" : "Verified"} ${primaryDoc.updated}` : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-primary-foreground/60" />
              </div>

              {!heroPending && recentIdApp && (
                <p className="relative mt-2 text-[10.5px] text-primary-foreground/60">
                  Last used for {recentIdApp.service} · {recentIdApp.submitted}
                </p>
              )}
            </button>
          ) : (
            <button
              onClick={() => setSelectedCategory("National ID")}
              className="flex w-full items-center gap-3 rounded-3xl border-2 border-dashed border-primary/40 bg-accent/40 p-5 text-left transition-transform active:scale-[0.99]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
                <Fingerprint className="h-5 w-5 text-primary" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15.5px] font-semibold">Verify your identity</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Add your PhilSys National ID to unlock every city service.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="mb-5 mt-3.5 flex gap-2">
          <TrustPoint icon={ShieldCheck} label="Government-verified" />
          <TrustPoint icon={RefreshCw} label="Reused automatically" />
          <TrustPoint icon={Lock} label="Encrypted & secure" />
        </div>

        <div className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">
          Other documents in your wallet
        </div>
        <div className="mb-5 rounded-2xl border border-border bg-card px-4">
          {secondaryDocs.map((doc, i) => (
            <DocRow
              key={doc.category}
              doc={doc}
              onClick={() => setSelectedCategory(doc.category)}
              isLast={i === secondaryDocs.length - 1}
            />
          ))}
        </div>

        {idRequestTypes.length > 0 && (
          <>
            <div className="mb-1 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">
              Where your wallet is used
            </div>
            <p className="mb-2.5 text-[11.5px] text-muted-foreground">
              Used automatically in {idRequestTypes.length} city services - no re-uploading required.
            </p>
            <div className="rounded-2xl border border-border bg-card px-4">
              {idRequestTypes.map((r, i) => {
                const Icon = ICONS[r.icon] ?? ICONS.home
                return (
                  <button
                    key={r.slug}
                    onClick={() => navigate(r.flowType === "cart" ? `/${r.slug}` : `/request/${r.slug}`)}
                    className={cn(
                      "flex w-full items-center gap-3 py-3.5 text-left",
                      i < idRequestTypes.length - 1 && "border-b border-border"
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent">
                      <Icon className="h-[18px] w-[18px] text-primary" strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold">{r.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">Auto-fills with your verified ID</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          </>
        )}

        <p className="mt-6 px-2 text-center text-[11px] text-muted-foreground">
          Permits, clearances, and other per-application documents are attached separately when you file each
          request - they aren't stored here.
        </p>
      </div>

      {selectedDoc && selectedMeta && (
        <>
          <div
            className="fixed inset-0 z-[90] animate-fade-in bg-foreground/40 backdrop-blur-[1px]"
            onClick={closeSheet}
          />
          <div className="fixed inset-x-0 bottom-0 z-[95] mx-auto max-w-md animate-sheet-up">
            <div className="max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-3xl border border-b-0 border-border bg-card px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3 shadow-2xl">
              <div className="sticky top-0 -mt-3 mb-1 bg-card pt-3">
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", selectedMeta.swatch)}>
                    <selectedMeta.icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {selectedDoc.category}
                    </p>
                    <h3 className="truncate font-display text-[16px] font-semibold leading-tight">
                      {selectedDoc.status === "missing" ? selectedDoc.category : selectedDoc.name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={closeSheet}
                  aria-label="Close"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3">
                <StatusPill status={selectedDoc.status} />
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{selectedMeta.description}</p>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary px-3.5 py-2.5 text-[12px]">
                <span className="text-muted-foreground">Issued by</span>
                <span className="font-semibold">{selectedMeta.issuer}</span>
              </div>

              {selectedDoc.updated && (
                <div className="mt-2 flex items-center justify-between rounded-xl bg-secondary px-3.5 py-2.5 text-[12px]">
                  <span className="text-muted-foreground">
                    {selectedDoc.status === "verified" ? "Verified on" : "Submitted on"}
                  </span>
                  <span className="font-semibold">{selectedDoc.updated}</span>
                </div>
              )}

              {isPrimarySelected && idRequestTypes.length > 0 && selectedDoc.status !== "missing" && (
                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Used automatically in
                  </p>
                  <div className="rounded-2xl border border-border">
                    {idRequestTypes.map((r, i) => {
                      const Icon = ICONS[r.icon] ?? ICONS.home
                      return (
                        <div
                          key={r.slug}
                          className={cn(
                            "flex items-center gap-3 px-3.5 py-2.5",
                            i < idRequestTypes.length - 1 && "border-b border-border"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                          <span className="flex-1 text-[12.5px] font-medium">{r.title}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-5">
                {selectedDoc.status === "missing" && (
                  <Button className="w-full" disabled={uploading} onClick={() => handleAction(selectedDoc)}>
                    {uploading ? (
                      <RotateCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    {uploading ? "Verifying…" : `Verify with ${selectedMeta.issuer}`}
                  </Button>
                )}

                {selectedDoc.status === "pending" && (
                  <p className="rounded-xl bg-gold/10 px-3.5 py-3 text-center text-[12px] text-gold-foreground">
                    We're confirming this with {selectedMeta.issuer}. No action needed - this usually takes 1-2
                    business days.
                  </p>
                )}

                {selectedDoc.status === "verified" && (
                  <button
                    onClick={() => handleAction(selectedDoc)}
                    disabled={uploading}
                    className="flex w-full items-center justify-center gap-2 py-2 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-primary disabled:opacity-60"
                  >
                    <RotateCw className={cn("h-3.5 w-3.5", uploading && "animate-spin")} />
                    {uploading ? "Updating…" : "Update this document"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
