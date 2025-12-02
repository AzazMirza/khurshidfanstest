// app/orders/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Image from "next/image";
import CuratedSidebar from "@/components/curatedsidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ProductInItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string[];
  sku: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  color: string | null;
  size: number | null;
  product: ProductInItem;
}

interface OrderDetail {
  id: number;
  userId: number | null;
  guestId: string | null;
  firstName: string | null;
  lastName: string | null;
  totalAmount: number;
  status: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

interface OrderUpdateData {
  status: string;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderUpdateData>({
    status: "",
  });

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/order/${orderId}`
        );

        if (!res.ok) {
          throw new Error(
            `Failed to fetch order: ${res.status} ${res.statusText}`
          );
        }

        const data = await res.json();
        setOrder(data.order);

        setEditingOrder({
          status: data.order.status || "",
        });
      } catch (err) {
        console.error("Error fetching order:", err);
        setError((err as Error).message);
        toast.error("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Fix: This handles input change (not submission)
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit handler
  // const handleUpdateOrder = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     const payload = {
  //       orderId: parseInt(orderId, 10),
  //       status: editingOrder.status,
  //     };

  //     const res = await fetch(`${process.env.NEXT_PUBLIC_API}/order`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     if (res.ok){
  //       const response = JSON.parse(await res.text());
  //       setOrder(response);
  //     }

  //     if (!res.ok) {
  //       const errData = await res.json();
  //       throw new Error(errData.message);
  //     }

  //     const updatedOrder = await res.json();
  //     setOrder(updatedOrder);

  //     toast.success("Order status updated successfully!");
  //     setIsEditDialogOpen(false);
  //   } catch (error) {
  //     toast.error((error as Error).message);
  //   }
  // };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        orderId: parseInt(orderId, 10),
        status: editingOrder.status,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/order`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update order");
      }

      // ⬇️ Correct way: parse once
      const data = await res.json();

      // Your API returns: { order: {...} }
      const updatedOrder = data.order ?? data;

      // ⬇️ Update UI immediately without reload
      setOrder(updatedOrder);

      toast.success("Order status updated successfully!");
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const buildImageUrl = (path: string) => {
    const base = process.env.NEXT_PUBLIC_IMG;
    if (!base) return "/placeholder-image.jpg";
    return new URL(path, base).href;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-red-500">{error || "Order not found."}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <CuratedSidebar
      main={
        <main className="flex-1 p-4">
          <SidebarTrigger />

          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold">Order #{order.id}</h1>

              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}>
                Edit Status
              </Button>
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <strong>Status:</strong> {order.status}
                  </p>
                  <p>
                    <strong>Total:</strong> Rs. {order.totalAmount}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              {/* Customer */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Name:</strong> {order.firstName} {order.lastName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.phoneNumber}
                  </p>
                  <p>
                    <strong>Address:</strong> {order.address}
                  </p>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex space-x-4">
                      <div className="w-16 h-16 relative">
                        <img
                          src={buildImageUrl(item.product.image)}
                          alt=""
                          // fill
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <p>{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty {item.quantity} × Rs.{item.price}
                        </p>
                      </div>

                      <div className="ml-auto font-semibold">
                        Rs. {item.quantity * item.price}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* --- Edit Status Dialog --- */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Order Status</DialogTitle>
                  <DialogDescription>
                    Change the order status and click save.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUpdateOrder} className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <select
                      name="status"
                      value={editingOrder.status}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      required>
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      }
    />
  );
}

// // app/orders/[id]/page.tsx
// 'use client';

// import { useState, useEffect, use } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";
// import Image from 'next/image';
// import CuratedSidebar from '@/components/curatedsidebar';
// import { SidebarTrigger } from '@/components/ui/sidebar';

// // Define types based on your API response structure
// interface ProductInItem {
//   id: number;
//   name: string;
//   price: number;
//   image: string; // Path to the product image
//   category: string[]; // Array of category strings
//   sku: string;
// }

// interface OrderItem {
//   id: number;
//   orderId: number;
//   productId: number;
//   quantity: number;
//   price: number; // Price *at time of order*
//   color: string | null;
//   size: number | null;
//   product: ProductInItem; // Embedded product details
// }

// interface OrderDetail {
//   id: number;
//   userId: number | null; // Might be null for guest orders
//   guestId: string | null; // Unique identifier for guest orders
//   firstName: string | null;
//   lastName: string | null;
//   totalAmount: number;
//   status: string; // e.g., PENDING, CONFIRMED, SHIPPED, COMPLETED, CANCELLED
//   address: string;
//   phoneNumber: string;
//   createdAt: string;
//   updatedAt: string;
//   orderItems: OrderItem[]; // Array of items in the order
// }

// // Define the form data type for updates (only status for now)
// interface OrderUpdateData {
//   status: string;
// }

// export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id: orderId } = use(params);
//   const router = useRouter();

//   const [order, setOrder] = useState<OrderDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [editingOrder, setEditingOrder] = useState<OrderUpdateData>({
//     status: '',
//   });

//   useEffect(() => {
//     const fetchOrder = async () => {
//       if (!orderId) return;

//       try {
//         setLoading(true);
//         setError(null);
//         const res = await fetch(`${process.env.NEXT_PUBLIC_API}/order/${orderId}`); // Update API endpoint

//         if (!res.ok) {
//           throw new Error(`Failed to fetch order: ${res.status} ${res.statusText}`);
//         }

//         const  data = await res.json();
//         // The API returns { order: {...} }, so access the inner object
//         setOrder(data.order);

//         // Initialize editing state with fetched data (only status for now)
//         setEditingOrder({
//           status: data.order.status || '',
//         });
//       } catch (err) {
//         console.error('Error fetching order:', err);
//         setError((err as Error).message || 'An error occurred while fetching the order.');
//         toast.error('Failed to load order details.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrder();
//   }, [orderId]);

//   // Handle input changes for the order status
//   const handleInputChange = async (e: React.FormEvent) => {
//     const { name, value } = e.target;
//     setEditingOrder(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Handle form submission for updating the order status
//   const handleUpdateOrder = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       // Prepare the payload (only status for now)
//       const payload = {
//         orderId: isNaN(parseInt(orderId, 10)) ? null : parseInt(orderId, 10),
//         status: editingOrder.status,
//       };

//       const res = await fetch(`${process.env.NEXT_PUBLIC_API}/order`, { // Update API endpoint
//         method: 'PUT', // Or 'PATCH' depending on your API
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || `Failed to update order: ${res.status}`);
//       }

//       const updatedOrder: OrderDetail = await res.json();
//       setOrder(updatedOrder);

//       toast.success('Order status updated successfully!');
//       setIsEditDialogOpen(false);
//     } catch (error) {
//       console.error('Update order failed:', error);
//       toast.error(`Failed to update order: ${(error as Error).message}`);
//     }
//   };

//   // Build image URL safely (assuming NEXT_PUBLIC_IMG is the base for product images)
//   const buildImageUrl = (path: string) => {
//     const baseUrl = process.env.NEXT_PUBLIC_IMG;
//     if (!baseUrl) {
//       console.error("NEXT_PUBLIC_IMG environment variable is not set.");
//       return "/placeholder-image.jpg";
//     }
//     return new URL(path, baseUrl).href;
//   };

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8 max-w-6xl">
//         <Skeleton className="h-8 w-1/3 mb-4" />
//         <div className="space-y-6">
//           <Skeleton className="h-48 w-full" />
//           <Skeleton className="h-48 w-full" />
//           <Skeleton className="h-48 w-full" />
//         </div>
//       </div>
//     );
//   }

//   if (error || !order) {
//     return (
//       <div className="container mx-auto px-4 py-8 max-w-4xl">
//         <div className="text-red-500">Error: {error || 'Order not found.'}</div>
//         <Button onClick={() => router.back()}>Go Back</Button>
//       </div>
//     );
//   }

//   return (
//     <CuratedSidebar main={
//         <main className="flex-1 p-4">
//           <div className="mb-4">
//             <SidebarTrigger />
//           </div>

//     <div className="container mx-auto px-4 py-8 max-w-6xl">
//       <div className="flex justify-between items-start mb-6">
//         <h1 className="text-3xl font-bold">Order #{order.id}</h1>
//         <div className="flex space-x-2">
//           <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
//             Edit Status
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Order Summary Card */}
//         <div className="lg:col-span-1">
//           <Card>
//             <CardHeader>
//               <CardTitle>Order Summary</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <p><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{order.status}</span></p>
//               <p><span className="font-semibold">Total Amount:</span> Rs. {order.totalAmount}</p>
//               <p><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
//               <p><span className="font-semibold">Last Updated:</span> {new Date(order.updatedAt).toLocaleDateString()}</p>
//               <p><span className="font-semibold">Guest ID:</span> {order.guestId || 'N/A'}</p>
//               <p><span className="font-semibold">User ID:</span> {order.userId || 'N/A'}</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Customer & Address Card */}
//         <div className="lg:col-span-1">
//           <Card>
//             <CardHeader>
//               <CardTitle>Customer & Address</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <p><span className="font-semibold">Name:</span> {order.firstName || 'N/A'} {order.lastName || ''}</p>
//               <p><span className="font-semibold">Phone:</span> {order.phoneNumber}</p>
//               <p><span className="font-semibold">Address:</span> {order.address}</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Order Items Card */}
//         <div className="lg:col-span-1">
//           <Card>
//             <CardHeader>
//               <CardTitle>Order Items</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {order.orderItems.map((item) => (
//                   <div key={item.id} className="flex items-center space-x-4 border-b pb-4 last:border-0 last:pb-0">
//                     <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
//                       <img
//                         src={buildImageUrl(item.product.image)}
//                         alt={item.product.name}
//                         fill
//                         className="object-cover"
//                       />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium truncate">{item.product.name}</p>
//                       <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
//                       <p className="text-sm">Qty: {item.quantity} x Rs. {item.price}</p>
//                       {item.color && <p className="text-xs">Color: {item.color}</p>}
//                       {item.size && <p className="text-xs">Size: {item.size}</p>}
//                     </div>
//                     <div className="text-right">
//                       <p className="font-semibold">Rs. {(item.quantity * item.price).toFixed(2)}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Edit Order Status Dialog */}
//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Update Order Status</DialogTitle>
//             <DialogDescription>
//               Change the status of this order. Click save when you're done.
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleUpdateOrder} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="status">Status</Label>
//               <select
//                 id="status"
//                 name="status"
//                 value={editingOrder.status}
//                 onChange={handleInputChange}
//                 required
//               >
//                 <option value="PENDING">PENDING</option>
//                 <option value="CONFIRMED">CONFIRMED</option>
//                 <option value="SHIPPED">SHIPPED</option>
//                 <option value="COMPLETED">COMPLETED</option>
//                 <option value="CANCELLED">CANCELLED</option>
//               </select>
//             </div>

//             {/* <DialogFooter>
//               <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit">Save Changes</Button>
//             </DialogFooter> */}
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//     </main>
//     }
//     />
//   );
// }
