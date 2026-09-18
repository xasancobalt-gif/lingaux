import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-mesh text-white grid place-items-center p-6">
      <div className="glass-card rounded-[28px] p-8 max-w-[480px] w-full text-center">
        <div className="font-serif text-5xl font-black">404</div>
        <h1 className="mt-2 text-xl font-bold">This page doesn&apos;t exist</h1>
        <p className="mt-2 text-sm text-white/60">It may have moved. Head back and keep your streak alive.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/" className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm">Dashboard</Link>
          <Link href="/guide" className="px-6 py-3 rounded-full glass font-semibold text-sm">Guide</Link>
        </div>
      </div>
    </div>
  );
}
