import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const UNIFIED_STATUSES = [
  "Received",
  "Printing",
  "In Transit",
  "At Hostel Gate",
  "Delivered",
] as const;

export type UnifiedStatus = (typeof UNIFIED_STATUSES)[number];

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  isOpen,
  onClose,
  orderId,
}) => {
  const [orderData, setOrderData] = useState<{
    orderId: string;
    campus: string;
    hostelName: string;
    roomNumber: string;
    status: UnifiedStatus;
    items: Array<{ name: string; size: string; customText?: string }>;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    const q = query(collection(db, "orders"), where("orderId", "==", orderId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        setOrderData({
          orderId: data.orderId || docSnap.id,
          campus: data.campus || "IIT Campus",
          hostelName: data.hostelName || "Hostel",
          roomNumber: data.roomNumber || "",
          status: (data.status as UnifiedStatus) || "Received",
          items: Array.isArray(data.items) ? data.items : [],
        });
      }
    });

    return () => unsubscribe();
  }, [isOpen, orderId]);

  if (!isOpen || !orderId) return null;

  const currentStatusIndex = orderData
    ? UNIFIED_STATUSES.indexOf(orderData.status) !== -1
      ? UNIFIED_STATUSES.indexOf(orderData.status)
      : 0
    : 0;

  const getStatusMessage = (status: UnifiedStatus, campus: string, hostel: string) => {
    switch (status) {
      case "Received":
        return `Order received ready for dispatch to ${campus}`;
      case "Printing":
        return "Your customized items are getting printed at Unora Studio.";
      case "In Transit":
        return `Dispatched from the hub. Courier is routed to ${campus}.`;
      case "At Hostel Gate":
        return `Your package has arrived at the ${campus} and is on the way to ${hostel}.`;
      case "Delivered":
        return `Package handed over at ${hostel}. Enjoy your campus fit!`;
      default:
        return "Order is being processed by us.";
    }
  };

  return (
    <div className="fixed inset-0 z-140 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FFF8F0] border-2 border-[#3C1A11] rounded-3xl p-6 md:p-8 shadow-2xl text-[#3C1A11]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full border border-[#3C1A11]/20 hover:bg-[#3C1A11] hover:text-[#FFE2C7] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="bg-[#3C1A11] text-[#BDF119] text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
              LIVE TELEMETRY
            </span>
            <span className="font-mono text-xs font-bold text-[#D94F27]">{orderId}</span>
          </div>
          <h2 className="font-anton text-3xl uppercase tracking-tight mt-1">
            CAMPUS DISPATCH TRACKER
          </h2>
          <p className="text-xs font-bold text-[#3C1A11]/60 mt-0.5">
            Destination: {orderData ? `${orderData.hostelName} (${orderData.campus})` : "Verifying..."}
          </p>
        </div>

        <div className="bg-[#D94F27]/10 border border-[#D94F27] rounded-2xl p-4 mb-6">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#D94F27] block">
            LIVE DISPATCH STATUS
          </span>
          <p className="font-bold text-xs text-[#3C1A11] mt-1">
            {orderData
              ? getStatusMessage(orderData.status, orderData.campus, orderData.hostelName)
              : "Connecting to campus logistics node..."}
          </p>
        </div>

        <div className="space-y-4 my-6">
          {UNIFIED_STATUSES.map((step, idx) => {
            const isCompleted = idx < currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            const isPending = idx > currentStatusIndex;

            return (
              <div key={step} className="flex items-start gap-4 relative">
                {idx < UNIFIED_STATUSES.length - 1 && (
                  <div
                    className={`absolute left-[15px] top-[28px] bottom-[-16px] w-[2px] transition-colors ${
                      idx < currentStatusIndex ? "bg-[#3C1A11]" : "bg-[#3C1A11]/20"
                    }`}
                  />
                )}

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-anton text-xs shrink-0 z-10 border-2 transition-all ${
                    isCurrent
                      ? "bg-[#D94F27] border-[#3C1A11] text-[#FFE2C7] scale-110 shadow-md ring-4 ring-[#D94F27]/20"
                      : isCompleted
                      ? "bg-[#3C1A11] border-[#3C1A11] text-[#BDF119]"
                      : "bg-[#FFF8F0] border-[#3C1A11]/30 text-[#3C1A11]/40"
                  }`}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>

                <div className="pt-1 flex-1">
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-anton text-sm uppercase tracking-wide ${
                        isCurrent
                          ? "text-[#D94F27]"
                          : isCompleted
                          ? "text-[#3C1A11]"
                          : "text-[#3C1A11]/40"
                      }`}
                    >
                      {step}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#D94F27] text-white px-2 py-0.5 rounded-full">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 bg-[#3C1A11] text-[#FFE2C7] font-black uppercase text-xs tracking-wider rounded-xl hover:bg-[#D94F27] transition-all cursor-pointer shadow-md mt-2"
        >
          CLOSE TRACKER
        </button>
      </div>
    </div>
  );
};