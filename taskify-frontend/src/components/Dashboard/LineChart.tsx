import React, { useEffect, useState } from 'react';

interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  height?: number;
  color?: string;
  animate?: boolean;
  title?: string;
  showDots?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  color = '#3B82F6',
  animate = true,
  title,
  showDots = true
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimationProgress(1);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnimationProgress(1);
    }
  }, [animate]);

  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const valueRange = maxValue - minValue || 1;

  const getY = (value: number) => {
    return height - 40 - ((value - minValue) / valueRange) * (height - 80);
  };

  const getX = (index: number) => {
    return (index / (data.length - 1)) * 100;
  };

  // Create SVG path
  const pathData = data.map((item, index) => {
    const x = getX(index);
    const y = getY(item.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const pathLength = data.length * 50; // Approximate path length for animation

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="relative bg-gray-50 rounded-lg p-4" style={{ height: height + 60 }}>
        <svg
          className="absolute inset-4"
          width="calc(100% - 32px)"
          height={height}
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={height - 40 - percent * (height - 80)}
              x2="100"
              y2={height - 40 - percent * (height - 80)}
              stroke="#E5E7EB"
              strokeWidth="0.5"
            />
          ))}

          {/* Main line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={animate ? pathLength : 0}
            strokeDashoffset={animate ? pathLength * (1 - animationProgress) : 0}
            className="transition-all duration-2000 ease-out"
          />

          {/* Area under the line */}
          <path
            d={`${pathData} L 100 ${height - 40} L 0 ${height - 40} Z`}
            fill={`url(#gradient-${color.replace('#', '')})`}
            opacity="0.1"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Data points */}
          {showDots && data.map((item, index) => (
            <circle
              key={index}
              cx={getX(index)}
              cy={getY(item.value)}
              r="3"
              fill={color}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-1000 ease-out"
              style={{
                opacity: animationProgress,
                transform: `scale(${animationProgress})`
              }}
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-4 right-4 flex justify-between">
          {data.map((item, index) => (
            <span key={index} className="text-xs text-gray-600">
              {item.label}
            </span>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between">
          {[maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), minValue].map((value, index) => (
            <span key={index} className="text-xs text-gray-600 -ml-8">
              {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
