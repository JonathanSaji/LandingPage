"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

// Spring animation preset
const spring = { type: "spring" as const, stiffness: 380, damping: 28 };

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Missing or invalid email verification token.");
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`, {
          method: "GET",
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Verification failed.");
        }

        if (isMounted) {
          setStatus("success");
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          setErrorMsg(err instanceof Error ? err.message : "Verification failed.");
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleContinue = () => {
    if (status === "success") {
      // Go home and trigger the login modal using query param
      router.push("/?verified=true");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[420px] mx-4 overflow-hidden rounded-3xl"
         style={{
           background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
           border: "1px solid rgba(255,255,255,0.1)",
           boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)"
         }}>
      
      {/* Glow effect at the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(to right, transparent, rgba(255,214,10,0.3), transparent)"
        }}
      />

      <div className="px-8 py-10 flex flex-col items-center text-center">
        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-8">
          <span className="font-heading font-black text-xl tracking-[0.05em] text-white">
            SUB<span style={{ color: "#FFD60A" }}>SYNC</span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.03] border border-white/10">
                <Loader2 className="w-8 h-8 text-[#FFD60A] animate-spin" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl text-white mb-2">Verifying your email</h2>
                <p className="font-body text-sm text-[#a1a1a6] leading-relaxed px-4">
                  Please wait while we confirm your email verification token with the database...
                </p>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={spring}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                {/* Radial glow */}
                <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm -z-10" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl text-white mb-2">Verification Successful</h2>
                <p className="font-body text-sm text-[#a1a1a6] leading-relaxed px-4">
                  Your email address has been successfully verified. You are now ready to log in.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
                className="w-full bg-[#FFD60A] text-black font-heading font-bold text-sm py-3 px-6 rounded-xl hover:bg-[#ffe566] transition-colors duration-150 mt-2 focus:outline-none focus:ring-2 focus:ring-[#FFD60A] focus:ring-offset-2 focus:ring-offset-black"
              >
                Go to Sign In
              </motion.button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={spring}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30">
                <XCircle className="w-8 h-8 text-red-400" />
                {/* Radial glow */}
                <div className="absolute -inset-1 rounded-full bg-red-500/20 blur-sm -z-10" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl text-white mb-2">Verification Failed</h2>
                <p className="font-body text-sm text-red-200 bg-red-950/20 border border-red-900/30 rounded-xl px-4 py-2 mt-1 mx-2 leading-relaxed">
                  {errorMsg || "The verification link is invalid or has expired."}
                </p>
                <p className="font-body text-xs text-[#a1a1a6] mt-4 px-4">
                  Please make sure you copied the correct link, or request a new verification email.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
                className="w-full bg-white/[0.05] border border-white/10 text-white font-heading font-bold text-sm py-3 px-6 rounded-xl hover:bg-white/[0.08] transition-colors duration-150 mt-2 focus:outline-none focus:ring-2 focus:ring-[#FFD60A] focus:ring-offset-2 focus:ring-offset-black"
              >
                Back to Home
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden font-sans">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(circle, rgba(255,214,10,0.08) 0%, transparent 70%)"
        }}
        aria-hidden
      />
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }}
        aria-hidden
      />
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-[#FFD60A] animate-spin" />
          <p className="text-[#a1a1a6] text-sm font-body">Loading verification page...</p>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
