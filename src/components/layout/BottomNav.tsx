import { NavLink } from "react-router-dom"
import { Home, Wallet, ClipboardList, User } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/applications", label: "Applications", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: User },
]

export function BottomNav() {
  return (
    <nav className="flex flex-shrink-0 border-t border-border bg-card px-1 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-muted-foreground transition-colors",
              isActive && "text-primary"
            )
          }
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} />
          <span className="text-[10.5px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
