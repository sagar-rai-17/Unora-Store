import React from "react";
import { Brand } from "./Icons";

interface FooterProps {
  onOpenAccount: () => void;
  onOpenAbout: () => void;
  onOpenStaticInfo: (type: "returns" | "investors" | "community" | "terms" | "privacy") => void;
  onTriggerToast: (msg: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAccount,
  onOpenAbout,
  onOpenStaticInfo,
  onTriggerToast,
}) => {
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInfluencerClick = () => {
    onTriggerToast("Wanna collaborate with us? DM us on Instagram @unora.clothin");
    setTimeout(() => {
      window.open("https://www.instagram.com/unora.clothin", "_blank", "noopener,noreferrer");
    }, 1500);
  };

  return (
    <footer>
      <div className="footer-main">
        <div className="footer-brand">
          <Brand />
          <p>
            Bold campus wear for India’s brightest. Designed with students, made
            to be remembered.
          </p>
          <div className="socials flex items-center gap-2.5">
            <a
              href="https://www.instagram.com/unora.clothin"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 border border-[#FFE2C7]/30 rounded-full flex items-center justify-center text-[#FFE2C7] hover:bg-[#D94F27] hover:border-[#D94F27] transition-all"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            <a
              href="mailto:unoraclothin@gmail.com"
              aria-label="Email Support"
              className="w-9 h-9 border border-[#FFE2C7]/30 rounded-full flex items-center justify-center text-[#FFE2C7] hover:bg-[#D94F27] hover:border-[#D94F27] transition-all"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>NEED HELP</h3>
          <a href="mailto:unoraclothin@gmail.com">Contact Us</a>
          <button type="button" onClick={onOpenAccount} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">Track Order</button>
          <button type="button" onClick={() => onOpenStaticInfo("returns")} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">Returns & Refunds</button>
          <button type="button" onClick={() => scrollToId("faq")} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">FAQs</button>
          <button type="button" onClick={onOpenAccount} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">My Account</button>
        </div>

        <div className="footer-column">
          <h3>COMPANY</h3>
          <button type="button" onClick={onOpenAbout} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">About Us</button>
          <button type="button" onClick={() => onOpenStaticInfo("investors")} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">Investor Relations</button>
          <button type="button" onClick={() => onOpenStaticInfo("community")} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">Community Initiatives</button>
        </div>

        <div className="footer-column">
          <h3>MORE INFO</h3>
          <button type="button" onClick={() => onOpenStaticInfo("terms")} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">T&C</button>
          <button type="button" onClick={() => onOpenStaticInfo("privacy")} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">Privacy Policy</button>
          <button type="button" onClick={() => scrollToId("reviews")} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">Testimonials</button>
        </div>

        <div className="footer-column">
          <h3>OUR COMMUNITIES</h3>
          <button type="button" onClick={() => scrollToId("shop")} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">Featured IIT Collections</button>
          <button
            type="button"
            onClick={handleInfluencerClick}
            className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer"
          >
            Influencer Program
          </button>
          <button
            type="button"
            onClick={() => onTriggerToast("Wanna collaborate? DM us on Instagram @unora.clothin")}
            className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer"
          >
            Partner With Us
          </button>
        </div>
      </div>

      <div className="help-banner">
        <span>FOR ANY HELP, WRITE TO US AT unoraclothin@gmail.com</span>
        <span>Working Timings- Mon–Sat, 10 AM–7 PM IST</span>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="hover:underline cursor-pointer font-bold"
        >
          unoraclothin.in
        </a>
      </div>

      <div className="copyright">
        <span>© 2026 UNORA INDIA. ALL RIGHTS RESERVED.</span>
        <span>MADE FOR CAMPUS, WITH CHARACTER.</span>
      </div>
    </footer>
  );
};