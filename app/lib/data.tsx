// app/lib/data.ts
import { Product } from "@/app/types";
import { User } from "@/app/ui/users/columns"; // reuse your existing User type

// 🔹 Shared API Response Shape (DRY)
interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface ApiResponse<T> {
  data: T;
  products: T;
  meta?: PaginationMeta;
}

// 🔹 Order Types (fixed: `user` is now a single object, not array)
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    price: number;
    stock: number;
    image: string;
    images: string[];
    category: string;
    sku: string;
    rating: number;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Order {rating: number
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: User; // ✅ Fixed: no longer `[User]`
  orderItems: OrderItem[];
}

// 🔹 API Base URL Helper
const API_BASE = process.env.NEXT_PUBLIC_API ;

// 🔹 Generic fetcher (handles errors, JSON parsing)
async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { next: { revalidate: 30 } }); // optional: ISR

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

// ───────────────────────────────────────────────────────────────
// 🔹 PRODUCTS
// ───────────────────────────────────────────────────────────────

// export async function fetchFilteredProducts(
//   query: string = "",
//   page: number = 1,
//   limit: number = 6
// ): Promise<{ products: Product[]; totalPages: number }> {
//   const search = query ? `&search=${encodeURIComponent(query)}` : "";
//   const res: ApiResponse<Product[]> = await apiGet(
//     `/products?page=${page}&limit=${limit}&search=${search}`
//   );
//   const products = res.products; 
//   console.log("Products:", products);

//   return {
//     products,
//     totalPages: res.meta?.totalPages ?? 1,
//   };
// }

export async function fetchFilteredProducts(
  query: string = "",
  page: number = 1,
  limit: number = 10
): Promise<{ products: Product[]; totalPages: number }> {
  try {
    const search = query ? `&query=${encodeURIComponent(query)}` : "";
    // Adjust endpoint to match your API
    const res: ApiResponse<Product[]> = await apiGet(
      `/products?page=${page}&limit=${limit}${search}`
    );

    // Handle your actual API response shape
    return {
      products: res.products || res.data || [], // ✅ flexible
      totalPages:  res.meta?.totalPages || 1,
    };
  } catch (error) {
    console.error("Fetch products failed:", error);
    return { products: [], totalPages: 0 };
  }
}



// ───────────────────────────────────────────────────────────────
// 🔹 ORDERS
// ───────────────────────────────────────────────────────────────

export async function fetchFilteredOrders(
  query: string = "",
  page: number = 1,
  limit: number = 10
): Promise<{ orders: Order[]; totalPages: number }> {
  // Adjust query param name to match your backend (e.g., `q`, `search`, `query`)
  const search = query ? `&query=${encodeURIComponent(query)}` : "";
  const res: ApiResponse<Order[]> = await apiGet(
    `/order?page=${page}&limit=${limit}${search}`
  );

  return {
     orders : res.data,
    totalPages: res.meta?.totalPages ?? 1,
  };
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  try {
    const res: ApiResponse<Order> = await apiGet(`/order/${id}`);
    return res.data;
  } catch (error) {
    if ((error as Error).message.includes("404")) return null;
    throw error;
  }
}

export async function fetchOrdersPages(query: string = ""): Promise<number> {
  try {
    const params = new URLSearchParams();
    if (query) {
      params.set('query', query);
    }
    
    // Try primary endpoint first
    const res: ApiResponse<PaginationMeta> = await apiGet(`/order?${params.toString()}&page=1&limit=1`);
    
    // Extract total pages from common patterns
    const totalPages = 
      res.meta?.totalPages ||    // standard
      // res.totalPages || 
      // res.totalPages || 
      Math.ceil((res.meta?.total || 0) / 1) || 
      1;
      
    return totalPages;
  } catch (error) {
    console.error("Failed to fetch order pages:", error);
    return 1; // fallback
  }
}
// ───────────────────────────────────────────────────────────────
// 🔹 USERS
// ───────────────────────────────────────────────────────────────

export async function fetchFilteredUsers(
  query: string = "",
  page: number = 1,
  limit: number = 50 // higher limit for client-side filtering in DataTable
): Promise<{ users: User[]; totalPages: number }> {
  const search = query ? `&query=${encodeURIComponent(query)}` : "";
  const res: ApiResponse<User[]> = await apiGet(
    `/user?page=${page}&limit=${limit}${search}`
  );

  return {
    users: res.data,
    totalPages: res.meta?.totalPages ?? 1,
  };
}

export async function fetchUserById(id: string): Promise<User | null> {
  try {
    const res: ApiResponse<User> = await apiGet(`/user/${id}`);
    return res.data;
  } catch (error) {
    if ((error as Error).message.includes("404")) return null;
    throw error;
  }
}

// Optional: Re-export types for reuse
export type { Product, User };

// ───────────────────────────────────────────────────────────────