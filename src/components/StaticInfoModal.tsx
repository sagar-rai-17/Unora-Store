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
    title: "Return, Refund & Replacement Policy",
    subtitle: "Campus Policy & Verification",
    body: (
      <div className="space-y-4 text-xs font-semibold leading-relaxed text-[#3C1A11]/80">
        <p>
          At Unora, we take great care in packaging and delivering every order. Since many of our products are customised or made specifically for individual campuses, we follow a clear return and replacement policy.
        </p>

        <div>
          <h4 className="font-bold text-sm text-[#3C1A11] mb-1">1. Unboxing Video Is Mandatory</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Customers must record a continuous, unedited video while opening the package.</li>
            <li>The video must begin before the package is opened and clearly show the outer packaging, shipping label, package condition, and the product inside.</li>
            <li>Any damage, missing items, incorrect products, or manufacturing defects must be clearly visible in the video.</li>
            <li>Claims submitted without a valid unboxing video may not be eligible for a replacement or refund.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-[#3C1A11] mb-1">2. Reporting Time Limit</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Any complaint regarding damaged, defective, incorrect, or missing products must be reported within <strong>3 days (72 hours)</strong> of delivery.</li>
            <li>Customers must contact us through our official email and provide order details along with the unboxing video and relevant photographs.</li>
            <li>Complaints received after the 72-hour window may not be considered.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-[#3C1A11] mb-1">3. Eligible Cases for Replacement</h4>
          <p className="mb-1">A replacement or refund may be considered in the following situations:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>The product arrives damaged.</li>
            <li>The customer receives an incorrect product or design.</li>
            <li>Items are missing from the delivered order.</li>
            <li>The product has a verified manufacturing defect.</li>
          </ul>
          <p className="mt-1 italic">All claims are subject to verification and approval by our team.</p>
        </div>

        <div>
          <h4 className="font-bold text-sm text-[#3C1A11] mb-1">4. Non-Returnable Items</h4>
          <p className="mb-1">Due to the customised nature of our merchandise, the following are not eligible for return or exchange:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Customised or personalised products (e.g. if your name or roll number is printed on the garment).</li>
            <li>Products made specifically for an event or organisation.</li>
            <li>Products with customer-approved sizes or specifications (e.g. if you selected size M and received size M, sizing preference mismatches are not eligible).</li>
            <li>Products damaged due to improper handling after delivery.</li>
            <li>Products reported after the 72-hour complaint window.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-[#3C1A11] mb-1">5. Refunds & Replacements</h4>
          <p className="mb-1">Once a complaint is verified and approved, we will determine whether a replacement or refund is appropriate:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Approved replacements will be processed as soon as reasonably possible.</li>
            <li>Approved refunds will be issued through the original payment method or another mutually agreed method.</li>
            <li>Shipping charges, where applicable, will be handled based on the nature of the issue.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-[#3C1A11] mb-1">6. How to Raise a Complaint</h4>
          <p className="mb-1">To report an issue, please email <a href="mailto:unoraclothin@gmail.com" className="text-[#2952CC] font-bold underline">unoraclothin@gmail.com</a> within 72 hours of delivery with:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Order ID.</li>
            <li>Continuous, unedited unboxing video.</li>
            <li>Clear photographs of the issue, if applicable.</li>
            <li>Brief description of the problem.</li>
          </ol>
          <p className="mt-2 text-[#D94F27] font-bold">Important: Please retain the original packaging until your complaint has been resolved.</p>
        </div>
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
        <p>We are currently privately held and self-funded, focusing on supply-chain efficiency and unit-level profitability across target institutes. For institutional investment inquiries and partnership discussions, reach out directly to our founders at <a href="mailto:unoraclothin@gmail.com" className="text-[#2952CC] font-bold underline">invest@unora.in</a>.</p>
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