import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultName = "",
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(defaultName);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "feedback"), {
        userId: auth.currentUser?.uid || "guest",
        name: name.trim() || "Anonymous Student",
        email: auth.currentUser?.email || "",
        rating,
        message: message.trim(),
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage("");
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFF8F0] border-2 border-[#3C1A11] rounded-3xl p-6 md:p-8 shadow-2xl text-[#3C1A11]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-anton text-2xl uppercase">Campus Feedback</h3>
          <button type="button" onClick={onClose} className="font-black text-sm cursor-pointer">✕</button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <span className="font-anton text-xl uppercase text-[#D94F27]">Thank You!</span>
            <p className="text-xs font-semibold text-[#3C1A11]/70">Your thoughts directly shape Unora's next collection.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rishabh Kapoor"
                className="w-full h-11 px-3.5 rounded-xl border border-[#3C1A11] bg-white text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase mb-1">Experience Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`flex-1 h-9 rounded-lg font-black text-xs cursor-pointer ${
                      rating >= star ? "bg-[#3C1A11] text-[#BDF119]" : "bg-[#3C1A11]/10 text-[#3C1A11]"
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase mb-1">Your Feedback / Feature Request</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you loved or what we should drop next..."
                className="w-full p-3 rounded-xl border border-[#3C1A11] bg-white text-xs font-bold outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#D94F27] hover:bg-[#F47E20] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};