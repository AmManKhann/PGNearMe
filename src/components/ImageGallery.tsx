"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Pagination } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper/types";
import { ChevronLeft, ChevronRight, X, Building2 } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/keyboard";

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const mainRef = useRef<SwiperClass | null>(null);
  const lightboxRef = useRef<SwiperClass | null>(null);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxActive, setLightboxActive] = useState(0);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    if (lightboxOpen) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen]);

  if (!images.length) {
    return (
      <div className="relative h-64 md:h-80 bg-surface-alt overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <Building2 className="w-20 h-20 text-primary/30" />
        </div>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setLightboxActive(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="relative bg-surface-alt overflow-hidden group">
        <Swiper
          modules={[Pagination, Keyboard]}
          spaceBetween={0}
          slidesPerView={1}
          grabCursor
          keyboard={{ enabled: true }}
          pagination={{ clickable: true, dynamicBullets: true }}
          onSwiper={(swiper) => {
            mainRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActive(swiper.realIndex)}
          className="pg-gallery-swiper w-full h-64 md:h-80"
        >
          {images.map((src, i) => (
            <SwiperSlide key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => openLightbox(i)}
                aria-label={`View ${name} photo ${i + 1} in fullscreen`}
                className="relative block w-full h-64 md:h-80 cursor-zoom-in"
              >
                <Image
                  src={src}
                  alt={`${name} photo ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                  unoptimized
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              mainRef.current?.slidePrev();
            }}
            aria-label="Previous photo"
            className={`pointer-events-auto w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/40 text-white backdrop-blur-sm flex items-center justify-center transition-all hover:bg-black/60 ${
              active === 0
                ? "opacity-0 invisible"
                : "opacity-0 group-hover:opacity-100 md:opacity-100"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              mainRef.current?.slideNext();
            }}
            aria-label="Next photo"
            className={`pointer-events-auto w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/40 text-white backdrop-blur-sm flex items-center justify-center transition-all hover:bg-black/60 ${
              active === images.length - 1
                ? "opacity-0 invisible"
                : "opacity-0 group-hover:opacity-100 md:opacity-100"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs font-semibold backdrop-blur-sm pointer-events-none">
          {active + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-surface border-t border-border">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => {
                mainRef.current?.slideTo(i);
                setActive(i);
              }}
              aria-label={`Go to ${name} photo ${i + 1}`}
              className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all ring-2 ${
                active === i ? "ring-primary" : "ring-transparent hover:ring-primary/40"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close fullscreen viewer"
            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold backdrop-blur-sm pointer-events-none">
            {lightboxActive + 1} / {images.length}
          </div>

          <Swiper
            modules={[Keyboard]}
            spaceBetween={0}
            slidesPerView={1}
            initialSlide={lightboxActive}
            grabCursor
            keyboard={{ enabled: true }}
            onSwiper={(swiper) => {
              lightboxRef.current = swiper;
            }}
            onSlideChange={(swiper) => setLightboxActive(swiper.realIndex)}
            className="pg-lightbox-swiper w-full h-full"
          >
            {images.map((src, i) => (
              <SwiperSlide key={`${src}-${i}`}>
                <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
                  <Image
                    src={src}
                    alt={`${name} photo ${i + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              lightboxRef.current?.slidePrev();
            }}
            aria-label="Previous photo"
            className={`absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm flex items-center justify-center transition-all ${
              lightboxActive === 0 ? "hidden" : ""
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              lightboxRef.current?.slideNext();
            }}
            aria-label="Next photo"
            className={`absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm flex items-center justify-center transition-all ${
              lightboxActive === images.length - 1 ? "hidden" : ""
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
}