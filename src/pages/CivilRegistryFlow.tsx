import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ChevronRight,
  Check,
  ShieldCheck,
  Upload,
  RotateCw,
  ReceiptText,
  Smartphone,
  CreditCard,
  Landmark,
} from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Timeline } from "@/components/shared/Timeline"
import { ClaimStub } from "@/components/shared/ClaimStub"
import { WalletBanner } from "@/components/shared/WalletBanner"
import { useAppData } from "@/context/AppDataContext"
import { civilRegistryCertTypes, walletProfile, type CivilRegistryCertType } from "@/data/mock"
import { ICONS } from "@/lib/icon-map"
import { cn } from "@/lib/utils"
import type { Application } from "@/types"

type CertId = CivilRegistryCertType["id"]

const STEP_LABELS = ["Choose certificate", "Fill information", "Review", "Payment"]

const PURPOSE_OPTIONS = [
  "Employment",
  "Passport application",
  "School requirement",
  "Loan or bank requirement",
  "Travel abroad",
  "Other government transaction",
] as const

const RELATIONSHIP_OPTIONS = [
  "Parent",
  "Legal guardian",
  "Sibling",
  "Spouse",
  "Child",
  "Authorized representative",
  "Other",
] as const

const DEATH_RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Legal representative",
  "Other",
] as const

const PAYMENT_METHODS = [
  { id: "gcash", label: "GCash", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "bank", label: "Online Banking", icon: Landmark },
] as const

const peso = (n: number) => `PHP ${n.toLocaleString("en-PH")}.00`

function getApplicantName(certType: CertId | null, values: Record<string, string>) {
  if (certType === "birth") {
    return [values.firstName, values.middleName, values.lastName, values.suffix].filter(Boolean).join(" ")
  }
  if (certType === "marriage") {
    const husband = [values.hFirstName, values.hMiddleName, values.hLastName, values.hSuffix].filter(Boolean).join(" ")
    const wife = [values.wFirstName, values.wMiddleName, values.wLastName].filter(Boolean).join(" ")
    if (husband && wife) return `${husband} & ${wife}`
    return husband || wife
  }
  if (certType === "death") return values.deceasedFullName || ""
  return ""
}

// ---- Small field helpers (self-contained spacing so they work standalone or inside a 2-col grid) ----

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  optional,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: "text" | "date" | "number"
  error?: boolean
  optional?: boolean
}) {
  return (
    <div className="mb-4">
      <Label>
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        error={error}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="mt-1.5 text-[11.5px] text-adobe">This field is required.</p>}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  error?: boolean
}) {
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-adobe" : undefined}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1.5 text-[11.5px] text-adobe">This field is required.</p>}
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      <Input value={value} disabled />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">{children}</p>
}

function UploadField({
  label,
  done,
  uploading,
  onUpload,
}: {
  label: string
  done?: string
  uploading?: boolean
  onUpload: () => void
}) {
  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13.5px] font-semibold">{label}</p>
        {done && (
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase text-sage-foreground">
            <Check className="h-3 w-3" /> Attached
          </span>
        )}
      </div>
      {done && <p className="mt-0.5 text-[11.5px] text-sage-foreground">{done}</p>}
      <button
        onClick={onUpload}
        disabled={uploading}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-[12.5px] font-semibold text-muted-foreground hover:bg-secondary"
      >
        {uploading ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {uploading ? "Uploading..." : done ? "Replace file" : "Upload file"}
      </button>
    </div>
  )
}

function WalletAutofillCard() {
  return (
    <div className="mb-4 rounded-2xl border border-border bg-card p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
            <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold">{walletProfile.fullName}</p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">{walletProfile.address}</p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">{walletProfile.contactNumber}</p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase text-sage-foreground">
          <Check className="h-3 w-3" /> Ready
        </span>
      </div>
    </div>
  )
}

function ReviewRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-2.5 text-[13px]", !last && "border-b border-border")}>
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-semibold">{value}</span>
    </div>
  )
}

function PaymentMethodPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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

export default function CivilRegistryFlow() {
  const navigate = useNavigate()
  const { addApplication, showToast } = useAppData()

  const [step, setStep] = useState(1)
  const [certType, setCertType] = useState<CertId | null>(null)
  const [own, setOwn] = useState(true)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [files, setFiles] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [paying, setPaying] = useState(false)
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null)

  const certConfig = civilRegistryCertTypes.find((c) => c.id === certType)
  const applicantName = getApplicantName(certType, values)
  const copies = parseInt(values.copies || "1", 10) || 1
  const fee = (certConfig?.fee ?? 0) * copies
  const paymentMethodLabel = PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ?? ""

  const setField = (id: string, v: string) => {
    setValues((s) => ({ ...s, [id]: v }))
    setErrors((s) => ({ ...s, [id]: false }))
  }

  const selectCertType = (id: CertId) => {
    setCertType(id)
    setValues({ copies: "1" })
    setErrors({})
    setOwn(id !== "death")
    setFiles({})
    setStep(2)
  }

  const handleUpload = (key: string, label: string) => {
    setUploading(key)
    setTimeout(() => {
      setFiles((f) => ({ ...f, [key]: `${label}.pdf` }))
      setUploading(null)
      showToast("File attached to this application")
    }, 700)
  }

  const fillRequestorFromWallet = () => {
    setValues((v) => ({ ...v, requestorName: walletProfile.fullName, requestorAddress: walletProfile.address }))
    showToast("Filled in from your Identity Wallet")
  }

  const validateStep2 = () => {
    if (!certType) return false
    const req: string[] = []
    if (certType === "birth") {
      req.push(
        "firstName", "lastName", "sex", "birthDate", "province", "cityMunicipality",
        "fatherName", "motherMaidenName", "purpose", "copies"
      )
      if (!own) req.push("relationship", "requestorName", "requestorAddress")
    } else if (certType === "marriage") {
      req.push(
        "hFirstName", "hLastName", "wFirstName", "wLastName", "marriageDate",
        "province", "cityMunicipality", "purpose", "copies"
      )
      if (!own) req.push("relationship", "requestorName", "requestorAddress")
    } else if (certType === "death") {
      req.push(
        "deceasedFullName", "deceasedSex", "dateOfDeath", "province", "cityMunicipality",
        "fatherName", "motherMaidenName", "relationship", "purpose", "copies",
        "requestorName", "requestorAddress"
      )
    }

    const nextErrors: Record<string, boolean> = {}
    let ok = true
    req.forEach((id) => {
      if (!values[id]?.trim()) {
        nextErrors[id] = true
        ok = false
      }
    })
    setErrors(nextErrors)
    if (!ok) return false

    if (certType !== "death" && !own && (!files.authLetter || !files.validId)) {
      showToast("Attach the authorization letter and a valid ID to continue")
      return false
    }
    return true
  }

  const goToReview = () => {
    if (validateStep2()) setStep(3)
  }

  const goToPayment = () => {
    if (!paymentMethod) return showToast("Choose a payment method to continue")
    setReferenceNumber(`REF-2026-${Math.floor(1000 + Math.random() * 8999)}`)
    setStep(4)
  }

  const submit = () => {
    if (!certType || !certConfig) return
    const today = "Jul 18, 2026"
    const seq = Math.floor(1000 + Math.random() * 8999)
    const track = `LCR-2026-${seq}`
    const attachmentsList = [files.authLetter, files.validId].filter(Boolean) as string[]

    const app: Application = {
      id: `app-${Date.now()}`,
      service: "Civil registry copy",
      who: `${certConfig.title} - ${applicantName || "Requestor"}`,
      status: "submitted",
      track,
      submitted: today,
      attachments: attachmentsList,
      stages: [
        { label: "Submitted", done: true, note: "Received online, along with your payment reference", date: today },
        { label: "Under review", done: false, note: "Local Civil Registry Office is verifying your request" },
        { label: "Payment verified", done: false, note: `Confirming your ${paymentMethodLabel} payment - ${referenceNumber}` },
        { label: "Processing", done: false },
        { label: "Ready for pickup", done: false },
        { label: "Completed", done: false },
      ],
    }
    addApplication(app)
    setSubmittedApp(app)
  }

  const payNow = () => {
    setPaying(true)
    setTimeout(() => {
      setPaying(false)
      submit()
    }, 900)
  }

  // ---- Success screen ----
  if (submittedApp) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-5 pb-4 pt-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3.5 flex h-[76px] w-[76px] items-center justify-center rounded-full border-[2.5px] border-primary">
              <Check className="h-9 w-9 text-primary" strokeWidth={1.8} />
            </div>
            <h2 className="font-display text-[19px] font-semibold">Application submitted</h2>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              The Local Civil Registry Office will review your request. You will receive a notification once your
              document is ready for pickup.
            </p>
          </div>
          <ClaimStub app={submittedApp} />
          <div className="mt-5">
            <Timeline stages={submittedApp.stages} />
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2.5 border-t border-border bg-card px-5 py-3.5 pb-[max(env(safe-area-inset-bottom),14px)]">
          <Button variant="ghost" size="auto" className="flex-1" onClick={() => navigate("/home")}>
            Back to home
          </Button>
          <Button className="flex-[2]" onClick={() => navigate("/applications")}>
            Back to Applications
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Civil registry"
        subtitle={`Step ${step} of 4 - ${STEP_LABELS[step - 1]}`}
        backTo={() => (step > 1 ? setStep(step - 1) : navigate("/home"))}
      />
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <Progress value={(step / 4) * 100} className="mb-5" />

        {step === 1 && (
          <div>
            <p className="mb-4 text-[12.5px] text-muted-foreground">
              Choose the certificate you need. Your request will be reviewed by the Local Civil Registry Office.
            </p>
            <div className="space-y-2.5">
              {civilRegistryCertTypes.map((c) => {
                const Icon = ICONS[c.icon] ?? ICONS["file-text"]
                return (
                  <button
                    key={c.id}
                    onClick={() => selectCertType(c.id)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition-transform active:scale-[0.99]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                      <Icon className="h-5 w-5 text-primary" strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold">{c.title}</p>
                      <p className="mt-0.5 text-[11.5px] text-muted-foreground">{c.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 2 && certType && (
          <div>
            <WalletBanner />

            {certType === "birth" && (
              <>
                <TextField
                  label="BReN (Birth Reference Number)"
                  optional
                  placeholder="If available"
                  value={values.bren || ""}
                  onChange={(v) => setField("bren", v)}
                />

                <SectionLabel>Person information</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="First name" value={values.firstName || ""} onChange={(v) => setField("firstName", v)} error={errors.firstName} />
                  <TextField label="Middle name" optional value={values.middleName || ""} onChange={(v) => setField("middleName", v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Last name" value={values.lastName || ""} onChange={(v) => setField("lastName", v)} error={errors.lastName} />
                  <TextField label="Suffix" optional placeholder="Jr., Sr., III" value={values.suffix || ""} onChange={(v) => setField("suffix", v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Sex" value={values.sex || ""} onChange={(v) => setField("sex", v)} options={["Male", "Female"]} error={errors.sex} />
                  <TextField label="Birth date" type="date" value={values.birthDate || ""} onChange={(v) => setField("birthDate", v)} error={errors.birthDate} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Province" placeholder="e.g. Bulacan" value={values.province || ""} onChange={(v) => setField("province", v)} error={errors.province} />
                  <TextField label="City / Municipality" placeholder="e.g. Malolos" value={values.cityMunicipality || ""} onChange={(v) => setField("cityMunicipality", v)} error={errors.cityMunicipality} />
                </div>

                <SectionLabel>Parents</SectionLabel>
                <TextField label="Father's full name" value={values.fatherName || ""} onChange={(v) => setField("fatherName", v)} error={errors.fatherName} />
                <TextField label="Mother's maiden name" value={values.motherMaidenName || ""} onChange={(v) => setField("motherMaidenName", v)} error={errors.motherMaidenName} />

                <SectionLabel>Request details</SectionLabel>
                <SelectField label="Purpose" value={values.purpose || ""} onChange={(v) => setField("purpose", v)} options={PURPOSE_OPTIONS} error={errors.purpose} />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Number of copies" type="number" value={values.copies || "1"} onChange={(v) => setField("copies", v)} error={errors.copies} />
                  {own ? (
                    <ReadOnlyField label="Relationship to owner" value="Self" />
                  ) : (
                    <SelectField label="Relationship to owner" value={values.relationship || ""} onChange={(v) => setField("relationship", v)} options={RELATIONSHIP_OPTIONS} error={errors.relationship} />
                  )}
                </div>

                <div className="mb-3.5 mt-2 flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5">
                  <Checkbox checked={own} onCheckedChange={(v) => setOwn(v === true)} className="mt-0.5" />
                  <label className="text-[13px] leading-snug" onClick={() => setOwn(!own)}>
                    I am requesting my own birth certificate.
                  </label>
                </div>

                {own ? (
                  <WalletAutofillCard />
                ) : (
                  <>
                    <TextField label="Requestor name" value={values.requestorName || ""} onChange={(v) => setField("requestorName", v)} error={errors.requestorName} />
                    <TextField label="Requestor address" value={values.requestorAddress || ""} onChange={(v) => setField("requestorAddress", v)} error={errors.requestorAddress} />
                    <UploadField label="Authorization letter" done={files.authLetter} uploading={uploading === "authLetter"} onUpload={() => handleUpload("authLetter", "Authorization-letter")} />
                    <UploadField label="Valid ID" done={files.validId} uploading={uploading === "validId"} onUpload={() => handleUpload("validId", "Valid-ID")} />
                  </>
                )}
              </>
            )}

            {certType === "marriage" && (
              <>
                <TextField
                  label="Marriage Reference Number"
                  optional
                  placeholder="If available"
                  value={values.mrn || ""}
                  onChange={(v) => setField("mrn", v)}
                />

                <SectionLabel>Husband</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="First name" value={values.hFirstName || ""} onChange={(v) => setField("hFirstName", v)} error={errors.hFirstName} />
                  <TextField label="Middle name" optional value={values.hMiddleName || ""} onChange={(v) => setField("hMiddleName", v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Last name" value={values.hLastName || ""} onChange={(v) => setField("hLastName", v)} error={errors.hLastName} />
                  <TextField label="Suffix" optional placeholder="Jr., Sr., III" value={values.hSuffix || ""} onChange={(v) => setField("hSuffix", v)} />
                </div>

                <SectionLabel>Wife</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Maiden first name" value={values.wFirstName || ""} onChange={(v) => setField("wFirstName", v)} error={errors.wFirstName} />
                  <TextField label="Middle name" optional value={values.wMiddleName || ""} onChange={(v) => setField("wMiddleName", v)} />
                </div>
                <TextField label="Maiden last name" value={values.wLastName || ""} onChange={(v) => setField("wLastName", v)} error={errors.wLastName} />

                <SectionLabel>Marriage details</SectionLabel>
                <TextField label="Marriage date" type="date" value={values.marriageDate || ""} onChange={(v) => setField("marriageDate", v)} error={errors.marriageDate} />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Province" placeholder="e.g. Bulacan" value={values.province || ""} onChange={(v) => setField("province", v)} error={errors.province} />
                  <TextField label="City / Municipality" placeholder="e.g. Malolos" value={values.cityMunicipality || ""} onChange={(v) => setField("cityMunicipality", v)} error={errors.cityMunicipality} />
                </div>

                <SectionLabel>Request details</SectionLabel>
                <SelectField label="Purpose" value={values.purpose || ""} onChange={(v) => setField("purpose", v)} options={PURPOSE_OPTIONS} error={errors.purpose} />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Copies" type="number" value={values.copies || "1"} onChange={(v) => setField("copies", v)} error={errors.copies} />
                  {own ? (
                    <ReadOnlyField label="Relationship" value="Self" />
                  ) : (
                    <SelectField label="Relationship" value={values.relationship || ""} onChange={(v) => setField("relationship", v)} options={RELATIONSHIP_OPTIONS} error={errors.relationship} />
                  )}
                </div>

                <div className="mb-3.5 mt-2 flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5">
                  <Checkbox checked={own} onCheckedChange={(v) => setOwn(v === true)} className="mt-0.5" />
                  <label className="text-[13px] leading-snug" onClick={() => setOwn(!own)}>
                    I am one of the spouses.
                  </label>
                </div>

                {own ? (
                  <WalletAutofillCard />
                ) : (
                  <>
                    <TextField label="Requestor name" value={values.requestorName || ""} onChange={(v) => setField("requestorName", v)} error={errors.requestorName} />
                    <TextField label="Requestor address" value={values.requestorAddress || ""} onChange={(v) => setField("requestorAddress", v)} error={errors.requestorAddress} />
                    <UploadField label="Authorization letter" done={files.authLetter} uploading={uploading === "authLetter"} onUpload={() => handleUpload("authLetter", "Authorization-letter")} />
                    <UploadField label="Valid ID" done={files.validId} uploading={uploading === "validId"} onUpload={() => handleUpload("validId", "Valid-ID")} />
                  </>
                )}
              </>
            )}

            {certType === "death" && (
              <>
                <TextField
                  label="Death Reference Number"
                  optional
                  placeholder="If available"
                  value={values.drn || ""}
                  onChange={(v) => setField("drn", v)}
                />

                <SectionLabel>Deceased</SectionLabel>
                <TextField label="Full name" value={values.deceasedFullName || ""} onChange={(v) => setField("deceasedFullName", v)} error={errors.deceasedFullName} />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Sex" value={values.deceasedSex || ""} onChange={(v) => setField("deceasedSex", v)} options={["Male", "Female"]} error={errors.deceasedSex} />
                  <TextField label="Birth date" optional type="date" value={values.deceasedBirthDate || ""} onChange={(v) => setField("deceasedBirthDate", v)} />
                </div>
                <TextField label="Date of death" type="date" value={values.dateOfDeath || ""} onChange={(v) => setField("dateOfDeath", v)} error={errors.dateOfDeath} />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Province" placeholder="e.g. Bulacan" value={values.province || ""} onChange={(v) => setField("province", v)} error={errors.province} />
                  <TextField label="City / Municipality" placeholder="e.g. Malolos" value={values.cityMunicipality || ""} onChange={(v) => setField("cityMunicipality", v)} error={errors.cityMunicipality} />
                </div>

                <SectionLabel>Parents</SectionLabel>
                <TextField label="Father's name" value={values.fatherName || ""} onChange={(v) => setField("fatherName", v)} error={errors.fatherName} />
                <TextField label="Mother's maiden name" value={values.motherMaidenName || ""} onChange={(v) => setField("motherMaidenName", v)} error={errors.motherMaidenName} />

                <SectionLabel>Request details</SectionLabel>
                <SelectField label="Relationship to the deceased" value={values.relationship || ""} onChange={(v) => setField("relationship", v)} options={DEATH_RELATIONSHIP_OPTIONS} error={errors.relationship} />
                <SelectField label="Purpose" value={values.purpose || ""} onChange={(v) => setField("purpose", v)} options={PURPOSE_OPTIONS} error={errors.purpose} />
                <TextField label="Number of copies" type="number" value={values.copies || "1"} onChange={(v) => setField("copies", v)} error={errors.copies} />

                <div className="mb-2.5 flex items-center justify-between">
                  <SectionLabel>Requestor</SectionLabel>
                  <button type="button" onClick={fillRequestorFromWallet} className="mb-2.5 text-[11.5px] font-semibold text-primary">
                    Use wallet info
                  </button>
                </div>
                <TextField label="Requestor name" value={values.requestorName || ""} onChange={(v) => setField("requestorName", v)} error={errors.requestorName} />
                <TextField label="Requestor address" value={values.requestorAddress || ""} onChange={(v) => setField("requestorAddress", v)} error={errors.requestorAddress} />
              </>
            )}
          </div>
        )}

        {step === 3 && certType && certConfig && (
          <div>
            <p className="mb-3 text-[12.5px] text-muted-foreground">Review your request before proceeding to payment.</p>
            <div className="rounded-2xl border border-border bg-card p-4">
              <ReviewRow label="Certificate type" value={certConfig.title} />
              <ReviewRow label="Applicant" value={applicantName || "-"} />
              <ReviewRow label="Purpose" value={values.purpose || "-"} />
              <ReviewRow label="Copies" value={String(copies)} />
              <ReviewRow label="Estimated fee" value={peso(fee)} last />
            </div>

            <p className="mb-2.5 mt-5 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">Payment method</p>
            <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <ReviewRow label="Amount" value={peso(fee)} />
              <ReviewRow label="Reference number" value={referenceNumber} last />
            </div>
            <div>
              <p className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">Payment method</p>
              <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
            </div>
            <div className="flex items-start gap-2.5 rounded-2xl bg-secondary p-3.5 text-[12px] text-muted-foreground">
              <ReceiptText className="h-4 w-4 shrink-0" strokeWidth={1.7} />
              This is a mock payment for demo purposes - no real transaction will be made.
            </div>
          </div>
        )}
      </div>

      {step > 1 && (
        <div className="flex flex-shrink-0 gap-2.5 border-t border-border bg-card px-5 py-3.5 pb-[max(env(safe-area-inset-bottom),14px)]">
          <Button variant="ghost" size="auto" className="flex-1" onClick={() => setStep(step - 1)}>
            Back
          </Button>
          {step === 2 && (
            <Button className="flex-[2]" onClick={goToReview}>
              Review request
            </Button>
          )}
          {step === 3 && (
            <Button className="flex-[2]" onClick={goToPayment}>
              Proceed to payment
            </Button>
          )}
          {step === 4 && (
            <Button className="flex-[2]" disabled={paying} onClick={payNow}>
              {paying && <RotateCw className="h-4 w-4 animate-spin" />}
              {paying ? "Processing..." : "Pay now"}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
