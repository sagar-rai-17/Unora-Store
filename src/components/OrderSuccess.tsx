import React from "react";

interface OrderSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  hostelName: string;
  campusName: string;
  onTrackOrder: (id: string) => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({
  isOpen,
  onClose,
  orderId,
  hostelName,
  campusName,
  onTrackOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 bg-[#FFF8F0] overflow-y-auto text-[#3C1A11] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-white border-2 border-[#3C1A11] rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative animate-fade-in">
        
        <div className="inline-flex items-center gap-2 bg-[#3C1A11] text-[#BDF119] px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          ORDER CONFIRMED
        </div>

        <h1 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-[#3C1A11] leading-none mb-2">
          ORDER PLACED FOR {hostelName || "HOSTEL"}
        </h1>

        <p className="text-xs sm:text-sm font-bold text-[#3C1A11]/70 max-w-md mx-auto mb-6">
          Your order has been successfully placed and will be delivered to {campusName}. 
        </p>

        <div className="bg-[#FFF8F0] border-2 border-[#3C1A11] rounded-2xl p-5 mb-6 text-left relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-[#3C1A11]/15 pb-3 mb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-[#D94F27]">REFERENCE CODE</span>
              <p className="font-anton text-2xl tracking-wider text-[#3C1A11]">{orderId}</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#BDF119] text-[#3C1A11] px-2.5 py-1 rounded-md border border-[#3C1A11]/20">
              Shopping Done!
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#3C1A11]/80">
            <div>
              <span className="text-[10px] uppercase text-[#3C1A11]/50 block">DESTINATION</span>
              <span>{hostelName} ({campusName})</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#3C1A11]/50 block">ESTIMATED Delivery Time</span>
              <span>24–48 Hours</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onTrackOrder(orderId)}
            className="flex-1 h-13 bg-[#3C1A11] hover:bg-[#D94F27] text-[#BDF119] hover:text-[#FFE2C7] font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            TRACK ORDER
          </button>

          <button
  type="button"
  onClick={onClose}
  className="flex-1 h-13 border-2 border-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#FFE2C7] text-[#3C1A11] font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z M3 6h18 M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
  CONTINUE SHOPPING
</button>
        </div>

      </div>
    </div>
  );
};