import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  Upload,
  WalletCards,
} from "lucide-react"
import { Header } from "@/components/layout/Header"
import { WalletBanner } from "@/components/shared/WalletBanner"
import { Timeline } from "@/components/shared/Timeline"
import { ReviewRow } from "@/components/shared/ReviewRow"
import { PaymentMethodPicker, PAYMENT_METHODS } from "@/components/shared/PaymentMethodPicker"
import { PaymentStep } from "@/components/shared/PaymentStep"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppData } from "@/context/useAppData"
import { walletProfile } from "@/data/mock"
import type { Application, ApplicationStage } from "@/types"

type View = "hub" | "new" | "renew" | "status"
type Values = Record<string, string>

const NEW_STEPS = ["Business", "Location", "Investment", "Documents", "Review"]
const RENEW_STEPS = ["Find permit", "Update details", "Documents", "Review"]
const BUSINESS_TYPES = ["Sole proprietorship", "Partnership", "Corporation", "Cooperative"]
const OWNERSHIP = ["Owned", "Rented", "Leased"]
const ACTIVITIES = ["Retail or merchandising", "Food and beverage", "Professional services", "Manufacturing", "Other"]
const peso = (value: number) => `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`

function Field({ label, value, onChange, placeholder, type = "text", disabled, required }: { label: string; value: string; onChange?: (value: string) => void; placeholder?: string; type?: "text" | "number" | "date" | "email" | "tel"; disabled?: boolean; required?: boolean }) {
  return <div className="flex flex-col gap-1.5"><Label>{label}{required && <span className="text-destructive"> *</span>}</Label><Input value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} type={type} disabled={disabled} /></div>
}

function Choice({ label, value, onChange, options, required }: { label: string; value: string; onChange: (value: string) => void; options: string[]; required?: boolean }) {
  return <div className="flex flex-col gap-1.5"><Label>{label}{required && <span className="text-destructive"> *</span>}</Label><Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle>{description && <CardDescription>{description}</CardDescription>}</CardHeader><CardContent className="flex flex-col gap-4">{children}</CardContent></Card>
}

function UploadRow({ label, file, onUpload, required = true }: { label: string; file?: string; onUpload: () => void; required?: boolean }) {
  return <div className="flex items-center gap-3 rounded-xl border border-border p-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">{file ? <Check className="size-4 text-primary" /> : <FileText className="size-4 text-muted-foreground" />}</div><div className="min-w-0 flex-1"><p className="text-[13px] font-semibold">{label}{required && " *"}</p><p className="truncate text-[11px] text-muted-foreground">{file || "PDF, JPG, or PNG · up to 10 MB"}</p></div><Button variant="outline" size="sm" onClick={onUpload}><Upload data-icon="inline-start" />{file ? "Replace" : "Upload"}</Button></div>
}

function StepFooter({ step, onBack, onNext, nextLabel = "Continue", disabled }: { step: number; onBack: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return <div className="flex shrink-0 gap-2.5 border-t border-border bg-card px-5 py-3.5 pb-[max(env(safe-area-inset-bottom),14px)]">{step > 1 && <Button variant="ghost" className="flex-1" onClick={onBack}>Back</Button>}<Button className="flex-[2]" onClick={onNext} disabled={disabled}>{nextLabel}<ArrowRight data-icon="inline-end" /></Button></div>
}

function Success({ app, onHome, onTrack }: { app: Application; onHome: () => void; onTrack: () => void }) {
  return <div className="flex h-full flex-col"><div className="flex flex-1 flex-col items-center overflow-y-auto px-5 py-8 text-center"><div className="flex size-20 items-center justify-center rounded-full border-2 border-primary"><Check className="size-9 text-primary" /></div><h2 className="mt-4 font-display text-xl font-semibold">Application submitted</h2><p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">The Business Permits and Licensing Office will review your details and documents.</p><Card className="mt-6 w-full text-left"><CardHeader><CardDescription>Tracking number</CardDescription><CardTitle className="font-mono text-lg">{app.track}</CardTitle></CardHeader><CardContent><ReviewRow label="Business" value={app.who} /><ReviewRow label="Submitted" value={app.submitted} last /></CardContent></Card><div className="mt-5 w-full text-left"><Timeline stages={app.stages} /></div></div><div className="flex gap-2.5 border-t border-border bg-card px-5 py-3.5 pb-[max(env(safe-area-inset-bottom),14px)]"><Button variant="ghost" className="flex-1" onClick={onHome}>Home</Button><Button className="flex-[2]" onClick={onTrack}>Track status</Button></div></div>
}

function NewApplication({ onBack, onStatus }: { onBack: () => void; onStatus: () => void }) {
  const { addApplication, showToast } = useAppData()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState<Application | null>(null)
  const [values, setValues] = useState<Values>({ applicantType: "Owner", ownerType: "Individual", ownerName: walletProfile.fullName, ownerAddress: walletProfile.address, mobile: walletProfile.contactNumber, city: "Malolos", province: "Bulacan", postalCode: "3000", employees: "1", capitalization: "0", equipment: "0", inventory: "0", improvements: "0" })
  const [activities, setActivities] = useState([{ id: 1, activity: "", units: "1" }])
  const [files, setFiles] = useState<Values>({})
  const [declared, setDeclared] = useState(false)
  const set = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }))
  const total = ["capitalization", "equipment", "inventory", "improvements"].reduce((sum, key) => sum + (Number(values[key]) || 0), 0)
  const upload = (key: string, name: string) => { setFiles((current) => ({ ...current, [key]: `${name}.pdf` })); showToast("File attached") }
  const validate = () => {
    const requiredByStep: Record<number, string[]> = { 1: ["businessName", "businessType", "tin", "ownerName", "mobile"], 2: ["street", "barangay", "ownership", "employees"], 3: ["capitalization"] }
    const missing = (requiredByStep[step] || []).some((key) => !values[key]?.trim())
    if (missing) { showToast("Complete all required fields to continue"); return false }
    if (step === 3 && activities.some((item) => !item.activity)) { showToast("Select each business activity"); return false }
    if (step === 4 && (!files.registration || !files.barangay || !files.location || (values.ownership !== "Owned" && !files.lease))) { showToast("Attach all required documents"); return false }
    return true
  }
  const next = () => { if (validate()) setStep((current) => Math.min(current + 1, 5)) }
  const submit = () => {
    if (!declared) return showToast("Confirm the declaration before submitting")
    const app: Application = { id: `app-${Date.now()}`, service: "Business permit", who: values.businessName, status: "submitted", track: `BP-2026-${Math.floor(1000 + Math.random() * 8999)}`, submitted: "Jul 19, 2026", attachments: Object.values(files), stages: [{ label: "Application submitted", done: true, note: "Received online", date: "Jul 19, 2026" }, { label: "Document review", done: false, note: "BPLO will verify your application" }, { label: "Assessment", done: false }, { label: "Payment", done: false }, { label: "Permit issuance", done: false }] }
    addApplication(app); setSubmitted(app)
  }
  if (submitted) return <Success app={submitted} onHome={onBack} onTrack={onStatus} />
  return <div className="flex h-full flex-col"><Header title="New business permit" subtitle={`Step ${step} of 5 · ${NEW_STEPS[step - 1]}`} backTo={() => step > 1 ? setStep(step - 1) : onBack()} /><div className="flex-1 overflow-y-auto px-5 pb-5"><Progress value={step * 20} className="mb-5" />
    {step === 1 && <div className="flex flex-col gap-4"><WalletBanner /><Section title="Application details" description="Tell us who is filing this application."><Choice label="Applicant" value={values.applicantType} onChange={(v) => set("applicantType", v)} options={["Owner", "Authorized representative"]} />{values.applicantType === "Authorized representative" && <><Field label="Representative name" value={values.representativeName || ""} onChange={(v) => set("representativeName", v)} required /><Field label="Relationship to owner" value={values.relationship || ""} onChange={(v) => set("relationship", v)} required /></>}</Section><Section title="Business and owner"><Field label="Business name" value={values.businessName || ""} onChange={(v) => set("businessName", v)} required /><Choice label="Organization type" value={values.businessType || ""} onChange={(v) => set("businessType", v)} options={BUSINESS_TYPES} required /><Field label="TIN" value={values.tin || ""} onChange={(v) => set("tin", v)} placeholder="000-000-000-000" required /><Choice label="Owner type" value={values.ownerType} onChange={(v) => set("ownerType", v)} options={["Individual", "Organization"]} />{values.ownerType === "Individual" ? <Field label="Owner full name" value={values.ownerName} onChange={(v) => set("ownerName", v)} required /> : <><Field label="Registered organization name" value={values.organizationName || ""} onChange={(v) => set("organizationName", v)} required /><Field label="Authorized officer" value={values.ownerName} onChange={(v) => set("ownerName", v)} required /></>}<Field label="Owner address" value={values.ownerAddress} onChange={(v) => set("ownerAddress", v)} required /><Field label="Mobile number" type="tel" value={values.mobile} onChange={(v) => set("mobile", v)} required /><Field label="Email address" type="email" value={values.email || ""} onChange={(v) => set("email", v)} /></Section></div>}
    {step === 2 && <div className="flex flex-col gap-4"><Section title="Business location"><Field label="Unit / street / building" value={values.street || ""} onChange={(v) => set("street", v)} required /><Field label="Barangay" value={values.barangay || ""} onChange={(v) => set("barangay", v)} required /><div className="grid grid-cols-2 gap-3"><Field label="City" value={values.city} disabled /><Field label="Province" value={values.province} disabled /></div><Field label="Postal code" value={values.postalCode} disabled /><Choice label="Occupancy" value={values.ownership || ""} onChange={(v) => set("ownership", v)} options={OWNERSHIP} required />{values.ownership && values.ownership !== "Owned" && <><Field label="Lessor full name" value={values.lessorName || ""} onChange={(v) => set("lessorName", v)} required /><Field label="Lessor address" value={values.lessorAddress || ""} onChange={(v) => set("lessorAddress", v)} required /><Field label="Monthly rent" type="number" value={values.rent || ""} onChange={(v) => set("rent", v)} /></>}</Section><Section title="Operations"><Field label="Number of employees" type="number" value={values.employees} onChange={(v) => set("employees", v)} required /><Field label="Business start date" type="date" value={values.startDate || ""} onChange={(v) => set("startDate", v)} /><Field label="Floor area (sq. m.)" type="number" value={values.floorArea || ""} onChange={(v) => set("floorArea", v)} /></Section></div>}
    {step === 3 && <div className="flex flex-col gap-4"><Section title="Capital investment" description="Enter the current value for each category.">{[["capitalization", "Initial capitalization"], ["equipment", "Machinery and equipment"], ["inventory", "Inventory"], ["improvements", "Leasehold improvements"]].map(([key, label]) => <Field key={key} label={label} type="number" value={values[key]} onChange={(v) => set(key, v)} required={key === "capitalization"} />)}<div className="flex items-center justify-between rounded-xl bg-secondary p-3"><span className="text-[13px] font-semibold">Total investment</span><strong className="font-mono text-[15px]">{peso(total)}</strong></div></Section><Section title="Business activities" description="Add every activity conducted at this location.">{activities.map((item, index) => <div key={item.id} className="flex items-end gap-2"><div className="flex-1"><Choice label={`Activity ${index + 1}`} value={item.activity} onChange={(v) => setActivities((current) => current.map((entry) => entry.id === item.id ? { ...entry, activity: v } : entry))} options={ACTIVITIES} /></div>{activities.length > 1 && <Button variant="ghost" size="icon" aria-label={`Remove activity ${index + 1}`} onClick={() => setActivities((current) => current.filter((entry) => entry.id !== item.id))}><Trash2 /></Button>}</div>)}<Button variant="outline" onClick={() => setActivities((current) => [...current, { id: Date.now(), activity: "", units: "1" }])}><Plus data-icon="inline-start" />Add activity</Button></Section></div>}
    {step === 4 && <div className="flex flex-col gap-4"><Section title="Supporting documents" description="Clear scans help the office review your application faster."><UploadRow label="DTI / SEC / CDA registration" file={files.registration} onUpload={() => upload("registration", "Business-registration")} /><UploadRow label="Barangay business clearance" file={files.barangay} onUpload={() => upload("barangay", "Barangay-clearance")} /><UploadRow label="Proof of business location" file={files.location} onUpload={() => upload("location", "Location-proof")} />{values.ownership !== "Owned" && <UploadRow label="Lease contract" file={files.lease} onUpload={() => upload("lease", "Lease-contract")} />}<UploadRow label="Other supporting document" required={false} file={files.other} onUpload={() => upload("other", "Supporting-document")} /></Section></div>}
    {step === 5 && <div className="flex flex-col gap-4"><Section title="Review application" description="Check your information before submitting."><ReviewRow label="Business" value={values.businessName} /><ReviewRow label="Organization" value={values.businessType} /><ReviewRow label="Owner" value={values.ownerName} /><ReviewRow label="Location" value={`${values.street}, Brgy. ${values.barangay}, Malolos`} /><ReviewRow label="Employees" value={values.employees} /><ReviewRow label="Total investment" value={peso(total)} /><ReviewRow label="Activities" value={activities.map((item) => item.activity).join(", ")} last /></Section><label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-[13px] leading-relaxed"><Checkbox checked={declared} onCheckedChange={(value) => setDeclared(value === true)} className="mt-0.5" /><span>I declare that the information provided is true and complete. I authorize the City of Malolos to verify these details.</span></label></div>}
  </div><StepFooter step={step} onBack={() => setStep(step - 1)} onNext={step === 5 ? submit : next} nextLabel={step === 5 ? "Submit application" : "Continue"} disabled={step === 5 && !declared} /></div>
}

function Renewal({ onBack, onStatus }: { onBack: () => void; onStatus: () => void }) {
  const { addApplication, showToast } = useAppData()
  const [step, setStep] = useState(1)
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [found, setFound] = useState(false)
  const [editable, setEditable] = useState(false)
  const [values, setValues] = useState<Values>({ businessName: "Kalayaan Bakeshop", permit: "BP-2025-0754", tin: "123-456-789-000", address: "18 Paseo del Congreso, Brgy. San Gabriel, Malolos", owner: walletProfile.fullName, employees: "6", occupancy: "Rented", gross2025: "1250000" })
  const [sales, setSales] = useState([{ id: 1, year: "2025", amount: "1250000" }])
  const [files, setFiles] = useState<Values>({})
  const [declared, setDeclared] = useState(false)
  const [submitted, setSubmitted] = useState<Application | null>(null)
  const gross = useMemo(() => sales.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [sales])
  const search = () => { if (!query.trim()) return showToast("Enter a permit number or TIN"); setSearching(true); setTimeout(() => { setSearching(false); setFound(true) }, 650) }
  const submit = () => { if (!declared) return; const app: Application = { id: `app-${Date.now()}`, service: "Business permit renewal", who: values.businessName, status: "submitted", track: `BPR-2026-${Math.floor(1000 + Math.random() * 8999)}`, submitted: "Jul 19, 2026", attachments: Object.values(files), stages: [{ label: "Renewal submitted", done: true, date: "Jul 19, 2026" }, { label: "Reviewing records", done: false }, { label: "Assessment", done: false }, { label: "Payment", done: false }, { label: "Renewed permit", done: false }] }; addApplication(app); setSubmitted(app) }
  if (submitted) return <Success app={submitted} onHome={onBack} onTrack={onStatus} />
  return <div className="flex h-full flex-col"><Header title="Renew business permit" subtitle={`Step ${step} of 4 · ${RENEW_STEPS[step - 1]}`} backTo={() => step > 1 ? setStep(step - 1) : onBack()} /><div className="flex-1 overflow-y-auto px-5 pb-5"><Progress value={step * 25} className="mb-5" />
    {step === 1 && <div className="flex flex-col gap-4"><Section title="Find your business" description="Use your previous permit number or registered TIN."><div className="flex gap-2"><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Permit number or TIN" /><Button onClick={search} disabled={searching}>{searching ? <RefreshCw className="animate-spin" /> : <Search />}<span className="sr-only">Search</span></Button></div></Section>{found && <Card><CardHeader><CardDescription>Active business record</CardDescription><CardTitle>{values.businessName}</CardTitle></CardHeader><CardContent><ReviewRow label="Permit" value={values.permit} /><ReviewRow label="Owner" value={values.owner} /><ReviewRow label="Address" value={values.address} last /></CardContent><CardFooter><Button className="w-full" onClick={() => setStep(2)}>Use this record<ArrowRight data-icon="inline-end" /></Button></CardFooter></Card>}</div>}
    {step === 2 && <div className="flex flex-col gap-4"><Section title="Existing business details" description="Information is locked until you choose to edit it."><Field label="Business name" value={values.businessName} onChange={(v) => setValues((c) => ({ ...c, businessName: v }))} disabled={!editable} /><Field label="TIN" value={values.tin} disabled /><Field label="Business address" value={values.address} onChange={(v) => setValues((c) => ({ ...c, address: v }))} disabled={!editable} /><Field label="Owner" value={values.owner} disabled /><Button variant="outline" onClick={() => setEditable((value) => !value)}>{editable ? "Lock information" : "Edit information"}</Button></Section><Section title="Renewal details"><Field label="Current number of employees" type="number" value={values.employees} onChange={(v) => setValues((c) => ({ ...c, employees: v }))} required /><Choice label="Occupancy" value={values.occupancy} onChange={(v) => setValues((c) => ({ ...c, occupancy: v }))} options={OWNERSHIP} /><div className="flex flex-col gap-3"><Label>Gross sales</Label>{sales.map((item, index) => <div key={item.id} className="grid grid-cols-[90px_1fr_auto] gap-2"><Input aria-label={`Sales year ${index + 1}`} value={item.year} onChange={(e) => setSales((current) => current.map((entry) => entry.id === item.id ? { ...entry, year: e.target.value } : entry))} /><Input aria-label={`Sales amount ${index + 1}`} type="number" value={item.amount} onChange={(e) => setSales((current) => current.map((entry) => entry.id === item.id ? { ...entry, amount: e.target.value } : entry))} />{sales.length > 1 && <Button variant="ghost" size="icon" onClick={() => setSales((current) => current.filter((entry) => entry.id !== item.id))}><Trash2 /></Button>}</div>)}<Button variant="outline" onClick={() => setSales((current) => [...current, { id: Date.now(), year: "2026", amount: "" }])}><Plus data-icon="inline-start" />Add year</Button><div className="flex justify-between rounded-xl bg-secondary p-3 text-[13px]"><span>Total gross sales</span><strong className="font-mono">{peso(gross)}</strong></div></div></Section></div>}
    {step === 3 && <Section title="Updated documents" description="Only documents needed for this renewal are shown."><UploadRow label="Latest barangay business clearance" file={files.barangay} onUpload={() => { setFiles((c) => ({ ...c, barangay: "Barangay-clearance-2026.pdf" })); showToast("File attached") }} />{values.occupancy !== "Owned" && <UploadRow label="Current lease contract" file={files.lease} onUpload={() => setFiles((c) => ({ ...c, lease: "Lease-contract-2026.pdf" }))} />}<UploadRow label="Latest financial statement" required={false} file={files.financial} onUpload={() => setFiles((c) => ({ ...c, financial: "Financial-statement.pdf" }))} /></Section>}
    {step === 4 && <div className="flex flex-col gap-4"><Section title="Review renewal"><ReviewRow label="Business" value={values.businessName} /><ReviewRow label="Permit" value={values.permit} /><ReviewRow label="Employees" value={values.employees} /><ReviewRow label="Gross sales" value={peso(gross)} /><ReviewRow label="Occupancy" value={values.occupancy} last /></Section><label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-[13px]"><Checkbox checked={declared} onCheckedChange={(value) => setDeclared(value === true)} /><span>I certify that these renewal details and uploaded documents are accurate.</span></label></div>}
  </div>{step > 1 && <StepFooter step={step} onBack={() => setStep(step - 1)} onNext={step === 4 ? submit : () => setStep(step + 1)} nextLabel={step === 4 ? "Submit renewal" : "Continue"} disabled={(step === 3 && (!files.barangay || (values.occupancy !== "Owned" && !files.lease))) || (step === 4 && !declared)} />}</div>
}

const STATUS_RECORDS: Record<string, { title: string; status: string; icon: typeof Clock3; stages: ApplicationStage[] }> = {
  review: { title: "Under review", status: "BP-2026-0812", icon: Clock3, stages: [{ label: "Submitted", done: true, date: "Jul 16, 2026" }, { label: "Document review", done: true, note: "BPLO is checking your attachments" }, { label: "Assessment", done: false }, { label: "Payment", done: false }, { label: "Permit issuance", done: false }] },
  payment: { title: "For payment", status: "BP-2026-0754", icon: WalletCards, stages: [{ label: "Submitted", done: true }, { label: "Documents approved", done: true }, { label: "Assessment complete", done: true, note: "Total due: ₱1,850.00" }, { label: "Payment", done: false }, { label: "Permit issuance", done: false }] },
  verified: { title: "Payment verified", status: "BP-2026-0688", icon: ReceiptText, stages: [{ label: "Submitted", done: true }, { label: "Documents approved", done: true }, { label: "Assessment paid", done: true }, { label: "Payment verified", done: true, date: "Jul 17, 2026" }, { label: "Permit issuance", done: false }] },
  issued: { title: "Permit issued", status: "BP-2026-0541", icon: FileCheck2, stages: [{ label: "Submitted", done: true }, { label: "Documents approved", done: true }, { label: "Assessment paid", done: true }, { label: "Payment verified", done: true }, { label: "Permit issued", done: true, date: "Jul 18, 2026" }] },
}

function StatusDashboard({ onBack }: { onBack: () => void }) {
  const { showToast } = useAppData()
  const [status, setStatus] = useState("review")
  const [method, setMethod] = useState("")
  const [paid, setPaid] = useState(false)
  const record = paid ? STATUS_RECORDS.verified : STATUS_RECORDS[status]
  const Icon = record.icon
  return <div className="flex h-full flex-col"><Header title="Permit status" subtitle="Track assessment, payment, and release" backTo={onBack} /><div className="flex-1 overflow-y-auto px-5 pb-6"><Tabs value={paid ? "verified" : status} onValueChange={(value) => { setStatus(value); setPaid(false) }}><TabsList className="mb-5 grid w-full grid-cols-4"><TabsTrigger value="review">Review</TabsTrigger><TabsTrigger value="payment">Pay</TabsTrigger><TabsTrigger value="verified">Verified</TabsTrigger><TabsTrigger value="issued">Issued</TabsTrigger></TabsList></Tabs><Card><CardHeader className="flex-row items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-accent"><Icon className="size-5 text-primary" /></div><div><CardDescription className="font-mono">{record.status}</CardDescription><CardTitle>{record.title}</CardTitle></div></CardHeader><CardContent><ReviewRow label="Business" value="Kalayaan Bakeshop" /><ReviewRow label="Application" value="New business permit" last /></CardContent></Card><div className="mt-5"><Timeline stages={record.stages} /></div>{status === "review" && !paid && <Card className="mt-5"><CardHeader><CardTitle>No payment needed yet</CardTitle><CardDescription>We will notify you when your assessment is ready. No action is required while documents are under review.</CardDescription></CardHeader></Card>}{status === "payment" && !paid && <div className="mt-5 flex flex-col gap-4"><Section title="Assessment"><ReviewRow label="Mayor's permit fee" value="₱1,200.00" /><ReviewRow label="Sanitary inspection" value="₱350.00" /><ReviewRow label="Fire safety fee" value="₱300.00" /><ReviewRow label="Total due" value="₱1,850.00" last /></Section><PaymentStep amount="₱1,850.00" amountLabel="Business permit assessment · Kalayaan Bakeshop" paymentMethod={method} onPaymentChange={setMethod} /><Button disabled={!method} onClick={() => { setPaid(true); showToast(`Mock payment sent via ${PAYMENT_METHODS.find((item) => item.id === method)?.label}`) }}>Pay ₱1,850.00</Button></div>}{(status === "verified" || paid) && <Card className="mt-5"><CardHeader><CardTitle>Official receipt</CardTitle><CardDescription>Your payment was verified by the City Treasurer&apos;s Office.</CardDescription></CardHeader><CardContent><ReviewRow label="Receipt no." value="OR-2026-18442" /><ReviewRow label="Amount paid" value="₱1,850.00" /><ReviewRow label="Verified" value="Jul 17, 2026" last /></CardContent><CardFooter><Button variant="outline" className="w-full" onClick={() => showToast("Receipt opened")}>View receipt</Button></CardFooter></Card>}{status === "issued" && <Card className="mt-5"><CardHeader><div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-accent"><ShieldCheck className="size-5 text-primary" /></div><CardTitle>2026 Business Permit</CardTitle><CardDescription>Valid until December 31, 2026 · Ready for digital download or pickup at BPLO Window 3.</CardDescription></CardHeader><CardContent><ReviewRow label="Permit number" value="BP-2026-0541" /><ReviewRow label="Issued" value="Jul 18, 2026" last /></CardContent><CardFooter className="flex-col"><Button className="w-full" onClick={() => showToast("Permit download started")}><Download data-icon="inline-start" />Download permit</Button><Button variant="outline" className="w-full" onClick={() => showToast("Pickup instructions opened")}>View pickup instructions</Button></CardFooter></Card>}</div></div>
}

export default function BusinessPermitFlow() {
  const navigate = useNavigate()
  const [view, setView] = useState<View>("hub")
  if (view === "new") return <NewApplication onBack={() => setView("hub")} onStatus={() => setView("status")} />
  if (view === "renew") return <Renewal onBack={() => setView("hub")} onStatus={() => setView("status")} />
  if (view === "status") return <StatusDashboard onBack={() => setView("hub")} />
  const services = [{ id: "new" as const, title: "New application", description: "Register a new business in Malolos", icon: Store }, { id: "renew" as const, title: "Renew a permit", description: "Update and renew an existing permit", icon: RefreshCw }, { id: "status" as const, title: "Check status", description: "Track review, payment, and issuance", icon: FileCheck2 }]
  return <div className="flex h-full flex-col"><Header title="Business permit" subtitle="Business Permits and Licensing Office" backTo={() => navigate("/home")} /><main className="flex-1 overflow-y-auto px-5 pb-6"><div className="mb-5 rounded-2xl bg-primary p-5 text-primary-foreground"><div className="flex size-11 items-center justify-center rounded-xl bg-background/15"><BriefcaseBusiness className="size-6" /></div><h1 className="mt-4 text-balance font-display text-xl font-semibold">Start or manage your business permit</h1><p className="mt-1.5 text-[13px] leading-relaxed opacity-80">Apply online, upload requirements, pay assessed fees, and follow your permit through release.</p></div><div className="flex flex-col gap-3">{services.map(({ id, title, description, icon: Icon }) => <button key={id} onClick={() => setView(id)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-transform active:scale-[0.99]"><div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent"><Icon className="size-6 text-primary" /></div><div className="min-w-0 flex-1"><p className="font-display text-[15px] font-semibold">{title}</p><p className="mt-1 text-[12px] text-muted-foreground">{description}</p></div><ArrowRight className="size-4 shrink-0 text-muted-foreground" /></button>)}</div><div className="mt-5 flex items-start gap-3 rounded-2xl bg-secondary p-4"><Building2 className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="text-[13px] font-semibold">City of Malolos BPLO</p><p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">Applications are reviewed during city office hours. Keep your tracking number for follow-ups.</p></div></div></main></div>
}
