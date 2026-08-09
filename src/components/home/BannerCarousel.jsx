import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { getBannerConfig, subscribeBannerConfig } from "@/lib/bannerStore";

export default function BannerCarousel({ className = "", onBannerClick }) {
  const [config, setConfig] = useState(getBannerConfig());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mutedStates, setMutedStates] = useState({});
  const videoRefs = useRef({});

  useEffect(() => {
    const unsubscribe = subscribeBannerConfig((newCfg) => {
      setConfig(newCfg);
    });
    return () => unsubscribe();
  }, []);

  const activeBanners = (config.banners || []).filter((b) => b.active !== false);

  // Auto-play interval for carousel slides
  useEffect(() => {
    if (!config.enableCarousel || activeBanners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, config.autoplayInterval || 6000);

    return () => clearInterval(interval);
  }, [activeBanners.length, config.enableCarousel, config.autoplayInterval, isPaused]);

  // Adjust current index if list shrinks
  useEffect(() => {
    if (currentIndex >= activeBanners.length && activeBanners.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeBanners.length, currentIndex]);

  if (activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const toggleMute = (e, bannerId) => {
    e?.stopPropagation();
    setMutedStates((prev) => ({
      ...prev,
      [bannerId]: prev[bannerId] !== undefined ? !prev[bannerId] : false, // Default muted is true, toggle to false
    }));
  };

  const isVideoMuted = (banner) => {
    if (mutedStates[banner.id] !== undefined) {
      return mutedStates[banner.id];
    }
    return banner.muted !== false;
  };

  const handleItemClick = (banner) => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, "_blank");
    } else if (onBannerClick) {
      onBannerClick(banner);
    }
  };

  // Determine image/video object fit mode: "contain" vs "cover"
  const getFitClass = (banner) => {
    const fit = banner.objectFit || config.objectFitGlobal || "cover";
    return fit === "contain" ? "object-contain bg-black" : "object-cover";
  };

  const getTransitionProps = () => {
    const effect = config.transitionEffect || "fade";
    switch (effect) {
      case "slide":
        return {
          initial: { opacity: 0, x: 60 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -60 },
          transition: { duration: 0.4, ease: "easeInOut" }
        };
      case "zoom":
        return {
          initial: { opacity: 0, scale: 0.88 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.12 },
          transition: { duration: 0.4, ease: "easeInOut" }
        };
      case "flip":
        return {
          initial: { opacity: 0, rotateY: 75 },
          animate: { opacity: 1, rotateY: 0 },
          exit: { opacity: 0, rotateY: -75 },
          transition: { duration: 0.45, ease: "easeInOut" }
        };
      case "fade":
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.35, ease: "easeInOut" }
        };
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden shrink-0 group rounded-none sm:rounded-xl shadow-lg border-y sm:border border-white/10 ${className}`}
      style={{ height: config.bannerHeight || "180px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id + "_" + currentIndex}
          {...getTransitionProps()}
          onClick={() => handleItemClick(currentBanner)}
          className="relative w-full h-full cursor-pointer flex items-center justify-center bg-[#0a0d18]"
        >
          {currentBanner.type === "video" ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
              <video
                ref={(el) => (videoRefs.current[currentBanner.id] = el)}
                src={currentBanner.url}
                poster={currentBanner.poster || undefined}
                autoPlay={currentBanner.autoPlay !== false}
                loop={currentBanner.loop !== false}
                muted={isVideoMuted(currentBanner)}
                controls={currentBanner.controls === true}
                playsInline
                className={`w-full h-full ${getFitClass(currentBanner)}`}
              />
              {/* Mute Toggle Overlay Button */}
              <button
                type="button"
                onClick={(e) => toggleMute(e, currentBanner.id)}
                className="absolute bottom-2.5 right-2.5 z-20 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 shadow-lg"
                title={isVideoMuted(currentBanner) ? "Bật âm thanh video" : "Tắt âm thanh video"}
              >
                {isVideoMuted(currentBanner) ? (
                  <VolumeX className="w-4 h-4 text-white/80" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#ffab40]" />
                )}
              </button>
            </div>
          ) : (
            <img
              src={currentBanner.url}
              alt={currentBanner.title || "Sands Banner"}
              className={`w-full h-full ${getFitClass(currentBanner)}`}
              onError={(e) => {
                // Fallback to default image if error occurs
                e.target.onerror = null;
                e.target.src = "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/51180f3b5_b60421ada_4b68ef08ef88c5e8b3877cb04357aa802c84a60d.png";
              }}
            />
          )}

          {/* Dark gradient overlay for title legibility if title/badge exists */}
          {(currentBanner.title || currentBanner.subtitle || currentBanner.badge) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none flex flex-col justify-end p-3.5 sm:p-5">
              {currentBanner.badge && (
                <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#7033ff]/90 text-white border border-white/20 mb-1 backdrop-blur-md shadow">
                  {currentBanner.badge}
                </span>
              )}
              {currentBanner.title && (
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight drop-shadow-md">
                  {currentBanner.title}
                </h3>
              )}
              {currentBanner.subtitle && (
                <p className="text-[11px] sm:text-xs text-white/80 line-clamp-1 mt-0.5 drop-shadow">
                  {currentBanner.subtitle}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows for multiple banners */}
      {activeBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-white/20 shadow-md"
            aria-label="Banner trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-white/20 shadow-md"
            aria-label="Banner tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-lg">
            {activeBanners.map((b, idx) => (
              <button
                key={b.id || idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all rounded-full ${
                  idx === currentIndex ? "w-4 h-1.5 bg-[#ffab40]" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/80"
                }`}
                aria-label={`Chuyển tới banner ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
