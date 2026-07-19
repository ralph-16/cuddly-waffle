import { useRef, useState } from "react"
import { Sparkles, Send } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types"

const SUGGESTIONS = [
  "Paano mag-apply ng business permit?",
  "Requirements para sa cedula",
  "Paano gumamit ng document wallet?",
  "Sino ang tatawagan sa emergency?",
]

function reply(input: string): string {
  const q = input.toLowerCase()
  if (q.includes("business") || q.includes("permit"))
    return "For a business permit you'll need a valid ID, DTI or SEC registration, barangay clearance, and your lease contract or land title. Add them once to your document wallet and eKaratig will attach them automatically when you apply."
  if (q.includes("cedula"))
    return "A cedula (community tax certificate) just needs a valid ID and your occupation or business details. You can request one under City services on the Home tab."
  if (q.includes("wallet"))
    return "Your document wallet stores requirements like your ID, proof of billing, and clearances once. When you request a service, eKaratig checks what's already verified and only asks you to upload what's missing."
  if (q.includes("emergency") || q.includes("hotline") || q.includes("tawag"))
    return "You can reach the Malolos City Police at 117, or open the Hotlines page from Home for fire, medical, and barangay contacts."
  if (q.includes("rpt") || q.includes("property") || q.includes("tax"))
    return "Real property tax requests need your tax declaration number, property address, and a valid ID plus proof of billing from your wallet."
  return "I can help with document requests, your wallet, reporting an issue, or emergency hotlines. Try asking about a specific service, like \"business permit requirements.\""
}

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m0", role: "assistant", text: "Kumusta! I'm eKa, your assistant for Malolos city services. Ask me about requirements, your document wallet, or where to report something." },
  ])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMessage = { id: `u${Date.now()}`, role: "user", text }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setTyping(true)
    setTimeout(() => {
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "assistant", text: reply(text) }])
      setTyping(false)
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50)
    }, 700)
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="eKa" subtitle="AI assistant - preview" backTo="/home" />
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 pb-3">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "assistant" && (
              <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                m.role === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card"
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="rounded-2xl rounded-bl-md border border-border bg-card px-3.5 py-2.5 text-[13px] text-muted-foreground">eKa is typing...</div>
          </div>
        )}
      </div>

      {messages.length < 3 && (
        <div className="flex flex-shrink-0 gap-2 overflow-x-auto px-5 pb-2 no-scrollbar">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-shrink-0 items-center gap-2 border-t border-border bg-card px-4 py-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about a service..."
          className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => send(input)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
