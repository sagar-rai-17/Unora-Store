import React, { useState } from "react";
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
              href="https://instagram.com/unora.in"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 border border-[#FFE2C7]/30 rounded-full flex items-center justify-center text-[#FFE2C7] hover:bg-[#D94F27] hover:border-[#D94F27] transition-all"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 border border-[#FFE2C7]/30 rounded-full flex items-center justify-center text-[#FFE2C7] hover:bg-[#D94F27] hover:border-[#D94F27] transition-all"
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>

            <a
              href="tel:18002663333"
              aria-label="Call Support"
              className="w-9 h-9 border border-[#FFE2C7]/30 rounded-full flex items-center justify-center text-[#FFE2C7] hover:bg-[#D94F27] hover:border-[#D94F27] transition-all"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>NEED HELP</h3>
          <a href="tel:18002663333">Contact Us</a>
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
          <a href="https://instagram.com/unora.in" target="_blank" rel="noreferrer">Get Notified</a>
          <button type="button" onClick={() => scrollToId("reviews")} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">Testimonials</button>
        </div>

        <div className="footer-column">
          <h3>OUR COMMUNITIES</h3>
          <button type="button" onClick={() => scrollToId("shop")} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">Featured IIT Collections</button>
          <button type="button" onClick={() => scrollToId("reels")} className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer">Influencer Program</button>
          <button
            type="button"
            onClick={() => onTriggerToast("Wanna collaborate? DM us on Instagram @unora.in")}
            className="text-left text-xs text-[#FFE2C7]/70 hover:text-white cursor-pointer"
          >
            Partner With Us
          </button>
        </div>
      </div>

      <div className="help-banner">
        <span>FOR ANY HELP, CALL US AT 1800-266-3333</span>
        <span>Mon–Sat, 10 AM–7 PM IST</span>
        <span>hello@unora.in</span>
      </div>

      <div className="copyright">
        <span>© 2026 UNORA INDIA. ALL RIGHTS RESERVED.</span>
        <span>MADE FOR CAMPUS, WITH CHARACTER.</span>
      </div>
    </footer>
  );
};