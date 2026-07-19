export function ApprovalStamp({ office = "City Government of Malolos" }: { office?: string }) {
  return (
    <div className="my-2 flex justify-center">
      <svg className="animate-stamp" width="150" height="150" viewBox="0 0 160 160">
        <path id="stampCircle" d="M 80,80 m -58,0 a 58,58 0 1,1 116,0 a 58,58 0 1,1 -116,0" fill="none" />
        <circle cx="80" cy="80" r="58" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
        <circle cx="80" cy="80" r="47" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <text fontSize="9.5" fill="hsl(var(--primary))" letterSpacing="3" fontFamily="IBM Plex Mono, monospace">
          <textPath href="#stampCircle" startOffset="1%">
            {office.toUpperCase()} -
          </textPath>
        </text>
        <text x="80" y="76" textAnchor="middle" fontSize="16" fontWeight="700" fill="hsl(var(--primary))" fontFamily="Inter, sans-serif">
          APPROVED
        </text>
        <text x="80" y="92" textAnchor="middle" fontSize="9" fill="hsl(var(--primary))" fontFamily="IBM Plex Mono, monospace">
          READY FOR RELEASE
        </text>
      </svg>
    </div>
  )
}
