'use client';

import { useEffect, useRef } from 'react';

interface Product {
  id: number;
  title: string;
  specs: {
    area?: number;
    series?: string;
    aspectRatio?: number;
  };
}

interface RadarChartProps {
  foils?: Product[];
  data?: {
    name: string;
    metrics: {
      speed: number;
      turning: number;
      pump: number;
      glide: number;
      lift: number;
    };
    color: string;
  }[];
  compact?: boolean;
}

// Generate radar metrics from foil specs
function generateMetrics(foil: Product) {
  const ar = foil.specs.aspectRatio || 9;
  const area = foil.specs.area || 1000;
  
  return {
    speed: Math.min(10, Math.max(2, (ar - 7) * 1.5 + 3)),
    lift: Math.min(10, Math.max(2, (area - 600) / 120 + 2)),
    turning: Math.min(10, Math.max(2, 12 - ar * 0.6)),
    pump: Math.min(10, Math.max(2, (ar - 6) * 1.2 + 2)),
    glide: Math.min(10, Math.max(2, (ar - 6) * 1.4 + 1)),
  };
}

export default function RadarChart({ foils, data, compact = false }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Convert foils to data format if provided
  const chartData = data || (foils?.map((foil, i) => ({
    name: `${foil.specs.series} ${foil.specs.area}`,
    metrics: generateMetrics(foil),
    color: i === 0 ? '#3b82f6' : '#f97316', // blue for primary, orange for reference
  })) || []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - (compact ? 40 : 60);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Radar properties
    const metrics = ['SPEED', 'TURNING', 'PUMP', 'GLIDE', 'LIFT'];
    const angleStep = (Math.PI * 2) / metrics.length;

    // Draw background grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const r = (radius / 5) * i;
      ctx.beginPath();
      for (let j = 0; j <= metrics.length; j++) {
        const angle = angleStep * j - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    for (let i = 0; i < metrics.length; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = compact ? 'bold 11px sans-serif' : 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < metrics.length; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const labelRadius = radius + (compact ? 20 : 30);
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      ctx.fillText(metrics[i], x, y);
    }

    // Draw data polygons
    chartData.forEach((foil) => {
      const values = [
        foil.metrics.speed,
        foil.metrics.turning,
        foil.metrics.pump,
        foil.metrics.glide,
        foil.metrics.lift,
      ];

      // Fill
      ctx.fillStyle = foil.color + '30'; // 30 = alpha
      ctx.beginPath();
      values.forEach((value, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (value / 10) * radius;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();

      // Stroke
      ctx.strokeStyle = foil.color;
      ctx.lineWidth = compact ? 2 : 3;
      ctx.beginPath();
      values.forEach((value, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (value / 10) * radius;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.stroke();

      // Points
      ctx.fillStyle = foil.color;
      values.forEach((value, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (value / 10) * radius;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        
        ctx.beginPath();
        ctx.arc(x, y, compact ? 4 : 5, 0, Math.PI * 2);
        ctx.fill();
      });
    });

  }, [chartData, compact]);

  const size = compact ? 300 : 600;

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-auto"
      />
    </div>
  );
}
