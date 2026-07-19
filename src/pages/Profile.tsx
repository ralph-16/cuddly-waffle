import { useNavigate } from "react-router-dom"
import { FileText, Bell, Globe, HelpCircle, LogOut, ChevronRight, IdCard } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppData } from "@/context/AppDataContext"

function Row({ icon: Icon, label, sub, onClick }: { icon: any; label: string; sub?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex cursor-pointer items-center gap-3 border-b border-border py-3.5 last:border-none">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.7} />
      </div>
      <div className="flex-1">
        <p className="text-[13.5px] font-semibold">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { wallet, showToast } = useAppData()
  const verified = wallet.filter((w) => w.status === "verified")

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-4">
        <h1 className="mb-4 font-display text-[22px] font-semibold">Profile</h1>
        <div className="mb-5 flex items-center gap-3.5">
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-[16.5px] font-semibold">Juan Dela Cruz</h2>
            <p className="text-[12px] text-muted-foreground">juan.delacruz@email.com</p>
          </div>
        </div>

        <div className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">Document wallet</div>
        <div className="mb-5 rounded-2xl border border-border bg-card px-4">
          <Row icon={IdCard} label={`${verified.length} verified documents`} sub="View your wallet" onClick={() => navigate("/wallet")} />
          <Row icon={FileText} label="Application history" sub={`${wallet.length ? "See all filed requests" : ""}`} onClick={() => navigate("/applications")} />
        </div>

        <div className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">Settings</div>
        <div className="rounded-2xl border border-border bg-card px-4">
          <Row icon={Bell} label="Notifications" onClick={() => showToast("Notification settings preview only")} />
          <Row icon={Globe} label="Language" sub="English" onClick={() => showToast("Language settings preview only")} />
          <Row icon={HelpCircle} label="Help center" onClick={() => showToast("Help center preview only")} />
          <Row icon={LogOut} label="Log out" onClick={() => navigate("/")} />
        </div>
      </div>
    </div>
  )
}
