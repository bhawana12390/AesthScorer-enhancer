interface ScoreDisplayProps {
  score: number;
  label: string;
}

export function ScoreDisplay({ score, label }: ScoreDisplayProps) {
  const percentage = Math.round(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  // We cap the score at 10 for the ring display
  const displayScore = Math.min(score, 10);
  const offset = circumference - (displayScore / 10) * circumference;

  let scoreColorClass = 'text-green-500';
  if (score < 4) {
    scoreColorClass = 'text-destructive';
  } else if (score < 7) {
    scoreColorClass = 'text-yellow-500';
  }


  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-muted/50 p-4">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            className="text-border"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            className={`transform origin-center transition-all duration-500 ease-out ${scoreColorClass}`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${scoreColorClass}`}>{score.toFixed(1)}</span>
          <span className="text-sm font-medium text-muted-foreground -mt-1">Score</span>
        </div>
      </div>
      <p className="font-semibold text-center text-muted-foreground">{label}</p>
    </div>
  );
}
