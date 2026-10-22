import React, { useState } from "react";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passCreated, setPassCreated] = useState(false);

  if (!isOpen) return null;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!email.trim() || !isEmailValid) newErrors.email = "Valid email is required.";
    if (!password) newErrors.password = "Password is required.";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!dobDay || !dobMonth || !dobYear) newErrors.dob = "Complete birthdate is required.";
    if (!mobile.trim() || mobile.replace(/\D/g, "").length !== 10) {
      newErrors.mobile = "10-digit mobile number is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setPassCreated(true);
    setTimeout(() => {
      onSuccess(`${firstName} ${lastName}`);
      setPassCreated(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-[#FFF8F0] border-2 border-[#3C1A11] rounded-2xl p-6 sm:p-10 shadow-2xl text-[#3C1A11]">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full border border-[#3C1A11]/20 hover:bg-[#3C1A11] hover:text-[#FFE2C7] transition-colors"
          aria-label="Close modal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {passCreated ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
            <span className="text-[10px] font-black tracking-widest text-[#D94F27] uppercase">
              STUDENT CLEARANCE VERIFIED
            </span>
            <h2 className="font-anton text-4xl uppercase text-[#3C1A11] mt-2 mb-4">
              ACCESS PASS GENERATED
            </h2>
            <div className="w-full max-w-sm bg-[#3C1A11] text-[#FFE2C7] rounded-2xl p-6 border-2 border-[#BDF119] shadow-xl text-left my-4">
              <div className="flex justify-between items-center border-b border-[#FFE2C7]/20 pb-3 mb-4">
                <span className="font-anton text-lg tracking-wider text-[#BDF119]">UNORA PASS</span>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-[#D94F27] text-white px-2 py-0.5 rounded">CAMPUS MEMBER</span>
              </div>
              <p className="text-xs uppercase tracking-wider text-[#FFE2C7]/70">Holder</p>
              <p className="font-anton text-2xl uppercase tracking-wide text-white">{firstName} {lastName}</p>
              <div className="flex justify-between mt-4 pt-3 border-t border-[#FFE2C7]/20 text-[11px] font-mono">
                <span>PASS ID: UNR-{Math.floor(100000 + Math.random() * 900000)}</span>
                <span className="text-[#BDF119]">ALL 10 IITS</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-[#3C1A11]/70 mt-2">
              Redirecting you to the catalog with community benefits applied...
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="font-anton text-4xl sm:text-5xl uppercase tracking-tight text-[#3C1A11] leading-none mt-1">
                JOIN THE COMMUNITY
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#3C1A11]/70 mt-1">
                Mint your digital student access pass for campus drops and priority hostel delivery.
              </p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Rohan"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 outline-none transition-all"
                  />
                  {errors.firstName && (
                    <span className="text-[10px] font-bold text-[#D94F27] mt-0.5 block">{errors.firstName}</span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Kapoor"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 outline-none transition-all"
                  />
                  {errors.lastName && (
                    <span className="text-[10px] font-bold text-[#D94F27] mt-0.5 block">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-wider uppercase mb-1">
                  Email Id
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@iitb.ac.in"
                    className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 outline-none transition-all"
                  />
                  <div className="absolute right-3 top-3">
                    {email.length > 0 && (
                      isEmailValid ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2952CC" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D94F27" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                          <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
                        </svg>
                      )
                    )}
                  </div>
                </div>
                {errors.email && (
                  <span className="text-[10px] font-bold text-[#D94F27] mt-0.5 block">{errors.email}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-3.5 pr-12 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-3 text-[10px] font-black tracking-wider uppercase text-[#3C1A11]/60 hover:text-[#3C1A11]"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-[10px] font-bold text-[#D94F27] mt-0.5 block">{errors.password}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-3.5 pr-12 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-3 text-[10px] font-black tracking-wider uppercase text-[#3C1A11]/60 hover:text-[#3C1A11]"
                    >
                      {showConfirmPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-[10px] font-bold text-[#D94F27] mt-0.5 block">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-wider uppercase mb-1">
                  Birthdate
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={dobDay}
                    onChange={(e) => setDobDay(e.target.value)}
                    className="h-11 px-2.5 rounded-lg border border-[#3C1A11] bg-transparent text-xs font-semibold focus:border-[#2952CC] outline-none"
                  >
                    <option value="" disabled>Day</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)} className="bg-[#FFF8F0]">
                        {i + 1}
                      </option>
                    ))}
                  </select>

                  <select
                    value={dobMonth}
                    onChange={(e) => setDobMonth(e.target.value)}
                    className="h-11 px-2.5 rounded-lg border border-[#3C1A11] bg-transparent text-xs font-semibold focus:border-[#2952CC] outline-none"
                  >
                    <option value="" disabled>Month</option>
                    {[
                      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                    ].map((month) => (
                      <option key={month} value={month} className="bg-[#FFF8F0]">
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    value={dobYear}
                    onChange={(e) => setDobYear(e.target.value)}
                    className="h-11 px-2.5 rounded-lg border border-[#3C1A11] bg-transparent text-xs font-semibold focus:border-[#2952CC] outline-none"
                  >
                    <option value="" disabled>Year</option>
                    {Array.from({ length: 30 }, (_, i) => {
                      const year = 2010 - i;
                      return (
                        <option key={year} value={String(year)} className="bg-[#FFF8F0]">
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {errors.dob && (
                  <span className="text-[10px] font-bold text-[#D94F27] mt-0.5 block">{errors.dob}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-wider uppercase mb-1">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="h-11 px-3 flex items-center justify-center rounded-lg border border-[#3C1A11] bg-[#3C1A11]/5 text-xs font-black">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    className="flex-1 h-11 px-3.5 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 outline-none transition-all"
                  />
                </div>
                {errors.mobile && (
                  <span className="text-[10px] font-bold text-[#D94F27] mt-0.5 block">{errors.mobile}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-wider uppercase mb-1">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 border border-[#3C1A11]/30 rounded-xl bg-[#3C1A11]/5">
                  {(["Male", "Female", "Other"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setGender(item)}
                      className={`h-9 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                        gender === item
                          ? "bg-[#3C1A11] text-[#FFE2C7] shadow-sm"
                          : "text-[#3C1A11] hover:bg-[#3C1A11]/10"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-13 mt-3 bg-[#D94F27] hover:bg-[#F47E20] text-[#FFE2C7] font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                Register yourself
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};