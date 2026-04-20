import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';

const ResolutionTimelineChart = ({ data, chartType = 'line', loading = false }) => {
  // Process real data or use fallback
  const chartData = data && data.length > 0 ?
    data.map(item => {
      const dateObj = item.date ? new Date(item.date) : null;
      const isValidDate = dateObj && !isNaN(dateObj.getTime());
      
      return {
        date: isValidDate ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown',
        reported: Number(item.total) || 0,
        resolved: Number(item.resolved) || 0,
        pending: Number(item.pending) || 0
      };
    }) : [
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

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon name="Activity" size={32} className="text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Timeline Data Unavailable</p>
        <p className="text-xs text-muted-foreground mt-1">Resolution trends will appear here once issues are tracked</p>
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