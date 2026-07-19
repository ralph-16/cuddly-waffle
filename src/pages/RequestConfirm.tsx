import { useNavigate } from "react-router-dom"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClaimStub } from "@/components/shared/ClaimStub"
import { useAppData } from "@/context/useAppData"

export default function RequestConfirm() {
  const navigate = useNavigate()
  const { applications } = useAppData()
  const app = applications[0]

  if (!app) {
    navigate("/home")
    return null
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3.5 flex h-[76px] w-[76px] items-center justify-center rounded-full border-[2.5px] border-primary">
            <Check className="h-9 w-9 text-primary" strokeWidth={1.8} />
          </div>
          <h2 className="font-display text-[19px] font-semibold">Application submitted</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">We'll notify you as it moves through review.</p>
        </div>
        <ClaimStub app={app} />
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
