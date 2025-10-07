import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const ResolutionTimelineChart = ({ data, chartType = 'line', loading = false }) => {
  // Process real data or use fallback
  const chartData = data && data.length > 0 ?
    data.map(item => ({
      date: item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown',
      reported: item.total || 0,
      resolved: item.resolved || 0,
      pending: item.pending || 0
    })) : [
      { date: 'No Data', reported: 0, resolved: 0, pending: 0 }
    ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.name}: <span className="font-medium">{entry?.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading timeline data...</p>
        </div>
      </div>
    );
  }

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
          <XAxis
            dataKey="date"
            stroke="#6C757D"
            fontSize={12}
          />
          <YAxis 
            stroke="#6C757D"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {chartType === 'area' ? (
            <>
              <Area
                type="monotone"
                dataKey="reported"
                stackId="1"
                stroke="#0D1B2A"
                fill="#0D1B2A"
                fillOpacity={0.8}
                name="Total Issues"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stackId="2"
                stroke="#28A745"
                fill="#28A745"
                fillOpacity={0.8}
                name="Resolved"
              />
              <Area
                type="monotone"
                dataKey="pending"
                stackId="3"
                stroke="#E63946"
                fill="#E63946"
                fillOpacity={0.8}
                name="Pending"
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="reported"
                stroke="#0D1B2A"
                strokeWidth={3}
                dot={{ fill: '#0D1B2A', strokeWidth: 2, r: 4 }}
                name="Total Issues"
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="#28A745"
                strokeWidth={3}
                dot={{ fill: '#28A745', strokeWidth: 2, r: 4 }}
                name="Resolved"
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#E63946"
                strokeWidth={3}
                dot={{ fill: '#E63946', strokeWidth: 2, r: 4 }}
                name="Pending"
              />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default ResolutionTimelineChart;