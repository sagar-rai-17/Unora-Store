import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Icon } from "./Icons";

interface ReelDoc {
  id: string;
  url: string;
  caption: string;
}

export const Reels: React.FC = () => {
  const [liveReels, setLiveReels] = useState<ReelDoc[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reels"), (snap) => {
      setLiveReels(snap.docs.map(d => ({ id: d.id, ...d.data() } as ReelDoc)));
    });
    return () => unsub();
  }, []);

  const getEmbedUrl = (rawUrl: string) => {
    try {
      const urlObj = new URL(rawUrl);
      const cleanPath = urlObj.pathname.replace(/\/$/, "");
      return `https://www.instagram.com${cleanPath}/embed`;
    } catch {
      return rawUrl;
    }
  };

  return (
    <section className="reels-section" id="reels">
      <div className="section-heading">
        <div>
          <span className="eyebrow eyebrow--dark">STYLED ON CAMPUS</span>
          <h2>CAMPUS INFLUENCER REELS</h2>
        </div>
        <p>Real fits. Real hostels. Zero boring.</p>
      </div>

      <div className="reels-row">
        {liveReels.length === 0 ? (
          <div className="w-full py-12 text-center border-2 border-dashed border-[#3C1A11]/20 rounded-2xl bg-[#FFF8F0]">
            <p className="font-anton text-xl uppercase tracking-wider text-[#3C1A11]">CAMPUS REELS IN PRODUCTION</p>
            <p className="text-xs font-semibold text-[#3C1A11]/60 mt-1">
              Tag @unoracloth in your hostel fits to get featured here.
            </p>
          </div>
        ) : (
          liveReels.map((reel) => (
            <article className="reel" key={reel.id}>
              <iframe
                src={getEmbedUrl(reel.url)}
                className="w-full h-full border-0 rounded-xl"
                loading="lazy"
                scrolling="no"
                allowTransparency={true}
              />
              <div>
                <b>{reel.caption}</b>
                <a href={reel.url} target="_blank" rel="noreferrer">
                  Watch on Instagram →
                </a>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};