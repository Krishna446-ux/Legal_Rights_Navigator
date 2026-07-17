import React from 'react';

interface Props {
  confidence: number
  size?: 'sm' | 'md'
}

export default function ConfidenceBadge({ confidence, size = 'sm' }: Props) {
  const pct = Math.round(confidence * 100)
  // use CSS variables that adapt to dark mode
  const color = pct >= 85 ? '#22c55e' : pct >= 65 ? '#f59e0b' : '#ef4444'
  const bg = pct >= 85 ? 'color-mix(in srgb, #22c55e 15%, transparent)' : pct >= 65 ? 'color-mix(in srgb, #f59e0b 15%, transparent)' : 'color-mix(in srgb, #ef4444 15%, transparent)'
  const label = pct >= 85 ? 'High' : pct >= 65 ? 'Medium' : 'Low'

  const sz = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-1 gap-1.5'

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded ${sz}`}
      style={{ color, backgroundColor: bg }}
    >
      <span
        className="rounded-full flex-shrink-0"
        style={{ width: size === 'sm' ? 5 : 6, height: size === 'sm' ? 5 : 6, backgroundColor: color }}
      />
      {pct}% {label}
    </span>
  )
}
