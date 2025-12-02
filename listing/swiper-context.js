/* Swiper Custom Styles */
.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Hide default navigation */
.swiper-button-next,
.swiper-button-prev {
  display: none !important;
}

import SwiperHero from '@/components/swiper-hero';

export default function ProductShowcase() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <SwiperHero />
      
      {/* Rest of your page */}
      <section id="products-section" className="py-32 px-4">
        {/* Products grid */}
      </section>
    </div>
  );
}

useEffect(() => {
  const fetchHeroProducts = async () => {
    const res = await fetch('/api/products?featured=true&limit=3');
    const data = await res.json();
    setHeroProducts(data.products);
  };
  fetchHeroProducts();
}, []);
```

2. **Add video integration** when ready:
```tsx
<video 
  src="/hero-video.mp4" 
  autoPlay 
  muted 
  loop 
  className="w-full h-full object-cover"
/>
```

3. **Optimize images** with Next.js:
```tsx
<Image
  src={product.image}
  alt={product.name}
  fill
  className="object-cover"
  sizes="100vw"
  priority={index === 0}
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>