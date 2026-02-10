'use client';

import { useEffect, useRef } from 'react';

interface RadarChartProps {
  data: {
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
}

export default function RadarChart({ data }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 60;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Radar properties
    const metrics = ['Speed', 'Turning', 'Pump', 'Glide', 'Lift'];
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
    ctx.strokeStyle = '#9ca3af';
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
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < metrics.length; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius + 30);
      const y = centerY + Math.sin(angle) * (radius + 30);
      ctx.fillText(metrics[i], x, y);
    }

    // Draw data polygons
    data.forEach((foil, index) => {
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
      ctx.lineWidth = 3;
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
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    });

  }, [data]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="w-full h-auto"
      />
    </div>
  );
}
