import CheckoutClient from "./CheckoutClient"

export const dynamic = "force-dynamic" // optional but safe

export default function CheckoutPage() {
  // This is rendered on the server (no hooks)
  return <CheckoutClient />
}
