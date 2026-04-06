import { getStageColor } from "@/shared/config/kohlberg-stages";

interface ScoreGaugeProps {
  score: number | null;
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = score ? getStageColor(score) : "#9CA3AF";
  const progress = score ? (score / 6) * circumference : 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-700"
        />
        {score && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
          />
        )}
      </svg>
      <span
        className="absolute text-3xl font-bold font-serif"
        style={{ color }}
      >
        {score ?? "—"}
      </span>
    </div>
  );
}
