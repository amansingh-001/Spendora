import React from 'react';

interface DonutChartProps {
  data: {
    category: string;
    totalAmount: number;
    percentage: number;
    color?: string; 
  }[];
}

const ReportDonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="relative flex items-center justify-center w-full h-full" style={{ minHeight: `${size}px`}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-gray-800"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {data.map((item, index) => {
          const dashoffset = circumference - (accumulatedPercentage / 100) * circumference;
          const dasharray = (item.percentage / 100) * circumference;
          accumulatedPercentage += item.percentage;
          
          const strokeColor = item.color || '#a3e635'; 

          return (
            <circle
              key={index}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dasharray} ${circumference}`}
              strokeDashoffset={-dashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
         <span className="text-gray-400 text-sm">Total Expenses</span>
         <span className="text-2xl font-bold text-white font-mono">
            ${data.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
         </span>
      </div>
    </div>
  );
};

export default ReportDonutChart;