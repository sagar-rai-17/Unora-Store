import React from "react";
import { Brand } from "./Icons";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
  onOpenFeedback,
}) => {
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[145] bg-[#FFF8F0] overflow-y-auto text-[#3C1A11]">
      <div className="sticky top-0 z-20 bg-[#FFF8F0]/95 backdrop-blur-md border-b-2 border-[#3C1A11] px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl border-2 border-[#3C1A11] hover:bg-[#3C1A11] hover:text-[#FFE2C7] transition-all cursor-pointer font-black text-xs uppercase"
        >
          ✕ Close
        </button>
        <Brand />
        <div className="w-10" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#D94F27]">
            ABOUT UNORA
          </span>
          <h1 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-[#3C1A11]">
            MORE THAN MERCHANDISE. A STATEMENT OF IDENTITY.
          </h1>
          <p className="max-w-3xl mx-auto text-sm sm:text-base font-semibold text-[#3C1A11]/80 leading-relaxed">
            Born in August 2024, Unora started with a simple observation: campus merchandise deserved better. Too often, college merchandise meant compromising on fabric quality, design, and style. We believed it shouldn't have to be that way. Why should something made to represent your campus be something you wouldn't want to wear beyond it?
          </p>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm font-bold text-[#D94F27] uppercase tracking-wide">
            Founded as a student-led venture, Unora was built around one simple idea: student merchandise should never mean compromising on quality, creativity, or style.
          </p>
        </div>

        <div className="bg-white border-2 border-[#3C1A11] rounded-3xl p-6 sm:p-10 shadow-lg space-y-4 text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D94F27] bg-[#D94F27]/10 px-2 py-0.5 rounded">
            WHAT WE DO
          </span>
          <h2 className="font-anton text-3xl uppercase text-[#3C1A11]">
            CAMPUS CULTURE MEETS CONTEMPORARY STREETWEAR
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#3C1A11]/80 leading-relaxed">
            We bring together campus culture and contemporary streetwear to create merchandise that people genuinely enjoy wearing. From oversized and regular-fit T-shirts to hoodies, varsity jackets, and jerseys, our collection combines thoughtful designs, comfortable fabrics, quality prints, and modern fits.
          </p>
          <p className="text-xs sm:text-sm font-semibold text-[#3C1A11]/80 leading-relaxed">
            Whether it's a college fest, student club, campus society, or an individual looking for something distinctive, we make apparel that goes beyond simply putting a logo on a garment.
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase text-[#D94F27] tracking-widest">
              CRAFT & ATTENTION
            </span>
            <h2 className="font-anton text-3xl uppercase">MORE THAN JUST A PRINT</h2>
            <p className="text-xs font-semibold text-[#3C1A11]/70 mt-1">
              At Unora, we believe good merchandise starts with the details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border-2 border-[#3C1A11] p-5 rounded-2xl shadow-sm space-y-2">
              <span className="font-anton text-lg uppercase text-[#D94F27]">01. Quality First</span>
              <p className="text-xs font-semibold text-[#3C1A11]/80 leading-relaxed">
                Comfortable, carefully selected fabrics made for everyday wear, long hostel lab sessions, and fest crowds.
              </p>
            </div>

            <div className="bg-white border-2 border-[#3C1A11] p-5 rounded-2xl shadow-sm space-y-2">
              <span className="font-anton text-lg uppercase text-[#D94F27]">02. Design That Stands Out</span>
              <p className="text-xs font-semibold text-[#3C1A11]/80 leading-relaxed">
                Creative, contemporary graphics inspired by modern streetwear rather than standard template logos.
              </p>
            </div>

            <div className="bg-white border-2 border-[#3C1A11] p-5 rounded-2xl shadow-sm space-y-2">
              <span className="font-anton text-lg uppercase text-[#D94F27]">03. Prints That Last</span>
              <p className="text-xs font-semibold text-[#3C1A11]/80 leading-relaxed">
                High-grade printing techniques that maintain their visual crispness and color with regular wash cycles.
              </p>
            </div>

            <div className="bg-white border-2 border-[#3C1A11] p-5 rounded-2xl shadow-sm space-y-2">
              <span className="font-anton text-lg uppercase text-[#D94F27]">04. Made to Represent</span>
              <p className="text-xs font-semibold text-[#3C1A11]/80 leading-relaxed">
                Custom designs and personalized lab drops that capture the true identity and character of campus communities.
              </p>
            </div>

            <div className="bg-white border-2 border-[#3C1A11] p-5 rounded-2xl shadow-sm space-y-2 md:col-span-2">
              <span className="font-anton text-lg uppercase text-[#D94F27]">05. Fits That Feel Right</span>
              <p className="text-xs font-semibold text-[#3C1A11]/80 leading-relaxed">
                Modern regular and oversized silhouettes that balance relaxed comfort with a structured streetwear drape.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-[#3C1A11] p-6 sm:p-8 rounded-3xl shadow-sm space-y-3 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D94F27] bg-[#D94F27]/10 px-2 py-0.5 rounded">
              OUR NAME
            </span>
            <h3 className="font-anton text-2xl uppercase text-[#3C1A11]">BUILT AROUND UNITY</h3>
            <p className="text-xs sm:text-sm font-semibold text-[#3C1A11]/80 leading-relaxed">
              The name Unora draws inspiration from the word <strong>Unity</strong>. To us, it represents the connections, communities, and shared experiences that make campus life special. Every college has its own culture, every fest has its own identity, and every community has a story worth representing. We bring those stories to life through apparel.
            </p>
          </div>

          <div className="bg-white border-2 border-[#3C1A11] p-6 sm:p-8 rounded-3xl shadow-sm space-y-3 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D94F27] bg-[#D94F27]/10 px-2 py-0.5 rounded">
              THE HORIZON
            </span>
            <h3 className="font-anton text-2xl uppercase text-[#3C1A11]">OUR VISION</h3>
            <p className="text-xs sm:text-sm font-semibold text-[#3C1A11]/80 leading-relaxed">
              We started with campus merchandise, but our ambition goes beyond it. We aim to become a trusted merchandise partner for student communities across India while building a streetwear identity that reaches beyond college campuses. Because at the end of the day, merchandise should be something you wear because you love it.
            </p>
          </div>
        </div>

        <div className="text-center py-4 border-y-2 border-[#3C1A11]/20">
          <p className="font-anton text-2xl sm:text-3xl uppercase tracking-wider text-[#3C1A11]">
            UNORA: MADE TO REPRESENT. DESIGNED TO BE WORN.
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase text-[#D94F27] tracking-widest">VERIFIED WORDS</span>
            <h2 className="font-anton text-3xl uppercase">THE WORD AROUND HOSTEL</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border-2 border-[#3C1A11] p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Ananya Mehta</span>
                <span className="text-[#D94F27]">IIT Bombay</span>
              </div>
              <p className="text-xs font-semibold text-[#3C1A11]/80">"The weight and fit feel properly premium. Wore it to Mood Indigo and got asked about it all night."</p>
            </div>
            <div className="bg-white border-2 border-[#3C1A11] p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Rishabh Kapoor</span>
                <span className="text-[#D94F27]">IIT Delhi</span>
              </div>
              <p className="text-xs font-semibold text-[#3C1A11]/80">"Customization is crisp, not that plasticky print. Delivery came straight to Kumaon hostel."</p>
            </div>
            <div className="bg-white border-2 border-[#3C1A11] p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Sneha Nair</span>
                <span className="text-[#D94F27]">IIT Madras</span>
              </div>
              <p className="text-xs font-semibold text-[#3C1A11]/80">"Finally campus merch I would wear outside campus too. The oversized tee drapes perfectly."</p>
            </div>
          </div>
        </div>

        <div className="bg-[#3C1A11] text-[#FFE2C7] p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          <div>
            <h3 className="font-anton text-2xl uppercase text-[#BDF119]">Help Us Improve Unora</h3>
            <p className="text-xs font-semibold text-[#FFE2C7]/70 mt-1">
              Have ideas for the next drop or feedback on sizing? Let our core team know directly.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenFeedback}
            className="px-6 h-12 bg-[#D94F27] hover:bg-[#F47E20] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 cursor-pointer shadow-md"
          >
            Leave Feedback
          </button>
        </div>
      </div>
    </div>
  );
};