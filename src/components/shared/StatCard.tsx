export function StatCard({ value, label, tone = "primary" }: { value: string | number; label: string; tone?: "primary" | "alt" }) {
  return (
    <div
      className={
        tone === "primary"
          ? "flex-1 rounded-2xl bg-primary p-3.5 text-primary-foreground"
          : "flex-1 rounded-2xl border border-border bg-card p-3.5"
      }
    >
      <div className="font-display text-[24px] font-semibold leading-none">{value}</div>
      <div className={tone === "primary" ? "mt-1.5 text-[11px] opacity-85" : "mt-1.5 text-[11px] text-muted-foreground"}>{label}</div>
    </div>
  )
}
