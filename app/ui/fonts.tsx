// app/ui/fonts.ts
import { Lusitana } from 'next/font/google';

export const lusitana = Lusitana({
  weight: ['400', '700'], // Specify the weights you need
  subsets: ['latin'],     // Specify the character subsets you need (e.g., 'latin', 'latin-ext', 'cyrillic', etc.)
  display: 'swap',        // Optional: Font display strategy (default is 'swap')
  // You don't need to specify 'src' if you're using Google Fonts via next/font/google
});