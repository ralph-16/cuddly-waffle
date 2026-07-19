import { useMemo, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { Upload, RotateCw, Check, ShieldCheck, ExternalLink } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppData } from "@/context/useAppData"
import { requestTypes, hasValidId, getValidId } from "@/data/mock"
import type { Application } from "@/types"

const STEP_LABELS = ["Details", "Attachments", "Review"]

export default function RequestFlow() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { wallet, addApplication, showToast } = useAppData()
  const config = useMemo(() => requestTypes.find((r) => r.slug === slug), [slug])

  const [step, setStep] = useState(1)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [attached, setAttached] = useState<Record<string, string>>({})
  const [uploadingAttachment, setUploadingAttachment] = useState<string | null>(null)

  if (!config) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Not found" backTo="/home" />
        <p className="px-5 text-[13.5px] text-muted-foreground">This service isn't available yet.</p>
      </div>
    )
  }

  const setField = (id: string, v: string) => {
    setValues((s) => ({ ...s, [id]: v }))
    setErrors((s) => ({ ...s, [id]: false }))
  }

  const validateStep1 = () => {
    const next: Record<string, boolean> = {}
    let ok = true
    config.fields.forEach((f) => {
      if (f.required && !values[f.id]?.trim()) {
        next[f.id] = true
        ok = false
      }
    })
    setErrors(next)
    return ok
  }

  const needsIdentity = config.identityRequirements.includes("Valid government ID")
  const identityMet = !needsIdentity || hasValidId(wallet)
  const validId = getValidId(wallet)
  const requiredAttachments = config.attachmentRequirements.filter((a) => a.required)
  const attachmentsMet = requiredAttachments.every((a) => attached[a.id])
  const stepTwoValid = identityMet && attachmentsMet

  const handleAttachmentUpload = (attId: string, label: string) => {
    setUploadingAttachment(attId)
    setTimeout(() => {
      setAttached((prev) => ({ ...prev, [attId]: `${label}.pdf` }))
      setUploadingAttachment(null)
      showToast("File attached to this application")
    }, 700)
  }

  const goNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !stepTwoValid) {
      showToast(!identityMet ? "Add a valid ID to your wallet to continue" : "Attach every required document to continue")
      return
    }
    if (step < 3) return setStep(step + 1)
    submit()
  }

  const submit = () => {
    const today = "Jul 18, 2026"
    const seq = Math.floor(1000 + Math.random() * 8999)
    const track = `${config.trackPrefix}-2026-${seq}`
    const primaryField = config.fields[0]
    const who = values[primaryField?.id] || config.title
    const app: Application = {
      id: `app-${Date.now()}`,
      service: config.title,
      who,
      status: "submitted",
      track,
      submitted: today,
      attachments: Object.values(attached),
      stages: [
        { label: "Submitted", done: true, note: "Received online", date: today },
        { label: "Under review", done: false },
        { label: "For payment", done: false },
        { label: "Approved - ready for release", done: false },
      ],
    }
    addApplication(app)
    navigate(`/request/${config.slug}/confirm`)
  }

  const hasAnyRequirement = needsIdentity || config.attachmentRequirements.length > 0

  return (
    <div className="flex h-full flex-col">
      <Header
        title={config.title}
        subtitle={`Step ${step} of 3 - ${STEP_LABELS[step - 1]}`}
        backTo={() => (step > 1 ? setStep(step - 1) : navigate("/home"))}
      />
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <Progress value={(step / 3) * 100} className="mb-5" />

        {step === 1 && (
          <div className="space-y-4">
            {config.fields.map((f) => (
              <div key={f.id}>
                <Label>{f.label}</Label>
                {f.type === "select" ? (
                  <Select value={values[f.id]} onValueChange={(v) => setField(f.id, v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    placeholder={f.placeholder}
                    value={values[f.id] || ""}
                    error={errors[f.id]}
                    onChange={(e) => setField(f.id, e.target.value)}
                  />
                )}
                {errors[f.id] && <p className="-mt-2.5 mb-3.5 text-[11.5px] text-adobe">This field is required.</p>}
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {!hasAnyRequirement && (
              <p className="text-[12.5px] text-muted-foreground">
                Nothing to attach for this service - your details from step 1 are enough to proceed.
              </p>
            )}

            {needsIdentity && (
              <div>
                <p className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">From your wallet</p>
                <div className="rounded-2xl border border-border bg-card p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                        <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold">Valid government ID</p>
                        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                          {identityMet ? `Will use: ${validId?.name}` : "No ID saved to your wallet yet"}
                        </p>
                      </div>
                    </div>
                    {identityMet ? (
                      <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase text-sage-foreground">
                        <Check className="h-3 w-3" /> Ready
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-bold uppercase text-adobe-foreground">Missing</span>
                    )}
                  </div>
                  {!identityMet && (
                    <Link
                      to="/wallet"
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 py-2.5 text-[12.5px] font-semibold text-primary hover:bg-accent"
                    >
                      Add to wallet <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {config.attachmentRequirements.length > 0 && (
              <div>
                <p className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">For this application</p>
                <p className="mb-3 text-[12px] text-muted-foreground">
                  These are specific to this request. Upload them fresh each time - they won't be saved to your wallet.
                </p>
                <div className="space-y-3">
                  {config.attachmentRequirements.map((att) => {
                    const done = !!attached[att.id]
                    const uploading = uploadingAttachment === att.id
                    return (
                      <div key={att.id} className="rounded-2xl border border-border bg-card p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[13.5px] font-semibold">
                              {att.label}
                              {!att.required && <span className="ml-1.5 font-normal text-muted-foreground">(optional)</span>}
                            </p>
                            {att.helpText && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{att.helpText}</p>}
                            {done && <p className="mt-0.5 text-[11.5px] text-sage-foreground">{attached[att.id]}</p>}
                          </div>
                          {done && (
                            <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase text-sage-foreground">
                              <Check className="h-3 w-3" /> Attached
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAttachmentUpload(att.id, att.label)}
                          disabled={uploading}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-[12.5px] font-semibold text-muted-foreground hover:bg-secondary"
                        >
                          {uploading ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          {uploading ? "Uploading..." : done ? "Replace file" : "Upload file"}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-3 text-[12.5px] text-muted-foreground">Review before you submit. Tap back to edit.</p>
            <div className="rounded-2xl border border-border bg-card p-4">
              {config.fields.map((f) => (
                <div key={f.id} className="flex items-center justify-between border-b border-border py-2.5 text-[13px] last:border-none">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="max-w-[60%] text-right font-semibold">{values[f.id] || "-"}</span>
                </div>
              ))}
              {needsIdentity && (
                <div className="flex items-center justify-between border-b border-border py-2.5 text-[13px] last:border-none">
                  <span className="text-muted-foreground">Identity</span>
                  <span className="max-w-[60%] text-right font-semibold">{validId?.name}</span>
                </div>
              )}
              {config.attachmentRequirements.length > 0 && (
                <div className="flex items-center justify-between py-2.5 text-[13px]">
                  <span className="text-muted-foreground">Attachments</span>
                  <span className="max-w-[60%] text-right font-semibold">
                    {Object.keys(attached).length} of {config.attachmentRequirements.length} added
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 gap-2.5 border-t border-border bg-card px-5 py-3.5 pb-[max(env(safe-area-inset-bottom),14px)]">
        {step > 1 && (
          <Button variant="ghost" size="auto" className="flex-1" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        <Button className="flex-[2]" onClick={goNext}>
          {step < 3 ? "Next" : "Submit application"}
        </Button>
      </div>
    </div>
  )
}
