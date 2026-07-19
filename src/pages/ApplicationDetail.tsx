import { useParams } from "react-router-dom"
import { Download, Eye, Printer, Paperclip, ReceiptText } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Timeline } from "@/components/shared/Timeline"
import { ApprovalStamp } from "@/components/shared/ApprovalStamp"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/context/useAppData"

export default function ApplicationDetail() {
  const { id } = useParams()
  const { applications, showToast } = useAppData()
  const app = applications.find((a) => a.id === id)

  if (!app) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Not found" backTo="/applications" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title={app.service} subtitle={`${app.track} - Filed ${app.submitted}`} backTo="/applications" />
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <Timeline stages={app.stages} />

        {!!app.attachments?.length && (
          <div className="mb-4 rounded-2xl border border-border bg-card p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5" /> Attached to this application
            </p>
            <ul className="space-y-1">
              {app.attachments.map((a) => (
                <li key={a} className="text-[12.5px]">{a}</li>
              ))}
            </ul>
          </div>
        )}

        {app.status === "released" && (
          <>
            <ApprovalStamp />
            <p className="mb-3 text-center text-[12px] text-muted-foreground">Your document is ready. View it now or claim a printed copy.</p>
            {app.service === "Cedula" ? (
              <div className="flex flex-col gap-2.5">
                <Button variant="ghost" className="w-full" onClick={() => showToast("Official receipt preview not available in this prototype")}>
                  <ReceiptText data-icon="inline-start" /> View Official Receipt
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => showToast("Cedula preview not available in this prototype")}>
                  <Eye data-icon="inline-start" /> View Cedula
                </Button>
                <Button className="w-full" onClick={() => showToast("Cedula PDF download simulated for this prototype")}>
                  <Download data-icon="inline-start" /> Download Cedula (PDF)
                </Button>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <Button variant="ghost" className="flex-1" onClick={() => showToast("Digital copy preview not available in this prototype")}>
                  <Eye data-icon="inline-start" /> View digital
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => showToast("Claim slip: bring a valid ID to City Hall, Window 2")}>
                  <Printer data-icon="inline-start" /> Claim printed
                </Button>
              </div>
            )}
          </>
        )}
        {app.status === "payment" && (
          <Button variant="gold" className="mt-4" onClick={() => showToast("Payment gateway preview not available")}>
            Pay fees online
          </Button>
        )}
        {(app.status === "submitted" || app.status === "review") && (
          <Button variant="ghost" className="mt-4" onClick={() => showToast("You'll be notified as this moves forward")}>
            Notify me on updates
          </Button>
        )}
      </div>
    </div>
  )
}
