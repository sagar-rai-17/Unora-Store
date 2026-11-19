import React from "react";

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full h-[calc(100vh-72px)] min-h-[500px] overflow-hidden bg-black">
      <div
        className="absolute inset-0 w-full h-full bg-contain bg-no-repeat bg-center"
        style={{ backgroundImage: `url('/assets/hero.png')` }}
      />
      <div className="absolute inset-0 bg-black/5" />
      <div className="absolute inset-x-0 bottom-[27%] z-10 px-4 text-center">
        <a
          href="#shop"
          className="inline-block px-8 py-3.5 bg-black/60 hover:bg-black/90 text-white font-sans font-bold tracking-wider text-sm uppercase rounded-full border border-white/30 backdrop-blur-md transition-all duration-300 shadow-2xl cursor-pointer"
        >
          ORDER NOW
        </a>
      </div>
    </section>
  );
};