"use client";

interface StatCardProps {
  title: string;
  value: number | string;
  className?: string;
}

export function StatCard({ title, value, className = "" }: StatCardProps) {
  return (
    <div className={`bg-[#1a1a1a] rounded-xl border border-white/10 p-4 ${className}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
