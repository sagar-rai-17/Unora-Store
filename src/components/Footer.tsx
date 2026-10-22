import React from "react";
import { Brand } from "./Icons";

export const Footer: React.FC = () => {
  const columns = {
    "NEED HELP": [
      "Contact Us",
      "Track Order",
      "Returns & Refunds",
      "FAQs",
      "My Account",
    ],
    COMPANY: [
      "About Us",
      "Investor Relations",
      "Careers",
      "Gift Vouchers",
      "Community Initiatives",
    ],
    "MORE INFO": ["T&C", "Privacy Policy", "Sitemap", "Get Notified", "Blogs"],
    "OUR COMMUNITIES": [
      "Featured IIT Collections",
      "Influencer Program",
      "Campus Ambassador Login",
    ],
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
          <div className="socials">
            <a href="#ig">ig</a>
            <a href="#yt">yt</a>
            <a href="#x">x</a>
            <a href="#in">in</a>
          </div>
        </div>

        {Object.entries(columns).map(([title, links]) => (
          <div key={title} className="footer-column">
            <h3>{title}</h3>
            {links.map((link) => (
              <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}>
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="help-banner">
        <span>FOR ANY HELP, CALL US AT 1800-266-3333</span>
        <span>Mon–Sat, 10 AM–7 PM IST</span>
        <span>hello@unora.in</span>
      </div>

      <div className="copyright">
        <span>© 2025 UNORA INDIA. ALL RIGHTS RESERVED.</span>
        <span>MADE FOR CAMPUS, WITH CHARACTER.</span>
      </div>
    </footer>
  );
};