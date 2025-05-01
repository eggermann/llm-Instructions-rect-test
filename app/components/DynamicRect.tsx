'use client';

import { useEffect, useRef, useState } from 'react';

interface DynamicRectProps {
  html: string;
  css: string;
  javascript: string;
  height?: string;
}

export default function DynamicRect({ html, css, javascript, height = '300px' }: DynamicRectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isInView) return;

    const currentContainer = containerRef.current;

    // Run any existing cleanup
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Clear previous content
    currentContainer.innerHTML = '';

    // Create unique class for scoping
    const uniqueClass = `dynamic-rect-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add scoped styles
    const styleElement = document.createElement('style');
    const scopedCss = css.replace(/([^{}]*){/g, `.${uniqueClass} $1 {`);
    styleElement.textContent = scopedCss;
    currentContainer.appendChild(styleElement);

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = uniqueClass;
    contentContainer.innerHTML = html;
    currentContainer.appendChild(contentContainer);

    // Create isolated script context
    const context = {
      container: contentContainer,
      cleanup: () => {}
    };

    // Execute JavaScript
    const script = document.createElement('script');
    script.text = `
      (function() {
        const container = document.querySelector('.${uniqueClass}');
        try {
          const cleanup = (function() {
            ${javascript}
          })();
          if (typeof cleanup === 'function') {
            window['${uniqueClass}_cleanup'] = cleanup;
          }
        } catch (error) {
          console.error('DynamicRect script error:', error);
        }
      })();
    `;
    currentContainer.appendChild(script);

    // Store cleanup function
    cleanupRef.current = () => {
      try {
        // Execute component cleanup if provided
        const cleanup = (window as any)[`${uniqueClass}_cleanup`];
        if (typeof cleanup === 'function') {
          cleanup();
        }
        // Remove cleanup function from window
        delete (window as any)[`${uniqueClass}_cleanup`];
        // Clear container
        if (currentContainer) {
          currentContainer.innerHTML = '';
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };

    // Cleanup on unmount or data change
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [html, css, javascript, isInView]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        height,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    />
  );
}