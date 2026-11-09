import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import emailjs from "@emailjs/browser";

import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Catalog, type Product } from "./components/Catalog";
import { UnoraStudio } from "./components/UnoraStudio";
import { Reels } from "./components/Reels";
import { SocialProof } from "./components/SocialProof";
import { Footer } from "./components/Footer";
import { Preloader } from "./components/Preloader";
import { CartSidebar, type CartItem } from "./components/CartSidebar";
import { Checkout } from "./components/Checkout";
import { OrderSuccess } from "./components/OrderSuccess";
import { AuthModal } from "./components/AuthModal";
import { AccountPage, type OrderRecord } from "./components/AccountPage";
import { AdminPortal } from "./components/adminportal";
import { TrackingModal } from "./components/TrackingModal";
import { WishlistDrawer } from "./components/WishlistDrawer";
import { products } from "./components/Catalog";
import { checkIsAdmin } from "./utils/adminCheck";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { StaticInfoModal, type StaticInfoType } from "./components/StaticInfoModal";
import { AboutUsModal } from "./components/AboutUsModal";
import { FeedbackModal } from "./components/FeedbackModal";

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("unora_cart")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [authResolved, setAuthResolved] = useState<boolean>(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [studioProduct, setStudioProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "men" | "women">("all");
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [staticInfoType, setStaticInfoType] = useState<StaticInfoType | null>(null);

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, "inventory"), (snap) => {
      const liveProducts = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Product[];

      if (liveProducts.length > 0) {
        setInventoryProducts(liveProducts);
      }

      const livePriceMap: Record<string, number> = {};
      liveProducts.forEach((p) => {
        livePriceMap[p.name] = p.price;
      });

      setCartItems((prevItems) =>
        prevItems.map((item) => {
          if (livePriceMap[item.name] && livePriceMap[item.name] !== item.basePrice) {
            return { ...item, basePrice: livePriceMap[item.name] };
          }
          return item;
        })
      );
    });

    return () => unsubInv();
  }, []);

  useEffect(() => {
    localStorage.setItem("unora_cart", JSON.stringify(cartItems));
    if (auth.currentUser) {
      setDoc(
        doc(db, "users", auth.currentUser.uid),
        { cart: cartItems },
        { merge: true }
      ).catch((err) => console.error(err));
    }
  }, [cartItems]);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false)
  const [orderDetails, setOrderDetails] = useState({ id: "", hostel: "", campus: "" })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("Added to your bag")
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email || "");

        try {
          const adminStatus = await checkIsAdmin(user.uid);
          setIsAdmin(adminStatus);

          const userDoc = await getDoc(doc(db, "users", user.uid));
          let finalName = "";

          if (userDoc.exists()) {
            const data = userDoc.data();
            finalName = ((data.firstName || "") + " " + (data.lastName || "")).trim();
            
            if (Array.isArray(data.cart)) {
              setCartItems(data.cart);
            }
          }
          
          if (!finalName) {
            finalName = user.displayName || (user.email ? user.email.split("@")[0] : "") || "Campus Member";
          }

          setUserName(finalName);
          setUserInitials(computeInitials(finalName));
        } catch (err) {
          console.error("Auth sync error:", err);
        }

        const wishlistQuery = collection(db, "users", user.uid, "wishlist");
        const unsubscribeWishlist = onSnapshot(wishlistQuery, (snap) => setWishlistItems(snap.docs.map(d => d.id)));

        const ordersQuery = query(collection(db, "orders"), where("userId", "==", user.uid));
        unsubscribeOrders = onSnapshot(ordersQuery, (snap) => {
          setOrders(snap.docs.map(d => ({ 
            id: d.data().orderId || d.id,
            date: d.data().createdAt?.toDate?.().toLocaleDateString("en-IN") || "Recent",
            hostelName: d.data().hostelName || "Hostel",
            campusName: d.data().campus || "IIT",
            total: Number(d.data().grandTotal || 0),
            itemsCount: d.data().items?.reduce((a: number, i: any) => a + (i.quantity || 1), 0) || 0,
            status: d.data().status || "Received"
          })));
        });
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserEmail("");
        setUserInitials("");
        setIsAdmin(false);
        setOrders([]);
        setWishlistItems([]);
        if (unsubscribeOrders) unsubscribeOrders();
      }
      setAuthResolved(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  const handleToggleWishlist = async (productId: string) => {
    if (!isLoggedIn || !auth.currentUser) {
      setToastMessage("Please Sign In to start your campus collection.");
      setToast(true);
      setIsAuthOpen(true);
      window.setTimeout(() => setToast(false), 3000);
      return;
    }
    const isCurrentlyWishlisted = wishlistItems.includes(productId);
    const wishDocRef = doc(db, "users", auth.currentUser.uid, "wishlist", productId);

    try {
      if (isCurrentlyWishlisted) {
        await deleteDoc(wishDocRef);
        setToastMessage("Removed from Wishlist");
      } else {
        await setDoc(wishDocRef, { id: productId, addedAt: new Date().toISOString() });
        setToastMessage("Added to Wishlist");
      }
      setToast(true);
      window.setTimeout(() => setToast(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const [appliedDiscount, setAppliedDiscount] = useState(0)
   const [activeCoupon, setActiveCoupon] = useState<string | null>(null)
   const handleApplyDiscount = (amount: number, code: string | null) => {
    setAppliedDiscount(amount)
    setActiveCoupon(code)
  }
  const handleAddCatalogProduct = (product: Product, size: string = "L") => {
    if (!isLoggedIn || !auth.currentUser) {
      setToastMessage("Please Sign In to start your campus collection.");
      setToast(true);
      setIsAuthOpen(true);
      window.setTimeout(() => setToast(false), 3000);
      return;
    }

    const liveProduct = inventoryProducts.find((p) => p.id === product.id) || product;
    if (liveProduct.inStock === false) {
      setToastMessage("This item is currently out of stock.");
      setToast(true);
      window.setTimeout(() => setToast(false), 2500);
      return;
    }

    const existingIndex = cartItems.findIndex(
      (item) => item.id.toString().includes(product.id) && item.size === size
    );

    if (existingIndex > -1) {
      setCartItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${size}-${Date.now()}`,
        name: product.name,
        basePrice: product.price,
        size: size,
        campus: product.campus,
        image: product.image,
        quantity: 1,
      };
      setCartItems((prev) => [...prev, newItem]);
    }
    setToastMessage(`Added ${product.name} (${size}) to Bag`);
    setToast(true);
    window.setTimeout(() => setToast(false), 2200);
  };

  const handleAddStudioProduct = (customItem: {
    name: string;
    basePrice: number;
    customFee: number;
    customText: string;
    size: string;
    image?: string;
    campus?: string;
    color?: string;
    style?: string;
    quantity: number;
  }) => {
    if (!isLoggedIn || !auth.currentUser) {
      setToastMessage("Please Sign In to start your campus collection.");
      setToast(true);
      setIsAuthOpen(true);
      window.setTimeout(() => setToast(false), 3000);
      return;
    }

    if (studioProduct) {
      const liveProduct = inventoryProducts.find((p) => p.id === studioProduct.id) || studioProduct;
      if (liveProduct.inStock === false) {
        setToastMessage("The base garment is currently out of stock.");
        setToast(true);
        window.setTimeout(() => setToast(false), 2500);
        return;
      }
    }

    const newItem: CartItem = {
      id: `studio-${Date.now()}`,
      name: customItem.name,
      basePrice: customItem.basePrice,
      customFee: customItem.customFee,
      customText: customItem.customText,
      size: customItem.size,
      color: customItem.color,
      style: customItem.style,
      campus: customItem.campus || "CAMPUS SPECIAL",
      image: customItem.image || "/assets/unora.jpg",
      quantity: customItem.quantity,
    };
    setCartItems((prev) => [...prev, newItem]);
    setToastMessage(`Added ${customItem.name} to Bag`);
    setToast(true);
    window.setTimeout(() => setToast(false), 2200);
  };

  const handleUpdateQuantity = (id: string | number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta
            return nextQty > 0 ? { ...item, quantity: nextQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const handleRemoveItem = (id: string | number) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => item.id !== id)
      if (next.length === 0) {
        setAppliedDiscount(0)
        setActiveCoupon(null)
      }
      return next
    })
  }

  const computeInitials = (name: string) => {
    if (!name) return "UN";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLoginSuccess = (name: string) => {
    setToastMessage(`Welcome back, ${name}!`);
    setToast(true);
    window.setTimeout(() => setToast(false), 3000);
  };

  const handleRegisterSuccess = (name: string) => {
    setToastMessage("Welcome to the Unora Community!");
    setToast(true);
    window.setTimeout(() => setToast(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setCartItems([]);
      localStorage.removeItem("unora_cart");
      setToastMessage("Logged out successfully.");
      setToast(true);
      window.setTimeout(() => setToast(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCartFromDetail = (product: Product, size: string, fit: string, customPrice: number) => {
    if (!isLoggedIn || !auth.currentUser) {
      setToastMessage("Please Sign In to start your campus collection.");
      setToast(true);
      setIsAuthOpen(true);
      window.setTimeout(() => setToast(false), 3000);
      return;
    }

    const liveProduct = inventoryProducts.find((p) => p.id === product.id) || product;
    if (liveProduct.inStock === false) {
      setToastMessage("This item is currently out of stock.");
      setToast(true);
      window.setTimeout(() => setToast(false), 2500);
      return;
    }

    const newItem: CartItem = {
      id: `${product.id}-${size}-${fit}-${Date.now()}`,
      name: `${product.name} (${fit})`,
      basePrice: customPrice,
      size,
      campus: product.campus,
      image: product.image,
      quantity: 1,
    };

    setCartItems((prev) => [...prev, newItem]);
    setSelectedDetailProduct(null);
    setToastMessage(`Added ${product.name} to Bag`);
    setToast(true);
    window.setTimeout(() => setToast(false), 2200);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePreloaderComplete = useCallback(() => {
    setLoading(false);
  }, []);
  return (
    <>
      {loading && <Preloader onComplete={handlePreloaderComplete} />}

      <div className={loading ? "hidden" : "block"}>
        <Navbar
          cartCount={totalCartCount}
          wishlistCount={wishlistItems.length}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          userInitials={userInitials}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectNavCategory={(cat) => {
            if (cat === "men") setSelectedCategory("men");
            else if (cat === "women") setSelectedCategory("women");
            else if (cat === "new-drops") setSelectedCategory("all");
            else if (cat === "about-us") setIsAboutOpen(true);
          }}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
        />
        <Hero />
        <Catalog
          products={inventoryProducts}
          onOpenDetail={(product) => setSelectedDetailProduct(product)}
          wishlistItems={wishlistItems}
          onToggleWishlist={handleToggleWishlist}
          searchQuery={searchQuery}
          onClearSearch={(term) => setSearchQuery(term || "")}
          selectedCategory={selectedCategory}
        />

        <ProductDetailPage
          product={selectedDetailProduct}
          isOpen={!!selectedDetailProduct}
          onClose={() => setSelectedDetailProduct(null)}
          onAddToCart={handleAddToCartFromDetail}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={selectedDetailProduct ? wishlistItems.includes(selectedDetailProduct.id) : false}
          onLaunchStudio={(prod) => {
            setSelectedDetailProduct(null);
            setStudioProduct(prod);
          }}
        />

        <UnoraStudio
          isOpen={!!studioProduct}
          onClose={() => setStudioProduct(null)}
          baseProduct={studioProduct}
          onAddToBag={(item) => {
            handleAddStudioProduct({
              name: item.name,
              basePrice: item.basePrice,
              customFee: item.customFee,
              customText: item.customText,
              size: item.size,
              quantity: item.quantity,
              image: studioProduct?.image || "/assets/unora.jpg",
              campus: studioProduct?.campus || "CAMPUS SPECIAL",
              color: "Default",
              style: "Custom",
            });
            setStudioProduct(null);
          }}
        />
        <Reels />
        <SocialProof />
        <Footer
          onOpenAccount={() => {
            if (!isLoggedIn) {
              setToastMessage("Please Sign In to access your account.");
              setToast(true);
              setIsAuthOpen(true);
              window.setTimeout(() => setToast(false), 3000);
              return;
            }
            setIsAccountOpen(true);
          }}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenStaticInfo={(type) => setStaticInfoType(type)}
          onTriggerToast={(msg) => {
            setToastMessage(msg);
            setToast(true);
            window.setTimeout(() => setToast(false), 3000);
          }}
        />

        <StaticInfoModal
          isOpen={!!staticInfoType}
          type={staticInfoType}
          onClose={() => setStaticInfoType(null)}
        />
        <AdminPortal
  isOpen={isAdminOpen}
  onClose={() => setIsAdminOpen(false)}
/>
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          activeCoupon={activeCoupon}
          appliedDiscount={appliedDiscount}
          onApplyDiscount={handleApplyDiscount}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={() => {
            if (!isLoggedIn) {
              setToastMessage("Please Sign In to start your campus collection.");
              setToast(true);
              setIsAuthOpen(true);
              window.setTimeout(() => setToast(false), 3000);
              return;
            }
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />
        <WishlistDrawer
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlistIds={wishlistItems}
          products={products}
          onMoveToBag={(product, size) => handleAddCatalogProduct(product, size)}
          onRemoveFromWishlist={(id) => handleToggleWishlist(id)}
        />
        <Checkout
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          appliedDiscount={appliedDiscount}
          onOrderSuccess={(orderId: string, hostel: string, campus: string) => {
            setCartItems([]);
            setAppliedDiscount(0);
            setActiveCoupon(null);
            setOrderDetails({ id: orderId, hostel: hostel || "Hostel", campus: campus || "IIT" });
            setIsCheckoutOpen(false);
            setIsOrderSuccessOpen(true);
          }}
        />
        <OrderSuccess
          isOpen={isOrderSuccessOpen}
          onClose={() => setIsOrderSuccessOpen(false)}
          orderId={orderDetails.id}
          hostelName={orderDetails.hostel}
          campusName={orderDetails.campus}
          onTrackOrder={(id) => {
            setIsOrderSuccessOpen(false);
            setTrackingOrderId(id);
          }}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
        />
        <AccountPage
          isOpen={isAccountOpen}
          onClose={() => setIsAccountOpen(false)}
          user={{
            name: userName || "Campus Student",
            initials: userInitials || "UN",
            email: userEmail || "student@iit.ac.in",
          }}
          orders={orders}
          onLogout={handleLogout}
          onTrackOrder={(id) => {
            setIsAccountOpen(false);
            setTrackingOrderId(id);
          }}
        />

        <TrackingModal
          isOpen={!!trackingOrderId}
          onClose={() => setTrackingOrderId(null)}
          orderId={trackingOrderId}
        />
        <AboutUsModal
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
          onOpenFeedback={() => {
            setIsAboutOpen(false);
            setIsFeedbackOpen(true);
          }}
        />

        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          defaultName={userName}
        />

        {toast && (
          <div className="toast">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        <button className="back-top" onClick={scrollToTop} aria-label="Back to top">
          ↑
        </button>
      </div>
    </>
  )
}