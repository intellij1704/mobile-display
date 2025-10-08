"use client"
import Link from "next/link"
import { CircularProgress } from "@mui/material"
import { useAuth } from "@/context/AuthContext"
import { useUserReturnRequests } from "@/lib/firestore/return_requests/read"

function formatDate(ts) {
  if (!ts) return "-"
  try {
    // Firestore Timestamp with seconds
    if (typeof ts.seconds === "number") {
      return new Date(ts.seconds * 1000).toLocaleDateString()
    }
    // JS Date or ISO
    const d = ts instanceof Date ? ts : new Date(ts)
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString()
  } catch {
    return "-"
  }
}

function StatusBadge({ status }) {
  const label = typeof status === "string" ? status : "—"
  return (
    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
      {label}
    </span>
  )
}

function InfoPill({ label, value }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="truncate text-sm text-foreground">{value ?? "—"}</span>
    </div>
  )
}

function RequestCard({ request }) {
  const name = request?.productDetails?.name || "Product"
  const description = request?.productDetails?.description || ""
  const imageSrc = request?.productDetails?.images?.[0] || "/modern-tech-product.png"

  return (
    <Link href={`/return-replacement/${request?.id}`} className="group block" aria-label={`Open details for ${name}`}>
      <article className="flex w-full items-stretch gap-4 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring">
        {/* Left: Thumbnail */}
        <div className="shrink-0">
          <img src={imageSrc || "/placeholder.svg"} alt={name} className="h-24 w-24 rounded-md object-cover" />
        </div>

        {/* Right: Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top row: Title + Status */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">{name}</h2>
            <StatusBadge status={request?.status} />
          </div>

          {/* Optional short description (single line) */}
          {description ? <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p> : null}

          {/* Inline info at a glance (keep minimal on card) */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <InfoPill label="Type" value={request?.type} />
            <InfoPill label="Qty" value={request?.quantity} />
            <InfoPill label="Created" value={formatDate(request?.createdAt)} />
            <InfoPill label="Order" value={request?.orderId} />
          </div>

          {/* Footer affordance */}
          <div className="mt-3 flex items-center justify-end">
            <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
              View details →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function Page() {
  const { user } = useAuth()
  const { data, error, isLoading } = useUserReturnRequests({ uid: user?.uid })

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6">
          <h1 className="text-pretty text-3xl font-bold text-foreground">Return & Replacement Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View the requests you submitted. Tap a card to see full details.
          </p>
        </header>

        {isLoading && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center">
            <CircularProgress size={48} thickness={4} color="primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading your requests...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-md border border-border bg-card p-4 text-destructive-foreground">
            Error loading requests.
          </div>
        )}

        {!isLoading && !error && (!Array.isArray(data) || data.length === 0) && (
          <div className="rounded-md border border-border bg-card p-6 text-center text-muted-foreground">
            No return or replacement requests found.
          </div>
        )}

        {Array.isArray(data) && data.length > 0 && (
          <section aria-label="Your return and replacement requests" className="grid grid-cols-1 gap-4">
            {data.map((request) => (
              <RequestCard key={request?.id} request={request} />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
