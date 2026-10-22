import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export interface OrderRecord {
  id: string;
  date: string;
  hostelName: string;
  campusName: string;
  total: number;
  itemsCount: number;
  status: "Received" | "Printing" | "Dispatched" | "Delivered" | "Processing";
}

interface AccountPageProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    initials: string;
    email: string;
  };
  orders?: OrderRecord[];
  onLogout: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  isOpen,
  onClose,
  user,
  orders: propOrders = [],
  onLogout,
  onTrackOrder,
}) => {
  const [liveOrders, setLiveOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: OrderRecord[] = snapshot.docs.map((docSnap) => {
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

        setLiveOrders(fetched);
      },
      (error) => {
        console.error(error);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  const displayOrders = liveOrders.length > 0 ? liveOrders : propOrders;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-115 bg-[#FFF8F0] overflow-y-auto text-[#3C1A11]">
      <div className="sticky top-0 z-20 bg-[#FFF8F0] border-b-2 border-[#3C1A11] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border-2 border-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#FFE2C7] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="font-anton text-2xl md:text-3xl uppercase tracking-wider">
            My Account
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="h-10 px-4 border-2 border-[#D94F27] text-[#D94F27] hover:bg-[#D94F27] hover:text-[#FFE2C7] font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer"
        >
          LOG OUT
        </button>
      </div>

      <div className="mx-auto max-w-5xl p-6 md:p-10 space-y-10">
        
        <div>
          <h2 className="font-anton text-3xl uppercase tracking-tight mt-1 mb-4">
            My UNORA Account
          </h2>

          <div className="max-w-md w-full bg-[#3C1A11] text-[#FFE2C7] rounded-3xl p-6 border-2 border-[#BDF119] shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start border-b border-[#FFE2C7]/20 pb-4 mb-4">
              <div>
                <span className="font-anton text-xl tracking-wider text-[#BDF119]">UNORA PASS</span>
                <p className="text-[10px] font-bold text-[#FFE2C7]/60 uppercase tracking-widest">
                  Verified
                </p>
              </div>
              <span className="w-10 h-10 rounded-full bg-[#FFF8F0] text-[#3C1A11] font-black text-sm flex items-center justify-center border-2 border-[#D94F27]">
                {user.initials}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#FFE2C7]/70">Pass Holder</span>
              <p className="font-anton text-2xl uppercase tracking-wide text-white">{user.name}</p>
              <p className="text-xs text-[#FFE2C7]/80 font-mono">{user.email}</p>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#FFE2C7]/20 text-[11px] font-mono">
              <span>PASS ID: UNR-2026-STUDENT</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#D94F27] uppercase">
              Previous Orders
            </span>
            <h2 className="font-anton text-3xl uppercase tracking-tight mt-1">
              Your ORDER HISTORY
            </h2>
            <p className="text-xs font-semibold text-[#3C1A11]/70 mt-1">
              Track your past purchases and shipments
            </p>
          </div>

          {displayOrders.length === 0 ? (
            <div className="bg-white border-2 border-[#3C1A11] rounded-2xl p-8 text-center text-[#3C1A11]/60">
              <p className="font-anton text-xl uppercase tracking-wide text-[#3C1A11]">No campus orders placed yet</p>
              <p className="text-xs font-semibold mt-1">Orders placed through the Shopping Reception will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border-2 border-[#3C1A11] rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between border-b border-[#3C1A11]/15 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#D94F27]">REFERENCE CODE</span>
                      <p className="font-anton text-xl tracking-wider text-[#3C1A11]">{order.id}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#3C1A11]/60 uppercase">{order.date}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#BDF119] text-[#3C1A11] px-2.5 py-1 rounded-md border border-[#3C1A11]/20">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-[#3C1A11]/80 pt-1">
                    <div>
                      <span className="text-[10px] uppercase text-[#3C1A11]/50 block">DESTINATION</span>
                      <span>{order.hostelName} ({order.campusName})</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#3C1A11]/50 block">ITEMS</span>
                      <span>{order.itemsCount} {order.itemsCount === 1 ? "Item" : "Items"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#3C1A11]/50 block">TOTAL</span>
                      <span>₹{order.total.toLocaleString("en-IN")}.00</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#3C1A11]/50 block">PAYMENT</span>
                      <span>DONE</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#3C1A11]/10 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onTrackOrder(order.id)}
                      className="px-3.5 py-1.5 bg-[#3C1A11] hover:bg-[#D94F27] text-[#BDF119] hover:text-[#FFE2C7] rounded-lg font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Track Live Dispatch →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};