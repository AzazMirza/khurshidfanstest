// app/ui/products-grid.tsx
'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/app/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { fetchFilteredProducts } from '@/app/lib/data';

interface ProductsGridProps {
  initialProducts: Product[];
}

export function ProductsGrid({ initialProducts }: ProductsGridProps) {
  // const [products, setProducts] = useState<Product[]>(initialProducts);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    try {
      const { products: newProducts, totalPages } = await fetchFilteredProducts('', nextPage, 12);
      setProducts(prev => [...prev, ...newProducts]);
      setPage(nextPage);
      if (nextPage >= totalPages) setHasMore(false);
    } catch (error) {
      console.error('Failed to load more products', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card 
            key={product.id} 
            className="group overflow-hidden hover:shadow-lg transition-shadow border-0"
          >
            <Link href={`/products/${product.id}`}>
              <div className="relative h-48 overflow-hidden bg-muted">
                <img
                  src={product.image || `https://placehold.co/400x300/f5f3f0/5a4a42?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {product.rating && (
                  <Badge variant="secondary" className="absolute top-3 left-3 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {product.rating}
                  </Badge>
                )}
              </div>
              <CardHeader className="p-4 pb-2">
                <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                  {product.stock === 0 && (
                    <Badge variant="outline">Out of Stock</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-amber-100 group-hover:text-amber-700"
                  asChild
                >
                  <Link href={`/products/${product.id}`}>
                    View Details
                    <ShoppingCart className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Link>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 text-center">
          <Button 
            onClick={loadMore} 
            disabled={loading}
            variant="outline"
            className="mx-auto"
          >
            {loading ? 'Loading...' : 'Load More Products'}
          </Button>
        </div>
      )}
    </>
  );
}

// Skeleton for SSR loading
export function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-0">
          <div className="h-48 bg-muted relative overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>
          <CardHeader className="p-4 pb-2">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Skeleton className="h-9 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
