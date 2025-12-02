// app/page.tsx
import { Suspense } from 'react';
import { ProductsGrid, ProductsGridSkeleton } from '@/app/ui/products-grid';
import { fetchFilteredProducts } from '@/app/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';

  // Pre-fetch products for immediate render
  const { products } = await fetchFilteredProducts(query, 1, 12); // Load first 12

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-rose-50">
        <div className="container py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Discover <span className="text-amber-600">AIRION</span> Collection
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Curated artisanal goods, ethically sourced and crafted with care. 
                Elevate your everyday with timeless pieces.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/products">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/about">Our Story</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-80 md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-rose-100/80 to-amber-100/50 z-10" />
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: "url(https://placehold.co/800x600/f5f3f0/5a4a42?text=AIRION+Hero)" }}
                />
              </div>
              {/* Decorative floating elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-200/50 blur-xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-rose-200/50 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-6 border-b bg-background">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
              { icon: ShieldCheck, title: "Secure Checkout", desc: "SSL encrypted" },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day guarantee" },
              { icon: ShieldCheck, title: "Ethical Sourcing", desc: "Fair trade certified" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <item.icon className="h-6 w-6 text-amber-600 mb-2" />
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
              <p className="text-muted-foreground">
                Handpicked favorites from our collection
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products">
                View All Products
              </Link>
            </Button>
          </div>

          <Suspense fallback={<ProductsGridSkeleton count={12} />}>
            <ProductsGrid initialProducts={products} />
          </Suspense>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Ceramics", image: "https://placehold.co/400x300/f5f3f0/5a4a42?text=Ceramics" },
              { name: "Textiles", image: "https://placehold.co/400x300/e9e4e0/8c6d5a?text=Textiles" },
              { name: "Woodwork", image: "https://placehold.co/400x300/d4c9c2/7a5e48?text=Woodwork" },
              { name: "Jewelry", image: "https://placehold.co/400x300/faf6f3/9a857a?text=Jewelry" },
            ].map((category, i) => (
              <Link 
                key={i} 
                href={`/products?category=${category.name.toLowerCase()}`}
                className="group block rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-rose-500 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the AIRION Community
          </h2>
          <p className="max-w-2xl mx-auto text-amber-50 mb-8">
            Subscribe for early access to new collections, artisan stories, and exclusive offers.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button size="lg" variant="secondary" className="bg-white text-amber-600 hover:bg-amber-50">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}