import { Badge } from "@/components/ui/badge"

const STATUS_EXPLANATIONS = [
  {
    status: "submitted",
    label: "Submitted",
    description: "Your application has been received by the city.",
  },
  {
    status: "review",
    label: "Under Review",
    description: "City staff is verifying your documents and details.",
  },
  {
    status: "payment",
    label: "Payment Due",
    description: "Your application is approved for payment. Complete the payment to finalize.",
  },
  {
    status: "released",
    label: "Completed",
    description: "Your application is approved, issued, and ready to pick up or has been delivered.",
  },
]

export function StatusLegend() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">Application Status</p>
      <div className="space-y-2.5">
        {STATUS_EXPLANATIONS.map((item) => (
          <div key={item.status} className="flex items-start gap-3">
            <Badge variant={item.status as any} className="shrink-0 mt-0.5">
              {item.label}
            </Badge>
            <p className="text-[12px] text-muted-foreground leading-snug">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
