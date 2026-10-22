import React, { useState } from "react";
import type { CartItem } from "./CartSidebar";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedDiscount?: number;
  onOrderSuccess: (orderId: string, hostel: string, campus: string) => void;
}

const CAMPUSES = [
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "IIT Guwahati",
  "IIT BHU",
  "IIT Hyderabad",
  "IIT Gandhinagar",
];

export const Checkout: React.FC<CheckoutProps> = ({
  isOpen,
  onClose,
  items,
  appliedDiscount = 0,
  onOrderSuccess,
}) => {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0]);
  const [hostelName, setHostelName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const itemsTotal = items.reduce(
    (acc, item) => acc + item.basePrice * item.quantity,
    0
  );

  const customTotal = items.reduce(
    (acc, item) => acc + (item.customFee || 0) * item.quantity,
    0
  );

  const deliveryFee = items.length > 0 ? 40 : 0;
  const grandTotal = Math.max(0, itemsTotal + customTotal + deliveryFee - appliedDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!mobile.trim() || mobile.replace(/\D/g, "").length !== 10) {
      newErrors.mobile = "Valid 10-digit mobile number required.";
    }
    if (!hostelName.trim()) {
      newErrors.hostelName = "Hostel Name / Number is mandatory.";
    }
    if (!roomNumber.trim()) {
      newErrors.roomNumber = "Room Number is mandatory.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const generatedOrderId = `UNR-${Math.floor(100000 + Math.random() * 900000)}`;

      await addDoc(collection(db, "orders"), {
        userId: auth.currentUser?.uid || "guest",
        customerEmail: auth.currentUser?.email || "",
        orderId: generatedOrderId,
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        campus: selectedCampus,
        hostelName: hostelName.trim(),
        roomNumber: roomNumber.trim(),
        deliveryNote: deliveryNote.trim(),
        paymentMethod,
        items: items.map((it) => ({
          name: it.name,
          size: it.size,
          quantity: it.quantity,
          basePrice: it.basePrice,
          customFee: it.customFee || 0,
          customText: it.customText || "",
        })),
        grandTotal,
        status: "Received",
        createdAt: serverTimestamp(),
      });

      setIsSubmitting(false);
      onOrderSuccess(generatedOrderId, hostelName, selectedCampus);
      onClose();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#FFF8F0] overflow-y-auto text-[#3C1A11]">
      <div className="sticky top-0 z-20 bg-[#FFF8F0] border-b-2 border-[#3C1A11] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border-2 border-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#FFE2C7] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="font-anton text-2xl md:text-3xl uppercase tracking-wider">
            SHOPPING RECEPTION
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-[11px] font-black tracking-widest text-[#D94F27] uppercase">
                RECEPTION DETAILS
              </span>
              <h2 className="font-anton text-3xl md:text-4xl uppercase tracking-tight mt-1">
                HOSTEL DELIVERY ADDRESS
              </h2>
              <p className="text-xs font-semibold text-[#3C1A11]/70 mt-1">
                Packages are delivered safely and on time to your campus!
              </p>
            </div>

            <form onSubmit={handleSubmit} id="checkout-form" className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black tracking-wider uppercase mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Kabir Sharma"
                    className="w-full h-12 px-4 rounded-xl border-2 border-[#3C1A11] bg-transparent text-sm font-bold focus:border-[#2952CC] outline-none"
                  />
                  {errors.fullName && (
                    <span className="text-[10px] font-bold text-[#D94F27] block mt-1">{errors.fullName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black tracking-wider uppercase mb-1.5">
                    Mobile Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="h-12 px-3.5 flex items-center justify-center rounded-xl border-2 border-[#3C1A11] bg-[#3C1A11]/5 text-xs font-black">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="98765 43210"
                      className="flex-1 h-12 px-4 rounded-xl border-2 border-[#3C1A11] bg-transparent text-sm font-bold focus:border-[#2952CC] outline-none"
                    />
                  </div>
                  {errors.mobile && (
                    <span className="text-[10px] font-bold text-[#D94F27] block mt-1">{errors.mobile}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black tracking-wider uppercase mb-1.5">
                  Select Your Campus *
                </label>
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#3C1A11] bg-transparent text-sm font-bold focus:border-[#2952CC] outline-none cursor-pointer"
                >
                  {CAMPUSES.map((campus) => (
                    <option key={campus} value={campus} className="bg-[#FFF8F0]">
                      {campus}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black tracking-wider uppercase mb-1.5">
                    Hostel Name / Number *
                  </label>
                  <input
                    type="text"
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                    placeholder="Hostel 12 / Kumaon / Ganga"
                    className="w-full h-12 px-4 rounded-xl border-2 border-[#3C1A11] bg-transparent text-sm font-bold focus:border-[#2952CC] outline-none"
                  />
                  {errors.hostelName && (
                    <span className="text-[10px] font-bold text-[#D94F27] block mt-1">{errors.hostelName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black tracking-wider uppercase mb-1.5">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="B-304"
                    className="w-full h-12 px-4 rounded-xl border-2 border-[#3C1A11] bg-transparent text-sm font-bold focus:border-[#2952CC] outline-none"
                  />
                  {errors.roomNumber && (
                    <span className="text-[10px] font-bold text-[#D94F27] block mt-1">{errors.roomNumber}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black tracking-wider uppercase mb-1.5">
                  Hostel Gate Drop Notes (Optional)
                </label>
                <textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Leave with guard if in lab, call upon arrival at front porch."
                  rows={2}
                  className="w-full p-4 rounded-xl border-2 border-[#3C1A11] bg-transparent text-sm font-bold focus:border-[#2952CC] outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <span className="block text-xs font-black tracking-wider uppercase mb-2">
                  Payment Method
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`h-12 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      paymentMethod === "upi"
                        ? "bg-[#3C1A11] border-[#3C1A11] text-[#BDF119]"
                        : "border-[#3C1A11]/30 text-[#3C1A11] hover:border-[#3C1A11]"
                    }`}
                  >
                    UPI / QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`h-12 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      paymentMethod === "cod"
                        ? "bg-[#3C1A11] border-[#3C1A11] text-[#BDF119]"
                        : "border-[#3C1A11]/30 text-[#3C1A11] hover:border-[#3C1A11]"
                    }`}
                  >
                    Cash On Delivery
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white border-2 border-[#3C1A11] rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#D94F27] uppercase">
                  ORDER VERIFICATION
                </span>
                <h3 className="font-anton text-2xl uppercase mt-0.5">
                  SUMMARY BREAKDOWN
                </h3>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-3 pr-1 border-y border-[#3C1A11]/15 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded-lg border border-[#3C1A11]/15 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase truncate">{item.name}</p>
                      <p className="text-[10px] font-semibold text-[#3C1A11]/60">
                        Qty: {item.quantity} · Size: {item.size}
                      </p>
                      {item.customText && (
                        <p className="text-[10px] font-bold text-[#D94F27] uppercase">
                          Print: "{item.customText}"
                        </p>
                      )}
                    </div>
                    <span className="font-anton text-sm">
                      ₹{((item.basePrice + (item.customFee || 0)) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs font-bold text-[#3C1A11]/80">
                <div className="flex justify-between">
                  <span>Items Total</span>
                  <span>₹{itemsTotal.toLocaleString("en-IN")}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Customization Total</span>
                  <span>₹{customTotal.toLocaleString("en-IN")}.00</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#D94F27] font-bold">
                    <span>Discount Applied (-)</span>
                    <span>-₹{appliedDiscount.toLocaleString("en-IN")}.00</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toLocaleString("en-IN")}.00</span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t-2 border-[#3C1A11] text-base font-anton text-[#3C1A11]">
                  <span>GRAND TOTAL</span>
                  <span className="text-2xl text-[#D94F27]">
                    ₹{grandTotal.toLocaleString("en-IN")}.00
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || items.length === 0}
                className="w-full h-14 bg-[#D94F27] hover:bg-[#F47E20] disabled:bg-[#3C1A11]/30 text-[#FFE2C7] font-black uppercase text-sm tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? "PLACING ORDER..." : "PLACE YOUR ORDER"}
              </button>

              <div className="text-[10px] font-semibold text-[#3C1A11]/60 text-center space-y-1">
                <p>7-Day Free Replacement Window</p>
                <p>Hostel room distribution verified by student network</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};