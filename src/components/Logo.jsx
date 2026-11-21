// The ZUNO claw-mark: a transparent, tightly cropped PNG of the official logo.
// Opacity is controlled with the `opacity-*` utility classes.
export function ClawMark({ className = 'h-8 w-8' }) {
  return (
    <span className={`block shrink-0 ${className}`} aria-hidden="true">
      <img src="/images/zuno-logo.png" alt="" className="h-full w-full object-contain" />
    </span>
  )
}

export default function Logo() {
  return (
    <span className="flex items-center gap-1.5">
      <ClawMark className="h-9 w-9" />
      <span className="display text-2xl text-ink">ZUNO</span>
    </span>
  )
}
