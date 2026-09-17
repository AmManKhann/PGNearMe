"use client";

import { useState, useEffect } from "react";

const phrases = [
  "No Brokerage",
  "Verified Listings",
  "Direct Owner Contact",
  "Best Price Guaranteed",
  "Safe & Secure",
];

export function RotatingText() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const cycle = () => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setIsVisible(true);
      }, 400);
    };

    const interval = setInterval(cycle, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block transition-all duration-400 ease-in-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2"
      }`}
    >
      {phrases[index]}
    </span>
  );
}