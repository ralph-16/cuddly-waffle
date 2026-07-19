import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"

export function TabLayout() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
