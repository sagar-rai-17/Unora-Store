import React from "react";
import type { Product } from "./Catalog";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: Product[];
  onMoveToBag: (product: Product, size: string) => void;
  onRemoveFromWishlist: (productId: string) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  products,
  onMoveToBag,
  onRemoveFromWishlist,
}) => {
  if (!isOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div
      className="fixed inset-0 z-[120] flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-full bg-[#FFF8F0] text-[#3C1A11] border-l-2 border-[#3C1A11] shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#3C1A11]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-anton text-2xl uppercase tracking-wide">
              CAMPUS WISHLIST
            </h2>
            <span className="text-xs font-black bg-[#D94F27] text-[#FFE2C7] px-2 py-0.5 rounded-full">
              {wishlistedProducts.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full border border-[#3C1A11]/20 hover:bg-[#3C1A11] hover:text-[#FFE2C7] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlistedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-[#3C1A11]/60">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              <p className="font-anton text-xl uppercase tracking-wider text-[#3C1A11]">Your Wishlist is Empty</p>
              <p className="text-xs font-semibold mt-1">Tap the heart on any campus piece to save it here.</p>
            </div>
          ) : (
            wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="p-3.5 bg-white border border-[#3C1A11]/15 rounded-xl shadow-xs flex gap-3.5 items-center"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-20 object-cover rounded-lg border border-[#3C1A11]/10 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="font-bold text-xs uppercase tracking-tight text-[#3C1A11] truncate">
                      {product.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => onRemoveFromWishlist(product.id)}
                      className="text-[#D94F27] hover:opacity-80 p-0.5 cursor-pointer"
                      aria-label="Remove"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  <span className="text-[9px] font-black uppercase tracking-wider bg-[#3C1A11]/5 px-1.5 py-0.5 rounded text-[#3C1A11]/80 inline-block mt-1">
                    {product.campus}
                  </span>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#3C1A11]/10">
                    <span className="font-anton text-sm text-[#3C1A11]">
                      ₹{product.price.toLocaleString("en-IN")}.00
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        onMoveToBag(product, "L");
                        onRemoveFromWishlist(product.id);
                      }}
                      className="px-3 py-1.5 bg-[#3C1A11] hover:bg-[#D94F27] text-[#BDF119] hover:text-[#FFE2C7] rounded-lg font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Move to Bag (L) →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 bg-[#FFF8F0] border-t border-[#3C1A11]/15">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 border-2 border-[#3C1A11] text-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#FFE2C7] font-black uppercase text-xs tracking-widest rounded-xl transition-all cursor-pointer"
          >
            CONTINUE BROWSING
          </button>
        </div>
      </div>
    </div>
  );
};