import React from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

export interface CartItem {
  id: string | number;
  name: string;
  basePrice: number;
  customFee?: number;
  size: string;
  color?: string;
  style?: string;
  campus: string;
  image: string;
  quantity: number;
  customText?: string;
  studioDesign?: any;
}

export interface CouponOffer {
  code: string;
  title: string;
  subtitle: string;
  type: "percent" | "buy_x_get_1";
  discountPercent?: number;
  minAmount?: number;
  buyQty?: number;
  firstPurchaseOnly?: boolean;
  active?: boolean;
}

const DEFAULT_COUPONS: CouponOffer[] = [
  {
    code: "FIRST",
    title: "5% OFF",
    subtitle: "On your first purchase",
    type: "percent",
    discountPercent: 5,
    firstPurchaseOnly: true,
    active: true,
  },
  {
    code: "UNO10",
    title: "10% OFF",
    subtitle: "On shopping above ₹1,500",
    type: "percent",
    discountPercent: 10,
    minAmount: 1500,
    active: true,
  },
  {
    code: "UNO15",
    title: "15% OFF",
    subtitle: "On shopping above ₹2,000",
    type: "percent",
    discountPercent: 15,
    minAmount: 2000,
    active: true,
  },
  {
    code: "B4G1",
    title: "BUY 4 GET 1 FREE",
    subtitle: "Lowest priced item free",
    type: "buy_x_get_1",
    buyQty: 4,
    active: true,
  },
];

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  activeCoupon: string | null;
  appliedDiscount: number;
  isFirstPurchase?: boolean;
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
  isFirstPurchase = true,
  onApplyDiscount,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [couponInput, setCouponInput] = React.useState("");
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [systemCoupons, setSystemCoupons] = React.useState<CouponOffer[]>([]);

  const subtotal = items.reduce((acc, item) => {
    return acc + item.basePrice * item.quantity;
  }, 0);

  const totalCustomizationFee = items.reduce((acc, item) => {
    return acc + (item.customFee || 0) * item.quantity;
  }, 0);

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const cheapestUnitPrice =
    items.length > 0 ? Math.min(...items.map((item) => item.basePrice)) : 0;

  React.useEffect(() => {
    const unsubPromo = onSnapshot(doc(db, "settings", "promotions"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.coupons)) {
          const mapped: CouponOffer[] = data.coupons
            .filter((c: any) => c.active !== false)
            .map((c: any) => ({
              code: String(c.code).toUpperCase(),
              title:
                c.type === "buy_x_get_1"
                  ? `BUY ${c.buyQty || 4} GET 1 FREE`
                  : `${Number(c.discountPercent || 0)}% OFF`,
              subtitle:
                c.subtitle ||
                (c.type === "buy_x_get_1"
                  ? "Lowest priced item free"
                  : c.minAmount
                  ? `On shopping above ₹${Number(c.minAmount).toLocaleString("en-IN")}`
                  : "Applicable on garment subtotal"),
              type: c.type === "buy_x_get_1" ? "buy_x_get_1" : "percent",
              discountPercent: Number(c.discountPercent || 0),
              minAmount: c.minAmount ? Number(c.minAmount) : undefined,
              buyQty: c.buyQty ? Number(c.buyQty) : undefined,
              firstPurchaseOnly: c.firstPurchaseOnly === true,
              active: true,
            }));
          setSystemCoupons(mapped);
        } else {
          setSystemCoupons([]);
        }
      } else {
        setSystemCoupons([]);
      }
    });

    return () => unsubPromo();
  }, []);

  const allCoupons = React.useMemo(() => {
    const map = new Map<string, CouponOffer>();
    DEFAULT_COUPONS.forEach((c) => {
      if (c.active !== false) map.set(c.code, c);
    });
    systemCoupons.forEach((c) => {
      if (c.active !== false) map.set(c.code, c);
    });
    return Array.from(map.values());
  }, [systemCoupons]);

  const evaluateCoupon = React.useCallback(
    (offer: CouponOffer) => {
      if (offer.firstPurchaseOnly && !isFirstPurchase) {
        return {
          eligible: false,
          discount: 0,
          message: "Valid only on your first purchase.",
        };
      }

      if (offer.minAmount && subtotal < offer.minAmount) {
        const remaining = offer.minAmount - subtotal;
        return {
          eligible: false,
          discount: 0,
          message: `Shop for ₹${remaining.toLocaleString("en-IN")} more to avail this discount.`,
        };
      }

      if (offer.type === "buy_x_get_1") {
        const requiredQty = (offer.buyQty || 4) + 1;
        if (totalQuantity < requiredQty) {
          const needed = requiredQty - totalQuantity;
          return {
            eligible: false,
            discount: 0,
            message: `Add ${needed} more item${needed > 1 ? "s" : ""} to unlock Buy ${offer.buyQty || 4} Get 1 Free.`,
          };
        }
        return {
          eligible: true,
          discount: cheapestUnitPrice,
          message: "",
        };
      }

      const pct = offer.discountPercent || 0;
      return {
        eligible: true,
        discount: Math.round(subtotal * (pct / 100)),
        message: "",
      };
    },
    [subtotal, totalQuantity, cheapestUnitPrice, isFirstPurchase]
  );

  const matchedActiveCoupon = activeCoupon
    ? allCoupons.find((c) => c.code === activeCoupon) || null
    : null;

  React.useEffect(() => {
    if (items.length === 0) {
      if (appliedDiscount !== 0 || activeCoupon !== null) {
        onApplyDiscount(0, null);
      }
      return;
    }

    if (!activeCoupon) {
      if (appliedDiscount !== 0) {
        onApplyDiscount(0, null);
      }
      return;
    }

    if (!matchedActiveCoupon) {
      onApplyDiscount(0, null);
      return;
    }

    const result = evaluateCoupon(matchedActiveCoupon);
    if (!result.eligible) {
      onApplyDiscount(0, null);
      setCouponError(result.message);
    } else if (result.discount !== appliedDiscount) {
      onApplyDiscount(result.discount, matchedActiveCoupon.code);
    }
  }, [
    subtotal,
    totalQuantity,
    cheapestUnitPrice,
    activeCoupon,
    matchedActiveCoupon,
    items.length,
    appliedDiscount,
    evaluateCoupon,
    onApplyDiscount,
  ]);

  const finalTotal = Math.max(0, subtotal - appliedDiscount) + totalCustomizationFee;

  const tryApplyCode = (rawCode: string) => {
    const cleanCode = rawCode.trim().toUpperCase();
    const matched = allCoupons.find((c) => c.code === cleanCode);

    if (!matched) {
      setCouponError("Invalid or inactive discount code.");
      return;
    }

    const result = evaluateCoupon(matched);
    if (!result.eligible) {
      setCouponError(result.message);
      return;
    }

    onApplyDiscount(result.discount, matched.code);
    setCouponError(null);
    setCouponInput("");
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    tryApplyCode(couponInput);
  };

  const handleRemoveCoupon = () => {
    onApplyDiscount(0, null);
    setCouponError(null);
  };

  useBodyScrollLock(isOpen);
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
              {totalQuantity}
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
              <div className="space-y-1.5">
                <span className="block text-[10px] font-black uppercase tracking-widest text-[#3C1A11]/60">
                  Available Offers (1 Coupon Per Order)
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allCoupons.map((offer) => {
                    const status = evaluateCoupon(offer);
                    const isApplied = activeCoupon === offer.code;
                    return (
                      <button
                        key={offer.code}
                        type="button"
                        onClick={() => {
                          if (isApplied) {
                            handleRemoveCoupon();
                          } else {
                            tryApplyCode(offer.code);
                          }
                        }}
                        className={`shrink-0 w-44 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isApplied
                            ? "bg-[#3C1A11] border-[#3C1A11] text-[#BDF119]"
                            : status.eligible
                            ? "bg-white border-[#3C1A11]/40 hover:border-[#D94F27] text-[#3C1A11]"
                            : "bg-white/60 border-dashed border-[#3C1A11]/25 text-[#3C1A11]/70 hover:border-[#3C1A11]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] font-black uppercase tracking-wider">
                            {offer.code}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              isApplied
                                ? "bg-[#BDF119] text-[#3C1A11]"
                                : status.eligible
                                ? "bg-[#D94F27]/15 text-[#D94F27]"
                                : "bg-[#3C1A11]/10 text-[#3C1A11]/60"
                            }`}
                          >
                            {isApplied ? "APPLIED" : status.eligible ? "APPLY" : "LOCKED"}
                          </span>
                        </div>
                        <p className="text-[11px] font-black uppercase mt-1 leading-tight">
                          {offer.title}
                        </p>
                        <p
                          className={`text-[9px] font-semibold mt-0.5 leading-snug ${
                            isApplied ? "text-[#FFE2C7]/85" : "text-[#3C1A11]/65"
                          }`}
                        >
                          {offer.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeCoupon ? (
                <div className="flex items-center justify-between bg-[#3C1A11]/5 border border-[#3C1A11]/20 px-3 py-1.5 rounded-lg">
                  <span className="text-[10px] font-black text-[#D94F27] uppercase tracking-wider">
                    COUPON: {activeCoupon} ({matchedActiveCoupon?.title || "APPLIED"})
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
                    placeholder="Apply Coupon"
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
              <span>Items Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}.00</span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-[#D94F27] font-bold">
                <span>Discount Applied (-)</span>
                <span>-₹{appliedDiscount.toLocaleString("en-IN")}.00</span>
              </div>
            )}

            <div className="flex justify-between text-base font-anton text-[#3C1A11] pt-2 border-t border-[#3C1A11]/15">
              <span>SUBTOTAL (BAG)</span>
              <span className="text-[#D94F27]">₹{finalTotal.toLocaleString("en-IN")}.00</span>
            </div>
            <p className="text-[10px] text-[#3C1A11]/50 font-bold tracking-wide">
              Final total including delivery & applicable charges will be calculated at checkout
            </p>
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