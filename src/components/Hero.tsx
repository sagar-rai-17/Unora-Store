import React, { useState, useEffect } from "react";

export const Hero: React.FC = () => {
  const slides = [
    {
      kicker: "IIT Bombay exclusive",
      title: "CAMPUS, BUT MAKE IT ICONIC.",
      body: "Official campus-coded drops. Designed by students, for students.",
      cta: "SHOP THE DROP",
    },
    {
      kicker: "Fest season / 25",
      title: "THOMSO AFTER DARK.",
      body: "Statement layers made for headline nights and hostel mornings.",
      cta: "EXPLORE FEST EDIT",
    },
    {
      kicker: "Unora Studio",
      title: "YOUR CAMPUS. YOUR TYPE.",
      body: "Personalize premium heavyweight fits in under five minutes.",
      cta: "START CREATING",
    },
  ];

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setSlide((s) => (s + 1) % slides.length),
      5500
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const active = slides[slide];

  return (
    <section className={`hero hero--${slide}`}>
      <div className="hero__photo" />
      <div className="hero__content">
        <span className="eyebrow eyebrow--lime">{active.kicker}</span>
        <h1>{active.title}</h1>
        <p>{active.body}</p>
        <a className="button button--light" href={slide === 2 ? "#unora-studio" : "#shop"}>
          {active.cta}
        </a>
      </div>

      <div className="hero__controls">
        <button
          aria-label="Previous slide"
          onClick={() => setSlide((slide + slides.length - 1) % slides.length)}
        >
          ←
        </button>
        <div>
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              className={i === slide ? "active" : ""}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
        <button
          aria-label="Next slide"
          onClick={() => setSlide((slide + 1) % slides.length)}
        >
          →
        </button>
      </div>

      <div className="hero__index">
        0{slide + 1} / 0{slides.length}
      </div>
    </section>
  );
};