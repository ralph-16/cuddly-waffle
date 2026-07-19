import { Outlet } from "react-router-dom"
import { Toaster } from "./Toaster"

export function AppShell() {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[radial-gradient(ellipse_at_top_left,_#EFE9D8_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_#E9E3D2_0%,_transparent_55%),theme(colors.background)] py-0 sm:py-6">
      <div className="relative flex w-full max-w-md flex-col overflow-hidden bg-background sm:h-[844px] sm:rounded-[36px] sm:border sm:border-border sm:shadow-2xl">
        <Outlet />
        <Toaster />
      </div>
    </div>
  )
}
