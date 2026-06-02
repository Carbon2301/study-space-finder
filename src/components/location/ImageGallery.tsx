"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export default function ImageGallery({ images, name }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      {/* Gallery */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-72 md:h-96 rounded-2xl overflow-hidden">
        {/* Main image */}
        <div
          className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => {
            setActiveIdx(0);
            setLightboxOpen(true);
          }}
        >
          <Image
            src={images[0]}
            alt={`${name} - main`}
            fill
            className="object-cover group-hover:brightness-90 transition-all duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/50 rounded-full p-3">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Side images */}
        {images.slice(1, 3).map((img, i) => (
          <div
            key={i}
            className="hidden md:block relative col-span-2 cursor-pointer group"
            onClick={() => {
              setActiveIdx(i + 1);
              setLightboxOpen(true);
            }}
          >
            <Image
              src={img}
              alt={`${name} - ${i + 2}`}
              fill
              className="object-cover group-hover:brightness-90 transition-all duration-300"
              sizes="25vw"
            />
            {i === 1 && images.length > 3 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  +{images.length - 3} ảnh khác
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-7 h-7" />
            </button>

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((p) => (p - 1 + images.length) % images.length);
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <motion.div
              key={activeIdx}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-4xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[activeIdx]}
                alt={`${name} - ${activeIdx + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((p) => (p + 1) % images.length);
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIdx(i);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === activeIdx ? "bg-white w-6" : "bg-white/40"
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
