'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  parallaxFactor: number;
}

interface StarfieldProps {
  dimmed?: boolean;
}

// Performance constants
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;
const MIN_STAR_COUNT = 50;
const MAX_STAR_COUNT = 500;
const STAR_DENSITY = 4000; // pixels per star

export default function Starfield({ dimmed = false }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const fpsHistoryRef = useRef<number[]>([]);
  
  const prefersReducedMotion = useReducedMotion();

  const createStars = useCallback((width: number, height: number, reducedCount: boolean = false) => {
    const baseCount = Math.floor((width * height) / STAR_DENSITY);
    let starCount = Math.max(MIN_STAR_COUNT, Math.min(MAX_STAR_COUNT, baseCount));
    
    // Reduce star count on low-end devices or when performance is poor
    if (reducedCount) {
      starCount = Math.floor(starCount * 0.5);
    }
    
    const stars: Star[] = [];
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        parallaxFactor: Math.random() * 0.5 + 0.1,
      });
    }
    
    return stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Handle device pixel ratio for crisp rendering on retina displays
    const dpr = window.devicePixelRatio || 1;
    
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Set canvas size accounting for device pixel ratio
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      // Scale context for retina
      ctx.scale(dpr, dpr);
      
      // Check if we should reduce star count based on FPS history
      const avgFps = fpsHistoryRef.current.length > 0 
        ? fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length 
        : 60;
      const reducedCount = avgFps < 30;
      
      starsRef.current = createStars(width, height, reducedCount);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      mouseRef.current = {
        x: (e.clientX - window.innerWidth / 2) / window.innerWidth,
        y: (e.clientY - window.innerHeight / 2) / window.innerHeight,
      };
    };

    // Handle page visibility
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (isVisibleRef.current) {
        lastFrameTimeRef.current = performance.now();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let time = 0;

    // Pre-create gradient for background (reuse each frame)
    const createBackgroundGradient = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height)
      );
      gradient.addColorStop(0, '#0f0f1a');
      gradient.addColorStop(0.5, '#0a0a12');
      gradient.addColorStop(1, '#050508');
      return gradient;
    };

    let bgGradient = createBackgroundGradient();

    const animate = (currentTime: number) => {
      // Skip frames if tab is hidden
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Frame rate limiting
      const deltaTime = currentTime - lastFrameTimeRef.current;
      if (deltaTime < FRAME_TIME) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Track FPS for adaptive quality
      const fps = 1000 / deltaTime;
      fpsHistoryRef.current.push(fps);
      if (fpsHistoryRef.current.length > 30) {
        fpsHistoryRef.current.shift();
      }

      lastFrameTimeRef.current = currentTime;

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Reset transform and clear
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Draw gradient background
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      const stars = starsRef.current;
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const useParallax = !prefersReducedMotion;
      const useTwinkle = !prefersReducedMotion;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        let x = star.x;
        let y = star.y;
        
        // Apply parallax only if not reduced motion
        if (useParallax) {
          x += mouseX * star.parallaxFactor * 30;
          y += mouseY * star.parallaxFactor * 30;
        }
        
        // Calculate opacity with twinkle
        let opacity = star.opacity;
        if (useTwinkle) {
          const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
          opacity = star.opacity * (0.7 + twinkle * 0.3);
        }
        
        // Draw star
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();

        // Add subtle glow to larger stars (limit to reduce draw calls)
        if (star.size > 1.8 && i % 3 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, star.size * 2, 0, Math.PI * 2);
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 2);
          glowGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.2})`);
          glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glowGradient;
          ctx.fill();
        }
      }

      // Occasional shooting star (rare, skip in reduced motion)
      if (!prefersReducedMotion && Math.random() < 0.0008) {
        const shootingStarX = Math.random() * width;
        const shootingStarY = Math.random() * height * 0.5;
        const length = 80 + Math.random() * 80;
        
        const gradient2 = ctx.createLinearGradient(
          shootingStarX, shootingStarY,
          shootingStarX + length, shootingStarY + length * 0.5
        );
        gradient2.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient2.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.strokeStyle = gradient2;
        ctx.lineWidth = 1.5;
        ctx.moveTo(shootingStarX, shootingStarY);
        ctx.lineTo(shootingStarX + length, shootingStarY + length * 0.5);
        ctx.stroke();
      }

      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    // Recreate gradient on resize
    const resizeObserver = new ResizeObserver(() => {
      bgGradient = createBackgroundGradient();
    });
    resizeObserver.observe(canvas);

    lastFrameTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, [createStars, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full transition-opacity duration-700 ${
        dimmed ? 'opacity-40' : 'opacity-100'
      }`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
