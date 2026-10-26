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
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
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
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : role === 'male'
              ? 'bg-sky-50 text-sky-800 border-sky-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200';

          return (
            <div key={idx} className="pt-2 pb-0.5">
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${colorClass}`}>
                {role}
              </span>
            </div>
          );
        }

        // Normal lyric line
        return (
          <p key={idx} className="text-slate-800 tracking-wide font-normal">
            {rawLine}
          </p>
        );
      })}
    </div>
  );
};
