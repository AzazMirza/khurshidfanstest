// app/ui/order/table.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";
import { useState, useEffect } from "react";

// ------------------ Types ------------------
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  sku: string;
  rating: number;
  description: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  color: string | null;
  size: string | null;
  product: Product;
}

interface Order {
  id: number;
  userId: number | null;
  guestId: string;
  firstName: string | null;
  lastName: string | null;
  totalAmount: number;
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  address: string;
  phoneNumber: string;
  createdAt: string; // ISO string
  updatedAt: string;
  user: null; // or User if logged in — currently null in your response
  orderItems: OrderItem[];
}

interface OrdersResponse {
  data: Order[];
  meta: {
    totalOrders: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// ------------------ Utils ------------------
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (isoString: string): string => {
  return format(new Date(isoString), "MMM d, yyyy h:mm a");
};

const getStatusVariant = (status: Order["status"]) => {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "SHIPPED":
      return "default";
    case "DELIVERED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
};

// ------------------ Component ------------------
export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/order`);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: OrdersResponse = await res.json();
        setOrders(json.data || []);
      } catch (err) {
        console.error("[OrdersTable] Failed to load orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">{error}</div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">No orders yet.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile: Card Grid */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <Badge variant={getStatusVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Customer
                  </h3>
                  <p className="font-medium">
                    {order.firstName || order.lastName
                      ? `${order.firstName || ""} ${
                          order.lastName || ""
                        }`.trim()
                      : "Guest"}
                  </p>
                  {order.phoneNumber && (
                    <p className="text-sm text-muted-foreground">
                      {order.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Items
                  </h3>
                  <ul className="text-sm space-y-1">
                    {order.orderItems.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-muted-foreground">
                          ×{item.quantity} ·{" "}
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/order/${order.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>
                  {order.phoneNumber && (
                  <div>
                  {order.phoneNumber}
                  </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {order.firstName || order.lastName ? (
                        `${order.firstName || ""} ${order.lastName || ""}`.trim()
                      ) : (
                        <span className="text-muted-foreground">Guest</span>
                      )}
                    </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm">
                    {order.orderItems.map((oi) => oi.product.name).join(", ")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order.orderItems.length} item
                    {order.orderItems.length !== 1 ? "s" : ""}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.totalAmount)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="default">
                    <Link href={`/order/${order.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
