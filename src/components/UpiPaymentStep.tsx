import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { buildUpiPaymentUri, UNORA_UPI_ID } from "../utils/upiQr";

const MAX_SCREENSHOT_BYTES = 800 * 1024; // 800 KB safety cap under Firestore 1MB doc limit

interface UpiPaymentStepProps {
  orderDocId: string;
  orderId: string;
  grandTotal: number;
  hostelName: string;
  campusName: string;
  onSubmitted: (orderId: string, hostel: string, campus: string) => void;
}

function getDefaultLocalDateTime(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

export const UpiPaymentStep: React.FC<UpiPaymentStepProps> = ({
  orderDocId,
  orderId,
  grandTotal,
  hostelName,
  campusName,
  onSubmitted,
}) => {
  const [payerUpiId, setPayerUpiId] = useState("");
  const [transactionRefId, setTransactionRefId] = useState("");
  const [paymentTime, setPaymentTime] = useState(getDefaultLocalDateTime);
  const [screenshotBase64, setScreenshotBase64] = useState<string>("");
  const [screenshotName, setScreenshotName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upiUri = buildUpiPaymentUri({
    amount: grandTotal,
    orderId,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, or WEBP).");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError("Screenshot must be 800 KB or smaller so it saves reliably. Please compress or crop it.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setScreenshotBase64(reader.result);
        setScreenshotName(file.name);
      }
    };
    reader.onerror = () => {
      setError("Could not read the selected screenshot. Please try another image.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUpi = payerUpiId.trim();
    const cleanRef = transactionRefId.trim();

    if (!cleanUpi || !cleanUpi.includes("@")) {
      setError("Please enter the valid UPI ID you sent the payment from (e.g. name@okaxis).");
      return;
    }
    if (cleanRef.length < 6) {
      setError("Please enter the UPI Transaction / Reference ID (UTR).");
      return;
    }
    if (!paymentTime) {
      setError("Please select the date and time you made the payment.");
      return;
    }
    if (!screenshotBase64) {
      setError("Please upload a payment screenshot before submitting.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Only payment-claim fields are updated; paymentStatus stays "pending_verification"
      // until an admin manually verifies and approves in Admin Portal.
      await updateDoc(doc(db, "orders", orderDocId), {
        payerUpiId: cleanUpi,
        transactionRefId: cleanRef,
        paymentTime,
        paymentScreenshotBase64: screenshotBase64,
        submittedAt: serverTimestamp(),
      });

      setIsSubmitting(false);
      onSubmitted(orderId, hostelName, campusName);
    } catch (err) {
      console.error("Failed to submit payment details:", err);
      setError("Could not submit payment details. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10 space-y-8 text-[#3C1A11]">
      <div className="bg-white border-2 border-[#3C1A11] rounded-3xl p-6 md:p-8 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5 flex flex-col items-center text-center bg-[#FFF8F0] border-2 border-[#3C1A11] rounded-2xl p-5 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D94F27]">
            SCAN TO PAY VIA UPI
          </span>
          <div className="bg-white p-3 rounded-2xl border-2 border-[#3C1A11]">
            <QRCodeSVG
              value={upiUri}
              size={184}
              bgColor="#FFFFFF"
              fgColor="#3C1A11"
              level="M"
            />
          </div>
          <div className="space-y-0.5">
            <p className="font-anton text-3xl text-[#D94F27]">
              ₹{grandTotal.toLocaleString("en-IN")}.00
            </p>
            <p className="text-[11px] font-mono font-bold text-[#3C1A11]">
              UPI ID: {UNORA_UPI_ID}
            </p>
            <p className="text-[10px] font-bold text-[#3C1A11]/60">
              Order Ref: {orderId}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitClaim} className="md:col-span-7 space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D94F27]">
              STEP 2 OF 2 · MANUAL VERIFICATION
            </span>
            <h2 className="font-anton text-3xl uppercase tracking-tight">
              SUBMIT PAYMENT PROOF
            </h2>
            <p className="text-xs font-semibold text-[#3C1A11]/70 mt-1">
              Pay ₹{grandTotal.toLocaleString("en-IN")}.00 to <span className="font-mono font-bold">{UNORA_UPI_ID}</span>, then submit your transfer details below.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Your UPI ID (Sent From) *
            </label>
            <input
              type="text"
              value={payerUpiId}
              onChange={(e) => setPayerUpiId(e.target.value)}
              placeholder="student@okicici"
              className="w-full h-11 px-3.5 rounded-xl border-2 border-[#3C1A11] bg-[#FFF8F0] text-sm font-bold outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                UPI Transaction / Ref ID *
              </label>
              <input
                type="text"
                value={transactionRefId}
                onChange={(e) => setTransactionRefId(e.target.value)}
                placeholder="e.g. 432412345678"
                className="w-full h-11 px-3.5 rounded-xl border-2 border-[#3C1A11] bg-[#FFF8F0] text-sm font-mono font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Payment Date & Time *
              </label>
              <input
                type="datetime-local"
                value={paymentTime}
                onChange={(e) => setPaymentTime(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border-2 border-[#3C1A11] bg-[#FFF8F0] text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Payment Screenshot (Max 800 KB) *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs font-bold file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-2 file:border-[#3C1A11] file:bg-[#3C1A11] file:text-[#BDF119] file:font-black file:uppercase file:text-[10px] file:cursor-pointer cursor-pointer"
            />
            {screenshotName && (
              <p className="text-[11px] font-bold text-[#3C1A11]/70 mt-1">
                Attached: {screenshotName}
              </p>
            )}
            {screenshotBase64 && (
              <img
                src={screenshotBase64}
                alt="Payment screenshot preview"
                className="mt-2 h-28 w-auto rounded-xl border-2 border-[#3C1A11] object-contain bg-[#FFF8F0]"
              />
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#D94F27]/15 border border-[#D94F27] text-xs font-bold text-[#D94F27]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#D94F27] hover:bg-[#F47E20] disabled:bg-[#3C1A11]/30 text-[#FFE2C7] font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
          >
            {isSubmitting ? "SUBMITTING PAYMENT PROOF..." : "SUBMIT PAYMENT FOR VERIFICATION"}
          </button>
        </form>
      </div>
    </div>
  );
};