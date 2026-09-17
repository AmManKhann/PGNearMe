"use client";

import { useState } from "react";
import { Mail, Phone, Send, ShieldCheck, RefreshCw } from "lucide-react";
import {
  generateOTP,
  getTargetType,
  isValidEmail,
  isValidPhone,
  normalizePhone,
} from "@/lib/auth";

interface OTPVerifyProps {
  onVerified: (target: string) => void;
  submitLabel?: string;
}

export function OTPVerify({ onVerified, submitLabel = "Verify & Continue" }: OTPVerifyProps) {
  const [target, setTarget] = useState("");
  const [stage, setStage] = useState<"input" | "otp">("input");
  const [otp, setOtp] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const targetType = getTargetType(target);

  const sendOTP = () => {
    setError("");
    if (!isValidEmail(target) && !isValidPhone(target)) {
      setError(
        "Enter a valid 10-digit mobile number (e.g. 98765 43210) or email address."
      );
      return;
    }
    setSending(true);
    setTimeout(() => {
      const code = generateOTP();
      setSentCode(code);
      setStage("otp");
      setSending(false);
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }, 800);
  };

  const verify = () => {
    setError("");
    if (otp.trim() !== sentCode) {
      setError("Incorrect OTP. Please check and try again.");
      return;
    }
    onVerified(
      targetType === "phone" ? `+91 ${normalizePhone(target)}` : target.trim().toLowerCase()
    );
  };

  return (
    <div className="space-y-5">
      {stage === "input" ? (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {targetType === "phone" ? "Mobile Number" : "Phone or Email"}
            </label>
            <div className="relative">
              {targetType === "phone" ? (
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-light" />
              ) : (
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-light" />
              )}
              <input
                type="text"
                placeholder="Mobile number or email"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
              />
            </div>
            {targetType === "phone" && (
              <p className="text-xs text-muted mt-1">
                We&apos;ll send a one-time password (OTP) to{" "}
                <span className="font-medium text-foreground">+91 {normalizePhone(target)}</span> via SMS.
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={sendOTP}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-all neon-glow disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending OTP..." : "Send OTP"}
          </button>
        </>
      ) : (
        <>
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-primary-light" />
              <p className="text-sm font-medium text-foreground">
                OTP sent to{" "}
                {targetType === "phone"
                  ? `+91 ${normalizePhone(target)}`
                  : target.trim().toLowerCase()}
              </p>
            </div>
            <p className="text-xs text-muted">
              Dev mode: your verification code is{" "}
              <span className="font-mono font-bold text-secondary text-sm tracking-widest bg-secondary/10 px-2 py-0.5 rounded">{sentCode}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm tracking-widest text-center text-lg search-input focus:border-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={verify}
            disabled={otp.length !== 6}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-all neon-glow disabled:opacity-60"
          >
            {submitLabel}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              onClick={() => {
                setStage("input");
                setOtp("");
                setError("");
              }}
              className="text-muted hover:text-primary-light transition-colors"
            >
              Change number / email
            </button>
            <button
              onClick={sendOTP}
              disabled={countdown > 0}
              className="flex items-center gap-1 text-primary-light hover:text-primary-light disabled:text-muted disabled:no-underline transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}