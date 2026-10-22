import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

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
    return [
      {
        id: "init-1",
        name: "Varsity '58 Heavyweight Tee",
        basePrice: 899,
        size: "L",
        campus: "IIT BOMBAY",
        image: "https://images.unsplash.com/photo-1577372570570-fe08f7adc27b?auto=format&fit=crop&w=700&q=85",
        quantity: 1,
      },
    ]
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

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, "inventory"), (snap) => {
      if (snap.empty) return;
      const livePriceMap: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.name && typeof data.price === "number") {
          livePriceMap[data.name] = data.price;
        }
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
        const email = user.email || "";
        setUserEmail(email);

        setIsAdmin(
          email.toLowerCase() === "admin@unoracloth.in" ||
          email.toLowerCase() === "admin@unora.in" ||
          email.toLowerCase().endsWith("@unora.in")
        );

        let resolvedName = user.displayName || "";

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const cloudCart = userDoc.data().cart;
            if (Array.isArray(cloudCart) && cloudCart.length > 0) {
              setCartItems((prevGuestCart) => {
                const merged = [...cloudCart];
                prevGuestCart.forEach((guestItem) => {
                  const exists = merged.some(
                    (c) => c.name === guestItem.name && c.size === guestItem.size
                  );
                  if (!exists) {
                    merged.push(guestItem);
                  }
                });
                return merged;
              });
            }
          }
        } catch (err) {
          console.error(err);
        }

        const finalName = resolvedName || email.split("@")[0] || "Campus Member";
        setUserName(finalName);
        setUserInitials(computeInitials(finalName));
        setAuthResolved(true);

        const wishlistQuery = collection(db, "users", user.uid, "wishlist");
        const unsubscribeWishlist = onSnapshot(wishlistQuery, (snapshot) => {
          const ids = snapshot.docs.map((docSnap) => docSnap.id);
          setWishlistItems(ids);
        });

        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid)
        );

        unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
          const liveOrders: OrderRecord[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            let dateText = "Recent";
            if (data.createdAt?.toDate) {
              dateText = data.createdAt.toDate().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
            }
            return {
              id: data.orderId || docSnap.id,
              date: dateText,
              hostelName: data.hostelName || "Hostel",
              campusName: data.campus || "IIT",
              total: Number(data.grandTotal || 0),
              itemsCount: Array.isArray(data.items)
                ? data.items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)
                : 0,
              status: data.status || "Received",
            };
          });
          setOrders(liveOrders);
        });
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserEmail("");
        setUserInitials("");
        setIsAdmin(false);
        setOrders([]);
        setWishlistItems([]);
        setAuthResolved(true);
        if (unsubscribeOrders) {
          unsubscribeOrders();
          unsubscribeOrders = null;
        }
      }
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
    if (!isLoggedIn) {
      setToastMessage("Please Sign In to start your campus collection.");
      setToast(true);
      setIsAuthOpen(true);
      window.setTimeout(() => setToast(false), 3000);
      return;
    }

    const existingIndex = cartItems.findIndex(
      (item) => item.name === product.name && item.size === size
    );

    if (existingIndex > -1) {
      setCartItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      const newItem: CartItem = {
        id: `cat-${product.id}-${Date.now()}`,
        name: product.name,
        basePrice: product.price,
        size: size,
        campus: product.campus,
        image: product.image,
        quantity: 1,
      }
      setCartItems((prev) => [...prev, newItem])
    }
    setToastMessage(`Added ${product.name} (${size}) to Bag`)
    setToast(true)
    window.setTimeout(() => setToast(false), 2200)
  }

  const handleAddStudioProduct = (customItem: {
    name: string;
    basePrice: number;
    customFee: number;
    customText: string;
    size: string;
    quantity: number;
  }) => {
    if (!isLoggedIn) {
      setToastMessage("Please Sign In to start your campus collection.");
      setToast(true);
      setIsAuthOpen(true);
      window.setTimeout(() => setToast(false), 3000);
      return;
    }

    const newItem: CartItem = {
      id: `studio-${Date.now()}`,
      name: customItem.name,
      basePrice: customItem.basePrice,
      customFee: customItem.customFee,
      customText: customItem.customText,
      size: customItem.size,
      campus: "STUDIO LAB",
      image: "https://images.unsplash.com/photo-1652873575482-f33a4d7c7423?auto=format&fit=crop&w=700&q=85",
      quantity: customItem.quantity,
    }
    setCartItems((prev) => [...prev, newItem])
    setToastMessage(`Added Custom Hoodie (${customItem.size}) with "${customItem.customText}" to Bag`)
    setToast(true)
    window.setTimeout(() => setToast(false), 2200)
  }

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
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

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
      setToastMessage("Logged out successfully.");
      setToast(true);
      window.setTimeout(() => setToast(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}

      <div className={loading ? "hidden" : "block"}>
        <Navbar
          cartCount={totalCartCount}
          wishlistCount={wishlistItems.length}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          userInitials={userInitials}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
        />
        <Hero />
        <Catalog
          onAddToCart={(product, size) => handleAddCatalogProduct(product, size)}
          wishlistItems={wishlistItems}
          onToggleWishlist={handleToggleWishlist}
          searchQuery={searchQuery}
          onClearSearch={(term) => setSearchQuery(term || "")}
        />
        <UnoraStudio
          onAddToBag={(itemName, qty, singlePrice, customText) =>
            handleAddStudioProduct({
              name: itemName,
              basePrice: 1499,
              customFee: 299,
              customText: customText,
              size: "L",
              quantity: qty,
            })
          }
        />
        <Reels />
        <SocialProof />
        <Footer />
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