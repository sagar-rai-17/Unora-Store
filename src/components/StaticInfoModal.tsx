import React from "react";
import { Brand } from "./Icons";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

export type StaticInfoType = "returns" | "investors" | "community" | "terms" | "privacy";

interface StaticInfoModalProps {
  isOpen: boolean;
  type: StaticInfoType | null;
  onClose: () => void;
}

const STATIC_CONTENT: Record<StaticInfoType, { title: string; subtitle: string; body: React.ReactNode }> = {
  returns: {
    title: "Returns & Refund Policy",
    subtitle: "7-Day Campus Guarantee",
    body: (
      <div className="space-y-4 text-xs font-semibold leading-relaxed text-[#3C1A11]/80">
        <p>At Unora, we build apparel engineered for campus durability. If your order does not fit as expected or arrives with a defect, you are eligible for an exchange or refund within <strong>7 days of hostel delivery</strong>.</p>
        <p><strong>Condition Requirements:</strong> All returned pieces must be unworn, unwashed, with original tags attached, and in original packaging. Items showing signs of wear, perfume odor, or hostel wash damage will not be accepted.</p>
        <p><strong>Custom & Studio Drops:</strong> Any garment customized via Unora Studio (bearing your personal name, roll number, or department print) is <strong>final sale</strong> and non-refundable, unless there is a verifiable manufacturing or print defect.</p>
        <p><strong>Refund Timeline:</strong> Once our campus delivery node inspects the returned piece, refunds are processed back to your original payment method within 5–7 business days.</p>
      </div>
    ),
  },
  investors: {
    title: "Investor Relations",
    subtitle: "Campus-Coded Retail Expansion",
    body: (
      <div className="space-y-4 text-xs font-semibold leading-relaxed text-[#3C1A11]/80">
        <p>Unora is an early-stage apparel startup founded at IIT Roorkee, building direct-to-campus streetwear for India's top academic institutions.</p>
        <p>We operate on a hyper-localized logistics model that delivers directly past campus security gates to student hostel rooms, eliminating last-mile shipping friction.</p>
        <p>We are currently privately held and self-funded, focusing on supply-chain efficiency and unit-level profitability across target institutes. For institutional investment inquiries and partnership discussions, reach out directly to our founders at <a href="mailto:invest@unora.in" className="text-[#2952CC] font-bold underline">invest@unora.in</a>.</p>
      </div>
    ),
  },
  community: {
    title: "Community Initiatives",
    subtitle: "Fueling Student-Led Culture",
    body: (
      <div className="space-y-4 text-xs font-semibold leading-relaxed text-[#3C1A11]/80">
        <p>Unora was born inside hostel rooms. We actively reinvest in student culture across all participating IIT campuses.</p>
        <p><strong>Fest Partnerships:</strong> We sponsor and provide subsidized merchandise runs for cultural, technical, and sports organizing committees including Thomso, Mood Indigo, and Inter-IIT meets.</p>
        <p><strong>Club Subsidies:</strong> Competitive collegiate teams, robotics clubs, and dance societies receive subsidized manufacturing rates on custom-designed kits.</p>
      </div>
    ),
  },
  terms: {
    title: "Terms & Conditions",
    subtitle: "Storefront Agreement",
    body: (
      <div className="space-y-4 text-xs font-semibold leading-relaxed text-[#3C1A11]/80">
        <p>By accessing or purchasing from Unora Store, you agree to comply with and be bound by these Terms and Conditions.</p>
        <p><strong>Order Acceptance:</strong> All orders placed on our website are subject to stock availability and address verification. We reserve the right to cancel suspicious orders or orders with incomplete hostel identification.</p>
        <p><strong>Pricing & Specifications:</strong> Prices for our regular and oversized garments, as well as customization surcharges, are subject to update without prior notice.</p>
        <p><strong>Intellectual Property:</strong> All designs, typography, brand assets, and campus apparel motifs displayed on Unora are the exclusive property of Unora India Private Limited.</p>
        <p><strong>Governing Law:</strong> These terms are governed in accordance with the laws of India, under the jurisdiction of courts in Uttarakhand.</p>
      </div>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "Your Data on Campus",
    body: (
      <div className="space-y-4 text-xs font-semibold leading-relaxed text-[#3C1A11]/80">
        <p>We respect your privacy and only collect information essential to routing your orders directly to your hostel room.</p>
        <p><strong>Information We Collect:</strong> When you register or purchase, we store your name, student email address, verified mobile number, campus name, hostel number, and room number.</p>
        <p><strong>How We Use Your Data:</strong> Your data is used exclusively for order fulfillment, SMS delivery dispatch notices, and account verification via Google and Firebase Identity Platform. We do not sell your personal information to third parties.</p>
        <p><strong>Security:</strong> All user records are stored in secure Google Cloud Firestore data centers with strict token-based authorization rules.</p>
      </div>
    ),
  },
};

export const StaticInfoModal: React.FC<StaticInfoModalProps> = ({ isOpen, type, onClose }) => {
    useBodyScrollLock(isOpen);
  if (!isOpen || !type) return null;
  const content = STATIC_CONTENT[type];

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

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D94F27] bg-[#D94F27]/10 px-2 py-0.5 rounded">
            {content.subtitle}
          </span>
          <h1 className="font-anton text-4xl uppercase text-[#3C1A11] mt-2">
            {content.title}
          </h1>
        </div>

        <div className="bg-white border-2 border-[#3C1A11] rounded-3xl p-6 sm:p-8 shadow-sm">
          {content.body}
        </div>
      </div>
    </div>
  );
};