import React from "react";
import { Brand } from "./Icons";

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
            BORN IN ROORKEE - BUILT FOR INDIA
          </span>
          <h1 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-[#3C1A11]">
            WEAR YOUR CAMPUS ON YOUR SLEEVE.
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base font-semibold text-[#3C1A11]/80 leading-relaxed">
            Unora is an IIT Roorkee-rooted apparel brand engineered for India’s brightest. We make heavyweight, 240 GSM campus-coded drops designed to survive Thomso nights, Mood Indigo crowds, and endless hostel lab marathons.
          </p>
        </div>

        <div className="bg-white border-2 border-[#3C1A11] rounded-3xl p-6 sm:p-10 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex justify-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-[#3C1A11] overflow-hidden shadow-md">
              <img
                src="/assets/founder.png"
                alt="Sushant - Founder of Unora"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/assets/unora.jpg";
                }}
              />
            </div>
          </div>
          <div className="md:col-span-8 space-y-3 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D94F27] bg-[#D94F27]/10 px-2 py-0.5 rounded">
              FOUNDER'S STORY
            </span>
            <h2 className="font-anton text-3xl uppercase text-[#3C1A11]">Sushant</h2>
            <p className="text-xs font-bold text-[#3C1A11]/60 uppercase tracking-wide">
              Founder & Business Development Lead at MerchByIITR (Aug 2023 – Jan 2026)
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#3C1A11]/80 leading-relaxed pt-1">
              "During my work at MerchByIITR, I spent years building student apparel from the ground up—running sourcing, pricing, supply chain, and handling client acquisition for inter-IIT sports and fests. Unora was born from that exact fire: giving every campus distinct, premium streetwear that students actually want to wear beyond graduation."
            </p>
          </div>
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