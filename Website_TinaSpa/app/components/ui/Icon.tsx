export interface IconProps {
  readonly name: string
  readonly className?: string
  readonly filled?: boolean
  readonly size?: number
}

export function Icon({ name, className = '', filled = false, size }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size ?? 24}`,
        fontSize: size
      }}
      aria-hidden
    >
      {name}
    </span>
  )
}
