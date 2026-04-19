export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* A modern geometric take on the parallel/tilted bars */}
      <path
        d="M28 4L12 36H18L34 4H28Z"
        fill="url(#logo-gradient)"
        fillOpacity="0.9"
        className="transition-all duration-500 group-hover:translate-x-1"
      />
      <path
        d="M6 14H30L26 22H2L6 14Z"
        fill="url(#logo-gradient)"
        fillOpacity="0.8"
        className="transition-all duration-500 group-hover:-translate-x-1"
      />
    </svg>
  )
}
