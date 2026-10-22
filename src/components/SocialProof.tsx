import React, { useState } from "react";
import { Icon } from "./Icons";

export const SocialProof: React.FC = () => {
  const [open, setOpen] = useState(0);

  const items = [
    [
      "Do you deliver directly to IIT hostels?",
      "Yes. Add your campus, hostel and room details at checkout, and we’ll route the order directly to you.",
    ],
    [
      "How long does Unora Studio customization take?",
      "Personalized pieces are printed in 3–5 working days, quality checked, and then shipped. You’ll receive tracking as soon as it leaves our studio.",
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

      <section className="reviews-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow eyebrow--dark">CAMPUS APPROVED</span>
            <h2>THE WORD AROUND HOSTEL</h2>
          </div>
        </div>

        <div className="review-grid">
          {[
            [
              "AM",
              "Ananya Mehta",
              "IIT Bombay",
              "The weight and fit feel properly premium. Wore it to Mood Indigo and got asked about it all night.",
            ],
            [
              "RK",
              "Rishabh Kapoor",
              "IIT Delhi",
              "Customization is crisp, not that plasticky print. Delivery came straight to Kumaon hostel.",
            ],
            [
              "SN",
              "Sneha Nair",
              "IIT Madras",
              "Finally campus merch I would wear outside campus too. The oversized tee drapes perfectly.",
            ],
          ].map(([initials, name, campus, text]) => (
            <div key={name} className="review-card">
              <div className="review-top">
                <span>{initials}</span>
                <div>
                  <b>{name}</b>
                  <small>{campus}</small>
                </div>
                <em>★★★★★</em>
              </div>
              <p>“{text}”</p>
              <a href="#verified">
                <Icon name="check" size={10} /> Verified campus order
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="section faq">
        <div className="section-heading">
          <div>
            <span className="eyebrow eyebrow--dark">NEED TO KNOW</span>
            <h2>CAMPUS FAQs</h2>
          </div>
          <a href="#support">Still stuck? Talk to a human</a>
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