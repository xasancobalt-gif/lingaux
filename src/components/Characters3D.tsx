"use client";

export function Floating3D({ children, className = "", delay = 0, float = 3 }: { children: React.ReactNode; className?: string; delay?: number; float?: number }) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        animation: `float ${float}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {/* 3D shadow */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full blur-[6px] pointer-events-none"
        style={{ width: "60%", height: "8px", background: "rgba(0,0,0,0.15)" }}
      />
      <style>{`@keyframes float {0%,100%{transform:translateY(0) translateZ(0) rotate(0deg)} 50%{transform:translateY(-6px) translateZ(8px) rotate(0.6deg)}}`}</style>
    </div>
  );
}

export function CharacterStudio() {
  return (
    <Floating3D float={3.2}>
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-[20px] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 grid place-items-center shadow-[0_16px_32px_rgba(124,58,237,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] relative" style={{ transform: "perspective(600px) rotateY(-6deg) rotateX(4deg)" }}>
        <span className="text-3xl md:text-4xl drop-shadow-sm">🎙️</span>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white grid place-items-center shadow-md text-[10px]">● REC</div>
        <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-xl bg-white text-black grid place-items-center text-xs font-black shadow-md">5:00</div>
      </div>
    </Floating3D>
  );
}

export function CharacterCommunity() {
  return (
    <div className="flex gap-2">
      {[
        { e: "🙋‍♀️", c: "from-violet-500 to-indigo-500", d: 0 },
        { e: "🎯", c: "from-emerald-500 to-teal-500", d: 0.3 },
        { e: "🔥", c: "from-orange-500 to-pink-500", d: 0.6 },
      ].map((x) => (
        <Floating3D key={x.e} delay={x.d} float={3 + x.d}>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${x.c} grid place-items-center shadow-[0_10px_20px_rgba(0,0,0,0.2)]`} style={{ transform: `perspective(500px) rotateY(${x.d*6}deg)` }}>
            <span className="text-xl">{x.e}</span>
          </div>
        </Floating3D>
      ))}
    </div>
  );
}

export function CharacterLeaderboard() {
  return (
    <Floating3D float={2.8}>
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 grid place-items-center shadow-[0_12px_24px_rgba(245,158,11,0.35)]" style={{ transform: "perspective(600px) rotateY(8deg)" }}>
        <span className="text-2xl">🏆</span>
      </div>
    </Floating3D>
  );
}

export function CharacterGuide() {
  return (
    <Floating3D float={3.4}>
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 grid place-items-center shadow-[0_12px_24px_rgba(6,182,212,0.3)]">
        <span className="text-3xl">📚</span>
      </div>
    </Floating3D>
  );
}

export function CharacterPractice() {
  return (
    <Floating3D float={3}>
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 grid place-items-center shadow-[0_12px_24px_rgba(124,58,237,0.3)]">
        <span className="text-2xl">💪</span>
      </div>
    </Floating3D>
  );
}
