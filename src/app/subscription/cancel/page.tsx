import Link from "next/link";

export default function Cancel() {
  return (
    <div className="min-h-screen bg-mesh grid place-items-center p-6">
      <div className="glass-card rounded-[28px] p-8 max-w-[560px] w-full text-center">
        <div className="w-16 h-16 rounded-full glass grid place-items-center mx-auto text-xl">✕</div>
        <h1 className="mt-4 font-serif text-2xl font-bold">Checkout canceled</h1>
        <p className="mt-2 text-white/60 text-sm">No charge made. You can stay on Free or try again. Pro unlocks after payment + webhook.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/" className="px-6 py-3 rounded-full bg-white text-black font-bold">Back to LINGAUX</Link>
          <Link href="/?paywall=1" className="px-6 py-3 rounded-full glass">View plans again</Link>
        </div>
      </div>
    </div>
  );
}
