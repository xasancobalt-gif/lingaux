"use client";
import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-mesh text-white grid place-items-center p-6">
      <div className="glass-card rounded-[28px] p-8 max-w-[480px] w-full text-center">
        <div className="font-serif text-5xl font-black">500</div>
        <h1 className="mt-2 text-xl font-bold">Something broke on our side</h1>
        <p className="mt-2 text-sm text-white/60">Your data is safe. Try again — if it keeps happening, contact lingauxofficial@gmail.com.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={reset} className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm">Try again</button>
          <Link href="/" className="px-6 py-3 rounded-full glass font-semibold text-sm">Go home</Link>
        </div>
      </div>
    </div>
  );
}
