"use client";
export function LingauxLogo({ size = 40, withText = true, className = "" }: { size?: number; withText?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Mini ribbon icon */}
      <div
        className="rounded-xl grid place-items-center shadow-lg relative overflow-hidden"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #6D28D9 0%, #EC4899 50%, #FB923C 100%)",
          boxShadow: "0 8px 24px rgba(124,58,237,0.25)",
        }}
      >
        {/* stylized ribbon */}
        <svg viewBox="0 0 100 100" width={size * 0.85} height={size * 0.85} className="drop-shadow-sm">
          <defs>
            <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.9"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M 18 72 C 22 48, 38 38, 52 52 L 72 62 C 80 66, 88 62, 92 48 L 88 38 C 84 50, 76 58, 64 54 L 48 46 C 34 40, 24 52, 18 72 Z" fill="white" opacity="0.95"/>
          <path d="M 72 62 L 88 28 L 84 26 L 94 18 L 98 32 L 90 30 L 74 66 Z" fill="white" opacity="0.95"/>
          <path d="M 74 58 L 86 28" stroke="white" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.9"/>
        </svg>
      </div>
      {withText && (
        <div className="leading-none">
          <div className="font-black tracking-[0.12em] text-[16px]" style={{ color: "#1E1B4B", fontFamily: "Montserrat, sans-serif" }}>
            LINGAUX
          </div>
          <div className="text-[9px] tracking-[0.22em] font-semibold" style={{ color: "#1E1B4B", opacity: 0.6 }}>
            SPEAK • LEARN • PROGRESS
          </div>
        </div>
      )}
    </div>
  );
}

export function LingauxFullLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/brand/lingaux-logo.png"
      alt="LINGAUX — Speak Learn Progress"
      className={className}
      width={320}
      height={200}
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
}
