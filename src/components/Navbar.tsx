import React, { useState, useRef, useEffect } from "react";

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userInitials: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectNavCategory?: (category: "men" | "women" | "new-drops" | "about-us") => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
  onOpenWishlist: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  isLoggedIn,
  isAdmin,
  userInitials,
  searchQuery,
  onSearchChange,
  onSelectNavCategory,
  onOpenAuth,
  onOpenCart,
  onOpenAccount,
  onOpenAdmin,
  onOpenWishlist,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const NAV_ITEMS: Array<{ label: string; action: "men" | "women" | "new-drops" | "about-us" }> = [
    { label: "Men", action: "men" },
    { label: "Women", action: "women" },
    { label: "New Drops", action: "new-drops" },
    { label: "About Us", action: "about-us" },
  ];

  const handleCategoryClick = (action: "men" | "women" | "new-drops" | "about-us") => {
    if (onSelectNavCategory) {
      onSelectNavCategory(action);
    }
    setMobileOpen(false);

    if (action === "about-us") {
      const footerEl = document.querySelector("footer");
      if (footerEl) {
        footerEl.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    const shopSection = document.getElementById("shop");
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: "smooth" });
    }
  };

const TRENDING_CATEGORIES = [
  { rank: "01", title: "IIT Bombay Mood Indigo Oversized Hoodies", tag: "FEST EDIT" },
  { rank: "02", title: "Inter-IIT Department Heavyweight Tees", tag: "CAMPUS CORE" },
  { rank: "03", title: "Roorkee Thomso Winter Utility Jackets", tag: "WINTER DROP" },
];


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTrending = (title: string) => {
    onSearchChange(title);
    setSearchFocused(false);
    setMobileOpen(false);
    const shopSection = document.getElementById("shop");
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#3C1A11]/10 bg-[#FFE2C7]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 text-[#3C1A11] hover:text-[#D94F27] lg:hidden cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img
              src="/assets/unorawordmark.jpg"
              alt="Unora"
              className="h-7 sm:h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </a>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleCategoryClick(item.action)}
              className="text-sm font-bold tracking-wide text-[#3C1A11] transition-colors duration-200 hover:text-[#D94F27] cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <div ref={searchContainerRef} className="relative hidden md:block">
            <div
              className={`flex items-center h-10 rounded-xl border bg-[#3C1A11]/5 px-3.5 transition-all duration-300 ease-out ${
                searchFocused
                  ? "w-[360px] scale-[1.03] border-[#2952CC] bg-white shadow-xl ring-2 ring-[#2952CC]/15"
                  : "w-[240px] scale-100 border-[#3C1A11]/20 hover:border-[#3C1A11]/40"
              }`}
            >
              <svg
                width="16"
                height="16"
                className={`shrink-0 transition-colors ${searchFocused ? "text-[#2952CC]" : "text-[#3C1A11]/50"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchFocused(false);
                    const shopSection = document.getElementById("shop");
                    if (shopSection) {
                      shopSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search campus gear..."
                className="w-full bg-transparent pl-2.5 pr-2 text-xs font-bold text-[#3C1A11] placeholder-[#3C1A11]/50 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="text-[10px] font-bold text-[#3C1A11]/40 hover:text-[#3C1A11] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {searchFocused && (
              <div className="absolute left-0 top-[calc(100%+8px)] w-[360px] rounded-2xl border-2 border-[#3C1A11] bg-[#FFF8F0] p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#3C1A11]/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D94F27]">
                    TRENDING NOW
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#3C1A11]/50">
                    Top Campus Picks
                  </span>
                </div>
                <div className="space-y-1.5">
                  {TRENDING_CATEGORIES.map((item) => (
                    <button
                      key={item.rank}
                      type="button"
                      onClick={() => handleSelectTrending(item.title)}
                      className="w-full text-left p-2 rounded-xl hover:bg-[#3C1A11]/5 flex items-center justify-between transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="font-anton text-xs text-[#3C1A11]/40 group-hover:text-[#D94F27]">
                          {item.rank}
                        </span>
                        <span className="text-xs font-bold text-[#3C1A11] truncate group-hover:text-[#D94F27]">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#3C1A11]/10 text-[#3C1A11]/70 shrink-0">
                        {item.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              className="relative p-2 text-[#3C1A11] hover:text-[#D94F27] cursor-pointer"
              aria-label="Wishlist"
              onClick={onOpenWishlist}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3C1A11] px-1 text-[9px] font-black text-[#BDF119]">
                  {wishlistCount}
                </span>
              )}
            </button>

            {isLoggedIn && isAdmin && (
              <button
                type="button"
                className="cursor-pointer p-1.5 rounded-lg border border-[#3C1A11] bg-[#3C1A11] hover:bg-[#D94F27] transition-all shrink-0"
                title="Admin Portal"
                aria-label="Admin Portal"
                onClick={onOpenAdmin}
              >
                <span className="font-anton text-[10px] text-[#BDF119] px-1 py-0.5 tracking-wider">
                  Admin
                </span>
              </button>
            )}

            <button
              type="button"
              className="p-2 text-[#3C1A11] hover:text-[#D94F27] cursor-pointer"
              aria-label="Account"
              onClick={isLoggedIn ? onOpenAccount : onOpenAuth}
            >
              {isLoggedIn ? (
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#3C1A11] text-[#BDF119] font-black text-[11px] sm:text-xs flex items-center justify-center border border-[#3C1A11]">
                  {userInitials}
                </span>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="relative p-2 text-[#3C1A11] hover:text-[#D94F27] cursor-pointer"
              aria-label={`Cart with ${cartCount} items`}
              onClick={onOpenCart}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z M3 6h18 M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D94F27] px-1 text-[9px] font-black text-[#FFE2C7]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#3C1A11]/10 bg-[#FFE2C7] px-5 py-5 shadow-2xl lg:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="mb-4">
            <div className="flex h-11 items-center rounded-xl border border-[#3C1A11]/30 bg-white px-3.5 shadow-xs">
              <svg
                width="16"
                height="16"
                className="shrink-0 text-[#3C1A11]/50 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setMobileOpen(false);
                    const shopSection = document.getElementById("shop");
                    if (shopSection) {
                      shopSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                placeholder="Search campus gear..."
                className="w-full bg-transparent text-xs font-bold text-[#3C1A11] placeholder-[#3C1A11]/50 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="text-xs font-bold text-[#3C1A11]/40"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <nav className="flex flex-col space-y-3 pb-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleCategoryClick(item.action)}
                className="text-left text-sm font-black uppercase tracking-wider text-[#3C1A11] hover:text-[#D94F27] cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};