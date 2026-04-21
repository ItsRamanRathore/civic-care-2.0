import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label, color }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-neutral-100 shadow-xl rounded-xl p-3 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
          <span className="text-xs font-bold text-neutral-900 tracking-tight">
            {payload[0].value.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const RechartsSparkline = ({ data, color, gradientId }) => {
  // Transform data format for Recharts
  const chartData = data.map((val, i) => ({ value: val, index: i }));

  return (
    <div className="w-full h-24 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip 
            content={<CustomTooltip color={color} />} 
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }}
            isAnimationActive={true}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            fill={`url(#${gradientId})`}
            animationDuration={2000}
            animationEasing="ease-in-out"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RechartsSparkline;
