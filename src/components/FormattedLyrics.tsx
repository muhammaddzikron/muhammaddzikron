import React from 'react';
import { cleanLyricsText } from '../services/appsScript';

interface FormattedLyricsProps {
  lyrics?: string;
  className?: string;
  fontSizeClass?: string;
}

export const FormattedLyrics: React.FC<FormattedLyricsProps> = ({
  lyrics,
  className = '',
  fontSizeClass = 'text-sm sm:text-base leading-relaxed'
}) => {
  if (!lyrics || !lyrics.trim()) {
    return (
      <div className="py-10 text-center text-slate-400">
        <p>Lirik belum ditambahkan untuk lagu ini.</p>
        <p className="text-xs text-slate-400 mt-1">Gunakan Dashboard Admin CMS untuk mengisi lirik lagu.</p>
      </div>
    );
  }

  const cleaned = cleanLyricsText(lyrics);
  const lines = cleaned.split('\n');

  return (
    <div className={`space-y-1 select-text ${className} ${fontSizeClass}`}>
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();

        // Empty spacer line
        if (!line) {
          return <div key={idx} className="h-3 sm:h-4" />;
        }

        // Section header e.g. [Verse 1], (Chorus), Intro, Reff, Bridge, Outro, Coda
        const isSection = /^(intro|verse|\(verse|\[verse|chorus|\(chorus|\[chorus|reff|\(reff|\[reff|bridge|\[bridge|\(bridge|outro|\[outro|\(outro|coda|\[coda|interlude)/i.test(line);
        if (isSection) {
          return (
            <div key={idx} className="pt-3.5 pb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#00ffc8]/10 border border-[#00ffc8]/30 text-[#00ffc8] text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                {line.replace(/^\[|\]$|^\(|\)$/g, '')}
              </span>
            </div>
          );
        }

        // Vocal role direction e.g. (male), (female), (duet)
        const isVocal = /^\((male|female|duet)\)$/i.test(line);
        if (isVocal) {
          const role = line.replace(/^\(|\)$/g, '').toLowerCase();
          const colorClass =
            role === 'female'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : role === 'male'
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

          return (
            <div key={idx} className="pt-2 pb-0.5">
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${colorClass}`}>
                {role}
              </span>
            </div>
          );
        }

        // Normal lyric line
        return (
          <p key={idx} className="text-slate-200 tracking-wide">
            {rawLine}
          </p>
        );
      })}
    </div>
  );
};
