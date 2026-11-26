/** The product mark: a badge with its lanyard slot. Same shape as public/favicon.svg. */
export function BadgeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 2h16a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm4 5.5a1.5 1.5 0 0 0 0 3h8a1.5 1.5 0 0 0 0-3z"
      />
    </svg>
  );
}
