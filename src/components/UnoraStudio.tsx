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

const STUDIO_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif";

const COLORS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Black", value: "#111111" },
  { label: "Dark Brown", value: "#3C1A11" },
  { label: "Cream", value: "#FFE2C7" },
  { label: "Burnt Orange", value: "#D94F27" },
  { label: "Neon Lime", value: "#BDF119" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export const UnoraStudio: React.FC<UnoraStudioProps> = ({
  isOpen,
  onClose,
  baseProduct,
  onAddToBag,
}) => {
  const [text, setText] = useState("");
  const [color, setColor] = useState(COLORS[0].value);
  const [hexInput, setHexInput] = useState(COLORS[0].value);
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
  const customFee = 29;

  const handleSelectColor = (hex: string) => {
    const upper = hex.toUpperCase();
    setColor(upper);
    setHexInput(upper);
  };

  const handleHexChange = (val: string) => {
    const formatted = val.startsWith("#") ? val.toUpperCase() : `#${val.toUpperCase()}`;
    setHexInput(formatted);
    if (/^#([0-9A-F]{3}|[0-9A-F]{6})$/.test(formatted)) {
      setColor(formatted);
    }
  };

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
            font: STUDIO_FONT,
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
        <span className="font-anton text-2xl uppercase">UNORA STUDIO</span>
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
                    fontFamily: STUDIO_FONT,
                    fontWeight: 700,
                    color: color,
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.15,
                  }}
                  className="whitespace-pre-wrap text-center tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)]"
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
              CUSTOMIZE BASE PIECE
            </span>
            <h2 className="font-anton text-3xl uppercase tracking-tight text-[#3C1A11] mt-0.5">
              {baseProduct.name}
            </h2>
            <p className="text-xs font-bold text-[#D94F27] mt-1">
              Note: ₹{customFee} extra will be charged for custom text printing (Font: SF Pro Bold).
            </p>
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
              style={{ fontFamily: STUDIO_FONT, fontWeight: 700 }}
              className="w-full p-3 rounded-xl border-2 border-[#3C1A11] bg-[#FFF8F0] text-lg tracking-wider text-[#3C1A11] outline-none resize-none"
            />
            <span className="text-[10px] font-bold text-[#3C1A11]/50">{text.length}/25 characters</span>
          </div>

          <div className="space-y-2.5">
            <label className="block text-xs font-black uppercase tracking-wider">Text Color</label>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => handleSelectColor(c.value)}
                  title={`${c.label} (${c.value})`}
                  style={{ backgroundColor: c.value }}
                  className={`w-9 h-9 rounded-full border-2 cursor-pointer transition-transform ${
                    color.toUpperCase() === c.value.toUpperCase()
                      ? "border-[#D94F27] scale-110 ring-2 ring-[#D94F27]/40"
                      : "border-[#3C1A11]/40"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="color"
                value={color}
                onChange={(e) => handleSelectColor(e.target.value)}
                aria-label="Pick custom color"
                className="w-10 h-10 p-0.5 rounded-lg border-2 border-[#3C1A11] bg-white cursor-pointer shrink-0"
              />
              <input
                type="text"
                maxLength={7}
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1 h-10 px-3 rounded-xl border-2 border-[#3C1A11]/40 focus:border-[#3C1A11] bg-[#FFF8F0] text-xs font-mono font-bold uppercase text-[#3C1A11] outline-none"
              />
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