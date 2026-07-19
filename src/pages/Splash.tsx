import { useNavigate } from "react-router-dom"
import { Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Splash() {
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-8 text-center">
        <div className="mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-full border-[2.5px] border-primary">
          <Landmark className="h-9 w-9 text-primary" strokeWidth={1.6} />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          City of Malolos - Bulacan
        </div>
        <h1 className="font-display text-[32px] font-semibold">eKaratig</h1>
        <p className="mt-3 max-w-[260px] text-[14.5px] leading-relaxed text-muted-foreground">
          Skip the line. File online. Your ride to every city service, in one app.
        </p>
      </div>
      <div className="px-8 pb-8">
        <Button onClick={() => navigate("/auth")}>Get started</Button>
      </div>
    </div>
  )
}
