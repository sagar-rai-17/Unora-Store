import React, { useState } from "react";
import type { Product } from "./Catalog";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

export interface UnoraStudioProps {
  isOpen: boolean;
  onClose: () => void;
  baseProduct: Product | null;
  onAddToBag: (item: {
    name: string;
    basePrice: number;
    customFee: number;
    customText: string;
    size: string;
    quantity: number;
  }) => void;
}

export const UnoraStudio: React.FC<UnoraStudioProps> = ({
  isOpen,
  onClose,
  baseProduct,
  onAddToBag,
}) => {

  const [text, setText] = useState("");
  const [size, setSize] = useState("L");
  const [qty, setQty] = useState(1);
  useBodyScrollLock(isOpen);
  if (!isOpen || !baseProduct) return null;

  const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const customFee = 299;

  const handleAdd = () => {
    const cleanText = text.trim();
    onAddToBag({
      name: cleanText ? `${baseProduct.name} (Custom: ${cleanText})` : baseProduct.name,
      basePrice: baseProduct.price,
      customFee: cleanText ? customFee : 0,
      customText: cleanText,
      size,
      quantity: qty,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#FFF8F0] overflow-y-auto text-[#3C1A11]">
      <div className="sticky top-0 z-20 bg-[#FFF8F0] border-b-2 border-[#3C1A11] px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl border-2 border-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#FFE2C7] transition-all cursor-pointer font-black text-xs uppercase"
        >
          ✕ Close
        </button>
        <span className="font-anton text-2xl uppercase">UNORA CUSTOM LAB</span>
        <div className="w-10" />
      </div>

      <div className="mx-auto max-w-4xl p-6 md:p-10 space-y-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D94F27]">CUSTOMIZE BASE PIECE</span>
          <h2 className="font-anton text-3xl md:text-4xl uppercase tracking-tight text-[#3C1A11] mt-1">{baseProduct.name}</h2>
          <p className="text-xs font-semibold text-[#3C1A11]/70 mt-1">
            Enter the exact name, roll number, or department you want printed on this piece.
          </p>
        </div>

        <div className="bg-white border-2 border-[#3C1A11] rounded-3xl p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider">
              Text to Print (Max 15 Characters)
            </label>
            <input
              type="text"
              maxLength={15}
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              placeholder="LEAVE EMPTY IF NO CUSTOM PRINT DESIRED"
              className="w-full h-14 px-4 rounded-xl border-2 border-[#3C1A11] bg-[#FFF8F0] font-anton text-lg tracking-wider text-[#3C1A11] outline-none"
            />
            <span className="text-[10px] font-bold text-[#3C1A11]/50">{text.length}/15 characters</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider">Select Size</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSize(sz)}
                  className={`h-11 rounded-xl border-2 font-black text-xs uppercase cursor-pointer ${
                    size === sz ? "bg-[#3C1A11] text-[#BDF119]" : "bg-white text-[#3C1A11]"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-xs font-black uppercase tracking-wider">Quantity</label>
            <div className="flex items-center h-10 border-2 border-[#3C1A11] rounded-xl bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 text-sm font-black hover:bg-[#3C1A11]/10 cursor-pointer"
              >
                −
              </button>
              <span className="px-4 text-xs font-black">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="px-3 text-sm font-black hover:bg-[#3C1A11]/10 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full h-14 bg-[#D94F27] hover:bg-[#F47E20] text-[#FFE2C7] font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
          >
            CONFIRM & ADD TO BAG
          </button>
        </div>
      </div>
    </div>
  );
};