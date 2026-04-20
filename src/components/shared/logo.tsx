import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
          light ? "border-white/20 bg-white/10" : "border-accent-100 bg-accent-50"
        }`}
      >
        <span className={`text-lg font-semibold ${light ? "text-white" : "text-accent-700"}`}>SEA</span>
      </div>
      <div className="leading-tight">
        <div className={`text-sm font-medium uppercase tracking-[0.3em] ${light ? "text-white/70" : "text-slate-500"}`}>
          Visual Lab
        </div>
        <div className={`text-base font-semibold ${light ? "text-white" : "text-ink"}`}>图片生成工作台</div>
      </div>
    </Link>
  );
}
