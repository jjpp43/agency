import { Checkout } from "@polar-sh/nextjs";

/**
 * Polar checkout handler.
 *
 * Triggered by linking to `/api/checkout?products=PRODUCT_ID`.
 * Creates a Polar-hosted checkout session and redirects there.
 *
 * Required env:
 *   POLAR_ACCESS_TOKEN   — server-side token from polar.sh/dashboard
 *
 * Optional env:
 *   POLAR_SUCCESS_URL    — redirect destination after payment
 *                          (defaults to /payment/success on the same origin)
 *   POLAR_SERVER         — "sandbox" or "production" (default)
 */
export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
  successUrl: process.env.POLAR_SUCCESS_URL ?? "/payment/success",
  server: (process.env.POLAR_SERVER as "sandbox" | "production") ?? "production",
});
