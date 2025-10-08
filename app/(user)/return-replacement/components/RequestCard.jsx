import Link from "next/link"

export default function RequestCard({ request }) {
  const name = request?.productDetails?.name || "Product"
  const imageSrc = request?.productDetails?.images?.[0] || "/modern-tech-product.png"

  return (
    <Link href={`/return-replacement/${request?.id}`} className="group block">
      <article className="flex w-full items-stretch gap-4 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md">
        <img src={imageSrc || "/placeholder.svg"} alt={name} className="h-24 w-24 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">{name}</h2>
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
              {request?.status || "—"}
            </span>
          </div>
          {request?.productDetails?.description ? (
            <p className="mt-1 truncate text-sm text-muted-foreground">{request.productDetails.description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-xs text-muted-foreground">
              Type: <span className="text-sm text-foreground">{request?.type}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              Qty: <span className="text-sm text-foreground">{request?.quantity}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              Order: <span className="text-sm text-foreground truncate">{request?.orderId}</span>
            </span>
          </div>
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
