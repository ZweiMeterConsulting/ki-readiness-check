import { DIMENSIONS } from "@/lib/data";
import { getDimScore } from "@/lib/scoring";

const CX = 160;
const CY = 160;
const MAX_R = 120;
const GRID_LEVELS = [1, 2, 3, 4];

function polarToXY(index: number, value: number, total: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (value / 4) * MAX_R;
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function pointsToPath(points: { x: number; y: number }[]): string {
  return (
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") +
    "Z"
  );
}

export default function RadarChart({
  dimScores,
}: {
  dimScores: Record<string, number>;
}) {
  const n = DIMENSIONS.length;

  const dataPoints = DIMENSIONS.map((d, i) =>
    polarToXY(i, getDimScore(dimScores, d.id), n)
  );
  const dataPath = pointsToPath(dataPoints);

  return (
    <svg viewBox="0 0 320 320" style={{ width: "100%", maxWidth: 360 }}>
      {GRID_LEVELS.map((level) => {
        const pts = Array.from({ length: n }, (_, i) =>
          polarToXY(i, level, n)
        );
        return (
          <path
            key={level}
            d={pointsToPath(pts)}
            fill="none"
            stroke="#D5D8DC"
            strokeWidth={level === 2 ? 1.5 : 0.7}
            strokeDasharray={level === 2 ? "4,3" : "none"}
          />
        );
      })}
      {DIMENSIONS.map((d, i) => {
        const end = polarToXY(i, 4, n);
        return (
          <line
            key={d.id}
            x1={CX}
            y1={CY}
            x2={end.x}
            y2={end.y}
            stroke="#D5D8DC"
            strokeWidth={0.7}
          />
        );
      })}
      <path
        d={dataPath}
        fill="rgba(26,58,92,0.18)"
        stroke="#1A3A5C"
        strokeWidth={2.5}
      />
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={5}
          fill={DIMENSIONS[i].color}
          stroke="#fff"
          strokeWidth={2}
        />
      ))}
      {DIMENSIONS.map((d, i) => {
        const lp = polarToXY(i, 4.85, n);
        return (
          <text
            key={d.id}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              fill: d.color,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {d.shortLabel}
          </text>
        );
      })}
      {GRID_LEVELS.map((level) => {
        const p = polarToXY(level === 0 ? 0 : 0, level, n);
        return (
          <text
            key={level}
            x={p.x + 8}
            y={p.y - 4}
            style={{
              fontSize: 8.5,
              fill: "#999",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {level}
          </text>
        );
      })}
    </svg>
  );
}
