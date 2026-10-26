import React, { useEffect, useState } from 'react';

interface FloatingNote {
  id: number;
  symbol: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
}

export const BackgroundAurora: React.FC = () => {
  const [notes, setNotes] = useState<FloatingNote[]>([]);

  useEffect(() => {
    const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
    const colors = [
      'rgba(16, 185, 129, 0.25)', // emerald
      'rgba(99, 102, 241, 0.25)', // indigo
      'rgba(245, 158, 11, 0.25)', // amber
      'rgba(14, 165, 233, 0.25)', // sky
      'rgba(236, 72, 153, 0.22)', // pink
      'rgba(168, 85, 247, 0.22)'  // purple
    ];
    const generated: FloatingNote[] = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      left: Math.random() * 95,
      duration: 12 + Math.random() * 16,
      delay: Math.random() * 8,
      size: 16 + Math.random() * 22,
      color: colors[i % colors.length]
    }));
    setNotes(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#f8fafc]">
      {/* Soft Luxury Light Flare Blobs */}
      <div className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-amber-100/40 blur-[140px] animate-pulse-glow" />
      <div className="absolute top-[25%] -right-[10%] w-[55vw] h-[55vw] rounded-full bg-sky-100/50 blur-[150px] animate-pulse-glow" style={{ animationDelay: '2.5s' }} />
      <div className="absolute -bottom-[10%] left-[25%] w-[50vw] h-[50vw] rounded-full bg-emerald-100/35 blur-[140px] animate-pulse-glow" style={{ animationDelay: '4.5s' }} />
      <div className="absolute top-[60%] -left-[5%] w-[40vw] h-[40vw] rounded-full bg-purple-100/30 blur-[130px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      {/* Floating Musical Notes with delicate jewel tint */}
      {notes.map((note) => (
        <div
          key={note.id}
          className="absolute font-serif transition-opacity duration-1000"
          style={{
            left: `${note.left}%`,
            fontSize: `${note.size}px`,
            color: note.color,
            animation: `floatUp ${note.duration}s linear infinite`,
            animationDelay: `${note.delay}s`
          }}
        >
          {note.symbol}
        </div>
      ))}

      {/* Ultra-subtle luxury geometric grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#00000004_1px,transparent_1px),linear-gradient(to_bottom,#00000004_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" 
      />

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(105vh) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-10vh) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
