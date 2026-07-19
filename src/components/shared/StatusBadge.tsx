import { Badge } from "@/components/ui/badge"
import type { DocStatus } from "@/types"

const LABELS: Record<DocStatus, string> = {
  submitted: "Submitted",
  review: "Under review",
  payment: "For payment",
  released: "Released",
}

export function StatusBadge({ status }: { status: DocStatus }) {
  return <Badge variant={status}>{LABELS[status]}</Badge>
}
