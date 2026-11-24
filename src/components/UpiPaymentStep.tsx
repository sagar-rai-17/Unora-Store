import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { buildUpiPaymentUri, UNORA_UPI_ID } from "../utils/upiQr";

const MAX_SCREENSHOT_BYTES = 800 * 1024;
const UPI_ID_REGEX = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/;
const TXN_ID_REGEX = /^[a-zA-Z0-9_-]{4,50}$/;

interface UpiPaymentStepProps {
  orderPayload: {
    userId: string;
    customerEmail: string;
    orderId: string;
    fullName: string;
    mobile: string;
    campus: string;
    hostelName: string;
    roomNumber: string;
    deliveryNote: string;
    paymentMethod: "upi";
    paymentStatus: "pending_verification";
    items: any[];
    grandTotal: number;
    status: "Received";
    deliveryType?: "campus" | "other";
    fullAddress?: string;
  };
  onSubmitted: (orderId: string, hostel: string, campus: string) => void;
}

export const UpiPaymentStep: React.FC<UpiPaymentStepProps> = ({
  orderPayload,
  onSubmitted,
}) => {
  const { orderId, grandTotal, hostelName, campus } = orderPayload;
  const [payerUpiId, setPayerUpiId] = useState("");
  const [transactionRefId, setTransactionRefId] = useState("");
  const [screenshotBase64, setScreenshotBase64] = useState<string>("");
  const [screenshotName, setScreenshotName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitLockRef = useRef(false);

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

  const handleRemoveScreenshot = () => {
    setScreenshotBase64("");
    setScreenshotName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current) return;

    const cleanUpi = payerUpiId.trim();
    const cleanRef = transactionRefId.trim();

    if (!UPI_ID_REGEX.test(cleanUpi)) {
      setError("Please enter a valid UPI ID in username@handle format (e.g. student@okicici).");
      return;
    }
    if (!cleanRef || !TXN_ID_REGEX.test(cleanRef)) {
      setError("Please enter a valid UPI Transaction / Reference ID (letters and numbers allowed, no spaces).");
      return;
    }
    if (!screenshotBase64) {
      setError("Please upload a payment screenshot before submitting.");
      return;
    }

    submitLockRef.current = true;
    setError(null);
    setIsSubmitting(true);

    const exactSubmissionTime = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    try {
      await setDoc(doc(db, "orders", orderId), {
        ...orderPayload,
        payerUpiId: cleanUpi,
        transactionRefId: cleanRef,
        paymentTime: exactSubmissionTime,
        paymentScreenshotBase64: screenshotBase64,
        submittedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      setIsSubmitting(false);
      onSubmitted(orderId, hostelName, campus);
    } catch (err) {
      console.error("Failed to submit payment details:", err);
      setError("Could not submit payment details. Please check your connection and try again.");
      setIsSubmitting(false);
      submitLockRef.current = false;
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
              Pay ₹{grandTotal.toLocaleString("en-IN")}.00 to <span className="font-mono font-bold">Unora Clothin</span>, then submit your transfer details below.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Your UPI ID (username@handle) *
            </label>
            <input
              type="text"
              required
              value={payerUpiId}
              onChange={(e) => setPayerUpiId(e.target.value.replace(/\s/g, ""))}
              placeholder="student@okicici"
              className="w-full h-11 px-3.5 rounded-xl border-2 border-[#3C1A11] bg-[#FFF8F0] text-sm font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              UPI Transaction / Reference ID *
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={transactionRefId}
              onChange={(e) => setTransactionRefId(e.target.value.replace(/\s/g, ""))}
              placeholder="Enter UPI Transaction ID / UTR"
              className="w-full h-11 px-3.5 rounded-xl border-2 border-[#3C1A11] bg-[#FFF8F0] text-sm font-mono font-bold outline-none"
            />
            <span className="text-[10px] font-bold text-[#3C1A11]/60 mt-1 block">
              Letters & digits allowed · Transaction timestamp is recorded automatically
            </span>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Payment Screenshot (Max 800 KB) *
            </label>
            <input
              ref={fileInputRef}
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
              <div className="relative inline-block mt-2">
                <img
                  src={screenshotBase64}
                  alt="Payment screenshot preview"
                  className="h-28 w-auto rounded-xl border-2 border-[#3C1A11] object-contain bg-[#FFF8F0]"
                />
                <button
                  type="button"
                  onClick={handleRemoveScreenshot}
                  aria-label="Remove screenshot"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#D94F27] hover:bg-[#3C1A11] text-[#FFE2C7] border-2 border-[#3C1A11] flex items-center justify-center text-xs font-black cursor-pointer shadow-md"
                >
                  ✕
                </button>
              </div>
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