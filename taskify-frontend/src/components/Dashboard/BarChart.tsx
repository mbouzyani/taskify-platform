import React, { useEffect, useState } from 'react';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
  maxValue?: number;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  animate?: boolean;
  showValues?: boolean;
  title?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  animate = true,
  showValues = true,
  title
}) => {
  const [animatedData, setAnimatedData] = useState<BarChartData[]>(
    data.map(item => ({ ...item, value: 0 }))
  );

  const maxValue = Math.max(...data.map(item => item.value));

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

  const getBarHeight = (value: number) => {
    return (value / maxValue) * (height - 40);
  };

  const getBarColor = (index: number, customColor?: string) => {
    const defaultColors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-indigo-500'
    ];
    return customColor || defaultColors[index % defaultColors.length];
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="relative" style={{ height: height + 60 }}>
        <div className="flex items-end justify-between h-full pb-8">
          {animatedData.map((item, index) => (
            <div key={item.label} className="flex flex-col items-center flex-1 mx-1">
              {/* Bar */}
              <div
                className={`w-full max-w-12 rounded-t-lg transition-all duration-1000 ease-out ${getBarColor(index, item.color)}`}
                style={{
                  height: `${getBarHeight(item.value)}px`,
                  minHeight: item.value > 0 ? '4px' : '0px'
                }}
              >
                {/* Value label on top of bar */}
                {showValues && item.value > 0 && (
                  <div className="relative -top-6 text-center">
                    <span className="text-xs font-medium text-gray-700 bg-white px-1 rounded shadow-sm">
                      {item.value}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Label */}
              <div className="mt-2 text-xs text-gray-600 text-center max-w-16 truncate">
                {item.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Y-axis lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 0.25, 0.5, 0.75, 1].map((percent) => (
            <div
              key={percent}
              className="absolute w-full border-b border-gray-200"
              style={{ 
                bottom: `${8 + percent * (height - 40)}px`,
                opacity: percent === 0 ? 1 : 0.3
              }}
            >
              <span className="absolute -left-8 -top-2 text-xs text-gray-500">
                {Math.round(maxValue * percent)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
