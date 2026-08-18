import React, { useEffect, useState } from 'react';

interface FloatingNote {
  id: number;
  symbol: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
}

export const BackgroundAurora: React.FC = () => {
  const [notes, setNotes] = useState<FloatingNote[]>([]);

  useEffect(() => {
    const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
    const generated: FloatingNote[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      left: Math.random() * 95,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 10,
      size: 16 + Math.random() * 24,
    }));
    setNotes(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Aurora Ambient Glow Blobs */}
      <div className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-[#0099ff]/10 blur-[130px] animate-pulse-glow" />
      <div className="absolute top-[35%] -right-[15%] w-[60vw] h-[60vw] rounded-full bg-[#00ffc8]/10 blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[140px] animate-pulse-glow" style={{ animationDelay: '4s' }} />

      {/* Floating Particles and Musical Notes */}
      {notes.map((note) => (
        <div
          key={note.id}
          className="absolute text-[#00ffc8]/30 font-serif transition-opacity duration-1000"
          style={{
            left: `${note.left}%`,
            fontSize: `${note.size}px`,
            animation: `floatUp ${note.duration}s linear infinite`,
            animationDelay: `${note.delay}s`,
            textShadow: '0 0 10px rgba(0,255,200,0.4)'
          }}
        >
          {note.symbol}
        </div>
      ))}

      {/* Grid overlay lines */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" 
      />

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(105vh) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.6;
          }
          85% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-10vh) rotate(360deg) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
