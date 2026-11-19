export const UNORA_UPI_ID = "7846814491-2@ybl";
export const UNORA_PAYEE_NAME = "Unora";

export function formatUpiAmount(amount: number): string {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  return Number.isInteger(safeAmount) ? String(safeAmount) : safeAmount.toFixed(2);
}

export function buildUpiPaymentUri(params: {
  amount: number;
  orderId: string;
  upiId?: string;
  payeeName?: string;
}): string {
  const pa = encodeURIComponent((params.upiId || UNORA_UPI_ID).trim());
  const pn = encodeURIComponent((params.payeeName || UNORA_PAYEE_NAME).trim());
  const am = encodeURIComponent(formatUpiAmount(params.amount));
  const tn = encodeURIComponent(`Order ${params.orderId}`);

  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}