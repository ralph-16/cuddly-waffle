import {
  Home, FileText, IdCard, Briefcase, Lightbulb, Construction, Trash2,
  Droplets, PawPrint, Flag, Phone, ShieldAlert, Flame, HeartPulse,
  TriangleAlert, Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const ICONS: Record<string, LucideIcon> = {
  home: Home,
  "file-text": FileText,
  "id-card": IdCard,
  briefcase: Briefcase,
  lightbulb: Lightbulb,
  road: Construction,
  trash: Trash2,
  droplets: Droplets,
  "paw-print": PawPrint,
  flag: Flag,
  phone: Phone,
  police: ShieldAlert,
  fire: Flame,
  medical: HeartPulse,
  disaster: TriangleAlert,
  barangay: Users,
}
