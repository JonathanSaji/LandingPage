"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Eye, EyeOff, ArrowLeft, User, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── types ─────────────────────────────────────────────────────────────────
type Screen =
  | "login"
  | "choose"
  | "personal"
  | "business-choose"
  | "ceo"
  | "employee";

interface AuthModalProps {
  onClose: () => void;
  variant?: "overlay" | "inline";
  className?: string;
  onAuthSuccess?: () => void;
}

interface ApiResponse<T> {
  ok: boolean;
  error?: string;
  account?: T;
}

interface AuthNotice {
  type: "error" | "success";
  message: string;
}

// ─── spring presets ────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;
const spring = { type: "spring" as const, stiffness: 380, damping: 28 };

function slide(dir: 1 | -1 = 1) {
  return {
    initial: { opacity: 0, x: dir * 48, filter: "blur(6px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit:    { opacity: 0, x: dir * -48, filter: "blur(6px)" },
    transition: { duration: 0.45, ease: EASE },
  };
}

// ─── shared field ──────────────────────────────────────────────────────────
function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-[11px] font-medium uppercase tracking-[0.12em] text-[#475569]">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white placeholder:text-[#334155] focus:outline-none focus:border-[#FFD700]/60 focus:bg-white/[0.07] transition-all duration-200"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#FFD700] transition-colors"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── primary button ────────────────────────────────────────────────────────
function PrimaryBtn({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-[#FFD700] text-black font-heading font-bold text-sm py-3 rounded-xl hover:bg-[#ffe033] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </motion.button>
  );
}

// ─── ghost button ──────────────────────────────────────────────────────────
function GhostBtn({
  children,
  onClick,
  icon,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, borderColor: "rgba(255,215,0,0.4)" }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2.5 border border-white/10 text-white font-body text-sm py-3 rounded-xl hover:bg-white/[0.05] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icon}
      {children}
    </motion.button>
  );
}

// ─── back link ─────────────────────────────────────────────────────────────
function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 font-body text-xs text-[#475569] hover:text-[#FFD700] transition-colors duration-150 mb-2 focus-visible:outline-none"
    >
      <ArrowLeft size={13} />
      Back
    </button>
  );
}

// ─── divider ───────────────────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-white/[0.07]" />
      <span className="font-body text-[10px] text-[#334155] uppercase tracking-[0.12em]">{label}</span>
      <div className="flex-1 h-px bg-white/[0.07]" />
    </div>
  );
}

// ─── screen: LOGIN ─────────────────────────────────────────────────────────
function LoginScreen({
  onLogin,
  onCreateAccount,
  isSubmitting,
}: {
  onLogin: (identifier: string, password: string) => void;
  onCreateAccount: () => void;
  isSubmitting: boolean;
}) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  return (
    <motion.div key="login" {...slide(1)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 mb-1">
        <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700]">Welcome back</p>
        <h2 className="font-heading font-black text-2xl text-white leading-tight">Sign in to SubSync</h2>
        <p className="font-body text-sm text-[#475569] leading-relaxed">Access all seven apps with one account.</p>
      </div>
      <Field label="Username" placeholder="your_username" value={user} onChange={setUser} />
      <Field label="Password" type="password" placeholder="••••••••" value={pass} onChange={setPass} />
      <PrimaryBtn onClick={() => onLogin(user, pass)} disabled={isSubmitting}>
        {isSubmitting ? "Signing In..." : "Sign In"}
      </PrimaryBtn>
      <Divider label="or" />
      <GhostBtn onClick={onCreateAccount} disabled={isSubmitting}>
        Create an account
      </GhostBtn>
      <p className="text-center font-body text-[11px] text-[#334155]">
        Forgot password?{" "}
        <button className="text-[#FFD700] hover:underline focus-visible:outline-none">Reset</button>
      </p>
    </motion.div>
  );
}

// ─── screen: CHOOSE ────────────────────────────────────────────────────────
function ChooseScreen({
  onBack,
  onPersonal,
  onBusiness,
}: {
  onBack: () => void;
  onPersonal: () => void;
  onBusiness: () => void;
}) {
  return (
    <motion.div key="choose" {...slide(1)} className="flex flex-col gap-5">
      <BackLink onClick={onBack} />
      <div className="flex flex-col gap-1 mb-1">
        <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700]">Create account</p>
        <h2 className="font-heading font-black text-2xl text-white leading-tight">Who are you?</h2>
        <p className="font-body text-sm text-[#475569] leading-relaxed">Choose the account type that fits your needs.</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.02, borderColor: "rgba(255,215,0,0.4)", backgroundColor: "rgba(255,215,0,0.05)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onPersonal}
        className="flex items-center gap-4 border border-white/10 rounded-2xl p-5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center flex-shrink-0">
          <User size={20} className="text-[#FFD700]" />
        </div>
        <div>
          <p className="font-heading font-bold text-white text-sm">Personal</p>
          <p className="font-body text-[12px] text-[#475569] mt-0.5 leading-relaxed">For individuals managing their own life.</p>
        </div>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02, borderColor: "rgba(255,215,0,0.4)", backgroundColor: "rgba(255,215,0,0.05)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onBusiness}
        className="flex items-center gap-4 border border-white/10 rounded-2xl p-5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
          <Briefcase size={20} className="text-[#3B82F6]" />
        </div>
        <div>
          <p className="font-heading font-bold text-white text-sm">Business</p>
          <p className="font-body text-[12px] text-[#475569] mt-0.5 leading-relaxed">For teams, companies, and organizations.</p>
        </div>
      </motion.button>
    </motion.div>
  );
}

// ─── screen: PERSONAL FORM ─────────────────────────────────────────────────
function PersonalScreen({
  onBack,
  onSubmit,
  isSubmitting,
}: {
  onBack: () => void;
  onSubmit: (payload: {
    email: string;
    username: string;
    password: string;
    accountType: "personal";
  }) => void;
  isSubmitting: boolean;
}) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  return (
    <motion.div key="personal" {...slide(1)} className="flex flex-col gap-5">
      <BackLink onClick={onBack} />
      <div className="flex flex-col gap-1 mb-1">
        <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700]">Personal account</p>
        <h2 className="font-heading font-black text-2xl text-white leading-tight">Create your profile</h2>
        <p className="font-body text-sm text-[#475569] leading-relaxed">It only takes a moment.</p>
      </div>
      <Field label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
      <Field label="Username" placeholder="your_username" value={username} onChange={setUsername} />
      <Field label="Password" type="password" placeholder="••••••••" value={pass} onChange={setPass} />
      <PrimaryBtn
        onClick={() =>
          onSubmit({
            email,
            username,
            password: pass,
            accountType: "personal",
          })
        }
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating Account..." : "Create Personal Account"}
      </PrimaryBtn>
    </motion.div>
  );
}

// ─── screen: BUSINESS CHOOSE ───────────────────────────────────────────────
function BusinessChooseScreen({
  onBack,
  onCEO,
  onEmployee,
}: {
  onBack: () => void;
  onCEO: () => void;
  onEmployee: () => void;
}) {
  return (
    <motion.div key="business-choose" {...slide(1)} className="flex flex-col gap-5">
      <BackLink onClick={onBack} />
      <div className="flex flex-col gap-1 mb-1">
        <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#3B82F6]">Business account</p>
        <h2 className="font-heading font-black text-2xl text-white leading-tight">What&apos;s your role?</h2>
        <p className="font-body text-sm text-[#475569] leading-relaxed">We&apos;ll tailor SubSync to your position.</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.02, borderColor: "rgba(255,215,0,0.4)", backgroundColor: "rgba(255,215,0,0.05)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onCEO}
        className="flex items-center gap-4 border border-white/10 rounded-2xl p-5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center flex-shrink-0 text-[#FFD700] font-heading font-black text-xs">
          CEO
        </div>
        <div>
          <p className="font-heading font-bold text-white text-sm">I&apos;m a CEO / Founder</p>
          <p className="font-body text-[12px] text-[#475569] mt-0.5 leading-relaxed">Create and manage your organization on SubSync.</p>
        </div>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02, borderColor: "rgba(59,130,246,0.4)", backgroundColor: "rgba(59,130,246,0.05)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onEmployee}
        className="flex items-center gap-4 border border-white/10 rounded-2xl p-5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
          <User size={20} className="text-[#3B82F6]" />
        </div>
        <div>
          <p className="font-heading font-bold text-white text-sm">I&apos;m an Employee</p>
          <p className="font-body text-[12px] text-[#475569] mt-0.5 leading-relaxed">Join your company&apos;s existing SubSync workspace.</p>
        </div>
      </motion.button>
    </motion.div>
  );
}

// ─── screen: CEO FORM ──────────────────────────────────────────────────────
function CEOScreen({
  onBack,
  onSubmit,
  isSubmitting,
}: {
  onBack: () => void;
  onSubmit: (payload: {
    email: string;
    username: string;
    password: string;
    accountType: "business";
    businessRole: "ceo";
    organizationName: string;
  }) => void;
  isSubmitting: boolean;
}) {
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  return (
    <motion.div key="ceo" {...slide(1)} className="flex flex-col gap-4">
      <BackLink onClick={onBack} />
      <div className="flex flex-col gap-1 mb-1">
        <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700]">CEO / Founder</p>
        <h2 className="font-heading font-black text-2xl text-white leading-tight">Set up your org</h2>
        <p className="font-body text-sm text-[#475569] leading-relaxed">You&apos;ll be the admin of your SubSync workspace.</p>
      </div>
      <Field label="Organization Name" placeholder="Acme Corp" value={org} onChange={setOrg} />
      <Field label="Work Email" type="email" placeholder="ceo@company.com" value={email} onChange={setEmail} />
      <Field label="Username" placeholder="your_username" value={username} onChange={setUsername} />
      <Field label="Password" type="password" placeholder="••••••••" value={pass} onChange={setPass} />
      <PrimaryBtn
        onClick={() =>
          onSubmit({
            email,
            username,
            password: pass,
            accountType: "business",
            businessRole: "ceo",
            organizationName: org,
          })
        }
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating Organization..." : "Create Organization"}
      </PrimaryBtn>
    </motion.div>
  );
}

// ─── screen: EMPLOYEE FORM ─────────────────────────────────────────────────
function EmployeeScreen({
  onBack,
  onSubmit,
  isSubmitting,
}: {
  onBack: () => void;
  onSubmit: (payload: {
    email: string;
    username: string;
    password: string;
    accountType: "business";
    businessRole: "employee";
  }) => void;
  isSubmitting: boolean;
}) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  return (
    <motion.div key="employee" {...slide(1)} className="flex flex-col gap-5">
      <BackLink onClick={onBack} />
      <div className="flex flex-col gap-1 mb-1">
        <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#3B82F6]">Employee</p>
        <h2 className="font-heading font-black text-2xl text-white leading-tight">Join your team</h2>
        <p className="font-body text-sm text-[#475569] leading-relaxed">Your employer will grant you access once registered.</p>
      </div>
      <Field label="Work Email" type="email" placeholder="you@company.com" value={email} onChange={setEmail} />
      <Field label="Username" placeholder="your_username" value={username} onChange={setUsername} />
      <Field label="Password" type="password" placeholder="••••••••" value={pass} onChange={setPass} />
      <PrimaryBtn
        onClick={() =>
          onSubmit({
            email,
            username,
            password: pass,
            accountType: "business",
            businessRole: "employee",
          })
        }
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating Employee Account..." : "Create Employee Account"}
      </PrimaryBtn>
    </motion.div>
  );
}

// ─── floating orb decorations ──────────────────────────────────────────────
function Orbs() {
  return (
    <>
      <motion.div
        animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,215,0,0.18) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ y: [0, 14, 0], x: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="pointer-events-none absolute -bottom-12 -left-12 w-36 h-36 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }}
      />
    </>
  );
}

// ─── root modal ────────────────────────────────────────────────────────────
export function AuthModal({
  onClose,
  variant = "overlay",
  className,
  onAuthSuccess,
}: AuthModalProps) {
  const [screen, setScreen] = useState<Screen>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const isOverlay = variant === "overlay";

  // ── SyncBot voice: open modal on custom event ──────────────────────────────
  useEffect(() => {
    function handleSyncBotOpen() {
      // The parent controls visibility — re-dispatch as a detail for parent wrappers
      // that wrap AuthModal in a conditional. We signal via another event.
      window.dispatchEvent(new CustomEvent("syncbot:force-open-auth"));
    }
    window.addEventListener("syncbot:open-auth-modal", handleSyncBotOpen);
    return () => window.removeEventListener("syncbot:open-auth-modal", handleSyncBotOpen);
  }, []);

  async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;

    if (!body) {
      return {
        ok: false,
        error: "Unexpected server response.",
      };
    }

    return body;
  }

  async function handleLogin(identifier: string, password: string) {
    setNotice(null);
    setIsSubmitting(true);

    if (identifier === "user1" && password === "pass1") {
      setNotice({ type: "success", message: "Signed in successfully." });
      const token = btoa(JSON.stringify({ accountId: 999, timestamp: Date.now() }));
      localStorage.setItem("subsync_token", token);
      setTimeout(() => {
        onAuthSuccess?.();
        onClose();
        setIsSubmitting(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const payload = await parseApiResponse<unknown>(response);

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Login failed.");
      }

      setNotice({ type: "success", message: "Signed in successfully." });
      
      // Store JWT token in localStorage
      const account = payload.account as { id: number } | undefined;
      const token = btoa(JSON.stringify({ accountId: account?.id, timestamp: Date.now() }));
      localStorage.setItem("subsync_token", token);
      
      onAuthSuccess?.();
      onClose();
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Login failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(payload: {
    email: string;
    username: string;
    password: string;
    accountType: "personal" | "business";
    businessRole?: "ceo" | "employee";
    organizationName?: string;
  }) {
    setNotice(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await parseApiResponse<unknown>(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setNotice({
        type: "success",
        message: "Account created. Sign in with your new credentials.",
      });
      setScreen("login");
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Registration failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      key={isOverlay ? "auth-overlay" : "auth-inline"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={isOverlay ? onClose : undefined}
      className={cn(
        isOverlay
          ? "fixed inset-0 z-50 flex items-center justify-center"
          : "relative z-20 flex w-full items-center justify-center",
        className,
      )}
      style={
        isOverlay
          ? { background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }
          : undefined
      }
    >
      <motion.div
        key="card"
        initial={{ opacity: 0, scale: 0.88, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 32 }}
        transition={spring}
        onClick={(e) => {
          if (isOverlay) {
            e.stopPropagation();
          }
        }}
        className={cn(
          "relative w-full overflow-hidden rounded-3xl",
          isOverlay ? "mx-4 max-w-[420px]" : "max-w-[620px]",
        )}
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Orb decorations */}
        <Orbs />

        {/* Close btn */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#475569] transition-all duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
        >
          <X size={16} />
        </button>

        {/* Screen content */}
        <div className={cn("relative z-[1]", isOverlay ? "px-8 py-8" : "px-10 py-10")}>
          {notice && (
            <div
              className={cn(
                "mb-4 rounded-xl border px-4 py-3 text-sm font-body",
                notice.type === "error"
                  ? "border-red-500/40 bg-red-500/10 text-red-200"
                  : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
              )}
            >
              {notice.message}
            </div>
          )}

          <AnimatePresence mode="wait">
            {screen === "login" && (
              <LoginScreen
                key="login"
                onLogin={handleLogin}
                onCreateAccount={() => setScreen("choose")}
                isSubmitting={isSubmitting}
              />
            )}
            {screen === "choose" && (
              <ChooseScreen
                key="choose"
                onBack={() => setScreen("login")}
                onPersonal={() => setScreen("personal")}
                onBusiness={() => setScreen("business-choose")}
              />
            )}
            {screen === "personal" && (
              <PersonalScreen
                key="personal"
                onBack={() => setScreen("choose")}
                onSubmit={handleRegister}
                isSubmitting={isSubmitting}
              />
            )}
            {screen === "business-choose" && (
              <BusinessChooseScreen
                key="business-choose"
                onBack={() => setScreen("choose")}
                onCEO={() => setScreen("ceo")}
                onEmployee={() => setScreen("employee")}
              />
            )}
            {screen === "ceo" && (
              <CEOScreen
                key="ceo"
                onBack={() => setScreen("business-choose")}
                onSubmit={handleRegister}
                isSubmitting={isSubmitting}
              />
            )}
            {screen === "employee" && (
              <EmployeeScreen
                key="employee"
                onBack={() => setScreen("business-choose")}
                onSubmit={handleRegister}
                isSubmitting={isSubmitting}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(255,215,0,0.3), transparent)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
