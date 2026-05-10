interface Props {
  days: number;
}

export default function StreakBadge({ days }: Props) {
  return (
    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2">
      <span className="text-lg">🔥</span>
      <span className="font-bold text-orange-600">{days}天</span>
    </div>
  );
}
