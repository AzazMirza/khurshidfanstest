// app/products/page.tsx
import { Suspense } from 'react';
import { ProductsSkeleton } from '@/components/skeletons';
import { fetchFilteredProducts } from '@/app/lib/data';
import CuratedSidebar from '@/components/curatedsidebar';
import ProductTable from '@/app/ui/products/table';

interface PageProps {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}

export default async function ProductsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const { products, totalPages } = await fetchFilteredProducts(query, currentPage);

  return (
    <CuratedSidebar
      main={
        <main className="flex-1 p-6 bg-gray-50">
          <Suspense key={query + currentPage} fallback={<ProductsSkeleton />}>
            <ProductTable 
              products={products} 
              totalPages={totalPages}
              searchQuery={query}
            />
          </Suspense>
        </main>
      }
    />
  );
}