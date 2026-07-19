import { ReceiptText } from "lucide-react"
import { PaymentMethodPicker } from "@/components/shared/PaymentMethodPicker"
import { ReviewRow } from "@/components/shared/ReviewRow"

/**
 * Uniform payment step used by all four city-service flows.
 *
 * Props
 * ──────
 * amount        – formatted string shown prominently, e.g. "PHP 105.00"
 * amountLabel   – line label under the amount, e.g. "Community Tax Certificate"
 * reviewRows    – secondary detail rows shown in the summary card (optional)
 * paymentMethod – controlled value passed through to PaymentMethodPicker
 * onPaymentChange – setter for paymentMethod
 */
export interface PaymentStepReviewRow {
  label: string
  value: string
  last?: boolean
}

export function PaymentStep({
  amount,
  amountLabel,
  reviewRows,
  paymentMethod,
  onPaymentChange,
}: {
  amount: string
  amountLabel: string
  reviewRows?: PaymentStepReviewRow[]
  paymentMethod: string
  onPaymentChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Amount summary card */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Amount due
        </p>
        <p className="font-display text-[26px] font-semibold text-primary">{amount}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{amountLabel}</p>

        {reviewRows && reviewRows.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            {reviewRows.map((row) => (
              <ReviewRow key={row.label} label={row.label} value={row.value} last={row.last} />
            ))}
          </div>
        )}
      </div>

      {/* Payment method */}
      <div>
        <p className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">
          Payment method
        </p>
        <PaymentMethodPicker value={paymentMethod} onChange={onPaymentChange} />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 rounded-2xl bg-secondary p-3.5 text-[12px] text-muted-foreground">
        <ReceiptText className="mt-0.5 size-4 shrink-0" strokeWidth={1.7} />
        <span>
          This is a mock payment for demo purposes — no real transaction will be made. Your receipt
          will be generated once staff verifies the payment.
        </span>
      </div>
    </div>
  )
}
