import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, X, Upload, RotateCw, Check, ReceiptText, Landmark } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ClaimStub } from "@/components/shared/ClaimStub"
import { useAppData } from "@/context/AppDataContext"
import { lookupProperty, type PropertyRecord } from "@/data/mock"
import type { Application } from "@/types"

const peso = (n: number) => `PHP ${n.toLocaleString("en-PH")}.00`

interface CartItem {
  id: string
  label: string
  amount: number
}

export default function RptFlow() {
  const navigate = useNavigate()
  const { addApplication, showToast } = useAppData()

  const [step, setStep] = useState(1)
  const [tdn, setTdn] = useState("")
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [property, setProperty] = useState<PropertyRecord | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [proofFile, setProofFile] = useState<string | null>(null)
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null)

  const total = cart.reduce((sum, i) => sum + i.amount, 0)

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

  const inCart = (id: string) => cart.some((c) => c.id === id)
  const addToCart = (item: CartItem) => setCart((c) => [...c, item])
  const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.id !== id))

  const uploadProof = () => {
    setUploading(true)
    setTimeout(() => {
      setProofFile("GCash-receipt-0718.jpg")
      setUploading(false)
      showToast("Proof of payment attached")
    }, 800)
  }

  const submit = () => {
    const today = "Jul 18, 2026"
    const seq = Math.floor(1000 + Math.random() * 8999)
    const track = `RPT-2026-${seq}`
    const app: Application = {
      id: `app-${Date.now()}`,
      service: "Real property tax",
      who: property ? `Tax declaration ${property.tdn}` : "Property tax payment",
      status: "review",
      track,
      submitted: today,
      attachments: proofFile ? [proofFile] : [],
      stages: [
        { label: "Proof of payment submitted", done: true, note: "Received online", date: today },
        { label: "Verifying payment", done: false, note: "City Treasurer's Office is confirming your payment" },
        { label: "Official receipt generated", done: false },
        { label: "Approved - ready for release", done: false },
      ],
    }
    addApplication(app)
    setSubmittedApp(app)
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

  const stepLabels = ["Find property", "Review total", "Payment"]

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Real property tax"
        subtitle={`Step ${step} of 3 - ${stepLabels[step - 1]}`}
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
              <div className="space-y-4">
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

                <div>
                  <p className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">Amount due</p>
                  <div className="space-y-2.5">
                    {property.dueItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5">
                        <div>
                          <p className="text-[13.5px] font-semibold">{item.label}</p>
                          <p className="font-mono text-[12.5px] text-muted-foreground">{peso(item.amount)}</p>
                        </div>
                        {inCart(item.id) ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-sage-foreground">
                            <Check className="h-3.5 w-3.5" /> In cart
                          </span>
                        ) : (
                          <Button size="sm" variant="outline" className="w-auto gap-1.5" onClick={() => addToCart(item)}>
                            <Plus className="h-3.5 w-3.5" /> Add
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-3 text-[12.5px] text-muted-foreground">Review what you're paying for before proceeding.</p>
            {cart.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">Your cart is empty. Go back and add an amount due.</p>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-border py-2.5 text-[13px] last:border-none">
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="font-mono text-[12px] text-muted-foreground">{peso(item.amount)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-adobe-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 text-[15px] font-bold">
                  <span>Total</span>
                  <span className="font-mono">{peso(total)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[13px] font-bold">Total due: <span className="font-mono">{peso(total)}</span></p>
              <p className="mt-2 text-[12.5px] text-muted-foreground">
                Pay via GCash to 0917 000 0000 (City of Malolos Treasury), or over the counter at any Treasurer's satellite office. Then upload your proof of payment below.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-3 text-[13px] font-semibold">Proof of payment</p>
              {proofFile && <p className="mb-2 text-[12px] text-sage-foreground">{proofFile}</p>}
              <button
                onClick={uploadProof}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 py-3 text-[12.5px] font-semibold text-primary hover:bg-accent"
              >
                {uploading ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Uploading..." : proofFile ? "Replace file" : "Upload receipt or screenshot"}
              </button>
            </div>
            <div className="flex items-start gap-2.5 rounded-2xl bg-secondary p-3.5 text-[12px] text-muted-foreground">
              <ReceiptText className="h-4 w-4 shrink-0" strokeWidth={1.7} />
              Your official receipt will be generated once staff verifies this payment.
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
        {step === 1 && (
          <Button className="flex-[2]" disabled={cart.length === 0} onClick={() => setStep(2)}>
            Review total ({cart.length})
          </Button>
        )}
        {step === 2 && (
          <Button className="flex-[2]" disabled={cart.length === 0} onClick={() => setStep(3)}>
            Proceed to payment
          </Button>
        )}
        {step === 3 && (
          <Button className="flex-[2]" disabled={!proofFile} onClick={submit}>
            Submit for verification
          </Button>
        )}
      </div>
    </div>
  )
}
