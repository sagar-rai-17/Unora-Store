import React from "react";

export const Hero: React.FC = () => {
  return (
    <section className="hero hero--0" style={{ backgroundImage: `url('/assets/hero.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="hero__photo" />
      <div className="hero__content">
        <span className="eyebrow eyebrow--lime">IIT BOMBAY EXCLUSIVE</span>
        <h1>CAMPUS, BUT MAKE IT ICONIC.</h1>
        <p>Official campus-coded drops. Designed by students, for students.</p>
        <a className="button button--light" href="#shop">
          ORDER NOW
        </a>
      </div>
    </section>
  );
};