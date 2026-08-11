export function AuthLogoPanel() {
  return (
    <div
      className="hidden lg:flex flex-1 min-h-0 items-center justify-center order-1 lg:order-2"
      style={{ background: 'var(--accent-blue)' }}
    >
      <div className="w-[70%] max-w-md">
        <svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <g transform="translate(30,40)">
            <path fill="#FFFFFF" d="M60 0 L120 45 L108 45 L108 110 L12 110 L12 45 L0 45 Z" />
            <rect fill="#9FC4E8" x="48" y="70" width="24" height="40" rx="2" />
            <g transform="translate(35,20) rotate(-35 60 45)">
              <circle cx="60" cy="45" r="14" fill="none" stroke="#9FC4E8" strokeWidth={8} />
              <rect fill="#9FC4E8" x="66" y="40" width="46" height="10" rx="3" />
              <rect fill="#9FC4E8" x="104" y="34" width="10" height="22" rx="2" />
            </g>
          </g>
          <text
            x="175"
            y="105"
            fontSize="58"
            fill="#FFFFFF"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            Fix<tspan fill="#9FC4E8">It</tspan>
          </text>
          <text
            x="177"
            y="130"
            fontSize="13"
            fill="#C7D6E5"
            letterSpacing="2"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            PROPERTY MAINTENANCE BOARD
          </text>
          <line x1="177" y1="145" x2="470" y2="145" stroke="#C7D6E5" strokeWidth={1.5} strokeDasharray="4 3" />
        </svg>
      </div>
    </div>
  );
}