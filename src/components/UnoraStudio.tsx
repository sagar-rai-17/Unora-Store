import React, { useState, useRef } from "react";
import type { Product } from "./Catalog";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

export interface StudioDesign {
  studioImage: string;
  text: string;
  font: string;
  color: string;
  fontSize: number;
  x: number;
  y: number;
}

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
    studioDesign?: StudioDesign;
  }) => void;
}

const FONTS = [
  { label: "Street Bold", value: "'Anton', sans-serif" },
  { label: "Clean Sans", value: "sans-serif" },
  { label: "Tech Mono", value: "monospace" },
  { label: "Classic Serif", value: "Georgia, serif" },
];

const COLORS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Black", value: "#111111" },
  { label: "Neon Lime", value: "#BDF119" },
  { label: "Burnt Orange", value: "#D94F27" },
  { label: "Cream", value: "#FFE2C7" },
  { label: "Gold", value: "#FACC15" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export const UnoraStudio: React.FC<UnoraStudioProps> = ({
  isOpen,
  onClose,
  baseProduct,
  onAddToBag,
}) => {
  const [text, setText] = useState("");
  const [font, setFont] = useState(FONTS[0].value);
  const [color, setColor] = useState(COLORS[0].value);
  const [fontSize, setFontSize] = useState(22);
  const [posX, setPosX] = useState(72);
  const [posY, setPosY] = useState(45);
  const [size, setSize] = useState("L");
  const [qty, setQty] = useState(1);
  const [isSelected, setIsSelected] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    mode: "drag" | "resize" | null;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origSize: number;
  }>({
    mode: null,
    startX: 0,
    startY: 0,
    origX: 72,
    origY: 45,
    origSize: 22,
  });

  useBodyScrollLock(isOpen);

  if (!isOpen || !baseProduct) return null;

  const studioImg = baseProduct.studioImage || baseProduct.image;
  const customFee = 299;

  const handleBoxPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      mode: "drag",
      startX: e.clientX,
      startY: e.clientY,
      origX: posX,
      origY: posY,
      origSize: fontSize,
    };
  };

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      mode: "resize",
      startX: e.clientX,
      startY: e.clientY,
      origX: posX,
      origY: posY,
      origSize: fontSize,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = dragState.current;
    if (!state.mode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();

    if (state.mode === "drag") {
      const dxPercent = ((e.clientX - state.startX) / rect.width) * 100;
      const dyPercent = ((e.clientY - state.startY) / rect.height) * 100;
      setPosX(Math.min(95, Math.max(5, Math.round((state.origX + dxPercent) * 10) / 10)));
      setPosY(Math.min(95, Math.max(5, Math.round((state.origY + dyPercent) * 10) / 10)));
    } else if (state.mode === "resize") {
      const delta = (e.clientX - state.startX + (e.clientY - state.startY)) * 0.25;
      setFontSize(Math.min(48, Math.max(12, Math.round(state.origSize + delta))));
    }
  };

  const handlePointerUp = () => {
    dragState.current.mode = null;
  };

  const handleAdd = () => {
    const cleanText = text.trim();
    onAddToBag({
      name: cleanText ? `${baseProduct.name} (Custom: ${cleanText})` : baseProduct.name,
      basePrice: baseProduct.price,
      customFee: cleanText ? customFee : 0,
      customText: cleanText,
      size,
      quantity: qty,
      studioDesign: cleanText
        ? {
            studioImage: studioImg,
            text: cleanText,
            font,
            color,
            fontSize,
            x: posX,
            y: posY,
          }
        : undefined,
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

      <div className="mx-auto max-w-6xl p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-3">
          <div
            ref={canvasRef}
            onClick={() => setIsSelected(false)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full rounded-3xl overflow-hidden border-2 border-[#3C1A11] bg-white shadow-lg select-none"
          >
            <img
              src={studioImg}
              alt={`${baseProduct.name} Studio Preview`}
              draggable={false}
              className="w-full h-auto block pointer-events-none"
              onError={(e) => {
                e.currentTarget.src = "/assets/unora.jpg";
              }}
            />

            {text.trim() && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelected(true);
                }}
                onPointerDown={handleBoxPointerDown}
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`absolute touch-none cursor-grab active:cursor-grabbing px-2.5 py-1 rounded-lg transition-colors ${
                  isSelected
                    ? "border-2 border-[#BDF119] bg-black/20 shadow-lg"
                    : "border-2 border-transparent hover:border-white/40"
                }`}
              >
                <div
                  style={{
                    fontFamily: font,
                    color: color,
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.15,
                  }}
                  className="whitespace-pre-wrap text-center font-bold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)]"
                >
                  {text}
                </div>

                {isSelected && (
                  <div
                    onPointerDown={handleResizePointerDown}
                    title="Drag to resize"
                    className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-[#BDF119] border-2 border-[#3C1A11] cursor-nwse-resize flex items-center justify-center shadow"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3C1A11]" />
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-[11px] font-bold text-[#3C1A11]/60 text-center uppercase tracking-wider">
            Drag the text box anywhere on the front or back • Drag the bottom-right dot to resize
          </p>
        </div>

        <div className="lg:col-span-5 bg-white border-2 border-[#3C1A11] rounded-3xl p-6 space-y-5 h-fit">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D94F27]">
              CUSTOMIZE BASE PIECE (+₹{customFee})
            </span>
            <h2 className="font-anton text-3xl uppercase tracking-tight text-[#3C1A11] mt-0.5">
              {baseProduct.name}
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider">
              Text to Print (Max 25 Characters)
            </label>
            <textarea
              rows={2}
              maxLength={25}
              value={text}
              onChange={(e) => {
                setText(e.target.value.toUpperCase());
                setIsSelected(true);
              }}
              placeholder="E.G. SAGAR"
              className="w-full p-3 rounded-xl border-2 border-[#3C1A11] bg-[#FFF8F0] font-anton text-lg tracking-wider text-[#3C1A11] outline-none resize-none"
            />
            <span className="text-[10px] font-bold text-[#3C1A11]/50">{text.length}/25 characters</span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider">Font Style</label>
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setFont(f.value)}
                  style={{ fontFamily: f.value }}
                  className={`h-10 rounded-xl border-2 text-xs font-bold cursor-pointer transition-all ${
                    font === f.value
                      ? "bg-[#3C1A11] border-[#3C1A11] text-[#BDF119]"
                      : "border-[#3C1A11]/30 bg-white text-[#3C1A11]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider">Text Color</label>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  style={{ backgroundColor: c.value }}
                  className={`w-9 h-9 rounded-full border-2 cursor-pointer transition-transform ${
                    color === c.value ? "border-[#D94F27] scale-110 ring-2 ring-[#D94F27]/40" : "border-[#3C1A11]/40"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-[#FFF8F0] p-3.5 rounded-2xl border border-[#3C1A11]/20">
            <label className="block text-[10px] font-black uppercase mb-1">Text Size ({fontSize}px)</label>
            <input
              type="range"
              min={12}
              max={48}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-[#D94F27] cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider">Select Size</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSize(sz)}
                  className={`h-10 rounded-xl border-2 font-black text-xs uppercase cursor-pointer ${
                    size === sz ? "bg-[#3C1A11] border-[#3C1A11] text-[#BDF119]" : "border-[#3C1A11]/30 bg-white text-[#3C1A11]"
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