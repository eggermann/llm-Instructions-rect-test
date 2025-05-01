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

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Create style with scoped class
    const uniqueClass = `dynamic-rect-${Math.random().toString(36).substr(2, 9)}`;
    const styleElement = document.createElement('style');
    const scopedCss = css.replace(/([^{}]*){/g, `.${uniqueClass} $1 {`);
    styleElement.textContent = scopedCss;
    containerRef.current.appendChild(styleElement);

    // Create content container with scoped class
    const contentContainer = document.createElement('div');
    contentContainer.className = uniqueClass;
    contentContainer.innerHTML = html;
    containerRef.current.appendChild(contentContainer);

    // Execute JavaScript in a safe context
    const script = document.createElement('script');
    script.text = `
      (function() {
        const container = document.querySelector('.${uniqueClass}');
        try {
          ${javascript}
        } catch (error) {
          console.error('DynamicRect script error:', error);
        }
      })();
    `;
    containerRef.current.appendChild(script);

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
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