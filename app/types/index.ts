// lib/api/types.ts
export interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}


interface ProductDetails {
  id: number;
  productId: number;
  motor: string;
  blades: string | number; // could be '3', '5', or number
  speedLevels: string | number;
  remote: string; // e.g., 'yes', 'no', 'optional'
  timer: string;
  oscillation: string; // e.g., 'yes', 'no'
  noiseLevel: string;
  dimensions: string;
  warranty: string;
  motorType: string;
  height: string;
  bladeDiameter: string;
  baseDiameter: string;
  weight: string;
  powerConsumption: string;
  airFlow: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  rating: number;
  description: string;
  sku: string;
  image: string;
  images: string[];
  color: string | string[]; // e.g., "space-gray,silver" or ["Space Gray", "Silver"]
  size: string | number | (string | number)[];
  createdAt: string;
  updatedAt: string;
  productDetails: ProductDetails;
}

// 🔹 Cart Item Type
export interface CartItemAttributes {
  color?: string;
  size?: string | number;
  speedLevel?: string | number;
  blades?: string | number;
  remote?: 'yes' | 'no';
  oscillation?: 'yes' | 'no';
  [key: string]: unknown; // extensible
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  attributes: CartItemAttributes;
}

export interface AddToCartPayload {
  productId: number;
  quantity: number;
  attributes: CartItemAttributes;
}

// Optional: success/error response types
export interface CartResponse {
  success: boolean;
  message: string;
  cartItemCount?: number;
  guestId?: string;
}

export interface CartStore {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  updateItemQuantity: (id: number, quantity: number) => void;
  getItemById: (id: number) => CartItem | undefined;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    cartItems: number;
  };
}

// types/order.ts
export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: User; // ← NOT array! Fix this!
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}