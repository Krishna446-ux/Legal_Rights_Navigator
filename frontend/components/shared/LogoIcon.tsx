export function LogoIcon({
  size = 40,
  darkMode = false,
}: {
  size?: number;
  darkMode?: boolean;
}) {
  const BLUE = "#3B82F6";
  const NAVY = "#1E3A8A";
  const WHITE = "#FFFFFF";

  const markFill = darkMode ? WHITE : BLUE;
  const arrowFill = darkMode ? NAVY : WHITE;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: "block" }}
    >
      <path d="M7 5H33V23L20 36L7 23Z" fill={markFill} />
      <path d="M20 12L28 21H23V28H17V21H12L20 12Z" fill={arrowFill} />
    </svg>
  );
}
