import React from "react";

export interface CartItem {
  id: string | number;
  name: string;
  basePrice: number;
  customFee?: number;
  size: string;
  campus: string;
  image: string;
  quantity: number;
  customText?: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  activeCoupon: string | null;
  appliedDiscount: number;
  onApplyDiscount: (amount: number, code: string | null) => void;
  onUpdateQuantity: (id: string | number, delta: number) => void;
  onRemoveItem: (id: string | number) => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  items,
  activeCoupon,
  appliedDiscount,
  onApplyDiscount,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [couponInput, setCouponInput] = React.useState("");
  const [couponError, setCouponError] = React.useState<string | null>(null);

  const deliveryFee = items.length > 0 ? 40 : 0;
  const subtotal = items.reduce((acc, item) => {
    return acc + (item.basePrice + (item.customFee || 0)) * item.quantity;
  }, 0);

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const cheapestUnitPrice = items.length > 0
    ? Math.min(...items.map((item) => item.basePrice + (item.customFee || 0)))
    : 0;

  const autoOfferDiscount = totalQuantity >= 5 ? cheapestUnitPrice : 0;

  const calculateDiscount = (code: string | null) => {
    let promo = 0;
    if (code === "UNORA20" || code === "CAMPUS20") {
      promo = Math.round((subtotal - autoOfferDiscount) * 0.2);
    }
    return autoOfferDiscount + promo;
  };

  React.useEffect(() => {
    if (items.length === 0) {
      if (appliedDiscount > 0) onApplyDiscount(0, null);
      return;
    }
    const updatedDiscount = calculateDiscount(activeCoupon);
    if (updatedDiscount !== appliedDiscount) {
      onApplyDiscount(updatedDiscount, activeCoupon);
    }
  }, [subtotal, totalQuantity, activeCoupon]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponInput.trim().toUpperCase();
    if (cleanCode === "UNORA20" || cleanCode === "CAMPUS20") {
      const discount = calculateDiscount(cleanCode);
      onApplyDiscount(discount, cleanCode);
      setCouponError(null);
      setCouponInput("");
    } else {
      setCouponError("Invalid code. Use UNORA20 or CAMPUS20.");
    }
  };

  const handleRemoveCoupon = () => {
    onApplyDiscount(autoOfferDiscount, null);
    setCouponError(null);
  };

  const finalTotal = Math.max(0, subtotal - appliedDiscount) + deliveryFee;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-full bg-[#FFF8F0] text-[#3C1A11] border-l-2 border-[#3C1A11] shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#3C1A11]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-anton text-2xl uppercase tracking-wide">
              YOUR BAG
            </h2>
            <span className="text-xs font-black bg-[#3C1A11] text-[#BDF119] px-2 py-0.5 rounded-full">
              {items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-30 p-1.5 rounded-full border border-[#3C1A11]/20 hover:bg-[#3C1A11] hover:text-[#FFE2C7] transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-[#3C1A11]/60">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z M3 6h18 M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="font-anton text-xl uppercase tracking-wider text-[#3C1A11]">Your bag is empty</p>
              <p className="text-xs font-semibold mt-1">Explore campus drops or customize in Unora Studio.</p>
            </div>
          ) : (
            items.map((item) => {
              const itemUnitTotal = item.basePrice + (item.customFee || 0);

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-white border border-[#3C1A11]/15 rounded-xl shadow-xs flex gap-3.5 items-start"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg border border-[#3C1A11]/10 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-bold text-xs uppercase tracking-tight text-[#3C1A11] truncate">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-[#D94F27] hover:opacity-80 p-0.5 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#3C1A11]/5 px-1.5 py-0.5 rounded text-[#3C1A11]/80">
                        {item.campus}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#3C1A11]/5 px-1.5 py-0.5 rounded text-[#3C1A11]/80">
                        Size: {item.size}
                      </span>
                    </div>

                    {item.customText && (
                      <div className="mt-1 text-[10px] font-bold text-[#D94F27] uppercase">
                        Print: "{item.customText}"
                      </div>
                    )}

                    <div className="mt-1 text-[10px] font-medium text-[#3C1A11]/70">
                      <span>₹{item.basePrice.toLocaleString("en-IN")}</span>
                      {item.customFee && (
                        <span className="text-[#D94F27] font-semibold ml-1">
                          + ₹{item.customFee} Studio Fee
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#3C1A11]/10">
                      <div className="flex items-center border border-[#3C1A11]/30 rounded-md bg-[#FFF8F0]">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-xs font-black text-[#3C1A11] hover:bg-[#3C1A11]/10 transition-colors cursor-pointer"
                        >
                          −
                        </button>
                        <span className="px-2 text-xs font-bold text-[#3C1A11]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-xs font-black text-[#3C1A11] hover:bg-[#3C1A11]/10 transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-anton text-sm text-[#3C1A11]">
                        ₹{(itemUnitTotal * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-5 bg-[#FFF8F0] border-t border-[#3C1A11]/15 space-y-3">
          {items.length > 0 && (
            <div className="space-y-2 pb-2 border-b border-[#3C1A11]/10">
              {totalQuantity >= 5 && (
                <div className="flex items-center justify-between bg-[#3C1A11] text-[#BDF119] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  <span>BUY 4 GET 1 FREE APPLIED</span>
                  <span>-₹{autoOfferDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}

              {activeCoupon ? (
                <div className="flex items-center justify-between bg-[#3C1A11]/5 border border-[#3C1A11]/20 px-3 py-1.5 rounded-lg">
                  <span className="text-[10px] font-black text-[#D94F27] uppercase tracking-wider">
                    COUPON: {activeCoupon} (20% OFF)
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[10px] font-bold text-[#D94F27] hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError(null);
                    }}
                    placeholder="Apply Coupon (e.g. UNORA20)"
                    className="flex-1 h-9 px-3 rounded-lg border border-[#3C1A11]/30 bg-transparent text-xs font-bold uppercase tracking-wider focus:border-[#2952CC] outline-none"
                  />
                  <button
                    type="submit"
                    className="h-9 px-4 bg-[#3C1A11] hover:bg-[#D94F27] text-[#FFE2C7] font-black text-[10px] uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                  >
                    APPLY
                  </button>
                </form>
              )}

              {couponError && (
                <span className="text-[10px] font-bold text-[#D94F27] block">
                  {couponError}
                </span>
              )}
            </div>
          )}

          <div className="space-y-1.5 text-xs font-semibold text-[#3C1A11]/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}.00</span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-[#D94F27] font-bold">
                <span>Discount Applied (-)</span>
                <span>-₹{appliedDiscount.toLocaleString("en-IN")}.00</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹{deliveryFee.toLocaleString("en-IN")}.00</span>
            </div>

            <div className="flex justify-between text-base font-anton text-[#3C1A11] pt-2 border-t border-[#3C1A11]/15">
              <span>TOTAL</span>
              <span className="text-[#D94F27]">₹{finalTotal.toLocaleString("en-IN")}.00</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full h-13 bg-[#D94F27] hover:bg-[#F47E20] disabled:bg-[#3C1A11]/20 text-[#FFE2C7] font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            PROCEED TO BUY
          </button>
        </div>

      </div>
    </div>
  );
};