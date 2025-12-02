"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@/app/hooks/useGSAP";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ShoppingCart,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Banknote,
  Shield,
  Truck,
  RotateCcw,
  MapPin,
  Calendar,
  User,
  Lock,
} from "lucide-react";
import Link from "next/link";
import {redirect, useRouter} from "next/navigation";
import { fi } from "zod/v4/locales";
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Types
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  stock: number;
  // product: {
  //   id: number;
  //   name: string;
  //   price: number;
  //   category: string;
  //   image: string;
  //   stock: number;
  //   userId?: number;
  //   guestId?: string;
  //   color?: string;
  //   size?: string;
  //   blades?: string;
  //   speedLevels?: string;
  // }[];

}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: "credit" | "cash";
  last4?: string;
}


export default function CheckoutPage() {
  const [step, setStep] = useState<
    "cart" | "shipping" | "payment" | "confirmation"
  >("cart");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Shipping form
  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "Pakistan",
  });

  // Payment
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [selectedPayment, setSelectedPayment] = useState("credit");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cartItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null); 

  // Mock data - replace with API calls
  useEffect(() => {
    // Simulate API fetch
    const fetchCart = async () => {
      try {
        // In production:
        const userId = localStorage.getItem("userId");
        const guestId = localStorage.getItem("guestId");
        const url = userId
          ? `${process.env.NEXT_PUBLIC_API}/cart?userId=${userId}`
          : `${process.env.NEXT_PUBLIC_API}/cart?guestId=${guestId}`;
        const res = await fetch(url);
        const data = await res.json();

        // const mockCart: CartItem[] = [
        //   {
        //     id: 1,
        //     name: "AeroFlow Pro X",
        //     price: 349,
        //     quantity: 1,
        //     image:
        //       "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        //     category: "Premium Fans",
        //     stock: 12,
        //   },
        //   {
        //     id: 3,
        //     name: "EcoWind Max",
        //     price: 249,
        //     quantity: 1,
        //     image:
        //       "https://images.unsplash.com/photo-1583358164293-cc1bdf2c72e7?w=400&h=400&fit=crop",
        //     category: "Eco Fans",
        //     stock: 8,
        //   },
        // ];

        setCartItems(
          data.map((item:any) => ({
            id: item.id,
            userId: item.userId,
            guestId: item.guestId,
            productId: item.productId,
            size: item.size,
            color: item.color,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            name: item.name,

            // createdAt: item.createdAt,
            // updatedAt: item.updatedAt,
            // product: {
            //   id: item.product.id,
            //   name: item.product.name,
            //   stock: item.product.stock,
            //   category: item.product.category,
            //   rating: item.product.rating,
            //   description: item.product.description,
            //   sku: item.product.sku,
            //   image: item.product.image,
            //   images: item.product.images,
            //   color: item.product.color,
            //   size: item.product.size,
            //   createdAt: item.product.createdAt,
            //   updatedAt: item.product.updatedAt,
            // },
          }))
          
        );
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  // GSAP animations
  useGSAP(() => {
    if (isLoading) return;

    // Step animations
    stepRefs.current.forEach((stepEl, i) => {
      if (!stepEl) return;

      gsap.from(stepEl, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: i * 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: stepEl,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    // Cart items animation
    cartItemRefs.current.forEach((item, i) => {
      if (!item) return;

      gsap.from(item, {
        opacity: 0,
        x: -30,
        duration: 0.6,
        delay: i * 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: item,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Custom cursor setup
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;

    if (!cursor || !cursorDot) return; // Early exit if refs not ready

    const moveCursor = (e: MouseEvent) => {
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
    };

    const handleHover = () => {
      gsap.to(cursor, { scale: 2, duration: 0.3, ease: "power2.out" });
    };

    const handleLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power2.out" });
    };

    // Apply cursor effects
    const interactiveElements = document.querySelectorAll(
      "a, button, input, select"
    );
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleHover);
      el.addEventListener("mouseleave", handleLeave);
    });

    window.addEventListener("mousemove", moveCursor);

    // Return cleanup function (GSAP context handles GSAP cleanup; we handle event listeners)
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleHover);
        el.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, [isLoading, step]); // Dependencies
  // Cart calculations
  useEffect(() => {
  }, [cartItems]);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = selectedShipping === "express" ? 1000 : 500;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shippingCost + tax;

  // Shipping options
  const shippingOptions: ShippingOption[] = [
    {
      id: "standard",
      name: "Regular Shipping",
      price: 500,
      estimatedDays: "2-7 business days",
    },
    {
      id: "express",
      name: "Same Day Shipping",
      price: 1000,
      estimatedDays: "1 business days",
    },
  ];

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    { id: "credit", name: "Credit Card", type: "credit" },
    { id: "cash", name: "cash", type: "cash" },
    // { id: "apple", name: "Apple Pay", type: "apple" },
  ];

  // Handlers
  // const updateQuantity = (id: number, newQty: number) => {
  //   if (newQty < 1) return;

  //   const item = cartItems.find((item) => item.id === id);
  //   if (item && newQty <= item.stock) {
  //     setCartItems(
  //       cartItems.map((item) =>
  //         item.id === id ? { ...item, quantity: newQty } : item
  //       )
  //     );
  //   }
  // };

  
  async function increaseQty(id: number) {
  const guestId = localStorage.getItem("guestId");
  const userId = localStorage.getItem("userId");
  await fetch(`${process.env.NEXT_PUBLIC_API}/cart`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: id,
      change: +1,
      userId: userId || null,
      guestId: guestId || null,
    }),
  });
  
  // refreshCart();  // reload UI
}

async function decreaseQty(id: number) {
  const guestId = localStorage.getItem("guestId");
  const userId = localStorage.getItem("userId");
  await fetch(`${process.env.NEXT_PUBLIC_API}/cart`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: id,
      change: -1,
      userId: userId || null,
      guestId: guestId || null,
    }),
  });

  // refreshCart();  // reload UI
}

// 🎯 Example Button HTML
// <button onClick={() => decreaseQty(item)}>-</button>
// <span>{item.quantity}</span>
// <button onClick={() => increaseQty(item)}>+</button>

  const removeFromCart = async (id: number) => {
    const idType = localStorage.getItem("userId") ? "userId" : localStorage.getItem("guestId") ? "guestId" : null;
    const storageId = localStorage.getItem("guestId") || localStorage.getItem("userId");
    console.log(idType,storageId);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/cart?id=${id}&${idType}=${storageId}`, {
      method: "DELETE",
            headers: {
        'Content-Type': 'application/json',
      },

    });
    const data = await res.json();
    console.log(data);
    if (data.success === true) {
      setCartItems(cartItems.filter((item) => item.id !== id));
    }
  };

  const handleNext = () => {
    if (step === "cart") {
      setStep("shipping");
    } else if (step === "shipping") {
      setStep("payment");
    } else if (step === "payment") {
      setIsProcessing(true);

      let userId: string|null = "";
      userId = localStorage.getItem("userId");
      let guestId: string|null = "";
      guestId = localStorage.getItem("guestId");

      fetch(`${process.env.NEXT_PUBLIC_API}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingMethod: selectedShipping,
          paymentMethod: selectedPayment,
          cartItems:cartItems,
          shipping:shipping,
          phoneNumber:shipping.phone,
          address:shipping.address,
          paymentDetails:paymentDetails,
          total:total,
          guestId: localStorage.getItem("guestId"),
          userId: localStorage.getItem("userId"),
          firstName:shipping.firstName,
          lastName:shipping.lastName
        }),
      })
      .then((res) => res.json()
      ).then((res) => {setOrderId(res.order.id)
      window.open(res.waLink, "_blank");
      }
    )


      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        setStep("confirmation");
      }, 2000);
    }
  };

  const handleBack = () => {
    if (step === "shipping") {
      setStep("cart");
    } else if (step === "payment") {
      setStep("shipping");
    }
  };

  const setStepRef = (index: number) => {
    return (el: HTMLDivElement | null) => {
      stepRefs.current[index] = el;
    };
  };

  const setCartItemRef = (index: number) => {
    return (el: HTMLDivElement | null) => {
      cartItemRefs.current[index] = el;
    };
  };

  const ContinueShopping = () => {
    const router = useRouter();

    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your cart...</p>
        </div>
      </div>
    );
  }

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
            <Link
              href="/listing"
              className="text-2xl font-bold tracking-tight flex items-center space-x-2 group">
              <ChevronLeft className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span>Continue Shopping</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/checkout"
                className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors group">
                <ShoppingCart className="w-5 h-5 mr-1" />
                <span className="font-medium text-white">Cart ({cartItems.length})</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Progress Steps */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center space-x-8">
              {[
                { id: "cart", label: "Cart", icon: ShoppingCart },
                { id: "shipping", label: "Shipping", icon: Truck },
                { id: "payment", label: "Payment", icon: CreditCard },
                { id: "confirmation", label: "Confirmation", icon: Shield },
              ].map((stepItem, i) => {
                const Icon = stepItem.icon;
                const isActive = step === stepItem.id;
                const isCompleted =
                  (step === "shipping" && stepItem.id === "cart") ||
                  (step === "payment" &&
                    ["cart", "shipping"].includes(stepItem.id)) ||
                  (step === "confirmation" && stepItem.id !== "confirmation");

                return (
                  <div key={stepItem.id} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-cyan-500 text-white"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-white/10 text-gray-400"
                      }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="ml-3">
                      <div
                        className={`text-sm font-medium hidden md:block ${
                          isActive ? "text-white" : "text-gray-400"
                        }`}>
                        {stepItem.label}
                      </div>
                      {i < 3 && (
                        <div
                          className={`w-16 h-0.5 mt-2 hidden md:block ${
                            isCompleted ? "bg-green-500" : "bg-white/20"
                          }`}></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {step === "cart" && (
                <div ref={setStepRef(0)} className="space-y-8">
                  <h1 className="text-3xl font-bold">Your Cart</h1>

                  {cartItems.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-12 h-12 text-gray-600" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">
                        Your cart is empty
                      </h2>
                      <p className="text-gray-400 mb-6">
                        Add some products to get started.
                      </p>
                      <Link
                        href="/listing"
                        className="inline-flex items-center px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {cartItems.map((item, i) => (
                          <div
                            key={item.id}
                            ref={setCartItemRef(i)}
                            className="flex items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-all group">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden mr-4 flex-shrink-0">
                              <img
                                src={`${process.env.NEXT_PUBLIC_IMG}${item.image}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex flex-col justify-evenly w-full sm:flex-row">


                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold truncate">
                              {(item.name)}
                              </h3>
                              {/* <p className="text-gray-400 text-sm">
                                {item.category}
                                </p> */}
                              <div className="text-lg font-bold mt-1">
                                Rs {item.price.toFixed(2)}
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="flex items-center border border-white/20 rounded-full overflow-hidden">
                                <button
                                  onClick={() =>
                                    decreaseQty(item.id)

                                  }
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors"
                                  disabled={item.quantity <= 1}>
                                  <span className="text-xl">−</span>
                                </button>
                                <span className="w-12 text-center py-2 font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    increaseQty(item.id)
                                    
                                  }
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors"
                                  disabled={item.quantity >= item.stock}>
                                  <span className="text-xl">+</span>
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                            </div>

                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                          href="/listing"
                          className="px-8 py-4 border border-white/30 rounded-full font-semibold hover:bg-white/10 transition-all text-center">
                          Continue Shopping
                        </Link>
                        <button
                          onClick={() => setStep("shipping")}
                          className="flex-1 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-200 transition-all flex items-center justify-center">
                          <span>Proceed to Shipping</span>
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === "shipping" && (
                <div ref={setStepRef(1)} className="space-y-8">
                  <h1 className="text-3xl font-bold">Shipping Information</h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={shipping.email}
                        onChange={(e) =>
                          setShipping({ ...shipping, email: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="john@example.com"
                      />
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={shipping.phone}
                        onChange={(e) =>
                          setShipping({ ...shipping, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={shipping.address}
                        onChange={(e) =>
                          setShipping({ ...shipping, address: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="123 Street Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        First Name (optional)
                      </label>
                      <input
                        type="text"
                        value={shipping.firstName}
                        onChange={(e) =>
                          setShipping({
                            ...shipping,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Last Name (optional)
                      </label>
                      <input
                        type="text"
                        value={shipping.lastName}
                        onChange={(e) =>
                          setShipping({ ...shipping, lastName: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="Doe"
                      />
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={shipping.city}
                        onChange={(e) =>
                          setShipping({ ...shipping, city: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="Karachi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={shipping.zip}
                        onChange={(e) =>
                          setShipping({ ...shipping, zip: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="75600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Country
                      </label>
                      <select
                        value={shipping.country}
                        onChange={(e) =>
                          setShipping({ ...shipping, country: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none">
                        <option value="Pakistan">Pakistan</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div> */}
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">Shipping Method</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shippingOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                            selectedShipping === option.id
                              ? "border-cyan-500 bg-cyan-500/10"
                              : "border-white/20 hover:border-white/40"
                          }`}
                          onClick={() => setSelectedShipping(option.id)}>
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold">{option.name}</h3>
                            <div className="text-xl font-bold">
                              ${option.price}
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {option.estimatedDays}
                          </p>
                          {selectedShipping === option.id && (
                            <div className="w-4 h-4 bg-cyan-500 rounded-full mt-3"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleBack}
                      className="flex-1 flex items-center justify-center px-8 py-4 border border-white/30 rounded-full font-semibold hover:bg-white/10 transition-all">
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      <span>Back to Cart</span>
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex-1 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-200 transition-all flex items-center justify-center">
                      <span>Continue to Payment</span>
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {step === "payment" && (
                <div ref={setStepRef(2)} className="space-y-8">
                  <h1 className="text-3xl font-bold">Payment Details</h1>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                              selectedPayment === method.id
                                ? "border-cyan-500 bg-cyan-500/10"
                                : "border-white/20 hover:border-white/40"
                            }`}
                            onClick={() => setSelectedPayment(method.id)}>
                            <div className="flex items-center mb-3">
                              {method.type === "credit" && (
                                <CreditCard className="w-6 h-6 text-cyan-400 mr-3" />
                              )}
                              {method.type === "cash" && (
                                <Banknote className="w-6 h-6 text-cyan-500  mr-3" />
                              )}
                              {/* {method.type === "apple" && (
                                <div className="w-6 h-6 bg-black rounded mr-3"></div>
                              )} */}
                              <span className="font-medium">{method.name}</span>
                            </div>
                            {selectedPayment === method.id && (
                              <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedPayment === "credit" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold">
                          Credit Card Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Card Number
                            </label>
                            <div className="relative">
                              <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                value={paymentDetails.cardNumber}
                                onChange={(e) =>
                                  setPaymentDetails({
                                    ...paymentDetails,
                                    cardNumber: e.target.value,
                                  })
                                }
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="1234 5678 9012 3456"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              value={paymentDetails.name}
                              onChange={(e) =>
                                setPaymentDetails({
                                  ...paymentDetails,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Expiry Date
                            </label>
                            <div className="relative">
                              <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                value={paymentDetails.expiry}
                                onChange={(e) =>
                                  setPaymentDetails({
                                    ...paymentDetails,
                                    expiry: e.target.value,
                                  })
                                }
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="MM/YY"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              CVV
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                              <input
                                type="password"
                                value={paymentDetails.cvv}
                                onChange={(e) =>
                                  setPaymentDetails({
                                    ...paymentDetails,
                                    cvv: e.target.value,
                                  })
                                }
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-6 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-2xl border border-cyan-500/30">
                      <h3 className="font-bold mb-3 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-green-400" />
                        Secure Checkout
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Your payment information is encrypted and secure. We use
                        industry-standard SSL encryption to protect your data.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleBack}
                      className="flex-1 flex items-center justify-center px-8 py-4 border border-white/30 rounded-full font-semibold hover:bg-white/10 transition-all">
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      <span>Back to Shipping</span>
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={isProcessing}
                      className="flex-1 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-200 transition-all flex items-center justify-center disabled:opacity-70">
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span>Place Order</span>
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {step === "confirmation" && (
                <div ref={setStepRef(3)} className="space-y-8 text-center">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-12 h-12 text-green-400" />
                  </div>
                  <h1 className="text-3xl font-bold">Confirm Order </h1>
                  <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Please confirm you order via whatsapp.
                  </p>

                  <div className="max-w-md mx-auto space-y-4">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Order Number</span>
                        <span className="font-medium">#KH-2025-78945</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date</span>
                        <span className="font-medium">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-2xl border border-cyan-500/30">
                      <h3 className="font-bold mb-2 flex items-center justify-center">
                        <Truck className="w-5 h-5 mr-2 text-cyan-400" />
                        Estimated Delivery
                      </h3>
                      <p className="text-gray-300">
                        {
                          shippingOptions.find(
                            (opt) => opt.id === selectedShipping
                          )?.estimatedDays
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => {
                      setStep("cart");
                      setCartItems([]);
                      ContinueShopping();  
                      }}
                      className="px-8 py-4 border border-white/30 rounded-full font-semibold hover:bg-white/10 transition-all">
                      Continue Shopping
                    </button>
                    <button className="px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all">
                      View Order Details
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-400 ml-2">
                          × {item.quantity}
                        </span>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/20 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/20">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {step === "shipping" && (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="font-bold mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-cyan-400" />
                    Shipping Address
                  </h3>
                  <div className="text-gray-300 space-y-1">
                    <p>
                      {shipping.firstName} {shipping.lastName}
                    </p>
                    <p>{shipping.address}</p>
                    <p>
                      {shipping.city}, {shipping.zip}
                    </p>
                    <p>{shipping.country}</p>
                    <p className="mt-2">{shipping.email}</p>
                    <p>{shipping.phone}</p>
                  </div>
                </div>
              )}

              {step === "payment" && (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="font-bold mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-cyan-400" />
                    Payment Method
                  </h3>
                  <div className="text-gray-300">
                    {paymentMethods.find((m) => m.id === selectedPayment)?.name}
                    {selectedPayment === "credit" &&
                      paymentDetails.cardNumber && (
                        <p className="mt-2">
                          **** **** **** {paymentDetails.cardNumber.slice(-4)}
                        </p>
                      )}
                  </div>
                </div>
              )}

              {/* Security Badges */}
              <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10">
                <h3 className="font-bold mb-4">Secure Shopping</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-xs">SSL Encrypted</div>
                  </div>
                  <div>
                    <CreditCard className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <div className="text-xs">Secure Payments</div>
                  </div>
                  <div>
                    <RotateCcw className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-xs">1-year change warranty</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-500 text-sm">
            <p>
              © {new Date().getFullYear()} Khurshid Fans. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
