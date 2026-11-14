// The ZUNO claw-mark, from the official logo image. The JPG has a white
// background and wide padding, so blend the white away and crop in.
// Colour/opacity is controlled with the `opacity-*` utility classes.
export function ClawMark({ className = 'h-8 w-8' }) {
  return (
    <span className={`block shrink-0 overflow-hidden ${className}`} aria-hidden="true">
      <img
        src="/images/zuno-logo.jpg"
        alt=""
        className="h-full w-full scale-[1.7] object-contain mix-blend-multiply"
      />
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
