import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("login")

  return (
    <div className="flex h-full flex-col">
      <Header title="Welcome" backTo="/" />
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="mb-5 grid w-full grid-cols-2">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div>
              <Label>Mobile number</Label>
              <Input placeholder="09XX XXX XXXX" inputMode="numeric" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" placeholder="Enter your password" />
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div>
              <Label>Mobile number</Label>
              <Input placeholder="09XX XXX XXXX" inputMode="numeric" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" placeholder="Enter your password" />
            </div>
            <div>
              <Label>Full name</Label>
              <Input placeholder="Juan Dela Cruz" />
            </div>
          </TabsContent>
        </Tabs>

        <Button className="mt-5 w-full" onClick={() => navigate("/home")}>
          Continue
        </Button>
        <p className="mt-3.5 text-center text-[11.5px] text-muted-foreground">
          This is a hackathon preview - no real ID data is stored.
        </p>
      </div>
    </div>
  )
}
