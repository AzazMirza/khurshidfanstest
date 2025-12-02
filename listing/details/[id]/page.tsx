"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Wind,
  Zap,
  Shield,
  Award,
  Camera,
  Play,
  ChevronRight,
  Star,
  ShoppingCart,
  Heart,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dimg from "@/public/images/kingmodel.png";
import { useGSAP } from "@/app/hooks/useGSAP";
import { toast, useSonner } from "sonner";
import { Product, CartItem, CartItemAttributes, CartStore } from "@/app/types";
import AddToCartForm from "./AddToCartForm";

// const sonner = useSonner();

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Types matching your API

interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetail() {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  // const [size, setsize] = useState(1);
  // const [color, setcolor] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorite, setIsFavorite] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  let color = "";
  let size = 0;

  // Mock data for demo - replace with API fetch
  useEffect(() => {
    // Simulate API fetch
    const fetchProduct = async () => {
      const id = window.location.pathname.split("/").pop();
      try {
        // In production, replace with:
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/products/${id}`
        );
        const data = await res.json();

        // Mock data matching your API structure
        // const mockProduct: Product = {
        //   id: 1,
        //   name: "AeroFlow Pro X",
        //   description:
        //     "Experience whisper-quiet performance with our most advanced BLDC motor technology. Designed for those who demand perfection in every detail.",
        //   price: 349,
        //   category: "Premium Fans",
        //   rating: 4.9,
        //   image:
        //     "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
        //   images: [
        //     "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=1200&fit=crop",
        //     "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=1200&h=1200&fit=crop",
        //     "https://images.unsplash.com/photo-1583358164293-cc1bdf2c72e7?w=1200&h=1200&fit=crop",
        //     "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=1200&h=1200&fit=crop",
        //   ],
        //   stock: 12,
        //   sku: "AF-PRO-X-2025",
        //   createdAt: "2025-01-15T10:00:00Z",
        //   updatedAt: "2025-11-10T14:30:00Z",
        //   specs: {
        //     motor: "Brushless DC (BLDC)",
        //     blades: 5,
        //     speedLevels: 6,
        //     remote: true,
        //     timer: true,
        //     oscillation: true,
        //     noiseLevel: "22-45 dB",
        //     dimensions: "42 x 42 x 120 cm",
        //     weight: "6.8 kg",
        //     warranty: "5 Years",
        //   },
        // };

        const mockReviews: Review[] = [
          {
            id: 1,
            userId: 101,
            userName: "Alex Johnson",
            rating: 5,
            comment:
              "Absolutely incredible! The silence is what sold me - I can barely hear it running on the lowest setting. Build quality is exceptional.",
            createdAt: "2025-10-28T09:15:00Z",
          },
          {
            id: 2,
            userId: 102,
            userName: "Maria Garcia",
            rating: 5,
            comment:
              "Worth every penny. The remote control is intuitive and the design fits perfectly with my modern living room.",
            createdAt: "2025-10-22T14:30:00Z",
          },
          {
            id: 3,
            userId: 103,
            userName: "David Kim",
            rating: 4,
            comment:
              "Great fan overall. The only minor issue is that the highest speed is a bit louder than advertised, but still much quieter than my old fan.",
            createdAt: "2025-10-15T18:45:00Z",
          },
        ];

        setProduct(data);
        setReviews(mockReviews);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  // GSAP animations
  useGSAP(() => {
    if (loading || !product) return;

    // Hero animation
    if (heroRef.current) {
      gsap.from(heroRef.current.querySelectorAll(".hero-text"), {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      });

      // Floating product image
      const floatingImg = heroRef.current.querySelector(".floating-product");
      if (floatingImg) {
        gsap.to(floatingImg, {
          y: -25,
          rotate: 2,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }

    // Gallery animation
    if (galleryRef.current) {
      gsap.from(galleryRef.current.querySelectorAll(".gallery-thumb"), {
        opacity: 1,
        x: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: galleryRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }

    // Specs animation
    if (specsRef.current) {
      gsap.from(specsRef.current.querySelectorAll(".spec-item"), {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: specsRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }

    // Reviews animation
    if (reviewsRef.current) {
      gsap.from(reviewsRef.current.querySelectorAll(".review-card"), {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: reviewsRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }

    // Floating elements (icons, cards)
    floatingElementsRef.current.forEach((el, i) => {
      if (!el) return;

      gsap.from(el, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        delay: i * 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

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
    const interactiveElements = document.querySelectorAll(
      "a, button, .group, .tab-item"
    );
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
  }, [loading, product]);

  const handleAdd = (
    product: Product,
    quantity: number,
    attributes: CartItemAttributes,
    cart: CartStore,
    stockCheck: boolean = true // enable/disable stock validation
  ): void => {
    const { id, name, price, stock, sku } = product;

    // ✅ 1. Stock validation (if enabled)
    if (stockCheck && quantity > stock) {
      toast.error(
        `Only ${stock} ${name} ${stock === 1 ? "is" : "are"} in stock.`,
        { duration: 4000 }
      );
      return;
    }

    if (stockCheck && stock <= 0) {
      toast.error(`❌ ${name} is currently out of stock.`, {
        duration: 5000,
        icon: "📦",
      });
      return;
    }

    // ✅ 2. Generate attribute key
    const attributeKey = JSON.stringify(attributes);
    // ✅ 3. Check if identical variant already exists in cart
    const existingItem = cart.items.find(
      (item) =>
        item.id === id && JSON.stringify(item.attributes) === attributeKey
    );

    try {
      if (existingItem) {
        // ➕ Update quantity if same variant
        const newQty = existingItem.quantity + quantity;
        if (stockCheck && newQty > stock) {
          toast.error(
            `Cannot add: only ${stock - existingItem.quantity} more available.`,
            { duration: 4000 }
          );
          return;
        }
        cart.updateItemQuantity(existingItem.id, newQty);
        toast.success(
          `✅ ${name} (${
            existingItem.attributes.color || "Standard"
          }) quantity updated to ${newQty}`,
          { icon: "🛒" }
        );
      } else {
        // ➕ Add new item
        const newItem: CartItem = {
          id,
          name,
          price,
          quantity,
          attributes,
        };

        cart.addToCart(newItem);

        // 🎯 Friendly, brand-aligned success message
        const variantName = [
          attributes.color && `in ${attributes.color}`,
          attributes.size && `${attributes.size}”`,
          attributes.blades && `${attributes.blades} blades`,
        ]
          .filter(Boolean)
          .join(", ");

        toast.success(`✨ ${quantity} × ${name} ${variantName} added to cart`, {
          duration: 3500,
          icon: "🌬️", // AIRION-appropriate (gentle breeze)
          style: {
            background: "#fef6fb", // soft pastel pink
            color: "#5a2d4d",
            border: "1px solid #fbc6e4",
          },
        });
      }

      // 🔔 Optional: trigger analytics
      // trackEvent('add_to_cart', {
      //   product_id: id,
      //   sku,
      //   quantity,
      //   value: price * quantity,
      //   currency: 'USD',
      //   ...attributes,
      // });
    } catch (error) {
      console.error("[AIRION] Cart Add Error:", error);
      toast.error("⚠️ Failed to add item. Please try again.", {
        duration: 4000,
      });
    }
  };

  // const handleAddToCart = async (product: Product) => {
  //   console.log({userId: 1, productId: product.id, quantity: quantity, price: product.price, size: size, color: color})
  //   alert('Added to cart!')
  //   try {
  //     const response = await fetch("/cart", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ userId: 1, productId: product.id, quantity: quantity, price: product.price, size: size, color: color }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Failed to add to cart: ${response.statusText}`);
  //     }

  //     const data = await response.json();
  //     toast.success(`Added ${product.name} to cart!`);
  //   } catch (error) {
  //     toast.error(`Failed to add to cart: ${error.message}`);
  //   }
  // };

  const setFloatingRef = (index: number) => {
    return (el: HTMLDivElement | null) => {
      floatingElementsRef.current[index] = el;
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-400 mb-6">
            We couldn't find the product you're looking for.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
            <ChevronRight className="w-4 h-4 mr-2 -rotate-180" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Calculate rating distribution
  const ratingDistribution = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    const index = Math.min(4, Math.max(0, Math.floor(review.rating) - 1));
    ratingDistribution[index]++;
  });
  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews || 0;

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
              <Link
                href="/"
                className="text-2xl font-bold tracking-tight flex items-center space-x-2 group">
                <Wind className="w-7 h-7 transition-transform group-hover:rotate-12" />
                <span>Khurshid</span>
              </Link>
              <div className="hidden md:flex space-x-8">
                {["Products", "Technology", "About", "Support"].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="text-sm font-medium hover:text-cyan-400 transition-colors relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
                  </Link>
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
              <Link
                href="/listing/checkout"
                className="p-2 hover:bg-white/10 rounded-full transition-all relative group">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Product Images */}
            <div className="relative">
              <div className="floating-product relative aspect-square bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden border border-white/10">
                <img
                  // src={dimg}
                  // src={`${product.images[selectedImageIndex] || product.image}`}
                  src={
                    new URL(
                      product.images[selectedImageIndex] ,
                      process.env.NEXT_PUBLIC_IMG
                    ).href
                  }
                  alt={product.name}
                  // fill
                  className="object-cover transition-transform duration-700"
                  // priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Image Thumbnails */}
              <div ref={galleryRef} className="flex space-x-3 mt-6">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    className={`gallery-thumb relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-cyan-500 scale-105"
                        : "border-white/20 hover:border-white/40"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}>
                    <img
                      // src={dimg}
                      src={process.env.NEXT_PUBLIC_IMG + img}
                      // src={new URL(img, process.env.NEXT_PUBLIC_IMG).href}
                      alt={`${product.name} - View ${index + 1}`}
                      // fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full border border-cyan-500/30">
                    Premium Collection
                  </span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-400">
                      {product.rating.toFixed(1)} ({totalReviews} reviews)
                    </span>
                  </div>
                </div>

                <h1 className="hero-text text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {product.name}
                </h1>

                <p className="hero-text text-xl text-gray-300">
                  {product.description}
                </p>
              </div>

              {/* Price & Actions */}
              <div className="hero-text space-y-6">
                <div className="text-4xl font-bold">
                  ${product.price.toFixed(2)}
                  {product.stock < 10 && (
                    <span className="ml-4 text-sm font-normal text-red-400">
                      Only {product.stock} left!
                    </span>
                  )}
                </div>

                <div className="max-w-4xl mx-auto p-4">
                  <h1 className="text-3xl font-bold mb-6">{product.name}</h1>
                  <AddToCartForm product={product} onAddToCart={handleAdd} />
                </div>

                {/* Product Badges */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-1 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm">1-Year Return Warranty</span>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">Energy Efficient</span>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                    <Wind className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Whisper Quiet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs */}
      <section className="border-t border-white/10 bg-gradient-to-b from-transparent to-cyan-900/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex border-b border-white/10">
            {["overview", "specs", "reviews"].map((tab) => (
              <button
                key={tab}
                className={`tab-item px-6 py-4 font-medium capitalize transition-colors relative ${
                  activeTab === tab
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setActiveTab(tab)}>
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-12">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Key Features */}
                <div className="lg:col-span-2 space-y-12">
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold">
                      Engineered for Excellence
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      The AeroFlow Pro X represents the pinnacle of fan
                      technology, combining cutting-edge engineering with
                      timeless design. Every component has been meticulously
                      crafted to deliver unparalleled performance in
                      whisper-quiet operation.
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        icon: <Wind className="w-8 h-8" />,
                        title: "Advanced BLDC Motor",
                        desc: "Our proprietary brushless DC motor delivers powerful airflow with minimal energy consumption and near-silent operation.",
                      },
                      {
                        icon: <Camera className="w-8 h-8" />,
                        title: "Sleek Modern Design",
                        desc: "Crafted from premium aluminum and high-grade plastics, the AeroFlow Pro X is as beautiful as it is functional.",
                      },
                      {
                        icon: <Play className="w-8 h-8" />,
                        title: "Smart Controls",
                        desc: "Intuitive remote control with timer, oscillation, and 6 speed settings for perfect comfort in any environment.",
                      },
                      {
                        icon: <Shield className="w-8 h-8" />,
                        title: "Built to Last",
                        desc: "Rigorous quality testing ensures 50,000+ hours of reliable operation. Backed by our industry-leading 5-year warranty.",
                      },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        ref={setFloatingRef(i)}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                          <div className="text-cyan-400">{feature.icon}</div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Preview */}
                <div className="space-y-8">
                  <div
                    ref={setFloatingRef(4)}
                    className="p-6 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border border-cyan-500/30">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Award className="w-6 h-6 mr-2 text-cyan-400" />
                      Award Winning Design
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Recognized with the 2025 Red Dot Design Award for
                      exceptional innovation and user experience.
                    </p>
                    <div className="flex space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-white/20 rounded-lg"></div>
                      ))}
                    </div>
                  </div>

                  <div
                    ref={setFloatingRef(5)}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-xl font-bold mb-4">In the Box</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>AeroFlow Pro X Fan</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Premium Remote Control</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Mounting Hardware</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>User Manual & Warranty Card</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div ref={specsRef} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(product.productDetails).map(
                    ([key, value], i) => (
                      <div
                        key={key}
                        className="spec-item p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h4 className="text-gray-400 text-sm font-medium mb-1 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                        <div className="text-xl font-bold">
                          {typeof value === "boolean"
                            ? value
                              ? "Yes"
                              : "No"
                            : value}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Technical Diagram */}
                <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/10">
                  <h3 className="text-2xl font-bold mb-6">
                    Technical Specifications
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-cyan-400">
                        Performance
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Airflow</span>
                          <span className="font-medium">450 CFM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Power Consumption
                          </span>
                          <span className="font-medium">35W (Max)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Noise Level</span>
                          <span className="font-medium">22-45 dB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Oscillation</span>
                          <span className="font-medium">90° Horizontal</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-cyan-400">
                        Dimensions
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Height</span>
                          <span className="font-medium">120 cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Blade Diameter</span>
                          <span className="font-medium">42 cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Base Diameter</span>
                          <span className="font-medium">38 cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Weight</span>
                          <span className="font-medium">6.8 kg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div ref={reviewsRef} className="space-y-12">
                {/* Rating Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border border-cyan-500/30">
                      <div className="text-5xl font-bold mb-2">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${
                              i < Math.floor(averageRating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-gray-300">
                        {totalReviews} reviews
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold mb-6">
                      Rating Distribution
                    </h3>
                    {ratingDistribution.map((count, i) => {
                      const rating = 5 - i;
                      const percentage = totalReviews
                        ? (count / totalReviews) * 100
                        : 0;
                      return (
                        <div key={rating} className="mb-3">
                          <div className="flex items-center mb-1">
                            <span className="w-12 text-gray-400">
                              {rating} stars
                            </span>
                            <div className="flex-1 bg-white/10 rounded-full h-2 mx-3">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                                style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="w-12 text-right text-gray-400">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review, i) => (
                    <div
                      key={review.id}
                      className="review-card p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold">{review.userName}</h4>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, j) => (
                              <Star
                                key={j}
                                className={`w-4 h-4 ${
                                  j < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add Review */}
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-2xl font-bold mb-6">Write a Review</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Rating
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className="w-10 h-10 flex items-center justify-center">
                            <Star className="w-6 h-6 text-gray-400 hover:text-yellow-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Review Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="Summarize your experience"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Review
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="Share details about your experience..."></textarea>
                    </div>
                    <button className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors w-full sm:w-auto">
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2
            ref={setFloatingRef(6)}
            className="text-4xl font-bold mb-12 text-center">
            You Might Also Like
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 2,
                name: "SilentBreeze Elite",
                price: 299,
                image:
                  "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop",
                rating: 4.8,
              },
              {
                id: 3,
                name: "EcoWind Max",
                price: 249,
                image:
                  "https://images.unsplash.com/photo-1583358164293-cc1bdf2c72e7?w=800&h=800&fit=crop",
                rating: 4.7,
              },
              {
                id: 4,
                name: "UltraQuiet Plus",
                price: 279,
                image:
                  "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800&h=800&fit=crop",
                rating: 4.9,
              },
            ].map((item, i) => (
              <div
                key={item.id}
                ref={setFloatingRef(7 + i)}
                className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 aspect-square">
                    <img
                      //   src={item.image}
                      src={dimg}
                      alt={item.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                      <span className="font-semibold">{item.rating}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold">${item.price}</div>
                      <button className="px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2
            ref={setFloatingRef(10)}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Experience
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              The Difference?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of satisfied customers who've upgraded their comfort
            with Khurshid fans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart - ${product.price.toFixed(2)}
            </button>
            <button className="px-8 py-4 border-2 border-white/30 rounded-full font-bold text-lg hover:bg-white/10 transition-all hover:scale-105">
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
    </div>
  );
}
