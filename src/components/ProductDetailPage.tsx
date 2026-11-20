import React, { useState, useEffect } from "react";
import type { Product } from "./Catalog";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

interface ProductDetailPageProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, fit: string, customPrice: number) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  onLaunchStudio: (product: Product) => void;
}

const OVERSIZED_SIZES = ["S", "M", "L", "XL", "XXL"];
const REGULAR_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const OVERSIZED_CHART = [
  { size: "S", chest: "42", length: "27.5" },
  { size: "M", chest: "44", length: "28.5" },
  { size: "L", chest: "46", length: "29.5" },
  { size: "XL", chest: "48", length: "30" },
  { size: "XXL", chest: "50", length: "30.5" },
];

const REGULAR_CHART = [
  { size: "XS", chest: "36", length: "25" },
  { size: "S", chest: "38", length: "26" },
  { size: "M", chest: "40", length: "27" },
  { size: "L", chest: "42", length: "28" },
  { size: "XL", chest: "44", length: "29" },
  { size: "XXL", chest: "46", length: "30" },
  { size: "XXXL", chest: "48", length: "31" },
];

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onLaunchStudio,
}) => {
  const [selectedFit, setSelectedFit] = useState<"Regular-fit" | "Oversized-fit">("Oversized-fit");
  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeChart, setShowSizeChart] = useState<boolean>(false);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [sizeChartTab, setSizeChartTab] = useState<"size" | "fit">("size");

  useBodyScrollLock(isOpen);

  const fitType: "both" | "regular" | "oversized" =
    product?.fitType || (product?.hasOversized === false ? "regular" : "both");
  const hasRegular = fitType === "both" || fitType === "regular";
  const hasOversized = fitType === "both" || fitType === "oversized";

  useEffect(() => {
    if (isOpen && product) {
      const params = new URLSearchParams(window.location.search);
      const urlFit = params.get("fit");
      const urlSize = params.get("size");

      const currentFitType =
        product.fitType || (product.hasOversized === false ? "regular" : "both");
      const defaultFit = currentFitType === "regular" ? "Regular-fit" : "Oversized-fit";

      const validFit =
        (urlFit === "Regular-fit" && currentFitType !== "oversized") ||
        (urlFit === "Oversized-fit" && currentFitType !== "regular")
          ? urlFit
          : defaultFit;

      const baseFitSizes = validFit === "Oversized-fit" ? OVERSIZED_SIZES : REGULAR_SIZES;
  const validSizes =
    Array.isArray(product.availableSizes) && product.availableSizes.length > 0
      ? baseFitSizes.filter((sz) => product.availableSizes!.includes(sz))
      : baseFitSizes;
  const validSize =
    urlSize && validSizes.includes(urlSize)
      ? urlSize
      : validSizes.includes("L")
      ? "L"
      : validSizes[0] || "L";

      setSelectedFit(validFit);
      setSelectedSize(validSize);
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const fitSizes = selectedFit === "Oversized-fit" ? OVERSIZED_SIZES : REGULAR_SIZES;
  const availableSizes =
    Array.isArray(product.availableSizes) && product.availableSizes.length > 0
      ? fitSizes.filter((sz) => product.availableSizes!.includes(sz))
      : fitSizes;

  const handleFitChange = (fit: "Regular-fit" | "Oversized-fit") => {
    setSelectedFit(fit);
    if (fit === "Oversized-fit") {
      if (selectedSize === "XS") setSelectedSize("S");
      if (selectedSize === "XXXL") setSelectedSize("XXL");
    }
  };

  const fallbackPair = [product.image, product.image];
  const images =
    selectedFit === "Oversized-fit"
      ? product.imagesOversized && product.imagesOversized.length > 0
        ? product.imagesOversized
        : fallbackPair
      : product.imagesRegular && product.imagesRegular.length > 0
      ? product.imagesRegular
      : fallbackPair;
  const oversizedBump = fitType === "both" && selectedFit === "Oversized-fit" ? 50 : 0;
  const unitPrice = product.price + oversizedBump;
  const displayOriginalPrice = product.originalPrice + oversizedBump;
  return (
    <div className="fixed inset-0 z-[125] bg-[#FFF8F0] overflow-y-auto text-[#3C1A11]">
      <div className="sticky top-0 z-20 bg-[#FFF8F0]/95 backdrop-blur-md border-b-2 border-[#3C1A11] px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl border-2 border-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#FFE2C7] transition-all cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="font-anton text-2xl uppercase tracking-wider">{product.campus} EDITION</span>
        <div className="w-10" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxImg(img)}
                className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#3C1A11] bg-white shadow-sm cursor-zoom-in"
              >
                <img
                  src={img}
                  alt={`${product.name} ${selectedFit} view ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/unora.jpg";
                  }}
                />
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D94F27] bg-[#D94F27]/10 px-2 py-0.5 rounded">
                {product.badge}
              </span>
              <h1 className="font-anton text-3xl sm:text-4xl uppercase tracking-tight mt-2 text-[#3C1A11]">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="font-anton text-3xl text-[#3C1A11]">₹{unitPrice}</span>
                <span className="text-sm font-bold text-[#3C1A11]/40 line-through">₹{displayOriginalPrice}</span>
              </div>
              <p className="text-[11px] font-semibold text-[#3C1A11]/60 mt-0.5">Price incl. of all taxes</p>
            </div>

              <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider">Select Fit</label>
              <div className="grid grid-cols-2 gap-3">
                {hasRegular && (
                  <button
                    type="button"
                    onClick={() => handleFitChange("Regular-fit")}
                    className={`h-11 rounded-xl border-2 font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${
                      selectedFit === "Regular-fit"
                        ? "bg-[#3C1A11] border-[#3C1A11] text-[#FFE2C7]"
                        : "border-[#3C1A11]/30 hover:border-[#3C1A11] text-[#3C1A11]"
                    }`}
                  >
                    Regular-fit
                  </button>
                )}
                {hasOversized && (
                  <button
                    type="button"
                    onClick={() => handleFitChange("Oversized-fit")}
                    className={`h-11 rounded-xl border-2 font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${
                      selectedFit === "Oversized-fit"
                        ? "bg-[#3C1A11] border-[#3C1A11] text-[#BDF119]"
                        : "border-[#3C1A11]/30 hover:border-[#3C1A11] text-[#3C1A11]"
                    }`}
                  >
                    Oversized-fit
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider">Select Size</label>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  className="text-xs font-black uppercase text-[#2952CC] hover:underline cursor-pointer"
                >
                  SIZE CHART
                </button>
              </div>
              <div className={`grid ${availableSizes.length === 5 ? "grid-cols-5" : "grid-cols-4 sm:grid-cols-7"} gap-2`}>
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`h-11 rounded-xl border-2 font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${
                      selectedSize === sz
                        ? "bg-[#3C1A11] border-[#3C1A11] text-[#BDF119]"
                        : "border-[#3C1A11]/30 hover:border-[#3C1A11] bg-white text-[#3C1A11]"
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
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 text-sm font-black hover:bg-[#3C1A11]/10 cursor-pointer"
                >
                  −
                </button>
                <span className="px-4 text-xs font-black">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 text-sm font-black hover:bg-[#3C1A11]/10 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={product.inStock === false}
                onClick={() => onAddToCart(product, selectedSize, selectedFit, unitPrice)}
                className="flex-1 h-14 bg-[#D94F27] hover:bg-[#F47E20] disabled:bg-[#3C1A11]/30 disabled:cursor-not-allowed text-[#FFE2C7] font-black uppercase text-sm tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
              >
                {product.inStock === false ? "OUT OF STOCK" : "ADD TO CART"}
              </button>
              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className={`w-14 h-14 rounded-xl border-2 border-[#3C1A11] flex items-center justify-center transition-all cursor-pointer ${
                  isWishlisted ? "bg-[#3C1A11] text-[#BDF119]" : "bg-white hover:bg-[#3C1A11]/5 text-[#3C1A11]"
                }`}
                aria-label="Wishlist"
              >
                <svg width="22" height="22" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>

            <div className="border-2 border-dashed border-[#3C1A11] bg-[#FFF8F0] p-4 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="font-anton text-base uppercase text-[#3C1A11] block">Personalize This Garment</span>
                <span className="text-[11px] font-semibold text-[#3C1A11]/70 block mt-0.5">
                  Print your name & roll number onto this piece via Studio.
                </span>
              </div>
              <button
                type="button"
                onClick={() => onLaunchStudio(product)}
                className="px-4 h-10 bg-[#3C1A11] hover:bg-[#2952CC] text-[#BDF119] font-black uppercase text-[10px] tracking-wider rounded-xl transition-all shrink-0 cursor-pointer"
              >
                OPEN STUDIO
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-[11px] font-black uppercase text-[#3C1A11]/60">Share:</span>
              <div className="flex items-center gap-2 relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const shareUrl = `${window.location.origin}/?id=${product.id}&fit=${selectedFit}&size=${selectedSize}`;
                    const text = `Check out the ${product.name} (${selectedFit}, Size: ${selectedSize}) on Unora Clothin: ${shareUrl}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
                  }}
                  aria-label="Share on WhatsApp"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#3C1A11]/20 bg-white hover:bg-[#3C1A11] hover:text-[#BDF119] transition-all cursor-pointer text-[#3C1A11]"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6-.1.49-.3 1.47-1.2 1.68-1.77.21-.57.21-1.06.15-1.16-.06-.11-.22-.17-.47-.3z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const baseUrl = window.location.href.split("?")[0];
                    const shareUrl = `${baseUrl}?id=${product.id}&fit=${selectedFit}&size=${selectedSize}`;
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2200);
                  }}
                  aria-label="Share on Instagram"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#3C1A11]/20 bg-white hover:bg-[#3C1A11] hover:text-[#BDF119] transition-all cursor-pointer text-[#3C1A11]"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </button>

                {copiedLink && (
                  <span className="absolute -top-7 left-10 bg-[#3C1A11] text-[#BDF119] text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-md whitespace-nowrap animate-in fade-in">
                    Fit Link Copied!
                  </span>
                )}
              </div>
            </div>

            <div className="border-2 border-[#3C1A11] rounded-2xl bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full p-4 flex justify-between items-center font-anton text-sm uppercase tracking-wider cursor-pointer"
              >
                <span>Product Specifications & Origin</span>
                <span>{detailsOpen ? "−" : "+"}</span>
              </button>
              {detailsOpen && (
                <div className="p-4 pt-0 text-xs font-semibold space-y-2 border-t border-[#3C1A11]/10 text-[#3C1A11]/80">
                  <p>
                    <strong>Material & Care:</strong> 100% Cotton, Heavyweight 240 GSM. Machine wash cold, dry flat in shade.
                  </p>
                  <p>
                    <strong>Country of Origin:</strong> India
                  </p>
                  <p>
                    <strong>Manufactured & Sold By:</strong> Unora India Private Limited, Student Apparel Division.
                  </p>
                  <p>
                    <strong>Campus Node:</strong> Official Inter-IIT Dispatch Network.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSizeChart && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-[#FFF8F0] border-2 border-[#3C1A11] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-anton text-2xl sm:text-3xl uppercase tracking-wide">Size Chart</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#3C1A11]/60">
                  All Measurements in Inches (IN)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="font-black text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 border-b border-[#3C1A11]/20">
              <button
                type="button"
                onClick={() => setSizeChartTab("size")}
                className={`py-3 text-sm font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  sizeChartTab === "size"
                    ? "border-[#D94F27] text-[#3C1A11]"
                    : "border-transparent text-[#3C1A11]/50 hover:text-[#3C1A11]"
                }`}
              >
                Size Guide
              </button>
              <button
                type="button"
                onClick={() => setSizeChartTab("fit")}
                className={`py-3 text-sm font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  sizeChartTab === "fit"
                    ? "border-[#D94F27] text-[#3C1A11]"
                    : "border-transparent text-[#3C1A11]/50 hover:text-[#3C1A11]"
                }`}
              >
                Fit Guide
              </button>
            </div>

            {sizeChartTab === "size" ? (
              <div className={`grid grid-cols-1 ${hasRegular && hasOversized ? "md:grid-cols-2" : ""} gap-4`}>
                {hasOversized && (
                  <div className="border-2 border-[#3C1A11]/20 rounded-2xl bg-white overflow-hidden">
                    <div className="bg-[#3C1A11] text-[#BDF119] py-2.5 text-center font-anton text-base uppercase tracking-wider">
                      Oversized Fit
                    </div>
                    <table className="w-full text-center text-xs font-bold">
                      <thead>
                        <tr className="border-b border-[#3C1A11]/20 bg-[#FFF8F0]">
                          <th className="py-2.5">SIZE</th>
                          <th className="py-2.5">CHEST</th>
                          <th className="py-2.5">LENGTH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3C1A11]/10">
                        {OVERSIZED_CHART.map((row) => (
                          <tr key={row.size}>
                            <td className="py-2.5 font-black">{row.size}</td>
                            <td className="py-2.5">{row.chest}</td>
                            <td className="py-2.5">{row.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {hasRegular && (
                  <div className="border-2 border-[#3C1A11]/20 rounded-2xl bg-white overflow-hidden">
                    <div className="bg-[#3C1A11] text-[#FFE2C7] py-2.5 text-center font-anton text-base uppercase tracking-wider">
                      Regular Fit
                    </div>
                    <table className="w-full text-center text-xs font-bold">
                      <thead>
                        <tr className="border-b border-[#3C1A11]/20 bg-[#FFF8F0]">
                          <th className="py-2.5">SIZE</th>
                          <th className="py-2.5">CHEST</th>
                          <th className="py-2.5">LENGTH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3C1A11]/10">
                        {REGULAR_CHART.map((row) => (
                          <tr key={row.size}>
                            <td className="py-2.5 font-black">{row.size}</td>
                            <td className="py-2.5">{row.chest}</td>
                            <td className="py-2.5">{row.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-[#3C1A11]/20 rounded-2xl bg-white p-4 flex items-center justify-center">
  <img
    src="/assets/fit-guide.jpg"
    alt="Fit Guide"
    onClick={() => setLightboxImg("/assets/fit-guide.jpg")}
    className="w-full max-h-[420px] object-contain rounded-lg cursor-zoom-in"
  />
</div>
            )}

            <button
              type="button"
              onClick={() => setShowSizeChart(false)}
              className="w-full h-11 bg-[#3C1A11] text-[#FFE2C7] rounded-xl font-black text-xs uppercase cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {lightboxImg && (
        <div
          className="fixed inset-0 z-[180] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImg(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-[#FFF8F0] border-2 border-[#3C1A11] text-[#3C1A11] cursor-pointer"
            aria-label="Close image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <img
            src={lightboxImg}
            alt={product.name}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-default"
          />
        </div>
      )}
    </div>
  );
};