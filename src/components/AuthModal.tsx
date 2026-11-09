import React, { useState, useEffect } from "react";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string) => void;
  onRegisterSuccess: (name: string) => void;
}

const CAMPUS_OPTIONS = [
  "IIT BHU", "IIT Kharagpur", "IIT Roorkee", "IIT (ISM) Dhanbad",
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur",
  "IIT Guwahati", "IIT Hyderabad", "IIT Gandhinagar",
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "register" | "onboarding">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [pendingGoogleUid, setPendingGoogleUid] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [iitCampus, setIitCampus] = useState(CAMPUS_OPTIONS[0]);

  useEffect(() => {
    setErrors({});
  }, [mode]);
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  const mapAuthError = (errorCode: string): string => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Access temporarily disabled due to failed attempts. Try again later.";
      default:
        return "Authentication failed. Please verify your details.";
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!loginEmail.trim()) newErrors.loginEmail = "Email is required.";
    if (!loginPassword) newErrors.loginPassword = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const resolvedName = `${userData.firstName} ${userData.lastName}`.trim();
        onLoginSuccess(resolvedName || "Campus Member");
        onClose();
      } else {
        setPendingGoogleUid(userCredential.user.uid);
        setRegEmail(userCredential.user.email || "");
        setMode("onboarding");
      }
    } catch (err: any) {
      setErrors({ form: mapAuthError(err.code) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
        onLoginSuccess(fullName || user.displayName || "Campus Member");
        onClose();
      } else {
        const nameParts = (user.displayName || "").split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        setRegEmail(user.email || "");
        setPendingGoogleUid(user.uid);
        setMode("onboarding");
      }
    } catch (err: any) {
      setErrors({ form: err.message || "Google sign in failed." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginEmail.trim()) {
      setErrors({ loginEmail: "Enter your registered email address first." });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, loginEmail.trim());
      alert(`Password reset instructions sent to ${loginEmail.trim()}`);
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to send reset link." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      newErrors.regEmail = "Valid email is required.";
    }
    if (!regPassword || regPassword.length < 6) {
      newErrors.regPassword = "Password must be at least 6 characters.";
    }
    if (regPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!dobDay || !dobMonth || !dobYear) {
      newErrors.dob = "Select complete birthdate.";
    }
    const cleanMobile = regMobile.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      newErrors.regMobile = "Valid 10-digit mobile number is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail.trim(), regPassword);
      const uid = userCredential.user.uid;
      const birthdate = `${dobDay}-${dobMonth}-${dobYear}`;

      await setDoc(doc(db, "users", uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: regEmail.trim(),
        birthdate,
        gender,
        mobile: cleanMobile,
        iitCampus,
        cart: [],
        createdAt: new Date().toISOString(),
      });

      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      onRegisterSuccess(fullName);
      onClose();
    } catch (err: any) {
      setErrors({ form: mapAuthError(err.code) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!dobDay || !dobMonth || !dobYear) newErrors.dob = "Select complete birthdate.";
    const cleanMobile = regMobile.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      newErrors.regMobile = "Valid 10-digit mobile number required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const activeUid = pendingGoogleUid || auth.currentUser?.uid;
    if (!activeUid) {
      setErrors({ form: "User session not found. Please log in again." });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const birthdate = `${dobDay}-${dobMonth}-${dobYear}`;
      await setDoc(
        doc(db, "users", activeUid),
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: regEmail.trim() || auth.currentUser?.email || "",
          birthdate,
          gender,
          mobile: cleanMobile,
          iitCampus,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      onLoginSuccess(fullName);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to update profile." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto bg-[#FFF8F0] border-2 border-[#3C1A11] rounded-2xl p-5 sm:p-8 shadow-2xl text-[#3C1A11] max-h-[92vh] flex flex-col">
        <button
          onClick={async () => {
            if (mode === "onboarding") {
              await auth.signOut();
            }
            onClose();
          }}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full border border-[#3C1A11]/20 hover:bg-[#3C1A11] hover:text-[#FFE2C7] transition-colors z-20 cursor-pointer"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {mode !== "onboarding" && (
          <div className="flex mt-8 sm:mt-6 border border-[#3C1A11]/30 rounded-xl bg-[#3C1A11]/5 p-1 mb-5 shrink-0">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 h-9 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                mode === "login" ? "bg-[#3C1A11] text-[#FFE2C7] shadow-sm" : "text-[#3C1A11] hover:bg-[#3C1A11]/10"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 h-9 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                mode === "register" ? "bg-[#3C1A11] text-[#FFE2C7] shadow-sm" : "text-[#3C1A11] hover:bg-[#3C1A11]/10"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="overflow-y-auto pr-1 flex-1">
          {errors.form && (
            <div className="mb-4 p-3 rounded-xl bg-[#D94F27]/10 border border-[#D94F27] text-[#D94F27] text-xs font-bold text-center">
              {errors.form}
            </div>
          )}

          {mode === "login" && (
            <div>
              <div className="mb-4">
                <h2 className="font-anton text-3xl sm:text-4xl uppercase tracking-tight text-[#3C1A11] leading-none mt-1">
                  ACCESS YOUR ACCOUNT
                </h2>
                <p className="text-xs font-semibold text-[#3C1A11]/70 mt-1">
                  Log in to track orders, customize garments, and access student drops.
                </p>
              </div>

              <form onSubmit={handleStandardLogin} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@iitb.ac.in"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] outline-none"
                  />
                  {errors.loginEmail && <span className="text-[10px] font-bold text-[#D94F27] mt-0.5 block">{errors.loginEmail}</span>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black tracking-wider uppercase">Password</label>
                    <button type="button" onClick={handleForgotPassword} className="text-[10px] font-bold text-[#2952CC] hover:underline uppercase cursor-pointer">
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-3.5 pr-12 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-3 text-[10px] font-black uppercase text-[#3C1A11]/60 cursor-pointer"
                    >
                      {showLoginPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {errors.loginPassword && <span className="text-[10px] font-bold text-[#D94F27] mt-0.5 block">{errors.loginPassword}</span>}
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#D94F27] hover:bg-[#F47E20] disabled:bg-[#D94F27]/60 text-[#FFE2C7] font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? "AUTHENTICATING..." : "LOG IN"}
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-11 border border-[#3C1A11] bg-white hover:bg-[#3C1A11]/5 rounded-xl text-xs font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm text-[#3C1A11]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    CONTINUE WITH GOOGLE
                  </button>
                </div>
              </form>
            </div>
          )}

          {mode === "register" && (
            <div>
              <div className="mb-4">
                <h2 className="font-anton text-3xl sm:text-4xl uppercase tracking-tight text-[#3C1A11] leading-none mt-1">
                  JOIN THE COMMUNITY
                </h2>
                <p className="text-xs font-semibold text-[#3C1A11]/70 mt-1">
                  Create your profile for student drops and campus deliveries.
                </p>
              </div>

              <form onSubmit={handleDirectRegistration} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-black tracking-wider uppercase mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ananya"
                      className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] outline-none"
                    />
                    {errors.firstName && <span className="text-[10px] font-bold text-[#D94F27] block mt-0.5">{errors.firstName}</span>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Mehta"
                      className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] outline-none"
                    />
                    {errors.lastName && <span className="text-[10px] font-bold text-[#D94F27] block mt-0.5">{errors.lastName}</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Email ID</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@iitb.ac.in"
                    className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] outline-none"
                  />
                  {errors.regEmail && <span className="text-[10px] font-bold text-[#D94F27] block mt-0.5">{errors.regEmail}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 pl-3 pr-10 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2 top-2.5 text-[9px] font-black tracking-wider uppercase text-[#3C1A11]/60 cursor-pointer"
                      >
                        {showRegPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                    {errors.regPassword && <span className="text-[10px] font-bold text-[#D94F27] block mt-0.5">{errors.regPassword}</span>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 pl-3 pr-10 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-2.5 text-[9px] font-black tracking-wider uppercase text-[#3C1A11]/60 cursor-pointer"
                      >
                        {showConfirmPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="text-[10px] font-bold text-[#D94F27] block mt-0.5">{errors.confirmPassword}</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Select Your IIT Campus</label>
                  <select
                    value={iitCampus}
                    onChange={(e) => setIitCampus(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-lg border border-[#3C1A11] bg-transparent text-xs font-semibold outline-none cursor-pointer"
                  >
                    {CAMPUS_OPTIONS.map((campus) => (
                      <option key={campus} value={campus} className="bg-[#FFF8F0]">{campus}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Birthdate</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select value={dobDay} onChange={(e) => setDobDay(e.target.value)} className="h-10 px-2 rounded-lg border border-[#3C1A11] bg-transparent text-xs font-semibold outline-none">
                      <option value="" disabled>Day</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)} className="bg-[#FFF8F0]">{i + 1}</option>
                      ))}
                    </select>
                    <select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} className="h-10 px-2 rounded-lg border border-[#3C1A11] bg-transparent text-xs font-semibold outline-none">
                      <option value="" disabled>Month</option>
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                        <option key={m} value={m} className="bg-[#FFF8F0]">{m}</option>
                      ))}
                    </select>
                    <select value={dobYear} onChange={(e) => setDobYear(e.target.value)} className="h-10 px-2 rounded-lg border border-[#3C1A11] bg-transparent text-xs font-semibold outline-none">
                      <option value="" disabled>Year</option>
                      {Array.from({ length: 28 }, (_, i) => {
                        const y = 2008 - i;
                        return <option key={y} value={String(y)} className="bg-[#FFF8F0]">{y}</option>;
                      })}
                    </select>
                  </div>
                  {errors.dob && <span className="text-[10px] font-bold text-[#D94F27] block mt-0.5">{errors.dob}</span>}
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="h-10 px-3 flex items-center justify-center rounded-lg border border-[#3C1A11] bg-[#3C1A11]/5 text-xs font-black">+91</div>
                    <input
                      type="tel"
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="98765 43210"
                      className="flex-1 h-10 px-3 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] outline-none"
                    />
                  </div>
                  {errors.regMobile && <span className="text-[10px] font-bold text-[#D94F27] block mt-0.5">{errors.regMobile}</span>}
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Gender</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 border border-[#3C1A11]/30 rounded-xl bg-[#3C1A11]/5">
                    {(["Male", "Female", "Other"] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setGender(item)}
                        className={`h-8 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          gender === item ? "bg-[#3C1A11] text-[#FFE2C7] shadow-sm" : "text-[#3C1A11] hover:bg-[#3C1A11]/10"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#D94F27] hover:bg-[#F47E20] text-[#FFE2C7] font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    {isLoading ? "CREATING PROFILE..." : "REGISTER YOURSELF"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {mode === "onboarding" && (
            <div>
              <div className="mb-4">
                <span className="text-[10px] font-black tracking-widest text-[#D94F27] uppercase">ONE LAST STEP</span>
                <h2 className="font-anton text-3xl sm:text-4xl uppercase tracking-tight text-[#3C1A11] leading-none mt-1">
                  COMPLETE YOUR PROFILE
                </h2>
                <p className="text-xs font-semibold text-[#3C1A11]/70 mt-1">
                  We need your campus details to route your orders and student rewards.
                </p>
              </div>

              <form onSubmit={handleCompleteOnboarding} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-black tracking-wider uppercase mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] outline-none"
                    />
                    {errors.firstName && <span className="text-[10px] font-bold text-[#D94F27] block mt-0.5">{errors.firstName}</span>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] outline-none"
                    />
                    {errors.lastName && <span className="text-[10px] font-bold text-[#D94F27] block mt-0.5">{errors.lastName}</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={regEmail}
                    readOnly
                    className="w-full h-10 px-3 rounded-lg border border-[#3C1A11]/30 bg-[#3C1A11]/5 text-sm font-medium text-[#3C1A11]/70 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Select Your IIT Campus</label>
                  <select
                    value={iitCampus}
                    onChange={(e) => setIitCampus(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-lg border border-[#3C1A11] bg-transparent text-xs font-semibold outline-none cursor-pointer"
                  >
                    {CAMPUS_OPTIONS.map((campus) => (
                      <option key={campus} value={campus} className="bg-[#FFF8F0]">{campus}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Birthdate</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select value={dobDay} onChange={(e) => setDobDay(e.target.value)} className="h-10 px-2 rounded-lg border border-[#3C1A11] bg-transparent text-xs font-semibold outline-none">
                      <option value="" disabled>Day</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)} className="bg-[#FFF8F0]">{i + 1}</option>
                      ))}
                    </select>
                    <select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} className="h-10 px-2 rounded-lg border border-[#3C1A11] bg-transparent text-xs font-semibold outline-none">
                      <option value="" disabled>Month</option>
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                        <option key={m} value={m} className="bg-[#FFF8F0]">{m}</option>
                      ))}
                    </select>
                    <select value={dobYear} onChange={(e) => setDobYear(e.target.value)} className="h-10 px-2 rounded-lg border border-[#3C1A11] bg-transparent text-xs font-semibold outline-none">
                      <option value="" disabled>Year</option>
                      {Array.from({ length: 28 }, (_, i) => {
                        const y = 2008 - i;
                        return <option key={y} value={String(y)} className="bg-[#FFF8F0]">{y}</option>;
                      })}
                    </select>
                  </div>
                  {errors.dob && <span className="text-[10px] font-bold text-[#D94F27] block mt-0.5">{errors.dob}</span>}
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="h-10 px-3 flex items-center justify-center rounded-lg border border-[#3C1A11] bg-[#3C1A11]/5 text-xs font-black">+91</div>
                    <input
                      type="tel"
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="98765 43210"
                      className="flex-1 h-10 px-3 rounded-lg border border-[#3C1A11] bg-transparent text-sm font-medium focus:border-[#2952CC] outline-none"
                    />
                  </div>
                  {errors.regMobile && <span className="text-[10px] font-bold text-[#D94F27] block mt-0.5">{errors.regMobile}</span>}
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1">Gender</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 border border-[#3C1A11]/30 rounded-xl bg-[#3C1A11]/5">
                    {(["Male", "Female", "Other"] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setGender(item)}
                        className={`h-8 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          gender === item ? "bg-[#3C1A11] text-[#FFE2C7] shadow-sm" : "text-[#3C1A11] hover:bg-[#3C1A11]/10"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#D94F27] hover:bg-[#F47E20] text-[#FFE2C7] font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    {isLoading ? "SAVING..." : "SAVE PROFILE & ENTER"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};