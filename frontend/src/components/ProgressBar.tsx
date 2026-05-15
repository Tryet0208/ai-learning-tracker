interface Props {
  value: number;
  max: number;
  label?: string;
  size?: "sm" | "md";
}

export default function ProgressBar({ value, max, label, size = "md" }: Props) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const h = size === "sm" ? "h-2" : "h-4";
  return (
    <div>
      {label && <div className="flex justify-between text-sm mb-1"><span>{label}</span><span>{pct}%</span></div>}
      <div className={`${h} bg-gray-200 rounded-full overflow-hidden`}>
        <div className={`${h} bg-blue-500 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
