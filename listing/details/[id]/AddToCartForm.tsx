// app/[...]/AddToCartForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { addToCart } from '@/app/lib/cart';
import { Product } from '@/app/types'; // your product type

interface AddToCartFormProps {
  product: Product;
}

export default function AddToCartForm({ product }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Safely parse attributes (your API uses strings like "3,5" or comma lists)
  const getOptions = (val: unknown): string[] => {
    if (Array.isArray(val)) return val.map(String);
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    if (typeof val === 'number') return [String(val)];
    return val ? [String(val)] : [];
  };

  const colorOpts = getOptions(product.color);
  const sizeOpts = getOptions(product.size);
  const speedOpts = getOptions(product.productDetails.speedLevels);
  const bladeOpts = getOptions(product.productDetails.blades);

  const [color, setColor] = useState<string>(colorOpts[0] || '');
  const [size, setSize] = useState<string | number>(sizeOpts[0] || '');
  const [speed, setSpeed] = useState<string | number>(speedOpts[0] || '');
  const [blades, setBlades] = useState<string | number>(bladeOpts[0] || '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const payload = {
      productId: product.id,
      quantity,
      attributes: {
        ...(color && { color }),
        ...(size && { size }),
      },
    };

    try {
      const result = await addToCart(payload);
      setMessage({ type: 'success', text: result.message || 'Added to cart!' });

      if (result.guestId && !localStorage.getItem('guestId')) {
        localStorage.setItem('guestId', result.guestId);
      }

      // Optional: auto-hide success after 3s
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to add item. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Quantity */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Qty:</label>
        <button
          type="button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-8 h-8 rounded border flex items-center justify-center"
          disabled={quantity <= 1}
        >
          −
        </button>
        <span className="w-10 text-center">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity(quantity + 1)}
          className="w-8 h-8 rounded border flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* Color */}
      {colorOpts.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {colorOpts.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Size, Speed, Blades — repeat as needed */}
      {sizeOpts.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Size</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {sizeOpts.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded font-semibold ${
          isSubmitting
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {isSubmitting ? 'Adding…' : 'Add to Cart'}
      </button>

      {/* Feedback */}
      {message && (
        <div
          className={`p-2 text-sm rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
}