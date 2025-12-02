"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Camera,
  Wind,
  Zap,
  Shield,
  Award,
  ChevronRight,
  Play,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "../hooks/useGSAP";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Define types based on your API response
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  images: string[];
  stock: number;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<(HTMLDivElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);

  // Fetch real products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/products?page=1&limit=6`
        );
        const data = await res.json();

        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        // Fallback to minimal mock data
        // setProducts([
        //   {
        //     id: 1,
        //     name: "Premium Fan",
        //     description: "Engineered for silent operation",
        //     price: 199,
        //     category: "fans",
        //     rating: 5,
        //     image: "/uploads/default.png",
        //     images: ["/uploads/default.png"],
        //     stock: 10,
        //     sku: "FAN-PRO",
        //     createdAt: new Date().toISOString(),
        //     updatedAt: new Date().toISOString(),
        //   },
        // ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // GSAP animations
  useGSAP(() => {
    if (loading) return;

    // Hero text animation
    if (heroRef.current) {
      const heroText = heroRef.current.querySelectorAll(".hero-text");
      gsap.from(heroText, {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      });

      // Stats animation
      if (statsRef.current) {
        const stats = statsRef.current.querySelectorAll(".stat-item");
        gsap.utils.toArray(stats).forEach((stat, i) => {
          gsap.from(stat, {
            scrollTrigger: {
              trigger: stat,
              start: "top 90%",
              toggleActions: "play none none none",
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            delay: i * 0.1,
            ease: "power3.out",
          });
        });
      }

      // Features animation
      featuresRef.current.forEach((feature, i) => {
        if (!feature) return;

        gsap.from(feature, {
          scrollTrigger: {
            trigger: feature,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          delay: i * 0.1,
          ease: "power3.out",
        });
      });

      // Testimonials animation
      if (testimonialsRef.current) {
        gsap.from(
          testimonialsRef.current.querySelectorAll(".testimonial-card"),
          {
            scrollTrigger: {
              trigger: testimonialsRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
          }
        );
      }

      // Custom cursor
      const cursor = cursorRef.current;
      const cursorDot = cursorDotRef.current;

      const moveCursor = (e: MouseEvent) => {
        if (cursor && cursorDot) {
          gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(cursorDot, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power1.out",
          });
        }
      };

      const handleHover = () => {
        if (cursor)
          gsap.to(cursor, { scale: 2, duration: 0.3, ease: "power2.out" });
      };

      const handleLeave = () => {
        if (cursor)
          gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power2.out" });
      };

      // Apply cursor effects to interactive elements
      const interactiveElements =
        document.querySelectorAll("a, button, .group");
      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", handleHover);
        el.addEventListener("mouseleave", handleLeave);
      });

      window.addEventListener("mousemove", moveCursor);

      return () => {
        window.removeEventListener("mousemove", moveCursor);
        interactiveElements.forEach((el) => {
          el.removeEventListener("mouseenter", handleHover);
          el.removeEventListener("mouseleave", handleLeave);
        });
      };
    }
  }, [loading, products]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Wind className="w-8 h-8 text-yellow-400" />,
      title: "Whisper Quiet",
      description: "Advanced BLDC motor technology for near-silent operation",
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "Energy Efficient",
      description: "Save up to 60% on energy costs with smart power management",
    },
    {
      icon: <Shield className="w-8 h-8 text-yellow-400" />,
      title: "5-Year Warranty",
      description: "Premium build quality backed by comprehensive warranty",
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-400" />,
      title: "Award Winning",
      description: "Recognized for excellence in design and innovation",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Interior Designer",
      content:
        "The build quality is exceptional. These fans are not just functional, they're pieces of art.",
      rating: 5,
    },
    {
      name: "Michael Roberts",
      role: "Architect",
      content:
        "Finally, a fan that combines aesthetics with performance. Highly recommended!",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Home Owner",
      content:
        "Best investment for our home. Silent operation and elegant design.",
      rating: 5,
    },
  ];

  // Helper to get badge based on product properties
  const getBadge = (product: Product) => {
    if (product.stock < 5) return "Limited";
    if (
      new Date(product.createdAt) >
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )
      return "New";
    // if (product.category.toLowerCase().includes("premium")) return "Premium";
    return null;
  };

  const setFeatureRef = (index: number) => {
    return (el: HTMLDivElement | null) => {
      featuresRef.current[index] = el;
    };
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 border-2 border-white/30 rounded-full pointer-events-none z-[100] transition-transform duration-200 hidden lg:block"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      <div
        ref={cursorDotRef}
        className="fixed w-2 h-2 bg-white rounded-full pointer-events-none z-[100] hidden lg:block"
        style={{ transform: "translate(-50%, -50%)" }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-12">
              <div className="text-2xl font-bold tracking-tight flex items-center space-x-2">
                <Wind className="w-7 h-7" />
                <span>Khurshid</span>
              </div>
              <div className="hidden md:flex space-x-8">
                {["Products", "Technology", "About", "Support"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-sm font-medium hover:text-yellow-400 transition-colors relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300" />
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-white/10 rounded-full transition-all group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 group-hover:scale-110 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-all group">
                <span className="group-hover:scale-105 transition-transform inline-block">
                  Shop Now
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 via-cyan-600/20 to-pink-600/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        </div>

        <div ref={heroRef} className="text-center z-10 px-4 max-w-6xl">
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
            Experience the perfect harmony of cutting-edge technology and
            timeless design. Our BLDC fans deliver unparalleled performance in
            whisper-quiet operation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center hero-text">
            <button className="group px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all flex items-center space-x-2">
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
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2 animate-bounce">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-20 border-y border-white/10 bg-gradient-to-r from-yellow-900/10 to-cyan-900/10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "50K+", label: "Happy Customers" },
            { value: "99.8%", label: "Satisfaction Rate" },
            { value: "15+", label: "Years Experience" },
            { value: "24/7", label: "Support Available" },
          ].map((stat, i) => (
            <div key={i} className="text-center stat-item">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
                Khurshid
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Engineered with precision, crafted with care, designed for
              excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                ref={setFeatureRef(i)}
                className={`group p-8 rounded-3xl border transition-all duration-500 cursor-pointer ${
                  activeFeature === i
                    ? "bg-gradient-to-br from-yellow-600/20 to-cyan-600/20 border-yellow-500/50 scale-105"
                    : "bg-white/5 border-white/10 hover:border-white/30"
                }`}
                onMouseEnter={() => setActiveFeature(i)}>
                <div
                  className={`mb-6 transition-all duration-500 ${
                    activeFeature === i
                      ? "text-yellow-400 scale-110"
                      : "text-white"
                  }`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-32 px-4 bg-gradient-to-b from-transparent to-yellow-900/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Featured Collection
              </h2>
              <p className="text-lg md:text-xl text-gray-400">
                Discover our most loved products
              </p>
            </div>
            <button className="hidden md:flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors group">
              <span>View All</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Link
                href={`/listing/details/${product.id}`}
                key={product.id}
                className="group">
                <div key={product.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 aspect-square">
                      <img
                        src={process.env.NEXT_PUBLIC_IMG + product.image}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        // priority={index < 3}
                      />
                      {getBadge(product) && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-yellow-500 text-white text-xs font-bold rounded-full">
                          {getBadge(product)}
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full flex items-center space-x-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 text-yellow-400"
                          viewBox="0 0 20 20"
                          fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    <div className="p-6">
                      <p className="text-sm text-yellow-400 mb-2 font-medium">
                        {product.category}
                      </p>
                      <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl md:text-3xl font-bold">
                            ${product.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {product.stock > 0
                              ? `${product.stock} in stock`
                              : "Out of stock"}
                          </div>
                        </div>
                        <button
                          className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 ${
                            product.stock > 0
                              ? "bg-white text-black hover:bg-gray-200"
                              : "bg-gray-700 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={product.stock <= 0}>
                          {product.stock > 0 ? "Buy Now" : "Out of Stock"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-20">
            Loved by{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="testimonial-card p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105">
                <div className="flex mb-4">
                  {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {testimonial.content}
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Experience
            <br />
            <span className="bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
              The Difference?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of satisfied customers who've upgraded their comfort
            with Khurshid fans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 md:px-10 md:py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105">
              Shop Now
            </button>
            <button className="px-8 py-3 md:px-10 md:py-4 border-2 border-white/30 rounded-full font-bold text-lg hover:bg-white/10 transition-all hover:scale-105">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Wind className="w-8 h-8" />
                <span className="text-2xl font-bold">Khurshid</span>
              </div>
              <p className="text-gray-400 mb-4">
                Redefining comfort through innovation and design excellence.
              </p>
              <div className="flex space-x-4">
                {["instagram", "linkedin", "youtube"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-white/50 rounded-full" />
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Shop",
                links: ["All Products", "New Arrivals", "Best Sellers", "Sale"],
              },
              {
                title: "Support",
                links: ["Contact", "FAQ", "Warranty", "Returns"],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Press", "Sustainability"],
              },
            ].map((section, i) => (
              <div key={i}>
                <h3 className="font-bold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
            <p>
              © {new Date().getFullYear()} Khurshid Fans. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>

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
    </div>
  );
}
