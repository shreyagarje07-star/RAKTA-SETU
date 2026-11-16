interface Props {
  score: number;
  size?: 'sm' | 'md';
}

export function PriorityScoreBar({ score, size = 'md' }: Props) {
  const height = size === 'sm' ? 'h-2' : 'h-3';
  const color =
    score >= 80
      ? 'bg-emerald-500'
      : score >= 55
      ? 'bg-amber-500'
      : 'bg-rose-400';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-slate-600">Priority</span>
        <span className="font-bold text-slate-800">{score}/100</span>
      </div>
      <div className={`w-full bg-slate-200 rounded-full ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
