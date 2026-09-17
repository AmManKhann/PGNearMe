"use client";

import { useState, useEffect, useCallback } from "react";

export function TypewriterText({
  texts,
  speed = 80,
  deleteSpeed = 40,
  pause = 2000,
}: {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pause?: number;
}) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const text = texts[phraseIndex % texts.length];

  const tick = useCallback(() => {
    if (!isDeleting) {
      if (displayed.length < text.length) {
        setDisplayed(text.slice(0, displayed.length + 1));
      } else {
        setTimeout(() => setIsDeleting(true), pause);
        return;
      }
    } else {
      if (displayed.length > 0) {
        setDisplayed(displayed.slice(0, -1));
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % texts.length);
      }
    }
  }, [displayed, isDeleting, text, pause, texts.length]);

  useEffect(() => {
    const timer = setTimeout(tick, isDeleting ? deleteSpeed : speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, speed, deleteSpeed]);

  return (
    <span className="inline-block">
      {displayed}
      <span className="inline-block w-[3px] h-[1em] bg-accent ml-0.5 align-middle animate-pulse" />
    </span>
  );
}