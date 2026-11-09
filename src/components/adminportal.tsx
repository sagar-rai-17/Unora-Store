import React, { useState, useEffect, useMemo } from "react";
import { collection, doc, onSnapshot, updateDoc, query, orderBy, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { checkIsAdmin } from "../utils/adminCheck";
import { convertGoogleDriveUrl } from "../utils/driveImage";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

const CAMPUSES = [
  "ALL",
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "IIT Guwahati",
  "IIT BHU",
  "IIT Hyderabad",
  "IIT Gandhinagar",
  "IIT (ISM) Dhanbad",
];

const ORDER_STATUSES = [
  "Received",
  "In Transit",
  "Delivered",
] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  id?: string | number;
  name: string;
  size: string;
  quantity: number;
  basePrice?: number;
  customFee?: number;
  customText?: string;
}

export interface AdminOrder {
  id: string;
  docId: string;
  fullName: string;
  mobile: string;
  campus: string;
  hostelName: string;
  roomNumber: string;
  deliveryNote?: string;
  paymentMethod: "upi" | "cod";
  grandTotal: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt?: any;
}

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [promoCodeName, setPromoCodeName] = useState("UNORA20");
  const [isPromoActive, setIsPromoActive] = useState(true);
  const [promoSuccess, setPromoSuccess] = useState(false);

  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCampus, setNewProdCampus] = useState(CAMPUSES[1]);
  const [newProdCategory, setNewProdCategory] = useState<"men" | "women" | "unisex">("unisex");
  const [imgUrls, setImgUrls] = useState(["", "", "", ""]);
  const [mainImgIdx, setMainImgIdx] = useState(0);
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [buy4get1Enabled, setBuy4get1Enabled] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "reels">("orders");
  const [reelsList, setReelsList] = useState<any[]>([]);
  const [newReelUrl, setNewReelUrl] = useState("");
  const [newReelCaption, setNewReelCaption] = useState("");
  const [reelLoading, setReelLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const unsubReels = onSnapshot(collection(db, "reels"), (snap) => {
      setReelsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    if (!isOpen) return;
    const unsub = onSnapshot(doc(db, "settings", "offers"), (snap) => {
      if (snap.exists()) {
        setBuy4get1Enabled(snap.data().buy4get1Enabled === true);
      }
    });
    return () => {
      unsubReels();
      unsub();
    };
  }, [isOpen]);

  const handleSaveOffer = async (enabled: boolean) => {
    try {
      setBuy4get1Enabled(enabled);
      await setDoc(doc(db, "settings", "offers"), { buy4get1Enabled: enabled }, { merge: true });
      setOfferSuccess(true);
      setTimeout(() => setOfferSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;

    setCreateLoading(true);
    try {
      const convertedImgs = imgUrls.map(u => convertGoogleDriveUrl(u)).filter(Boolean);
      const mainImg = convertedImgs[mainImgIdx] || convertedImgs[0] || "/assets/unora.jpg";
      const finalImgs = [
        mainImg,
        ...convertedImgs.filter((_, idx) => idx !== mainImgIdx)
      ];
      while (finalImgs.length < 4) {
        finalImgs.push(mainImg);
      }

      const newId = `item-${Date.now().toString().slice(-4)}`;
      const priceNum = Number(newProdPrice);

      await setDoc(doc(db, "inventory", newId), {
        id: newId,
        name: newProdName.trim(),
        price: priceNum,
        originalPrice: priceNum + 300,
        badge: "New Arrival",
        campus: newProdCampus,
        category: newProdCategory,
        image: mainImg,
        images: finalImgs,
        inStock: true,
        createdAt: new Date().toISOString(),
      });

      setCreateSuccess(true);
      setNewProdName("");
      setNewProdPrice("");
      setImgUrls(["", "", "", ""]);
      setTimeout(() => setCreateSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const unsubPromo = onSnapshot(doc(db, "settings", "promotions"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPromoCodeName(data.code || "UNORA20");
        setIsPromoActive(data.active !== false);
      }
    });
    return () => unsubPromo();
  }, [isOpen]);

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "promotions"), {
        code: promoCodeName.trim().toUpperCase(),
        active: isPromoActive,
        discountPercent: 20,
      }, { merge: true });
      setPromoSuccess(true);
      setTimeout(() => setPromoSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedDatabase = async () => {
    const productsToSeed = [
      { id: "item-1", name: "Against The Odds Tee", price: 899, originalPrice: 1199, badge: "IIT Guwahati", image: "/assets/items/1.png", campus: "IIT Guwahati", category: "unisex", inStock: true },
      { id: "item-2", name: "Alcheringa Relaxed Tee", price: 1299, originalPrice: 1699, badge: "IIT Guwahati", image: "/assets/items/2.png", campus: "IIT Guwahati", category: "unisex", inStock: true },
      { id: "item-3", name: "Varsity Heavyweight Tee", price: 899, originalPrice: 1199, badge: "IIT BHU", image: "/assets/items/3.png", campus: "IIT BHU", category: "unisex", inStock: true },
      { id: "item-4", name: "Insti Dept. Boxy Tee", price: 799, originalPrice: 999, badge: "BestSeller", image: "/assets/items/4.png", campus: "General", category: "unisex", inStock: true },
      { id: "item-5", name: "Department Classic Heavyweight Tee", price: 899, originalPrice: 1199, badge: "IIT KGP", image: "/assets/items/5.png", campus: "IIT Kharagpur", category: "unisex", inStock: true },
      { id: "item-6", name: "Campus Heavy Hood", price: 1499, originalPrice: 1899, badge: "IIT KGP", image: "/assets/items/6.png", campus: "IIT Kharagpur", category: "unisex", inStock: true },
      { id: "item-7", name: "Alcheringa Relaxed Tee", price: 849, originalPrice: 1099, badge: "IIT GUWAHATI", image: "/assets/items/7.png", campus: "IIT Guwahati", category: "unisex", inStock: true },
      { id: "item-8", name: "Miner League Zip Jacket", price: 1699, originalPrice: 2199, badge: "DHANBAD", image: "/assets/items/8.png", campus: "IIT (ISM) Dhanbad", category: "unisex", inStock: true },
      { id: "item-9", name: "Thomso Arch Heavy Hoodie", price: 1599, originalPrice: 1999, badge: "IIT ROORKEE", image: "/assets/items/9.png", campus: "IIT Roorkee", category: "unisex", inStock: true },
      { id: "item-10", name: "Cyber Athletic Sweatshirt", price: 1299, originalPrice: 1699, badge: "HYDERABAD", image: "/assets/items/10.png", campus: "IIT Hyderabad", category: "unisex", inStock: true },
      { id: "item-11", name: "Main Building Graphic Tee", price: 849, originalPrice: 1099, badge: "IIT ROORKEE", image: "/assets/items/11.png", campus: "IIT Roorkee", category: "unisex", inStock: true },
      { id: "item-12", name: "Against The Odds Tee", price: 799, originalPrice: 999, badge: "IIT Guwahati", image: "/assets/items/12.png", campus: "IIT Guwahati", category: "unisex", inStock: true },
      { id: "item-13", name: "All-Campus Signature Hoodie", price: 1499, originalPrice: 1899, badge: "GLOBAL DROP", image: "/assets/items/13.png", campus: "General", category: "unisex", inStock: true },
      { id: "item-14", name: "Campus Core Oversized Tee", price: 949, originalPrice: 1299, badge: "IIT BHU", image: "/assets/items/14.png", campus: "IIT BHU", category: "unisex", inStock: true },
      { id: "item-15", name: "Spring Fest Relaxed Tee", price: 999, originalPrice: 1299, badge: "IIT KGP", image: "/assets/items/15.png", campus: "IIT Kharagpur", category: "unisex", inStock: true },
      { id: "item-16", name: "Hostel After-Hours Tee", price: 899, originalPrice: 1199, badge: "LIMITED", image: "/assets/items/16.png", campus: "General", category: "unisex", inStock: true },
      { id: "item-17", name: "Heritage Core Sweatshirt", price: 1399, originalPrice: 1799, badge: "DHANBAD", image: "/assets/items/17.png", campus: "IIT (ISM) Dhanbad", category: "unisex", inStock: true },
    ];

    try {
      setIsLoadingSeed(true);
      for (const product of productsToSeed) {
        await setDoc(doc(db, "inventory", product.id), product);
      }
      alert("Database Inventory Initialized.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSeed(false);
    }
  };

  const handleMigrateToUnisex = async () => {
    try {
      for (const item of inventory) {
        if (!item.category) {
          await updateDoc(doc(db, "inventory", item.id), { category: "unisex" });
        }
      }
      alert("All existing products standardized to unisex.");
    } catch (err) {
      console.error(err);
    }
  };

  const [isLoadingSeed, setIsLoadingSeed] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const status = await checkIsAdmin(user.uid);
        setIsAdminUser(status);
      } else {
        setIsAdminUser(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReelUrl.trim()) return;
    setReelLoading(true);
    try {
      await addDoc(collection(db, "reels"), {
        url: newReelUrl.trim(),
        caption: newReelCaption.trim() || "@unora.campus",
        createdAt: new Date().toISOString(),
      });
      setNewReelUrl("");
      setNewReelCaption("");
    } catch (err) {
      console.error(err);
    } finally {
      setReelLoading(false);
    }
  };

  const handleDeleteReel = async (id: string) => {
    try {
      await deleteDoc(doc(db, "reels", id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribeOrders = onSnapshot(
      q,
      (snapshot) => {
        const fetched: AdminOrder[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let formattedDate = "Just now";
          if (data.createdAt?.toDate) {
            formattedDate = data.createdAt.toDate().toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });
          } else if (typeof data.createdAt === "string") {
            formattedDate = new Date(data.createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });
          }

          return {
            id: data.orderId || docSnap.id,
            docId: docSnap.id,
            fullName: data.fullName || "Campus Student",
            mobile: data.mobile || "",
            campus: data.campus || "IIT",
            hostelName: data.hostelName || "Hostel",
            roomNumber: data.roomNumber || "",
            deliveryNote: data.deliveryNote || "",
            paymentMethod: data.paymentMethod || "upi",
            grandTotal: Number(data.grandTotal || 0),
            status: (data.status as OrderStatus) || "Received",
            items: Array.isArray(data.items) ? data.items : [],
            createdAt: formattedDate,
          };
        });
        setOrders(fetched);
      },
      (error) => {
        console.error("Firestore sync error:", error);
      }
    );

    const unsubscribeInventory = onSnapshot(collection(db, "inventory"), (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setInventory(items);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeInventory();
    };
  }, [isOpen]);

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await updateDoc(doc(db, "inventory", editingItem.id), {
        price: Number(editingItem.price),
        originalPrice: Number(editingItem.originalPrice),
        badge: editingItem.badge,
        inStock: editingItem.inStock,
        category: editingItem.category || "unisex",
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditingItem(null);
      }, 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (docId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(docId);
      const orderRef = doc(db, "orders", docId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + order.grandTotal, 0);
    const customItemsCount = orders.reduce((acc, order) => {
      const customsInOrder = order.items.reduce((itemAcc, item) => {
        return itemAcc + (item.customText && item.customText.trim() !== "" ? item.quantity : 0);
      }, 0);
      return acc + customsInOrder;
    }, 0);

    return { totalOrders, totalRevenue, customItemsCount };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesCampus = selectedCampus === "ALL" || order.campus.toLowerCase() === selectedCampus.toLowerCase();
      const matchesStatus = selectedStatusFilter === "ALL" || order.status === selectedStatusFilter;
      const matchesSearch =
        order.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.hostelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.mobile.includes(searchQuery);

      return matchesCampus && matchesStatus && matchesSearch;
    });
  }, [orders, selectedCampus, selectedStatusFilter, searchQuery]);
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  const isAuthorized = Boolean(currentUser && isAdminUser);

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-[130] bg-[#3C1A11] flex items-center justify-center p-6 text-[#FFF8F0]">
        <div className="max-w-md w-full bg-[#FFF8F0] text-[#3C1A11] rounded-3xl p-8 border-2 border-[#D94F27] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-[#D94F27]/10 text-[#D94F27] rounded-full mx-auto flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div>
            <h2 className="font-anton text-3xl uppercase tracking-tight text-[#3C1A11]">UNAUTHORIZED CLEARANCE</h2>
            <p className="text-xs font-bold text-[#3C1A11]/70 mt-2">
              This terminal is strictly restricted to senior campus logistics operators. Access requires an authenticated administrative profile.
            </p>
            {currentUser && (
              <p className="text-[11px] font-mono text-[#D94F27] mt-2 font-bold break-all">
                Signed in as: {currentUser.email}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 h-12 bg-[#3C1A11] text-[#FFE2C7] rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#D94F27] transition-all cursor-pointer"
            >
              Sign Out
            </button>
            <button
              onClick={onClose}
              className="flex-1 h-12 border-2 border-[#3C1A11] text-[#3C1A11] rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#3C1A11]/10 transition-all cursor-pointer"
            >
              Exit Terminal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[130] bg-[#FFF8F0] text-[#3C1A11] overflow-y-scroll flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-[#3C1A11] text-[#FFF8F0] border-b-2 border-[#BDF119] px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-[#FFE2C7]/30 hover:bg-[#FFF8F0] hover:text-[#3C1A11] transition-all cursor-pointer"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-anton text-2xl md:text-3xl tracking-wider text-[#FFE2C7]">ADMIN PORTAL</span>
            <span className="bg-[#BDF119] text-[#3C1A11] text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
              Live
            </span>
          </div>
          <div className="bg-[#3C1A11] px-6 py-2 flex gap-4 border-b border-[#FFE2C7]/10">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`pb-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === "orders" ? "border-[#BDF119] text-[#BDF119]" : "border-transparent text-[#FFE2C7]/60"
              }`}
            >
              Orders & Dispatch
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("inventory")}
              className={`pb-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === "inventory" ? "border-[#BDF119] text-[#BDF119]" : "border-transparent text-[#FFE2C7]/60"
              }`}
            >
              Inventory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reels")}
              className={`pb-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === "reels" ? "border-[#BDF119] text-[#BDF119]" : "border-transparent text-[#FFE2C7]/60"
              }`}
            >
              Campus Reels
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold text-[#FFE2C7]/60 tracking-wider">WELCOME!</span>
            <span className="text-xs font-mono font-bold text-[#BDF119]">{currentUser?.email || ""}</span>
          </div>
          <button
            onClick={handleLogout}
            className="h-9 px-4 rounded-xl border border-[#D94F27] bg-[#D94F27] text-[#FFE2C7] hover:bg-[#F47E20] font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border-2 border-[#3C1A11] rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#3C1A11]/60">Total Orders Placed</span>
              <div className="p-2 rounded-lg bg-[#3C1A11]/5 text-[#3C1A11]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z M3 6h18 M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="font-anton text-5xl text-[#3C1A11] tracking-tight">{metrics.totalOrders}</span>
              <p className="text-[11px] font-bold text-[#3C1A11]/60 mt-1 uppercase tracking-wide">real-time records</p>
            </div>
          </div>

          <div className="bg-white border-2 border-[#3C1A11] rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#3C1A11]/60">Cumulative Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-[#BDF119]/30 text-[#3C1A11] flex items-center justify-center font-anton text-base">
                ₹
              </div>
            </div>
            <div className="mt-4">
              <span className="font-anton text-5xl text-[#D94F27] tracking-tight">
                ₹{metrics.totalRevenue.toLocaleString("en-IN")}
              </span>
              <p className="text-[11px] font-bold text-[#3C1A11]/60 mt-1 uppercase tracking-wide">Gross Total</p>
            </div>
          </div>

          <div className="bg-white border-2 border-[#3C1A11] rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#3C1A11]/60">Studio Orders</span>
              <div className="p-2 rounded-lg bg-[#D94F27]/10 text-[#D94F27]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="font-anton text-5xl text-[#3C1A11] tracking-tight">{metrics.customItemsCount}</span>
              <p className="text-[11px] font-bold text-[#D94F27] mt-1 uppercase tracking-wide">Active printing tasks</p>
            </div>
          </div>
        </section>

        {activeTab === "reels" && (
          <section className="bg-white border-2 border-[#3C1A11] rounded-2xl p-6 shadow-lg space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase text-[#D94F27] tracking-widest">Video Showcase</span>
              <h2 className="font-anton text-3xl uppercase tracking-tight mt-0.5">MANAGE INSTAGRAM REELS</h2>
              <p className="text-xs font-bold text-[#3C1A11]/60 mt-1">
                Paste Instagram reel links to stream real campus fits directly to the homepage.
              </p>
            </div>

            <form onSubmit={handleAddReel} className="bg-[#FFF8F0] border-2 border-[#3C1A11] p-5 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Instagram Reel Link</label>
                  <input
                    type="url"
                    required
                    value={newReelUrl}
                    onChange={(e) => setNewReelUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/Cxxxxxx/"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#3C1A11] bg-white text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Handle / Caption</label>
                  <input
                    type="text"
                    value={newReelCaption}
                    onChange={(e) => setNewReelCaption(e.target.value)}
                    placeholder="e.g. @roorkee.fits / Thomso Night"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#3C1A11] bg-white text-xs font-bold outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={reelLoading}
                className="h-10 px-6 bg-[#D94F27] hover:bg-[#F47E20] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
              >
                {reelLoading ? "Adding Reel..." : "Add to Live Showcase"}
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {reelsList.map((reel) => (
                <div key={reel.id} className="border-2 border-[#3C1A11] rounded-2xl p-4 bg-[#FFF8F0] flex flex-col justify-between space-y-3">
                  <div className="text-xs font-bold truncate text-[#3C1A11]">{reel.caption}</div>
                  <a href={reel.url} target="_blank" rel="noreferrer" className="text-[11px] text-[#2952CC] font-bold truncate hover:underline">
                    {reel.url}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteReel(reel.id)}
                    className="h-8 bg-[#3C1A11] text-[#D94F27] hover:bg-[#D94F27] hover:text-white rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer"
                  >
                    Delete Reel
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section className="bg-white border-2 border-[#3C1A11] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#D94F27] tracking-widest">Live Logistics Information</span>
                <h2 className="font-anton text-3xl uppercase tracking-tight mt-0.5">ORDERS SUMMARY</h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search code, name, hostel, phone..."
                    className="h-10 pl-9 pr-4 rounded-xl border border-[#3C1A11]/30 bg-[#FFF8F0] text-xs font-bold outline-none focus:border-[#2952CC] w-64"
                  />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="absolute left-3 top-3 text-[#3C1A11]/50"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </div>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#3C1A11]/30 bg-[#FFF8F0] text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="ALL">Status: All</option>
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {CAMPUSES.map((camp) => (
                <button
                  key={camp}
                  onClick={() => setSelectedCampus(camp)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    selectedCampus === camp
                      ? "bg-[#3C1A11] text-[#BDF119]"
                      : "bg-[#3C1A11]/5 text-[#3C1A11] hover:bg-[#3C1A11]/15"
                  }`}
                >
                  {camp}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#3C1A11]/20">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#3C1A11] text-[#FFE2C7] uppercase text-[10px] tracking-wider font-anton">
                  <tr>
                    <th className="py-3 px-4">Order ID & Time</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4 min-w-[220px]">Order Items & Studio Spec</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4 min-w-[140px]">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3C1A11]/10 bg-white">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#3C1A11]/60 font-bold">
                        No order dispatches match the selected parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.docId} className="hover:bg-[#FFF8F0]/70 transition-colors">
                        <td className="py-3 px-4 align-top">
                          <span className="font-anton text-sm tracking-wide text-[#3C1A11] block">{order.id}</span>
                          <span className="text-[10px] font-mono font-bold text-[#3C1A11]/60 block mt-0.5">
                            {order.createdAt}
                          </span>
                        </td>

                        <td className="py-3 px-4 align-top">
                          <span className="font-bold text-xs uppercase text-[#3C1A11] block">{order.fullName}</span>
                          {order.mobile ? (
                            <a
                              href={`tel:${order.mobile}`}
                              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#2952CC] hover:underline mt-0.5"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                              </svg>
                              {order.mobile}
                            </a>
                          ) : (
                            <span className="text-[10px] text-[#3C1A11]/50 font-bold block">No phone</span>
                          )}
                        </td>

                        <td className="py-3 px-4 align-top">
                          <span className="font-black text-[11px] uppercase text-[#D94F27] block">{order.campus}</span>
                          <span className="font-bold text-xs block text-[#3C1A11] mt-0.5">
                            {order.hostelName} - Room {order.roomNumber}
                          </span>
                          {order.deliveryNote && (
                            <span className="text-[10px] font-medium text-[#3C1A11]/60 italic block mt-1 bg-[#3C1A11]/5 p-1 rounded">
                              "{order.deliveryNote}"
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 align-top space-y-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="border-b border-[#3C1A11]/5 pb-1 last:border-0 last:pb-0">
                              <div className="flex items-center gap-1 font-bold text-xs">
                                <span className="bg-[#3C1A11] text-[#FFE2C7] px-1.5 py-0.2 rounded text-[10px]">
                                  {item.quantity}x
                                </span>
                                <span className="text-[#3C1A11]">{item.name}</span>
                                <span className="text-[10px] text-[#3C1A11]/60">[{item.size}]</span>
                              </div>

                              {item.customText && item.customText.trim() !== "" && (
                                <div className="mt-1 bg-[#D94F27]/10 border border-[#D94F27] px-2 py-0.5 rounded text-[11px] font-black text-[#D94F27] uppercase tracking-wider inline-block">
                                  STUDIO PRINT: "{item.customText}"
                                </div>
                              )}
                            </div>
                          ))}
                        </td>

                        <td className="py-3 px-4 align-top">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              order.paymentMethod === "upi"
                                ? "bg-[#2952CC]/15 text-[#2952CC] border border-[#2952CC]/30"
                                : "bg-[#D94F27]/15 text-[#D94F27] border border-[#D94F27]/30"
                            }`}
                          >
                            {order.paymentMethod === "upi" ? "UPI / PAID" : "CASH ON DEL"}
                          </span>
                        </td>

                        <td className="py-3 px-4 align-top font-anton text-sm text-[#3C1A11]">
                          ₹{order.grandTotal.toLocaleString("en-IN")}.00
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="relative">
                            <select
                              disabled={updatingId === order.docId}
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.docId, e.target.value as OrderStatus)}
                              className={`w-full h-8 px-2 rounded-lg font-black text-[11px] uppercase tracking-wider border-2 outline-none cursor-pointer transition-all ${
                                order.status === "Delivered"
                                ? "bg-[#BDF119]/30 border-[#BDF119] text-[#3C1A11]"
                                : order.status === "In Transit"
                                ? "bg-[#2952CC]/15 border-[#2952CC] text-[#2952CC]"
                                : "bg-[#3C1A11]/10 border-[#3C1A11] text-[#3C1A11]"
                              }`}
                            >
                              {ORDER_STATUSES.map((statusOption) => (
                                <option key={statusOption} value={statusOption} className="bg-[#FFF8F0] text-[#3C1A11]">
                                  {statusOption}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "inventory" && (
          <section className="bg-white border-2 border-[#3C1A11] rounded-2xl p-6 shadow-lg space-y-6">
            <div className="bg-[#FFF8F0] border-2 border-[#3C1A11] p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-anton text-lg uppercase text-[#3C1A11]">Buy 4 Get 1 Free Promo Deal</h3>
                <p className="text-xs font-semibold text-[#3C1A11]/70 mt-0.5">
                  When enabled, carts with 5+ items automatically discount the lowest priced item.
                </p>
                {offerSuccess && <span className="text-[10px] font-black text-[#2952CC] uppercase">Offer updated live!</span>}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveOffer(true)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                    buy4get1Enabled ? "bg-[#3C1A11] text-[#BDF119]" : "bg-[#3C1A11]/10 text-[#3C1A11]"
                  }`}
                >
                  Enable Deal
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveOffer(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                    !buy4get1Enabled ? "bg-[#D94F27] text-white" : "bg-[#3C1A11]/10 text-[#3C1A11]"
                  }`}
                >
                  Disable Deal
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleMigrateToUnisex}
                className="px-4 py-2 bg-[#3C1A11] text-[#BDF119] text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer"
              >
                Standardize All as Unisex
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="bg-white border-2 border-[#3C1A11] p-6 rounded-2xl shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-anton text-xl uppercase text-[#3C1A11]">Add New Campus Garment</h3>
                {createSuccess && <span className="text-xs font-black text-[#BDF119] bg-[#3C1A11] px-2 py-1 rounded uppercase">Product Added Live!</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Vintage Arch Tee"
                    className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="899"
                    className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Campus</label>
                  <select
                    value={newProdCampus}
                    onChange={(e) => setNewProdCampus(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] text-xs font-bold outline-none cursor-pointer"
                  >
                    {CAMPUSES.filter(c => c !== "ALL").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase mb-1">Audience Category</label>
                    <select
                      value={editingItem.category || "unisex"}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-white text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="unisex">Unisex / Both</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                    </select>
                  </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-[10px] font-black uppercase">
                  Product Image URLs (Provide 4 URLs, select radio for primary thumbnail)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="flex items-center gap-2 border border-[#3C1A11]/30 p-2 rounded-xl bg-[#FFF8F0]">
                      <input
                        type="radio"
                        name="mainImageSelection"
                        checked={mainImgIdx === idx}
                        onChange={() => setMainImgIdx(idx)}
                        className="cursor-pointer"
                      />
                      <span className="text-[10px] font-black uppercase text-[#3C1A11]/60">#{idx + 1}</span>
                      <input
                        type="text"
                        value={imgUrls[idx]}
                        onChange={(e) => {
                          const copy = [...imgUrls];
                          copy[idx] = e.target.value;
                          setImgUrls(copy);
                        }}
                        placeholder={`URL for image ${idx + 1}`}
                        className="flex-1 bg-transparent text-xs font-bold outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="h-11 px-6 bg-[#D94F27] hover:bg-[#F47E20] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
              >
                {createLoading ? "Creating Garment..." : "Publish to Storefront"}
              </button>
            </form>

            <form onSubmit={handleSavePromo} className="bg-[#FFF8F0] border-2 border-[#3C1A11] p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-anton text-lg uppercase text-[#3C1A11]">Campus Promo Code Settings (20% Off)</h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isPromoActive ? "bg-[#BDF119] text-[#3C1A11]" : "bg-[#D94F27] text-white"}`}>
                  {isPromoActive ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={promoCodeName}
                    onChange={(e) => setPromoCodeName(e.target.value.toUpperCase())}
                    className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-white text-xs font-bold uppercase outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Coupon Availability</label>
                  <select
                    value={isPromoActive ? "active" : "inactive"}
                    onChange={(e) => setIsPromoActive(e.target.value === "active")}
                    className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-white text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="active">Active (Usable by students)</option>
                    <option value="inactive">Disabled (Turned Off)</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="px-5 h-9 bg-[#3C1A11] text-[#BDF119] hover:bg-[#D94F27] hover:text-[#FFE2C7] font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                {promoSuccess ? "SAVED TO SYSTEM!" : "SAVE PROMO CONFIG"}
              </button>
            </form>

            <div>
              <span className="text-[10px] font-black uppercase text-[#D94F27] tracking-widest">Live Inventory</span>
              <h2 className="font-anton text-3xl uppercase tracking-tight mt-0.5">INVENTORY & PRICING CONTROLLER</h2>
              <p className="text-xs font-bold text-[#3C1A11]/60 mt-1">
                Updates made here reflect on all student browser sessions in real-time.
              </p>
              {inventory.length === 0 && (
                <button
                  type="button"
                  onClick={handleSeedDatabase}
                  disabled={isLoadingSeed}
                  className="mt-4 px-4 py-2 bg-[#2952CC] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#3C1A11] transition-all cursor-pointer"
                >
                  {isLoadingSeed ? "Seeding..." : "Initialize Inventory Collection"}
                </button>
              )}
            </div>

            {editingItem && (
              <form onSubmit={handleUpdateProduct} className="bg-[#FFF8F0] border-2 border-[#D94F27] p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-anton text-xl uppercase text-[#3C1A11]">Editing: {editingItem.name}</h3>
                  <button type="button" onClick={() => setEditingItem(null)} className="text-xs font-bold text-[#3C1A11]/60 hover:text-[#3C1A11]">Cancel</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1">Live Price (₹)</label>
                    <input
                      type="number"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-white text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      value={editingItem.originalPrice}
                      onChange={(e) => setEditingItem({ ...editingItem, originalPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-white text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={editingItem.badge}
                      onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-white text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1">Stock Status</label>
                    <select
                      value={editingItem.inStock ? "inStock" : "outOfStock"}
                      onChange={(e) => setEditingItem({ ...editingItem, inStock: e.target.value === "inStock" })}
                      className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-white text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="inStock">In Stock</option>
                      <option value="outOfStock">Out of Stock (Sold Out)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 h-10 bg-[#D94F27] hover:bg-[#F47E20] text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    {saveSuccess ? "SAVED!" : "SAVE CHANGES"}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto rounded-xl border border-[#3C1A11]/20">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#3C1A11] text-[#FFE2C7] uppercase text-[10px] tracking-wider font-anton">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Campus</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Badge</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3C1A11]/10">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FFF8F0]/70">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <img src={item.image} alt={item.name} className="w-8 h-10 object-cover rounded" />
                        <span className="font-bold text-xs">{item.name}</span>
                      </td>
                      <td className="py-3 px-4 font-bold">{item.campus}</td>
                      <td className="py-3 px-4">
                        <span className="font-anton text-sm">₹{item.price}</span>
                        <s className="text-[#3C1A11]/40 ml-1.5">₹{item.originalPrice}</s>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-[#3C1A11]/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{item.badge}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.inStock !== false ? "bg-[#BDF119]/30 text-[#3C1A11]" : "bg-[#D94F27]/20 text-[#D94F27]"}`}>
                          {item.inStock !== false ? "In Stock" : "Sold Out"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="px-3 py-1 bg-[#3C1A11] hover:bg-[#D94F27] text-[#BDF119] hover:text-white rounded font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};