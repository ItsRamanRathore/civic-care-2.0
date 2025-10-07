import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const IssuesByCategoryChart = ({ data, loading = false }) => {
  // Color palette for categories
  const colors = ['#0D1B2A', '#415A77', '#778DA9', '#E0E1DD', '#E63946', '#F1FAEE', '#2A9D8F', '#E76F51'];
  
  // Process real data or use fallback
  const chartData = data && data.length > 0 ?
    data.map((item, index) => ({
      name: item.name,
      value: item.value,
      percentage: item.percentage,
      color: colors[index % colors.length]
    })) : [
      { name: 'No Data Available', value: 1, color: '#E0E1DD' }
    ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="font-medium text-popover-foreground">{data?.name}</p>
          <p className="text-sm text-muted-foreground">
            Issues: <span className="font-medium text-popover-foreground">{data?.value}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium text-popover-foreground">
              {data?.payload?.percentage || ((data?.value / chartData?.reduce((sum, item) => sum + item?.value, 0)) * 100)?.toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry?.color }}
            ></div>
            <span className="text-sm text-card-foreground">{entry?.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry?.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IssuesByCategoryChart;