import type { RequestTypeConfig, WalletDoc, Application, Hotline, ReportCategory, IssuedDocument } from "@/types"

/** Wallet holds ONLY long-term identity documents - things that don't expire per transaction. */
export const ID_CATEGORIES = ["National ID", "Driver's license", "Passport"]
export const WALLET_CATEGORIES = [...ID_CATEGORIES, "Proof of address"]

export const initialWallet: WalletDoc[] = [
  { id: "w1", name: "PhilSys National ID", category: "National ID", status: "verified", updated: "Jun 20, 2026" },
  { id: "w2", name: "Meralco bill - July 2026", category: "Proof of address", status: "verified", updated: "Jul 5, 2026" },
  { id: "w3", name: "Driver's license", category: "Driver's license", status: "missing" },
  { id: "w4", name: "Passport", category: "Passport", status: "missing" },
]

/** True if the wallet has at least one verified government ID (any type). */
export function hasValidId(wallet: WalletDoc[]) {
  return wallet.some((w) => ID_CATEGORIES.includes(w.category) && w.status !== "missing")
}

export function getValidId(wallet: WalletDoc[]) {
  return wallet.find((w) => ID_CATEGORIES.includes(w.category) && w.status !== "missing")
}

export const requestTypes: RequestTypeConfig[] = [
  {
    slug: "rpt",
    title: "Real property tax",
    shortLabel: "RPT",
    description: "Look up and pay property tax",
    icon: "home",
    trackPrefix: "RPT",
    flowType: "cart",
    identityRequirements: [],
    attachmentRequirements: [],
    fields: [],
  },
  {
    slug: "lcr",
    title: "Civil registry copy",
    shortLabel: "LCR",
    description: "Birth, marriage, or death certificate",
    icon: "file-text",
    trackPrefix: "LCR",
    // Has its own dedicated multi-certificate flow (see CivilRegistryFlow) - routed as "/lcr", same pattern as RPT.
    flowType: "cart",
    identityRequirements: ["Valid government ID"],
    attachmentRequirements: [],
    fields: [],
  },
  {
    slug: "cedula",
    title: "Cedula",
    shortLabel: "Cedula",
    description: "Community tax certificate",
    icon: "id-card",
    trackPrefix: "CTC",
    flowType: "standard",
    identityRequirements: ["Valid government ID"],
    attachmentRequirements: [
      { id: "proofIncome", label: "Proof of income or employment", helpText: "Optional - helps confirm your tax bracket", required: false },
    ],
    fields: [
      { id: "fullName", label: "Full name", type: "text", placeholder: "Full legal name", required: true },
      { id: "occupation", label: "Occupation or business", type: "text", placeholder: "e.g. Employed, Self-employed", required: true },
      { id: "income", label: "Gross annual income", type: "number", placeholder: "In pesos", required: true },
      { id: "address", label: "Current address", type: "text", placeholder: "Unit / street / barangay", required: true },
    ],
  },
  {
    slug: "business-permit",
    title: "Business permit",
    shortLabel: "Permit",
    description: "New application or renewal",
    icon: "briefcase",
    trackPrefix: "BP",
    flowType: "standard",
    identityRequirements: ["Valid government ID"],
    attachmentRequirements: [
      { id: "dti", label: "DTI or SEC registration", helpText: "Renews rarely, but re-upload if it has changed", required: true },
      { id: "brgyClearance", label: "Barangay business clearance", helpText: "Must be this year's clearance", required: true },
      { id: "lease", label: "Lease contract or land title", required: true },
    ],
    fields: [
      { id: "bizName", label: "Business name", type: "text", placeholder: "e.g. Kalayaan Bakeshop", required: true },
      { id: "bizType", label: "Type of business", type: "select", options: ["Retail or merchandising", "Food and beverage", "Services", "Manufacturing"], required: true },
      { id: "bizAddr", label: "Business address", type: "text", placeholder: "Unit / street / barangay", required: true },
      { id: "tin", label: "TIN", type: "text", placeholder: "000-000-000-000", required: true },
      { id: "ownerName", label: "Owner or representative", type: "text", placeholder: "Full name", required: true },
    ],
  },
]

export const initialApplications: Application[] = [
  {
    id: "a1",
    service: "Civil registry copy",
    who: "Birth certificate - Maria L. Santos",
    status: "review",
    track: "LCR-2026-0981",
    submitted: "Jul 12, 2026",
    stages: [
      { label: "Submitted", done: true, note: "Received online", date: "Jul 12, 2026" },
      { label: "Under review", done: true, note: "Civil registry is verifying the record", date: "Jul 13, 2026" },
      { label: "For payment", done: false },
      { label: "Approved - ready for release", done: false },
    ],
  },
  {
    id: "a2",
    service: "Business permit",
    who: "Kalayaan Bakeshop",
    status: "payment",
    track: "BP-2026-0754",
    submitted: "Jul 9, 2026",
    stages: [
      { label: "Submitted", done: true, note: "Received online", date: "Jul 9, 2026" },
      { label: "Under review", done: true, note: "Documents verified", date: "Jul 10, 2026" },
      { label: "For payment", done: true, note: "Assessed fee - PHP 1,850.00", date: "Jul 11, 2026" },
      { label: "Approved - ready for release", done: false },
    ],
  },
  {
    id: "a3",
    service: "Cedula",
    who: "Juan Dela Cruz",
    status: "released",
    track: "CTC-2026-0332",
    submitted: "Jul 2, 2026",
    stages: [
      { label: "Submitted", done: true, note: "Received online", date: "Jul 2, 2026" },
      { label: "Under review", done: true, note: "Details verified", date: "Jul 3, 2026" },
      { label: "For payment", done: true, note: "Paid - PHP 120.00", date: "Jul 3, 2026" },
      { label: "Approved - ready for release", done: true, note: "Released at City Hall Window 2", date: "Jul 4, 2026" },
    ],
  },
  {
    id: "a4",
    service: "Real property tax",
    who: "Tax declaration 04015-00231",
    status: "review",
    track: "RPT-2026-0602",
    submitted: "Jul 16, 2026",
    stages: [
      { label: "Proof of payment submitted", done: true, note: "GCash reference attached", date: "Jul 16, 2026" },
      { label: "Verifying payment", done: false, note: "City Treasurer's Office is confirming your payment" },
      { label: "Official receipt generated", done: false },
      { label: "Approved - ready for release", done: false },
    ],
  },
]

export const issuedDocuments: IssuedDocument[] = [
  {
    id: "i1",
    applicationId: "a3",
    title: "Official receipt - CTC-2026-0332",
    type: "Official Receipt",
    service: "Cedula",
    track: "OR-2026-04471",
    issuedDate: "Jul 4, 2026",
  },
  {
    id: "i2",
    applicationId: "a3",
    title: "Cedula 2026",
    type: "Certificate",
    service: "Cedula",
    track: "CTC-2026-0332",
    issuedDate: "Jul 4, 2026",
  },
]

export const hotlines: Hotline[] = [
  { id: "h1", name: "Malolos City Police Station", number: "117", category: "Police" },
  { id: "h2", name: "PNP Malolos - Trunkline", number: "(044) 794 5321", category: "Police" },
  { id: "h3", name: "Bureau of Fire Protection - Malolos", number: "(044) 794 2323", category: "Fire" },
  { id: "h4", name: "City Disaster Risk Reduction Office", number: "(044) 791 9330", category: "Disaster" },
  { id: "h5", name: "Malolos City Health Office / Ambulance", number: "(044) 662 1988", category: "Medical" },
  { id: "h6", name: "Barangay Emergency Response", number: "Contact your barangay hall", category: "Barangay" },
]

export const reportCategories: ReportCategory[] = [
  { id: "r1", label: "Broken streetlight", icon: "lightbulb" },
  { id: "r2", label: "Road or pothole damage", icon: "road" },
  { id: "r3", label: "Missed garbage collection", icon: "trash" },
  { id: "r4", label: "Flooding or drainage", icon: "droplets" },
  { id: "r5", label: "Stray or injured animal", icon: "paw-print" },
  { id: "r6", label: "Other concern", icon: "flag" },
]

/** Certificate types offered by the Civil Registry service, and their flat mock fee. */
export interface CivilRegistryCertType {
  id: "birth" | "marriage" | "death"
  title: string
  description: string
  icon: string
  fee: number
}

export const civilRegistryCertTypes: CivilRegistryCertType[] = [
  { id: "birth", title: "Birth Certificate", description: "Official record of birth.", icon: "baby", fee: 155 },
  { id: "marriage", title: "Marriage Certificate", description: "Official record of marriage.", icon: "heart-handshake", fee: 155 },
  { id: "death", title: "Death Certificate", description: "Official record of death.", icon: "scroll-text", fee: 155 },
]

/** The signed-in citizen's own verified info, reused to auto-fill requestor fields from the Identity Wallet. */
export const walletProfile = {
  fullName: "Juan Dela Cruz",
  address: "142 Kalayaan St., Brgy. Sto. Rosario, Malolos, Bulacan",
  contactNumber: "0917 123 4567",
}

/** Deterministic mock property lookup so any TDN typed in the demo returns a plausible record. */
export interface PropertyRecord {
  tdn: string
  owner: string
  address: string
  classification: string
  dueItems: { id: string; label: string; amount: number }[]
}

export function lookupProperty(tdn: string): PropertyRecord | null {
  const clean = tdn.trim()
  if (!clean) return null
  let hash = 0
  for (let i = 0; i < clean.length; i++) hash = (hash * 31 + clean.charCodeAt(i)) >>> 0
  const base = 2200 + (hash % 4000)
  const hasArrears = hash % 3 === 0
  const dueItems = [{ id: "y2026", label: "2026 Real property tax", amount: base }]
  if (hasArrears) dueItems.push({ id: "y2025", label: "2025 Arrears", amount: Math.round(base * 0.92) })
  return {
    tdn: clean.toUpperCase(),
    owner: "Juan Dela Cruz",
    address: "142 Kalayaan St., Brgy. Sto. Rosario, Malolos, Bulacan",
    classification: "Residential",
    dueItems,
  }
}
