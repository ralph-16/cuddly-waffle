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
    flowType: "cart",
    identityRequirements: ["Valid government ID"],
    attachmentRequirements: [],
    fields: [],
  },
  {
    slug: "business-permit",
    title: "Business permit",
    shortLabel: "Permit",
    description: "New application or renewal",
    icon: "briefcase",
    trackPrefix: "BP",
    // Dedicated new application, renewal, and status experience.
    flowType: "cart",
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
      { label: "Under Review", done: true, note: "Civil registry is verifying the record", date: "Jul 13, 2026" },
      { label: "Payment Due", done: false },
      { label: "Completed", done: false },
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
      { label: "Under Review", done: true, note: "Documents verified", date: "Jul 10, 2026" },
      { label: "Payment Due", done: true, note: "Assessed fee - PHP 1,850.00", date: "Jul 11, 2026" },
      { label: "Completed", done: false },
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
      { label: "Under Review", done: true, note: "Details verified", date: "Jul 3, 2026" },
      { label: "Payment Due", done: true, note: "Paid - PHP 120.00", date: "Jul 3, 2026" },
      { label: "Completed", done: true, note: "Issued at City Hall Window 2", date: "Jul 4, 2026" },
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
      { label: "Submitted", done: true, note: "Payment proof attached", date: "Jul 16, 2026" },
      { label: "Under Review", done: false, note: "City Treasurer's Office is confirming your payment" },
      { label: "Payment Due", done: false },
      { label: "Completed", done: false },
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
  birthDate: "1992-06-12",
  birthPlace: "Malolos, Bulacan",
  citizenship: "Filipino",
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

export const news = {
  "malolos-market-renovation": {
    headline: "Malolos City Launches New Public Market Renovation Project",
    shortDetail: "City government breaks ground on a modernization project for the Malolos public market to improve vendor facilities and sanitation.",
    fullDetail: "The Malolos City government officially broke ground on the long-awaited renovation of the public market this week, aiming to modernize vendor stalls, improve drainage and sanitation systems, and enhance overall customer experience. City officials stated that the project, funded through the local development budget, is expected to be completed within 18 months. Vendors will be temporarily relocated to a nearby holding area to ensure business continuity during construction. The mayor emphasized that the renovation is part of a broader initiative to boost local commerce and improve the quality of life for residents and traders alike.",
    date: "2026-07-15T09:30:00",
    views: 1284,
    image: "src/data/mockNewsImage.jpg"
  },
  "barasoain-church-independence-day": {
    headline: "Barasoain Church Hosts Special Independence Day Commemoration",
    shortDetail: "Historic Barasoain Church in Malolos held a special program honoring the site's role in Philippine history.",
    fullDetail: "The historic Barasoain Church, known as the 'Cradle of Democracy in the East,' hosted a special commemorative program this week to honor its pivotal role in Philippine history. Local officials, historians, and students gathered for a series of lectures, reenactments, and cultural performances highlighting the church's significance as the site of the First Philippine Congress. The event drew hundreds of attendees, including tourists from neighboring provinces. Organizers hope the annual tradition will continue to educate younger generations about the nation's fight for independence and the historical importance of Malolos as the former capital of the Philippine Republic.",
    date: "2026-06-12T14:00:00",
    views: 3521,
    image: "src/data/mockNewsImage.jpg"
  },
  "malolos-flooding-heavy-rains": {
    headline: "Flooding Concerns Rise in Malolos Barangays Amid Heavy Rains",
    shortDetail: "Several low-lying barangays in Malolos report flooding as heavy rains continue, prompting local disaster response teams to act.",
    fullDetail: "Continuous heavy rainfall over the past few days has caused flooding in several low-lying barangays across Malolos City, prompting the local disaster risk reduction and management office to place emergency teams on standby. Residents in affected areas have reported ankle to knee-deep water in some streets, disrupting daily activities and transportation. City officials have opened evacuation centers as a precautionary measure and are urging residents near riverbanks to remain vigilant. Local authorities are also coordinating with the provincial government to assess drainage infrastructure improvements to mitigate future flooding incidents in the city.",
    date: "2026-07-20T07:45:00",
    views: 8940,
    image: "src/data/mockNewsImage.jpg"
  },
  "malolos-traffic-management-scheme": {
    headline: "Malolos City Council Approves New Traffic Management Scheme",
    shortDetail: "City council passes a resolution introducing updated traffic rules aimed at easing congestion in the city center.",
    fullDetail: "The Malolos City Council has approved a new traffic management scheme designed to address worsening congestion in the city center, particularly along major thoroughfares near the public market and commercial districts. The new scheme includes designated one-way streets, updated loading and unloading zones, and stricter enforcement against illegal parking. Traffic enforcers will undergo additional training to implement the changes effectively starting next month. City officials expressed optimism that the measures will significantly reduce travel time for commuters and improve road safety, while also inviting public feedback during the initial implementation phase.",
    date: "2026-07-19T16:20:00",
    views: 2107,
    image: "src/data/mockNewsImage.jpg"
  },
  "bulacan-university-science-award": {
    headline: "Local Bulacan University Students Win National Science Competition",
    shortDetail: "A team of students from a Malolos-based university clinched top honors in a national science and innovation competition.",
    fullDetail: "A team of students from a university based in Malolos City brought pride to the region after winning top honors at a national science and innovation competition held in Manila. The team developed an innovative water filtration system using locally sourced materials, impressing judges with its practicality and environmental impact. School officials praised the students' dedication, noting months of research and prototype testing leading up to the competition. The achievement has inspired local educational institutions to further invest in science and technology programs, with city officials hinting at potential support for the students to pursue further development of their project.",
    date: "2026-05-20T11:00:00",
    views: 4632,
    image: "src/data/mockNewsImage.jpg"
  }
}