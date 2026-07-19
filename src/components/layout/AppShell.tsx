import { Outlet } from "react-router-dom";
import { Toaster } from "./Toaster";

export function AppShell() {
  return (
    <div className="flex min-h-dvh w-full bg-[...]">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background">
        <Outlet />
        <Toaster />
      </div>
    </div>
  );
}
