import React, { useState, useRef, useEffect } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (identifier: string) => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToRegister,
}) => {
  const [loginMethod, setLoginMethod] = useState<"standard" | "phone">("standard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
  let interval: ReturnType<typeof setInterval>;

  if (otpSent && otpTimer > 0) {
    interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
  }

  return () => clearInterval(interval);
}, [otpSent, otpTimer]);

  if (!isOpen) return null;

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim()) newErrors.email = "Email is required.";
    if (!password) newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSuccess(email);
      onClose();
    }, 1500);
  };

  const handleSendOtp = () => {
    if (!mobile.trim() || mobile.replace(/\D/g, "").length !== 10) {
      setErrors({ mobile: "Enter a valid 10-digit mobile number." });
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setOtpTimer(30);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, idx) => {
      if (idx < 6) newOtp[idx] = char;
    });
    setOtp(newOtp);
    otpInputsRef.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setErrors({ otp: "Enter the complete 6-digit verification code." });
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSuccess(`+91 ${mobile}`);
      onClose();
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess("Google User");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md my-8 bg-[#FFF8F0] border-2 border-[#3C1A11] rounded-2xl p-6 sm:p-8 shadow-2xl text-[#3C1A11]">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full border border-[#3C1A11]/20 hover:bg-[#3C1A11] hover:text-[#FFE2C7] transition-colors"
          aria-label="Close modal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="font-anton text-4xl uppercase tracking-tight text-[#3C1A11] leading-none mt-1">
            ACCESS YOUR ACCOUNT
          </h2>
          <p className="text-xs font-semibold text-[#3C1A11]/70 mt-1">
            Sign in to track hostel deliveries, unlock drops, and manage your studio orders.
          </p>
        </div>

        <div className="flex border border-[#3C1A11]/30 rounded-xl bg-[#3C1A11]/5 p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("standard");
              setErrors({});
            }}
            className={`flex-1 h-9 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
              loginMethod === "standard"
                ? "bg-[#3C1A11] text-[#FFE2C7] shadow-sm"
                : "text-[#3C1A11] hover:bg-[#3C1A11]/10"
            }`}
          >
            Email 
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("phone");
              setErrors({});
            }}
            className={`flex-1 h-9 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
              loginMethod === "phone"
                ? "bg-[#3C1A11] text-[#FFE2C7] shadow-sm"
                : "text-[#3C1A11] hover:bg-[#3C1A11]/10"
            }`}
          >
            Mobile No.
          </button>
        </div>

        {loginMethod === "standard" ? (
          <form onSubmit={handleStandardSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-black tracking-wider uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@iitb.ac.in"
                className="w-full h-11 px-3.5 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 outline-none transition-all"
              />
              {errors.email && (
                <span className="text-[10px] font-bold text-[#D94F27] mt-0.5 block">{errors.email}</span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black tracking-wider uppercase">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("A password reset link will be sent to your registered institute email.");
                  }}
                  className="text-[10px] font-bold text-[#2952CC] hover:underline uppercase"
                >
                  Forgot Password?
                </a>
              </div>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-1 bg-[#D94F27] hover:bg-[#F47E20] disabled:bg-[#D94F27]/60 text-[#FFE2C7] font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                "LOG IN"
              )}
            </button>
          </form>
        ) : (
          <div>
            {!otpSent ? (
              <div className="flex flex-col gap-4">
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

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full h-12 bg-[#D94F27] hover:bg-[#F47E20] disabled:bg-[#D94F27]/60 text-[#FFE2C7] font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>SENDING OTP...</span>
                    </>
                  ) : (
                    "SEND ACCESS CODE"
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black tracking-wider uppercase">
                      Enter 6-Digit Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[10px] font-bold text-[#2952CC] hover:underline uppercase"
                    >
                      Change Number
                    </button>
                  </div>

                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 sm:w-12 h-12 text-center font-anton text-xl rounded-lg border border-[#3C1A11] bg-transparent focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 outline-none transition-all"
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <span className="text-[10px] font-bold text-[#D94F27] mt-1 block">{errors.otp}</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[11px] font-semibold text-[#3C1A11]/70">
                  <span>Code sent to +91 {mobile}</span>
                  {otpTimer > 0 ? (
                    <span>Resend in {otpTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[#D94F27] font-bold hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#D94F27] hover:bg-[#F47E20] disabled:bg-[#D94F27]/60 text-[#FFE2C7] font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>VERIFYING CODE...</span>
                    </>
                  ) : (
                    "VERIFY & ENTER"
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3C1A11]/15" />
          </div>
          <span className="relative bg-[#FFF8F0] px-3 text-[10px] font-black tracking-widest uppercase text-[#3C1A11]/50">
            OR
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full h-11 border border-[#3C1A11] bg-white hover:bg-[#3C1A11]/5 rounded-xl text-xs font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        <div className="mt-6 text-center text-xs font-semibold text-[#3C1A11]/70">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#D94F27] font-black uppercase tracking-wider hover:underline ml-1 cursor-pointer"
          >
            Join Now
          </button>
        </div>

      </div>
    </div>
  );
};