import React, { useState } from "react";
import { Icon } from "./Icons";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  badge: string;
  image: string;
  campus: string;
}

export const campuses = [
  "IIT BHU",
  "IIT Kharagpur",
  "IIT Roorkee",
  "IIT (ISM) Dhanbad",
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Guwahati",
  "IIT Hyderabad",
  "IIT Gandhinagar",
];

export const products: Product[] = [
  {
    id: "item-3",
    name: "Varsity Heavyweight Tee",
    price: 899,
    originalPrice: 1199,
    badge: "IIT BHU",
    image: "/assets/items/3.png",
    campus: "IIT BHU",
  },
  {
    id: "item-14",
    name: "Campus Core Oversized Tee",
    price: 949,
    originalPrice: 1299,
    badge: "IIT BHU",
    image: "/assets/items/14.png",
    campus: "IIT BHU",
  },
  {
    id: "item-5",
    name: "Department Classic Heavyweight Tee",
    price: 899,
    originalPrice: 1199,
    badge: "IIT KGP",
    image: "/assets/items/5.png",
    campus: "IIT Kharagpur",
  },
  {
    id: "item-15",
    name: "Spring Fest Relaxed Tee",
    price: 999,
    originalPrice: 1299,
    badge: "IIT KGP",
    image: "/assets/items/15.png",
    campus: "IIT Kharagpur",
  },
  {
    id: "item-9",
    name: "Thomso Arch Heavy Hoodie",
    price: 1599,
    originalPrice: 1999,
    badge: "IIT ROORKEE",
    image: "/assets/items/9.png",
    campus: "IIT Roorkee",
  },
  {
    id: "item-11",
    name: "Main Building Graphic Tee",
    price: 849,
    originalPrice: 1099,
    badge: "IIT ROORKEE",
    image: "/assets/items/11.png",
    campus: "IIT Roorkee",
  },
  {
    id: "item-8",
    name: "Miner League Zip Jacket",
    price: 1699,
    originalPrice: 2199,
    badge: "DHANBAD",
    image: "/assets/items/8.png",
    campus: "IIT (ISM) Dhanbad",
  },
  {
    id: "item-17",
    name: "Heritage Core Sweatshirt",
    price: 1399,
    originalPrice: 1799,
    badge: "DHANBAD",
    image: "/assets/items/17.png",
    campus: "IIT (ISM) Dhanbad",
  },
  {
    id: "item-1",
    name: "Against The Odds Tee",
    price: 899,
    originalPrice: 1199,
    badge: "IIT Guwahati",
    image: "/assets/items/1.png",
    campus: "IIT Guwahati",
  },
  {
    id: "item-2",
    name: "Alcheringa Relaxed Tee",
    price: 1299,
    originalPrice: 1699,
    badge: "IIT Guwahati",
    image: "/assets/items/2.png",
    campus: "IIT Guwahati",
  },
  {
    id: "item-4",
    name: "Insti Dept. Boxy Tee",
    price: 799,
    originalPrice: 999,
    badge: "BestSeller",
    image: "/assets/items/4.png",
    campus: "General",
  },
  {
    id: "item-6",
    name: "Campus Heavy Hood",
    price: 1499,
    originalPrice: 1899,
    badge: "IIT KGP",
    image: "/assets/items/6.png",
    campus: "IIT KGP",
  },
  {
    id: "item-7",
    name: "Alcheringa Relaxed Tee",
    price: 849,
    originalPrice: 1099,
    badge: "IIT GUWAHATI",
    image: "/assets/items/7.png",
    campus: "IIT Guwahati",
  },
  {
    id: "item-10",
    name: "Cyber Athletic Sweatshirt",
    price: 1299,
    originalPrice: 1699,
    badge: "HYDERABAD",
    image: "/assets/items/10.png",
    campus: "IIT Hyderabad",
  },
  {
    id: "item-12",
    name: "Against The Odds Tee",
    price: 799,
    originalPrice: 999,
    badge: "IIT Guwahati",
    image: "/assets/items/12.png",
    campus: "IIT Guwahati",
  },
  {
    id: "item-13",
    name: "All-Campus Signature Hoodie",
    price: 1499,
    originalPrice: 1899,
    badge: "GLOBAL DROP",
    image: "/assets/items/13.png",
    campus: "General",
  },
  {
    id: "item-16",
    name: "Hostel After-Hours Tee",
    price: 899,
    originalPrice: 1199,
    badge: "LIMITED",
    image: "/assets/items/16.png",
    campus: "General",
  },
];

export function ProductCard({
  product,
  add,
  isWishlisted,
  onToggleWishlist,
}: {
  product: Product;
  add: (product: Product, size: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}) {
  const SIZES = ["S", "M", "L", "XL"];
  const [imgSrc, setImgSrc] = useState(product.image);
  const [errorStep, setErrorStep] = useState(0);

  const handleImageError = () => {
    if (errorStep === 0) {
      setErrorStep(1);
      setImgSrc(product.image.replace("/items/", "/Items/"));
    } else if (errorStep === 1) {
      setErrorStep(2);
      const switchedExt = product.image.endsWith(".png")
        ? product.image.replace(".png", ".jpg")
        : product.image.replace(".jpg", ".png");
      setImgSrc(switchedExt);
    } else if (errorStep === 2) {
      setErrorStep(3);
      setImgSrc(
        product.image
          .replace("/items/", "/Items/")
          .replace(".png", ".jpg")
      );
    } else {
      setImgSrc("/assets/unora.jpg");
    }
  };

  return (
    <div className="product-card group">
      <div className="product-card__image relative overflow-hidden">
        <img
          src={imgSrc}
          alt={`${product.name} campaign`}
          onError={handleImageError}
        />
        <span className="badge">{product.badge}</span>
        <button
          className={`wish ${isWishlisted ? "wish--active" : ""}`}
          onClick={() => onToggleWishlist(product.id)}
          aria-label="Add to wishlist"
        >
          <Icon name="heart" size={16} />
        </button>

        <div className="quick-add flex flex-col items-center justify-center gap-1 px-2.5 py-2">
          <div className="flex gap-1.5 w-full justify-center">
            {SIZES.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => add(product, sz)}
                className="flex-1 py-1 text-xs font-black bg-[#FFF8F0] text-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#BDF119] rounded-md transition-colors cursor-pointer shadow-xs text-center"
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="product-card__info">
        <h3>{product.name}</h3>
        <p>
          <span>₹{product.price.toLocaleString("en-IN")}</span>
          <s>₹{product.originalPrice.toLocaleString("en-IN")}</s>
        </p>
      </div>
    </div>
  );
}

export interface CatalogProps {
  onAddToCart: (product: Product, size: string) => void;
  wishlistItems: string[];
  onToggleWishlist: (productId: string) => void;
  searchQuery?: string;
  onClearSearch?: (term?: string) => void;
}

export const Catalog: React.FC<CatalogProps> = ({
  onAddToCart,
  wishlistItems = [],
  onToggleWishlist,
  searchQuery = "",
  onClearSearch,
}) => {
  const [campus, setCampus] = useState("IIT BHU");
  const [filter, setFilter] = useState("All drops");
  const [sort, setSort] = useState("Trending");
  const [sortOpen, setSortOpen] = useState(false);

  const sortOptions = [
    "Trending",
    "New Arrivals",
    "Price: Low to High",
    "Price: High to Low",
  ];

  const cleanQuery = searchQuery.trim().toLowerCase();

  const displayProducts = [...products]
    .filter((p) => {
      if (cleanQuery) {
        const matchesName = p.name.toLowerCase().includes(cleanQuery);
        const matchesCampus = p.campus.toLowerCase().includes(cleanQuery);
        const matchesBadge = p.badge.toLowerCase().includes(cleanQuery);
        return matchesName || matchesCampus || matchesBadge;
      }

      if (filter === "T-shirts") return p.name.toLowerCase().includes("tee");
      if (filter === "Hoodies")
        return (
          p.name.toLowerCase().includes("hood") ||
          p.name.toLowerCase().includes("sweatshirt") ||
          p.name.toLowerCase().includes("jacket")
        );
      if (filter === "Under ₹999") return p.price <= 999;
      return true;
    })
    .sort((a, b) => {
      if (sort === "Price: Low to High") {
        return a.price - b.price;
      }
      if (sort === "Price: High to Low") {
        return b.price - a.price;
      }
      if (sort === "New Arrivals") {
        return b.id.localeCompare(a.id);
      }

      const aMatchesCampus = a.campus === campus ? 1 : 0;
      const bMatchesCampus = b.campus === campus ? 1 : 0;
      return bMatchesCampus - aMatchesCampus;
    });
  return (
    <section id="shop" className="section">
      <div className="section-heading">
        <div>
          <span className="eyebrow eyebrow--dark">CURATED FOR YOUR CAMPUS</span>
          <h2>TRENDING IN {campus.toUpperCase()}</h2>
        </div>
        <a href="#shop">View all drops</a>
      </div>

      <div className="campus-chips">
        {campuses.map((item) => (
          <button
            key={item}
            className={campus === item ? "active" : ""}
            onClick={() => setCampus(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="filter-row">
        {["All drops", "T-shirts", "Hoodies", "Under ₹999"].map((item) => (
          <button
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}

        <div className="sort-wrap">
          <button
            className="sort button border border-unora-brown/20"
            onClick={() => setSortOpen(!sortOpen)}
            aria-expanded={sortOpen}
          >
            {sort}
            <Icon name="chevron" size={14} />
          </button>

          {sortOpen && (
            <div className="sort-menu">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSort(option);
                    setSortOpen(false);
                  }}
                >
                  <span>{option}</span>
                  {option === sort && <Icon name="check" size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {displayProducts.length === 0 ? (
        <div className="my-12 rounded-3xl border-2 border-dashed border-[#3C1A11]/20 bg-[#FFF8F0] p-12 text-center text-[#3C1A11]">
          <span className="font-anton text-3xl uppercase tracking-wide">
            No Drops Found for "{searchQuery}"
          </span>
          <p className="mt-2 text-xs font-bold text-[#3C1A11]/60">
            We couldn't find items matching your search criteria.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onClearSearch && onClearSearch("IIT Delhi")}
              className="rounded-xl border border-[#3C1A11]/30 bg-white px-4 py-2 text-xs font-black uppercase text-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#BDF119] transition-all cursor-pointer"
            >
              Try searching 'IIT Delhi'
            </button>
            <button
              type="button"
              onClick={() => onClearSearch && onClearSearch("Oversized Hoodie")}
              className="rounded-xl border border-[#3C1A11]/30 bg-white px-4 py-2 text-xs font-black uppercase text-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#BDF119] transition-all cursor-pointer"
            >
              Try searching 'Oversized Hoodie'
            </button>
            <button
              type="button"
              onClick={() => onClearSearch && onClearSearch("")}
              className="rounded-xl bg-[#D94F27] px-4 py-2 text-xs font-black uppercase text-[#FFE2C7] hover:bg-[#F47E20] transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="product-grid">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              add={onAddToCart}
              isWishlisted={wishlistItems.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </section>
  );
};

