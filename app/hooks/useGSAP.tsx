import { useEffect, DependencyList } from 'react';
import gsap from 'gsap';

// Type guard to detect old vs new GSAP
function isFunction(value: unknown): value is () => void {
  return typeof value === 'function';
}

export const useGSAP = (animationFn: () => void, deps: DependencyList = []) => {
  useEffect(() => {
    const ctx = gsap.context(animationFn);
    
    return () => {
      if (isFunction(ctx)) {
        ctx();
      } else {
        ctx.revert();
      }
    };
  }, deps);
};