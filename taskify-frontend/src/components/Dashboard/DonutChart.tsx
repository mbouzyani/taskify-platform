import React, { useEffect, useState } from 'react';

interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
  innerRadius?: number;
  title?: string;
  animate?: boolean;
  showLabels?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 200,
  innerRadius = 60,
  title,
  animate = true,
  showLabels = true
}) => {
  const [animatedData, setAnimatedData] = useState<DonutChartData[]>(
    data.map(item => ({ ...item, value: 0 }))
  );

  const radius = (size - 20) / 2;
  const center = size / 2;
  const strokeWidth = radius - innerRadius;

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimatedData(data);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnimatedData(data);
    }
  }, [data, animate]);

  const total = animatedData.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          
          {/* Data segments */}
          {animatedData.map((item, index) => {
            if (item.value === 0) return null;
            
            const percentage = item.value / total;
            const startAngle = currentAngle;
            
            currentAngle += percentage * 360;
            
            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${percentage * 2 * Math.PI * radius} ${2 * Math.PI * radius}`}
                strokeDashoffset={-startAngle / 180 * Math.PI * radius}
                className="transition-all duration-1000 ease-out [stroke-linecap:round]"
              />
            );
          })}
        </svg>
        
        {/* Center text showing total */}
        {total > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{total}</span>
            <span className="text-sm text-gray-500">Total</span>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLabels && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {data.map((item, index) => {
            // Map colors to Tailwind classes for common chart colors
            const getColorClass = (color: string) => {
              const colorMap: { [key: string]: string } = {
                '#6B7280': 'bg-gray-500',
                '#3B82F6': 'bg-blue-500',
                '#8B5CF6': 'bg-purple-500',
                '#10B981': 'bg-green-500',
                '#F59E0B': 'bg-yellow-500',
                '#EF4444': 'bg-red-500',
              };
              return colorMap[color] || 'bg-gray-400';
            };

            return (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getColorClass(item.color)}`} />
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium text-gray-800">({item.value})</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};