import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, MapPin, Check } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { reportCategories } from "@/data/mock"
import { ICONS } from "@/lib/icon-map"
import { useAppData } from "@/context/AppDataContext"

export default function Report() {
  const navigate = useNavigate()
  const { showToast } = useAppData()
  const [category, setCategory] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [desc, setDesc] = useState("")
  const [photoAdded, setPhotoAdded] = useState(false)
  const [submitted, setSubmitted] = useState<string | null>(null)

  const submit = () => {
    if (!category) return showToast("Choose what you're reporting")
    if (!location.trim()) return showToast("Add a location so it can be found")
    const ref = `RPT-CN-${Math.floor(1000 + Math.random() * 8999)}`
    setSubmitted(ref)
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-[2.5px] border-primary">
            <Check className="h-9 w-9 text-primary" strokeWidth={1.8} />
          </div>
          <h2 className="font-display text-[19px] font-semibold">Report received</h2>
          <p className="text-[13px] text-muted-foreground">
            The barangay and city works office have been notified. Reference number
          </p>
          <p className="font-mono text-[15px] font-semibold">{submitted}</p>
        </div>
        <div className="flex-shrink-0 px-5 pb-[max(env(safe-area-inset-bottom),20px)]">
          <Button onClick={() => navigate("/home")}>Back to home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Report an issue" subtitle="Non-emergency concerns for your barangay" backTo="/home" />
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <Label className="mt-1">What are you reporting?</Label>
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          {reportCategories.map((c) => {
            const Icon = ICONS[c.icon] ?? ICONS.flag
            const active = category === c.label
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.label)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-colors",
                  active ? "border-primary bg-accent" : "border-border bg-card"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", active ? "text-primary" : "text-muted-foreground")} strokeWidth={1.7} />
                <span className="text-[12.5px] font-semibold leading-tight">{c.label}</span>
              </button>
            )
          })}
        </div>

        <Label>Location</Label>
        <div className="relative mb-4">
          <Input placeholder="Street, landmark, or barangay" value={location} onChange={(e) => setLocation(e.target.value)} className="pr-11" />
          <button
            onClick={() => {
              setLocation("Near Barasoain Park, Brgy. Sto. Rosario")
              showToast("Using your approximate location")
            }}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-primary hover:bg-accent"
            aria-label="Use current location"
          >
            <MapPin className="h-4 w-4" />
          </button>
        </div>

        <Label>Description</Label>
        <Textarea placeholder="What's going on? Add any details that could help." value={desc} onChange={(e) => setDesc(e.target.value)} className="mb-4" />

        <button
          onClick={() => {
            setPhotoAdded(true)
            showToast("Photo attached")
          }}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-4 text-[13px] font-semibold",
            photoAdded ? "border-sage text-sage-foreground bg-sage/10" : "border-border text-muted-foreground"
          )}
        >
          {photoAdded ? <Check className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          {photoAdded ? "Photo attached" : "Attach a photo (optional)"}
        </button>
      </div>
      <div className="flex-shrink-0 border-t border-border bg-card px-5 py-3.5 pb-[max(env(safe-area-inset-bottom),14px)]">
        <Button onClick={submit}>Submit report</Button>
      </div>
    </div>
  )
}
