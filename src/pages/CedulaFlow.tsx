import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, CircleDollarSign, IdCard, Info, LoaderCircle, ShieldCheck } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Timeline } from "@/components/shared/Timeline"
import { PAYMENT_METHODS } from "@/components/shared/PaymentMethodPicker"
import { PaymentStep } from "@/components/shared/PaymentStep"
import { ReviewRow } from "@/components/shared/ReviewRow"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppData } from "@/context/useAppData"
import { getValidId, walletProfile } from "@/data/mock"
import type { Application } from "@/types"

const STEP_LABELS = [
  "Verified identity",
  "Personal information",
  "Personal details",
  "Employment & income",
  "Tax summary",
  "Review application",
  "Payment",
  "Submitted",
]
const CIVIL_STATUSES = ["Single", "Married", "Widowed", "Separated"]
const OCCUPATIONS = ["Employed", "Self-employed", "Business Owner", "Student", "Unemployed", "Retired", "Housewife"]
const INCOME_OCCUPATIONS = new Set(["Employed", "Self-employed", "Business Owner"])
const peso = (amount: number) => `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

type FormValues = {
  fullName: string
  address: string
  birthDate: string
  birthPlace: string
  citizenship: string
  civilStatus: string
  height: string
  weight: string
  occupation: string
  tin: string
  income: string
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  optional,
  error,
  inputMode,
}: {
  id: keyof FormValues
  label: string
  value: string
  onChange: (id: keyof FormValues, value: string) => void
  type?: "text" | "date" | "number"
  placeholder?: string
  optional?: boolean
  error?: boolean
  inputMode?: "decimal" | "numeric"
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
      </Label>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        aria-invalid={error}
        error={error}
        onChange={(event) => onChange(id, event.target.value)}
      />
      {error && <p className="text-[11.5px] text-adobe">This field is required.</p>}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 font-display text-[15px] font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export default function CedulaFlow() {
  const navigate = useNavigate()
  const { wallet, addApplication, showToast } = useAppData()
  const verifiedId = getValidId(wallet)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [declared, setDeclared] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paying, setPaying] = useState(false)
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null)
  const [values, setValues] = useState<FormValues>({
    fullName: walletProfile.fullName,
    address: walletProfile.address,
    birthDate: walletProfile.birthDate,
    birthPlace: walletProfile.birthPlace,
    citizenship: walletProfile.citizenship,
    civilStatus: "",
    height: "",
    weight: "",
    occupation: "",
    tin: "",
    income: "",
  })

  const hasIncome = INCOME_OCCUPATIONS.has(values.occupation)
  const annualIncome = Number(values.income) || 0
  const additionalTax = hasIncome ? Math.min(5000, Math.floor(annualIncome / 1000)) : 0
  const total = 5 + additionalTax
  const paymentLabel = PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.label ?? ""

  const setField = (id: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [id]: value }))
    setErrors((current) => ({ ...current, [id]: false }))
    if (id === "occupation" && !INCOME_OCCUPATIONS.has(value)) {
      setValues((current) => ({ ...current, occupation: value, tin: "", income: "" }))
    }
  }

  const requireFields = (fields: (keyof FormValues)[]) => {
    const nextErrors: Partial<Record<keyof FormValues, boolean>> = {}
    fields.forEach((field) => {
      if (!values[field].trim()) nextErrors[field] = true
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      showToast("Complete the required fields to continue")
      return false
    }
    return true
  }

  const next = () => {
    if (step === 1 && !verifiedId) {
      showToast("Add and verify a government ID in your Identity Wallet first")
      navigate("/wallet")
      return
    }
    if (step === 2 && !requireFields(["fullName", "address", "birthDate", "birthPlace", "citizenship", "civilStatus"])) return
    if (step === 3 && !requireFields(["height", "weight"])) return
    if (step === 4 && !requireFields(hasIncome ? ["occupation", "income"] : ["occupation"])) return
    if (step === 6 && !declared) {
      showToast("Confirm the declaration to continue")
      return
    }
    setStep((current) => Math.min(7, current + 1))
  }

  const submit = () => {
    if (!paymentMethod) {
      showToast("Choose a payment method to continue")
      return
    }
    setPaying(true)
    window.setTimeout(() => {
      const track = `CTC-2026-${Math.floor(1000 + Math.random() * 8999)}`
      const today = "Jul 20, 2026"
      const app: Application = {
        id: `app-${Date.now()}`,
        service: "Cedula",
        who: values.fullName,
        status: "submitted",
        track,
        submitted: today,
        stages: [
          { label: "Submitted", done: true, note: "Application and payment details received", date: today },
          { label: "Payment Verification", done: false, note: `City Treasurer's Office is confirming your ${paymentLabel} payment` },
          { label: "Processing", done: false, note: "Your Community Tax Certificate will be prepared" },
          { label: "Ready for Pickup", done: false },
        ],
      }
      addApplication(app)
      setSubmittedApp(app)
      setPaying(false)
      setStep(8)
    }, 900)
  }

  const content = useMemo(() => {
    if (step === 1) {
      return (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-primary/30 bg-accent p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <ShieldCheck className="size-5 text-primary" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="font-display text-[15px] font-semibold">Using your verified Identity Wallet</h2>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                  Your verified identity has been retrieved from your Identity Wallet to speed up this application.
                </p>
              </div>
            </div>
          </div>
          {verifiedId ? (
            <SectionCard title="Verified ID being used">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sage/15">
                  <IdCard className="size-5 text-sage-foreground" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold">{verifiedId.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">{verifiedId.category}</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-sage-foreground">
                  <Check className="size-3" /> Verified
                </span>
              </div>
            </SectionCard>
          ) : (
            <div className="rounded-2xl border border-adobe/30 bg-adobe/10 p-4 text-[13px] text-adobe-foreground">
              No verified government ID was found. Add one to your Identity Wallet before continuing.
            </div>
          )}
          <p className="px-2 text-center text-[11.5px] leading-relaxed text-muted-foreground">
            No additional ID upload is needed for this application.
          </p>
        </div>
      )
    }

    if (step === 2) {
      return (
        <SectionCard title="Personal information">
          <p className="mb-4 text-[12px] text-muted-foreground">Pre-filled from your Identity Wallet. Edit only if necessary.</p>
          <div className="flex flex-col gap-4">
            <Field id="fullName" label="Full name" value={values.fullName} onChange={setField} error={errors.fullName} />
            <Field id="address" label="Home address" value={values.address} onChange={setField} error={errors.address} />
            <Field id="birthDate" label="Birth date" type="date" value={values.birthDate} onChange={setField} error={errors.birthDate} />
            <Field id="birthPlace" label="Birth place" value={values.birthPlace} onChange={setField} error={errors.birthPlace} />
            <Field id="citizenship" label="Citizenship" value={values.citizenship} onChange={setField} error={errors.citizenship} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="civil-status">Civil status</Label>
              <Select value={values.civilStatus} onValueChange={(value) => setField("civilStatus", value)}>
                <SelectTrigger id="civil-status" aria-invalid={errors.civilStatus} className={errors.civilStatus ? "border-adobe" : undefined}>
                  <SelectValue placeholder="Select civil status" />
                </SelectTrigger>
                <SelectContent>{CIVIL_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
              </Select>
              {errors.civilStatus && <p className="text-[11.5px] text-adobe">This field is required.</p>}
            </div>
          </div>
        </SectionCard>
      )
    }

    if (step === 3) {
      return (
        <SectionCard title="Personal details">
          <p className="mb-4 text-[12px] text-muted-foreground">Enter your current measurements as they should appear on your Cedula.</p>
          <div className="grid grid-cols-2 gap-3">
            <Field id="height" label="Height (cm)" type="number" inputMode="decimal" placeholder="e.g. 170" value={values.height} onChange={setField} error={errors.height} />
            <Field id="weight" label="Weight (kg)" type="number" inputMode="decimal" placeholder="e.g. 65" value={values.weight} onChange={setField} error={errors.weight} />
          </div>
        </SectionCard>
      )
    }

    if (step === 4) {
      return (
        <SectionCard title="Employment & income">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occupation">Occupation</Label>
              <Select value={values.occupation} onValueChange={(value) => setField("occupation", value)}>
                <SelectTrigger id="occupation" aria-invalid={errors.occupation} className={errors.occupation ? "border-adobe" : undefined}>
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent>{OCCUPATIONS.map((occupation) => <SelectItem key={occupation} value={occupation}>{occupation}</SelectItem>)}</SelectContent>
              </Select>
              {errors.occupation && <p className="text-[11.5px] text-adobe">This field is required.</p>}
            </div>
            {hasIncome && (
              <>
                <Field id="tin" label="Tax Identification Number (TIN)" optional placeholder="000-000-000-000" value={values.tin} onChange={setField} />
                <Field id="income" label="Gross annual income (PHP)" type="number" inputMode="decimal" placeholder="0.00" value={values.income} onChange={setField} error={errors.income} />
              </>
            )}
            {values.occupation && !hasIncome && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-sage/15 p-3.5 text-sage-foreground">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p className="text-[12.5px] font-medium">You qualify for the basic Community Tax only.</p>
              </div>
            )}
          </div>
        </SectionCard>
      )
    }

    if (step === 5) {
      return (
        <div className="flex flex-col gap-4">
          <SectionCard title="Tax summary">
            <ReviewRow label="Base tax" value={peso(5)} />
            {hasIncome && <ReviewRow label="Additional Community Tax" value={peso(additionalTax)} />}
            <div className="mt-3 flex items-end justify-between rounded-xl bg-secondary p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total amount</p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">Estimated for this prototype</p>
              </div>
              <p className="font-display text-[22px] font-semibold text-primary">{peso(total)}</p>
            </div>
          </SectionCard>
          <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5">
            <CircleDollarSign className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[11.5px] leading-relaxed text-muted-foreground">The final amount is based on the information provided and will be verified by the City Treasurer's Office.</p>
          </div>
        </div>
      )
    }

    if (step === 6) {
      return (
        <div className="flex flex-col gap-3">
          <SectionCard title="Personal information">
            <ReviewRow label="Full name" value={values.fullName} />
            <ReviewRow label="Home address" value={values.address} />
            <ReviewRow label="Birth date" value={values.birthDate} />
            <ReviewRow label="Birth place" value={values.birthPlace} />
            <ReviewRow label="Citizenship" value={values.citizenship} />
            <ReviewRow label="Civil status" value={values.civilStatus} last />
          </SectionCard>
          <SectionCard title="Application details">
            <ReviewRow label="Height / Weight" value={`${values.height} cm / ${values.weight} kg`} />
            <ReviewRow label="Occupation" value={values.occupation} />
            {hasIncome && <ReviewRow label="TIN" value={values.tin || "Not provided"} />}
            {hasIncome && <ReviewRow label="Gross annual income" value={peso(annualIncome)} />}
            <ReviewRow label="Estimated Cedula fee" value={peso(total)} last />
          </SectionCard>
          <label htmlFor="declaration" className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <Checkbox id="declaration" checked={declared} onCheckedChange={(checked) => setDeclared(checked === true)} className="mt-0.5" />
            <span className="text-[12.5px] leading-relaxed">I declare that the information provided is true and correct.</span>
          </label>
        </div>
      )
    }

    if (step === 7) {
      return (
        <PaymentStep
          amount={peso(total)}
          amountLabel="Community Tax Certificate"
          paymentMethod={paymentMethod}
          onPaymentChange={setPaymentMethod}
        />
      )
    }

    return null
  }, [step, verifiedId, values, errors, hasIncome, additionalTax, annualIncome, total, declared, paymentMethod])

  if (step === 8 && submittedApp) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-8">
          <div className="text-center">
            <div className="mx-auto flex size-[76px] items-center justify-center rounded-full border-[2.5px] border-primary">
              <Check className="size-9 text-primary" strokeWidth={1.8} />
            </div>
            <h1 className="mt-4 font-display text-[20px] font-semibold">Application submitted</h1>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">Your Community Tax Certificate request is now being reviewed.</p>
          </div>
          <div className="my-5 rounded-2xl border border-border bg-card p-4">
            <ReviewRow label="Reference number" value={submittedApp.track} />
            <ReviewRow label="Current status" value="Pending Verification" last />
          </div>
          <Timeline stages={submittedApp.stages} />
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-accent p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[12.5px] leading-relaxed">Your payment will be verified by the City Treasurer&apos;s Office before your Community Tax Certificate is issued.</p>
          </div>
        </div>
        <div className="flex-shrink-0 border-t border-border bg-card px-5 py-3.5 pb-[max(env(safe-area-inset-bottom),14px)]">
          <Button className="w-full" onClick={() => navigate("/applications")}>Back to Applications</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Community Tax Certificate" subtitle={`Step ${step} of 8 - ${STEP_LABELS[step - 1]}`} backTo={() => (step > 1 ? setStep(step - 1) : navigate("/home"))} />
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <Progress value={(step / 8) * 100} className="mb-5" />
        {content}
      </div>
      <div className="flex-shrink-0 border-t border-border bg-card px-5 py-3.5 pb-[max(env(safe-area-inset-bottom),14px)]">
        {step === 7 ? (
          <Button className="w-full" disabled={paying} onClick={submit}>
            {paying && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
            {paying ? "Processing payment..." : `Pay ${peso(total)}`}
          </Button>
        ) : (
          <Button className="w-full" onClick={next}>{step === 6 ? "Continue to Payment" : "Continue"}</Button>
        )}
      </div>
    </div>
  )
}
