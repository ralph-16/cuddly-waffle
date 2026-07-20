import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppDataProvider } from "@/context/AppDataProvider"
import { AppShell } from "@/components/layout/AppShell"
import { TabLayout } from "@/components/layout/TabLayout"

import Splash from "@/pages/Splash"
import Auth from "@/pages/Auth"
import Home from "@/pages/Home"
import Wallet from "@/pages/Wallet"
import Applications from "@/pages/Applications"
import ApplicationDetail from "@/pages/ApplicationDetail"
import Profile from "@/pages/Profile"
import News from "@/pages/News"
import RequestFlow from "@/pages/RequestFlow"
import RequestConfirm from "@/pages/RequestConfirm"
import RptFlow from "@/pages/RptFlow"
import CivilRegistryFlow from "@/pages/CivilRegistryFlow"
import BusinessPermitFlow from "@/pages/BusinessPermitFlow"
import CedulaFlow from "@/pages/CedulaFlow"
import Report from "@/pages/Report"
import Hotlines from "@/pages/Hotlines"
import Assistant from "@/pages/Assistant"

/*
UI text/hints — a lot of the placeholder/hint text looks AI-generated and needs a human pass (rewrite for clarity/tone)
Status meanings — need a place in the app (tooltip? legend? info modal?) that explains what each status means, and whether all current statuses are even still needed
Spacing — component spacing/margins need cleanup across the app
Flow review — walk through the actual user process/flow end-to-end and check it makes sense
Home/Dashboard tab — needs improvement since it hasn't gotten attention; consider removing the last 2 items (sections/cards?) currently there
Add a News section — similar to Malolos City's "MaloloNews" on their website, so the dashboard doesn't feel empty
*/

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Splash />} />
            <Route path="/auth" element={<Auth />} />

            <Route element={<TabLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/news" element={<News />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/request/:slug" element={<RequestFlow />} />
            <Route path="/request/:slug/confirm" element={<RequestConfirm />} />
            <Route path="/rpt" element={<RptFlow />} />
            <Route path="/lcr" element={<CivilRegistryFlow />} />
            <Route path="/business-permit" element={<BusinessPermitFlow />} />
            <Route path="/cedula" element={<CedulaFlow />} />
            <Route path="/report" element={<Report />} />
            <Route path="/hotlines" element={<Hotlines />} />
            <Route path="/assistant" element={<Assistant />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  )
}
