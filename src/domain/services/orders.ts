import type { OrderStatus } from "../entities/types";

/** Customer-safe wording. Provider payloads and internal errors are never shown. */
const labels: Record<OrderStatus, string> = {
  draft: "Not finished",
  "awaiting-payment": "Awaiting payment",
  paid: "Paid",
  submitted: "Sent to the printer",
  "in-production": "Being made",
  shipped: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Could not be completed",
  refunded: "Refunded",
};

export function orderStatusLabel(status: OrderStatus): string {
  return labels[status] ?? "In progress";
}

/** Address changes and cancellation stop once the printer has started. */
export function canCancel(status: OrderStatus): boolean {
  return status === "draft" || status === "awaiting-payment" || status === "paid";
}

export function canEditAddress(status: OrderStatus): boolean {
  return canCancel(status);
}

export function cancellationExplanation(status: OrderStatus): string {
  return canCancel(status)
    ? "You can still cancel this order or change the delivery address."
    : "This order has already gone to the printer, so it cannot be cancelled and the delivery address cannot be changed. Contact support if something is wrong.";
}
