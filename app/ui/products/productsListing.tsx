"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/app/types";
import { useGSAP } from "@/app/hooks/useGSAP";

gsap.registerPlugin(ScrollTrigger);

interface ProductPageClientProps {
  initialProducts: Product[];
  totalPages: number;
  query: string;
  currentPage: number;
}

export default function ProductPageClient({
  initialProducts,
  totalPages,
  query,
  currentPage,
}: ProductPageClientProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ✅ Safe ref setter with index capture
  const setProductRef = useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      productRefs.current[index] = el;
    };
  }, []);

  useGSAP(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: "power3.out",
      });

      const mockup = heroRef.current.querySelector(".product-mockup");
      if (mockup) {
        gsap.to(mockup, {
          y: -20,
          rotate: 2,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }

    // Grid stagger
    if (gridRef.current) {
      gsap.from(gridRef.current.children, {
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }

    // Hover effects — now using current refs safely
    productRefs.current.forEach((card, i) => {
      if (!card) return;

      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          y: -12,
          duration: 0.5,
          ease: "power2.out",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        });

        const img = card.querySelector("img");
        if (img) {
          gsap.to(img, {
            y: -15,
            scale: 1.03,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        });

        const img = card.querySelector("img");
        if (img) {
          gsap.to(img, {
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      });
    });
  }, [initialProducts]); // ✅ dependency is fine here

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-b from-black to-gray-900 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
            Precision engineered.
            <br />
            <span className="font-semibold">Beautifully detailed.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
            Discover fans designed for performance, crafted for elegance.
          </p>
          <div className="relative w-full max-w-3xl mx-auto h-96 md:h-[500px]">
            <div className="product-mockup absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64 md:w-96 md:h-96">
                <img
                  src="/hero-fan.png"
                  alt="Khurshid Fan"
                  // fill
                  className="object-contain drop-shadow-2xl"
                  // priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-light text-gray-900">
              {query ? `Results for "${query}"` : "All Products"}
            </h2>
            <div className="w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products...."
                  defaultValue={query}
                  className="text-black w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">
                  🔍
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 pb-20">
        <div
          ref={gridRef}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {initialProducts.map((product, index) => (
            <div
              key={product.id}
              // ✅ FIXED: proper void-returning callback ref
              ref={setProductRef(index)}
              className="group cursor-pointer">
              <Card className="border-0 shadow-none bg-transparent hover:bg-white/50 transition-colors duration-500">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-2xl bg-white aspect-square mb-4">
                    <img
                      src={process.env.NEXT_PUBLIC_API_URL + product.image}
                      alt={product.name}
                      // fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                    {product.rating > 0 && (
                      <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        ★ {product.rating}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {product.category}
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-3xl p-12">
            <h3 className="text-3xl md:text-4xl font-light text-white mb-4">
              Experience the difference.
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Engineered for silent operation, built for lasting performance.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:bg-gray-100 px-12 py-6 text-lg">
              <Link href="/contact">Schedule a Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
