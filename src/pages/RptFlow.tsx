import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Check, RotateCw, Landmark } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ClaimStub } from "@/components/shared/ClaimStub"
import { PAYMENT_METHODS } from "@/components/shared/PaymentMethodPicker"
import { PaymentStep } from "@/components/shared/PaymentStep"
import { ReviewRow } from "@/components/shared/ReviewRow"
import { useAppData } from "@/context/useAppData"
import { lookupProperty, type PropertyRecord } from "@/data/mock"
import type { Application } from "@/types"

const peso = (n: number) => `PHP ${n.toLocaleString("en-PH")}.00`

const STEP_LABELS = ["Find property", "Review assessment", "Payment"]

export default function RptFlow() {
  const navigate = useNavigate()
  const { addApplication, showToast } = useAppData()

  const [step, setStep] = useState(1)
  const [tdn, setTdn] = useState("")
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [property, setProperty] = useState<PropertyRecord | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [paying, setPaying] = useState(false)
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null)

  const total = property?.dueItems.reduce((sum, i) => sum + i.amount, 0) ?? 0
  const paymentMethodLabel = PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ?? ""

  const search = () => {
    if (!tdn.trim()) return showToast("Enter a tax declaration number")
    setSearching(true)
    setSearched(false)
    setTimeout(() => {
      setProperty(lookupProperty(tdn))
      setSearching(false)
      setSearched(true)
    }, 700)
  }

  const goToPayment = () => {
    setReferenceNumber(`REF-2026-${Math.floor(1000 + Math.random() * 8999)}`)
    setStep(3)
  }

  const submit = () => {
    if (!property) return
    const today = "Jul 18, 2026"
    const seq = Math.floor(1000 + Math.random() * 8999)
    const track = `RPT-2026-${seq}`
    const app: Application = {
      id: `app-${Date.now()}`,
      service: "Real property tax",
      who: `Tax declaration ${property.tdn}`,
      status: "review",
      track,
      submitted: today,
      attachments: [],
      stages: [
        { label: "Payment submitted", done: true, note: `Paid via ${paymentMethodLabel} - ${referenceNumber}`, date: today },
        { label: "Verifying payment", done: false, note: "City Treasurer's Office is confirming your payment" },
        { label: "Official receipt generated", done: false },
        { label: "Approved - ready for release", done: false },
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

  if (submittedApp) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-5 pb-4 pt-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3.5 flex h-[76px] w-[76px] items-center justify-center rounded-full border-[2.5px] border-primary">
              <Check className="h-9 w-9 text-primary" strokeWidth={1.8} />
            </div>
            <h2 className="font-display text-[19px] font-semibold">Pending verification</h2>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Once staff confirms your payment, your official receipt will be ready to claim - digitally or printed.
            </p>
          </div>
          <ClaimStub app={submittedApp} />
        </div>
        <div className="flex flex-shrink-0 gap-2.5 border-t border-border bg-card px-5 py-3.5 pb-[max(env(safe-area-inset-bottom),14px)]">
          <Button variant="ghost" size="auto" className="flex-1" onClick={() => navigate("/home")}>
            Back to home
          </Button>
          <Button className="flex-[2]" onClick={() => navigate("/applications")}>
            Track application
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Real property tax"
        subtitle={`Step ${step} of 3 - ${STEP_LABELS[step - 1]}`}
        backTo={() => (step > 1 ? setStep(step - 1) : navigate("/home"))}
      />
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <Progress value={(step / 3) * 100} className="mb-5" />

        {step === 1 && (
          <div>
            <p className="mb-3 text-[12.5px] text-muted-foreground">
              No ID needed - real property tax is tied to the property record, not your personal identity.
            </p>
            <Label className="mb-2 block text-[12.5px] font-semibold text-muted-foreground">Tax declaration number</Label>
            <div className="mb-4 flex gap-2">
              <Input placeholder="Tax declaration number, e.g. 04015-00231" value={tdn} onChange={(e) => setTdn(e.target.value)} />
              <Button size="auto" className="px-4" onClick={search} disabled={searching}>
                {searching ? <RotateCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {searched && !property && <p className="text-[13px] text-muted-foreground">No property found for that number.</p>}

            {property && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
                    <Landmark className="h-[18px] w-[18px] text-primary" strokeWidth={1.7} />
                  </div>
                  <div>
                    <p className="font-mono text-[12px] font-semibold">{property.tdn}</p>
                    <p className="text-[11px] text-muted-foreground">{property.classification} property</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between"><span className="text-muted-foreground">Owner on record</span><span className="font-semibold">{property.owner}</span></div>
                  <div className="flex justify-between gap-3"><span className="shrink-0 text-muted-foreground">Address</span><span className="text-right font-semibold">{property.address}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && property && (
          <div>
            <p className="mb-3 text-[12.5px] text-muted-foreground">This is your current assessed tax for this property.</p>
            <div className="rounded-2xl border border-border bg-card p-4">
              {property.dueItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-border py-2.5 text-[13px] last:border-none">
                  <span className="font-semibold">{item.label}</span>
                  <span className="font-mono text-[12.5px] text-muted-foreground">{peso(item.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 text-[15px] font-bold">
                <span>Total due</span>
                <span className="font-mono">{peso(total)}</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <PaymentStep
            amount={peso(total)}
            amountLabel={`Real property tax · Tax declaration ${property?.tdn ?? ""}`}
            reviewRows={[
              { label: "Reference number", value: referenceNumber, last: true },
            ]}
            paymentMethod={paymentMethod}
            onPaymentChange={setPaymentMethod}
          />
        )}
      </div>

      <div className="flex flex-shrink-0 gap-2.5 border-t border-border bg-card px-5 py-3.5 pb-[max(env(safe-area-inset-bottom),14px)]">
        {step > 1 && (
          <Button variant="ghost" size="auto" className="flex-1" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step === 1 && (
          <Button className="flex-[2]" disabled={!property} onClick={() => setStep(2)}>
            Review assessment
          </Button>
        )}
        {step === 2 && (
          <Button className="flex-[2]" onClick={goToPayment}>
            Proceed to payment
          </Button>
        )}
        {step === 3 && (
          <Button className="flex-[2]" disabled={!paymentMethod || paying} onClick={payNow}>
            {paying && <RotateCw className="h-4 w-4 animate-spin" />}
            {paying ? "Processing..." : "Pay now"}
          </Button>
        )}
      </div>
    </div>
  )
}
