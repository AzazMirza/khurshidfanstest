"use client";

import { use, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "../hooks/useGSAP";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Wind, ChevronRight, Play, X } from "lucide-react";
import Image from "next/image";
import SwiperCore from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import { EffectFade, Navigation, Autoplay } from "swiper/modules";

// Register Swiper modules
SwiperCore.use([EffectFade, Navigation, Autoplay]);

export default function SwiperHero() {
  const [videoOpen, setVideoOpen] = useState(false);
  const heroRef = useRef < HTMLDivElement > null;
  const swiperRef = (useRef < SwiperCore) | (null > null);

  // Mock product data (replace with real API data)
  const heroProducts = [
    {
      id: 1,
      name: "AeroFlow Pro",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=1200&fit=crop",
      description: "Whisper-quiet BLDC motor technology",
    },
    {
      id: 2,
      name: "SilentBreeze Elite",
      image:
        "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=1200&h=1200&fit=crop",
      description: "Smart temperature control system",
    },
    {
      id: 3,
      name: "EcoWind Max",
      image:
        "https://images.unsplash.com/photo-1583358164293-cc1bdf2c72e7?w=1200&h=1200&fit=crop",
      description: "Energy efficient design",
    },
  ];

  useGSAP(() => {
    // GSAP animations for hero text
      if (heroRef.current) {
        const heroText = heroRef.current.querySelectorAll(".hero-text");
        gsap.from(heroText, {
          opacity: 0,
          y: 50,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.3,
        });

        // Scroll indicator animation
        const scrollIndicator =
          heroRef.current.querySelector(".scroll-indicator");
        if (scrollIndicator) {
          gsap.to(scrollIndicator, {
            opacity: 0.3,
            y: 10,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
          });
        }
      }

  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Swiper Container */}
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[EffectFade, Navigation, Autoplay]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={1200}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          className="w-full h-full">
          {heroProducts.map((product, index) => (
            <SwiperSlide key={product.id} className="relative">
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 via-cyan-600/20 to-pink-600/20" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

              {/* Product Image */}
              <div className="absolute inset-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover opacity-70"
                  priority={index === 0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>

              {/* Product Spotlight Effect */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Hero Content */}
      <div ref={heroRef} className="text-center z-10 px-4 max-w-6xl relative">
        <div className="mb-6 inline-block">
          <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20 hero-text">
            ✨ Introducing the Future of Cooling
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-none hero-text">
          <span className="bg-gradient-to-r from-white via-yellow-200 to-cyan-200 bg-clip-text text-transparent">
            Silence
          </span>
          <br />
          <span className="text-white">Redefined</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed hero-text">
          Experience the perfect harmony of cutting-edge technology and timeless
          design. Our BLDC fans deliver unparalleled performance in
          whisper-quiet operation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center hero-text">
          <button
            className="group px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all flex items-center space-x-2"
            onClick={() => {
              // Scroll to products section
              document.getElementById("products-section")?.scrollIntoView({
                behavior: "smooth",
              });
            }}>
            <span>Explore Collection</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => setVideoOpen(true)}
            className="group px-8 py-4 border-2 border-white/30 rounded-full font-semibold hover:bg-white/10 transition-all flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Watch Video</span>
          </button>
        </div>

        {/* Product Info Overlay */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full hero-text">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white font-medium">
              {heroProducts[0]?.name} • {heroProducts[0]?.description}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 scroll-indicator">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full" />
        </div>
      </div>

      {/* Manual Navigation Controls */}
      <div className="absolute bottom-8 right-8 flex space-x-3 z-10">
        {heroProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => swiperRef.current?.slideTo(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === 0 ? "bg-white" : "bg-white/50 hover:bg-white"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Video Modal */}
      {videoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-2xl overflow-hidden">
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
              <X className="w-6 h-6" />
            </button>
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Play className="w-20 h-20 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Video integration coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
