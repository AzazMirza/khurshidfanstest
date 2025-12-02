// lib/cart.ts
import { CartResponse, AddToCartPayload } from '@/app/types';

export const addToCart = async (
  payload: AddToCartPayload,
  endpoint = `${process.env.NEXT_PUBLIC_API}/cart`
): Promise<CartResponse> => {
  // ✅ Guard localStorage for SSR safety (even though this should only run in Client Components)
  const guestId = typeof window !== 'undefined' 
    ? localStorage.getItem('guestId') 
    : null;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        ...payload, 
        guestId // 👈 sent as part of body, not separate array
      }),
      // credentials: 'include', // keep only if backend uses cookies/sessions
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('[ADD_TO_CART_ERROR]', error);
    throw error;
  }
};