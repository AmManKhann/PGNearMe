"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const phrases = [
  { text: "No Brokerage", gradient: "from-[#F7A800] to-[#FF6F61]", bar: "bg-[#F7A800]" },
  { text: "Direct Deal", gradient: "from-[#7C3AED] to-[#C084FC]", bar: "bg-[#7C3AED]" },
  { text: "Ready to Move", gradient: "from-[#12B76A] to-[#2BC3AE]", bar: "bg-[#12B76A]" },
  { text: "Affordable", gradient: "from-[#0A9D8C] to-[#38BDF8]", bar: "bg-[#0A9D8C]" },
];

type Phase = "typing" | "striking" | "erasing";

const TYPE_SPEED = 70;
const HOLD_AFTER_TYPE = 900;
const STRIKE_HOLD = 650;
const ERASE_HOLD = 200;

export function AnimatedBanner() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  const phrase = phrases[index % phrases.length];
  const struck = phase === "striking" || phase === "erasing";

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (displayed.length < phrase.text.length) {
        timer = setTimeout(
          () => setDisplayed(phrase.text.slice(0, displayed.length + 1)),
          TYPE_SPEED
        );
      } else {
        timer = setTimeout(() => setPhase("striking"), HOLD_AFTER_TYPE);
      }
    } else if (phase === "striking") {
      timer = setTimeout(() => setPhase("erasing"), STRIKE_HOLD);
    } else {
      timer = setTimeout(() => {
        setDisplayed("");
        setIndex((prev) => (prev + 1) % phrases.length);
        setPhase("typing");
      }, ERASE_HOLD);
    }
    return () => clearTimeout(timer);
  }, [phase, displayed, phrase.text]);

  return (
    <div className="relative overflow-hidden bg-surface-alt border-b border-border">
      <div
        aria-hidden
        className={`absolute inset-0 opacity-10 bg-gradient-to-r ${phrase.gradient}`}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-2.5 text-center">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--neon-purple)] shrink-0 animate-neon-pulse" />
          <span className="text-base sm:text-2xl font-bold text-foreground whitespace-nowrap">
            Find PGs with
          </span>
          <span className="relative inline-block text-left align-middle min-w-[8.5rem] sm:min-w-[12rem]">
            <span
              className={`bg-gradient-to-r ${phrase.gradient} bg-clip-text text-transparent text-base sm:text-2xl font-extrabold`}
            >
              {displayed}
            </span>
            <span
              aria-hidden
              className={`absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full ${phrase.bar} origin-left transition-transform duration-300 ease-out ${
                struck ? "scale-x-100" : "scale-x-0"
              }`}
            />
            {phase === "typing" && (
              <span className="inline-block w-[3px] h-[1em] bg-foreground/70 ml-0.5 align-middle animate-pulse" />
            )}
          </span>
        </div>
        <span className="sr-only">
          No Brokerage, Direct Deal, Ready to Move, Affordable
        </span>
      </div>
    </div>
  );
}