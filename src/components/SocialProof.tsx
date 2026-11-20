import React, { useState, useRef, useEffect } from "react";
import { Icon } from "./Icons";

const REVIEWS = [
  {
    initials: "LP",
    name: "Lakshay Panchal",
    meta: "4th Year · IIT Roorkee",
    text: "Bhaiii, Unora Studio is crazy! Apna naam daalo aur apni hoodie customise karo? This is actually so cool 😂🔥",
  },
  {
    initials: "PM",
    name: "Priyanshu Maurya",
    meta: "4th Year · IIT Roorkee",
    text: "Bro, the fitting is actually what I liked the most. Oversized fit is on point, fabric is comfortable, and print quality is solid. Multiple washes ke baad bhi colour same hai. W purchase!",
  },
  {
    initials: "HG",
    name: "Harsh Gupta",
    meta: "4th Year · IIT Roorkee",
    text: "Honestly, I was expecting an average college merch T-shirt, but the quality surprised me. The print looks sharp, fabric feels premium, and it doesn't give that cheap merch wala feel.",
  },
  {
    initials: "SG",
    name: "Sanchita Gupta",
    meta: "4th Year · IIT Roorkee",
    text: "Been wearing my UNORA tee for quite a while now, and the quality is genuinely impressive. Fabric still feels great, and the print hasn't lost its charm. Definitely worth it! 🔥",
  },
  {
    initials: "PB",
    name: "Pratik Bajpayi",
    meta: "2nd Year · IIT Roorkee",
    text: "Bhai quality toh ekdum mast hai! Na fabric rough hai, na print wash ke baad kharab hua. Itna sahi merch mil raha hai toh aur kya chahiye 😂",
  },
  {
    initials: "SR",
    name: "Sagar Rai",
    meta: "3rd Year · IIT Roorkee",
    text: "One thing I genuinely appreciate is the attention to detail. The fabric, stitching and print quality are all quite good. Have worn it several times and it still holds its shape really well.",
  },
  {
    initials: "SK",
    name: "Saksham",
    meta: "1st Year · IIT Roorkee",
    text: "Didn't expect the T-shirt to feel this good tbh. It's super comfortable, and the oversized fit looks really nice. Already one of my favourite tees!",
  },
  {
    initials: "KG",
    name: "Kavya Gururani",
    meta: "1st Year · IIT Roorkee",
    text: "Such a nice everyday T-shirt! The material feels really comfortable, the colour looks beautiful, and the print is still intact after washing. Definitely going to order again!",
  },
  {
    initials: "DV",
    name: "Divya",
    meta: "1st Year · IIT Roorkee",
    text: "Yaar, finally some merch that I'd actually want to wear outside college too! The designs look nice, and the customisation feature is such a fun touch. Totally loving the vibe! ✨",
  },
];

export const SocialProof: React.FC = () => {
  const [open, setOpen] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused) return;
    const interval = window.setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 360, behavior: "smooth" });
      }
    }, 3500);
    return () => window.clearInterval(interval);
  }, [isPaused]);

  const handleScrollReviews = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    if (direction === "left") {
      if (el.scrollLeft <= 10) {
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -360, behavior: "smooth" });
      }
    } else {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 360, behavior: "smooth" });
      }
    }
  };

  const items = [
    [
      "Do you deliver directly to IIT hostels?",
      "Yes. Add your campus, hostel and room details at checkout, and we’ll route the order directly to you.",
    ],
    [
      "How long does Unora Studio customization take?",
      "Personalized pieces are printed in 7–10 working days, quality checked, and then shipped. You’ll receive tracking as soon as it leaves our studio.",
    ],
    [
      "Can I return a customized product?",
      "Customized items can be replaced for manufacturing or print defects. Standard products have an easy 14-day return window.",
    ],
    [
      "Are these official campus collections?",
      "Our campus edits are designed with student communities and campus ambassadors. Collection details specify official collaborations where applicable.",
    ],
    [
      "How do I choose the right size?",
      "Use the size guide on every product page. Our fits are intentionally relaxed; choose your regular size for the intended oversized silhouette.",
    ],
    [
      "Can our club create a bulk collection?",
      "Absolutely. Unora Studio supports fests, departments and hostel teams with design help and volume pricing.",
    ],
  ];

  return (
    <>
      <style>{`
        .reviews-scroll-track {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 8px 4px 16px;
        }
        .reviews-scroll-track::-webkit-scrollbar {
          display: none;
        }
        .reviews-scroll-track .review-card {
          width: 320px;
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .reviews-scroll-track .review-card {
            width: 340px;
          }
        }
      `}</style>

      <section className="story">
        <span className="eyebrow eyebrow--lime">BUILT FOR THE BRIGHTEST</span>
        <h2>
          UNORA: THE BRAND SERVING <mark>28,400+</mark> IITIANS MONTHLY.
        </h2>

        <div className="stats">
          <div>
            <b>10</b>
            <span>IIT CAMPUSES</span>
          </div>
          <div>
            <b>42K</b>
            <span>COMMUNITY MEMBERS</span>
          </div>
          <div>
            <b>4.9/5</b>
            <span>AVERAGE RATING</span>
          </div>
          <div>
            <b>100%</b>
            <span>STUDENT-LED ENERGY</span>
          </div>
        </div>
      </section>

      <section className="reviews-section" id="reviews">
        <div className="section-heading">
          <div>
            <span className="eyebrow eyebrow--dark">CAMPUS APPROVED</span>
            <h2>THE WORD AROUND HOSTEL</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScrollReviews("left")}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-full border-2 border-[#3C1A11] bg-[#FFF8F0] text-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#BDF119] flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleScrollReviews("right")}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-full border-2 border-[#3C1A11] bg-[#FFF8F0] text-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#BDF119] flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="reviews-scroll-track"
        >
          {REVIEWS.map((review) => (
            <div key={review.name} className="review-card">
              <div className="review-top">
                <span>{review.initials}</span>
                <div>
                  <b>{review.name}</b>
                  <small>{review.meta}</small>
                </div>
                <em>★★★★★</em>
              </div>
              <p>“{review.text}”</p>
              <a href="#verified">
                <Icon name="check" size={10} /> Verified campus order
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="section faq" id="faq">
        <div className="section-heading">
          <div>
            <span className="eyebrow eyebrow--dark">NEED TO KNOW</span>
            <h2>CAMPUS FAQs</h2>
          </div>
        </div>

        <div className="faq-list">
          {items.map(([q, a], i) => (
            <article className={open === i ? "open" : ""} key={q}>
              <button onClick={() => setOpen(open === i ? -1 : i)}>
                <span>0{i + 1}</span>
                <b>{q}</b>
                <Icon name={open === i ? "minus" : "plus"} />
              </button>
              {open === i && <p>{a}</p>}
            </article>
          ))}
        </div>
      </section>
    </>
  );
};