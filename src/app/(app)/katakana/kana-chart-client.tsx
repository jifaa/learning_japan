"use client";

type KanaChar = { character: string; romaji: string };

interface KanaChartClientProps {
  chars: KanaChar[];
}

export function KanaChartClient({ chars }: KanaChartClientProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {chars.map((char) => (
        <div
          key={char.character}
          className="flex flex-col items-center justify-center rounded-lg border border-border bg-background p-3"
        >
          <span className="text-2xl font-semibold leading-none">{char.character}</span>
          <span className="mt-1 text-xs text-muted-foreground">{char.romaji}</span>
        </div>
      ))}
    </div>
  );
}
