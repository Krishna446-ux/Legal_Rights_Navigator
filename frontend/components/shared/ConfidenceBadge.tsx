'use client';

interface Props {
  confidence: number;
  size?: 'sm' | 'md';
}

export default function ConfidenceBadge({ confidence, size = 'sm' }: Props) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 85 ? '#16a34a' : pct >= 65 ? '#d97706' : '#dc2626';
  const textSize = size === 'md' ? 'text-xs' : 'text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-mono font-medium ${textSize}`}
      style={{ backgroundColor: `${color}18`, color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {pct}%
    </span>
  );
}
