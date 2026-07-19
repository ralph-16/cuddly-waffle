import { useAppData } from "@/context/AppDataContext"

export function Toaster() {
  const { toasts } = useAppData()
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] mx-auto flex max-w-md flex-col items-center gap-2 px-5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in rounded-xl bg-foreground px-4 py-2.5 text-center text-[13px] text-background shadow-lg"
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
