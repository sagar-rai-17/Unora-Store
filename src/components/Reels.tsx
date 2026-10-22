import React from "react";
import { Icon } from "./Icons";

export const reels = [
  [
    "@riya.builds",
    "https://images.unsplash.com/photo-1773236237569-fe2120dfe05e?auto=format&fit=crop&w=500&q=85",
  ],
  [
    "@devoncampus",
    "https://images.unsplash.com/photo-1773236175416-4ecbcf148b3e?auto=format&fit=crop&w=500&q=85",
  ],
  [
    "@thehostelcut",
    "https://images.unsplash.com/photo-1772501387434-36b4ee48e1fb?auto=format&fit=crop&w=500&q=85",
  ],
  [
    "@tanvi.afterhours",
    "https://images.unsplash.com/photo-1594035795389-9363dd86b113?auto=format&fit=crop&w=500&q=85",
  ],
];

export const Reels: React.FC = () => {
  return (
    <section className="reels-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow eyebrow--dark">STYLED ON CAMPUS</span>
          <h2>CAMPUS INFLUENCER REELS</h2>
        </div>
        <p>Real fits. Real hostels. Zero boring.</p>
      </div>

      <div className="reels-row">
        {reels.map(([handle, image], i) => (
          <div key={i} className="reel">
            <img src={image} alt={`${handle} campus outfit`} />
            <button aria-label="Play video">
              <Icon name="play" size={18} />
            </button>
            <div>
              <b>{handle}</b>
              <span>Shop the look →</span>
            </div>
            {i === 0 && (
              <span className="absolute top-3 left-3 bg-unora-orange text-white text-[10px] font-bold px-2 py-1 rounded">
                12.4K views
              </span>
            )}
          </div>
        ))}

        <div className="reel-promo">
          <span>UNORA ORIGINALS / EP. 03</span>
          <h3>WE ASKED 50 IITIANS TO STYLE ONE TEE.</h3>
          <button>
            <Icon name="play" size={14} />
            WATCH THE FILM
          </button>
        </div>
      </div>
    </section>
  );
};