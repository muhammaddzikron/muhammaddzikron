import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  barCount?: number;
  height?: number;
  color?: 'tosca' | 'blue' | 'gradient';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 32,
  height = 40,
  color = 'gradient'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const barWidth = width / barCount;
      const gap = 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;

        if (isPlaying) {
          // Dynamic procedural waveform animation with organic variation
          const factor1 = Math.sin(phase + i * 0.25);
          const factor2 = Math.cos(phase * 1.5 + i * 0.15);
          const combined = Math.abs(factor1 * 0.6 + factor2 * 0.4);
          barHeight = Math.max(4, combined * (height - 6) + Math.random() * 6);
        } else {
          // Resting flat pulse
          barHeight = 3 + Math.sin(phase * 0.5 + i * 0.2) * 2;
        }

        const x = i * barWidth;
        const y = height - barHeight;

        // Gradient coloring
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        if (color === 'tosca') {
          grad.addColorStop(0, 'rgba(0, 255, 200, 0.2)');
          grad.addColorStop(1, '#00ffc8');
        } else if (color === 'blue') {
          grad.addColorStop(0, 'rgba(0, 153, 255, 0.2)');
          grad.addColorStop(1, '#0099ff');
        } else {
          grad.addColorStop(0, '#0099ff');
          grad.addColorStop(0.5, '#00ffc8');
          grad.addColorStop(1, '#a855f7');
        }

        ctx.fillStyle = grad;
        ctx.shadowBlur = isPlaying ? 8 : 0;
        ctx.shadowColor = '#00ffc8';

        // Draw rounded top bar
        ctx.beginPath();
        const r = Math.min(barWidth - gap, barHeight) / 2;
        ctx.roundRect(x, y, barWidth - gap, barHeight, [r, r, 0, 0]);
        ctx.fill();
      }

      phase += isPlaying ? 0.08 : 0.02;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, barCount, height, color]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 8}
      height={height}
      className="w-full h-auto block max-w-xs"
    />
  );
};
