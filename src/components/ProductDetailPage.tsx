import React, { useState } from "react";
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

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

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
    useBodyScrollLock(isOpen);
  if (!isOpen || !product) return null;

  const images = [product.image, product.image, product.image, product.image];
  const unitPrice = selectedFit === "Oversized-fit" ? product.price + 20 : product.price;

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
              <div key={idx} className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#3C1A11] bg-white shadow-sm">
                <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
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
                <span className="text-sm font-bold text-[#3C1A11]/40 line-through">₹{product.originalPrice}</span>
              </div>
              <p className="text-[11px] font-semibold text-[#3C1A11]/60 mt-0.5">Price incl. of all taxes</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider">Select Fit</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFit("Regular-fit")}
                  className={`h-11 rounded-xl border-2 font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${
                    selectedFit === "Regular-fit"
                      ? "bg-[#3C1A11] border-[#3C1A11] text-[#FFE2C7]"
                      : "border-[#3C1A11]/30 hover:border-[#3C1A11] text-[#3C1A11]"
                  }`}
                >
                  Regular-fit (₹{product.price})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFit("Oversized-fit")}
                  className={`h-11 rounded-xl border-2 font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${
                    selectedFit === "Oversized-fit"
                      ? "bg-[#3C1A11] border-[#3C1A11] text-[#BDF119]"
                      : "border-[#3C1A11]/30 hover:border-[#3C1A11] text-[#3C1A11]"
                  }`}
                >
                  Oversized-fit (+₹20)
                </button>
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
              <div className="grid grid-cols-4 gap-2">
                {SIZES.map((sz) => (
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

            {/* <div className="border-2 border-dashed border-[#3C1A11] bg-[#FFF8F0] p-4 rounded-2xl flex items-center justify-between gap-4"> */}
              {/* <div>
                <span className="font-anton text-base uppercase text-[#3C1A11] block">Personalize This Garment</span>
                <span className="text-[11px] font-semibold text-[#3C1A11]/70 block mt-0.5">
                  Print your name & roll number onto this piece via Studio.
                </span>
              </div> */}
              {/* <button
                type="button"
                disabled={product.inStock === false}
                onClick={() => onLaunchStudio(product)}
                className="px-4 h-10 bg-[#3C1A11] hover:bg-[#2952CC] disabled:bg-[#3C1A11]/30 disabled:cursor-not-allowed text-[#BDF119] font-black uppercase text-[10px] tracking-wider rounded-xl transition-all shrink-0 cursor-pointer"
              >
                {product.inStock === false ? "UNAVAILABLE" : "OPEN STUDIO"}
              </button> */}
            {/* </div> */}

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
                    const shareUrl = window.location.href;
                    const text = `Check out ${product.name} on Unora: ${shareUrl}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
                  }}
                  aria-label="Share on WhatsApp"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#3C1A11]/20 bg-white hover:bg-[#3C1A11] hover:text-[#BDF119] transition-all cursor-pointer text-[#3C1A11]"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6-.1.49-.3 1.47-1.2 1.68-1.77.21-.57.21-1.06.15-1.16-.06-.11-.22-.17-.47-.3z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2200);
                  }}
                  aria-label="Share on Instagram"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#3C1A11]/20 bg-white hover:bg-[#3C1A11] hover:text-[#BDF119] transition-all cursor-pointer text-[#3C1A11]"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const text = `Check out ${product.name} on Unora`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, "_blank", "noopener,noreferrer");
                  }}
                  aria-label="Share on X"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#3C1A11]/20 bg-white hover:bg-[#3C1A11] hover:text-[#BDF119] transition-all cursor-pointer text-[#3C1A11]"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank", "noopener,noreferrer");
                  }}
                  aria-label="Share on Facebook"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#3C1A11]/20 bg-white hover:bg-[#3C1A11] hover:text-[#BDF119] transition-all cursor-pointer text-[#3C1A11]"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>

                {copiedLink && (
                  <span className="absolute -top-7 left-10 bg-[#3C1A11] text-[#BDF119] text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-md whitespace-nowrap animate-in fade-in">
                    Link Copied!
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
                  <p><strong>Material & Care:</strong> 100% Cotton, Heavyweight 240 GSM. Machine wash cold, dry flat in shade.</p>
                  <p><strong>Country of Origin:</strong> India</p>
                  <p><strong>Manufactured & Sold By:</strong> Unora India Private Limited, Student Apparel Division.</p>
                  <p><strong>Campus Node:</strong> Official Inter-IIT Dispatch Network.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSizeChart && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#FFF8F0] border-2 border-[#3C1A11] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#3C1A11]/20 pb-3">
              <h3 className="font-anton text-2xl uppercase">Campus Size Chart (Inches)</h3>
              <button type="button" onClick={() => setShowSizeChart(false)} className="font-black text-sm cursor-pointer">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bold">
                <thead>
                  <tr className="border-b border-[#3C1A11]/20">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest</th>
                    <th className="py-2">Length</th>
                    <th className="py-2">Sleeve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3C1A11]/10">
                  <tr><td className="py-2">XXS</td><td>34</td><td>25</td><td>7.5</td></tr>
                  <tr><td className="py-2">XS</td><td>36</td><td>26</td><td>8</td></tr>
                  <tr><td className="py-2">S</td><td>38</td><td>27</td><td>8.5</td></tr>
                  <tr><td className="py-2">M</td><td>40</td><td>28</td><td>9</td></tr>
                  <tr><td className="py-2">L</td><td>42</td><td>29</td><td>9.5</td></tr>
                  <tr><td className="py-2">XL</td><td>44</td><td>30</td><td>10</td></tr>
                  <tr><td className="py-2">XXL</td><td>46</td><td>31</td><td>10.5</td></tr>
                  <tr><td className="py-2">XXXL</td><td>48</td><td>32</td><td>11</td></tr>
                </tbody>
              </table>
            </div>
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
    </div>
  );
};