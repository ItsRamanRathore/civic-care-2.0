import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DepartmentPerformanceChart = ({ data, loading = false }) => {
  // Process real data or use fallback
  const processedData = (data || [])
    ?.filter(item => item && (Number(item.total) > 0 || Number(item.resolved) > 0))
    ?.map(item => ({
      department: item.name || 'Unknown',
      assigned: Number(item.total) || 0,
      completed: Number(item.resolved) || 0,
      pending: Math.max(0, (Number(item.total) || 0) - (Number(item.resolved) || 0)),
      efficiency: Number(item.efficiency) || 0,
      avgResolutionTime: Number(item.avgResolutionTime) || 0
    })) || [];

  if (processedData.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No Performance Data</h3>
        <p className="text-sm text-muted-foreground max-w-xs">There is no department performance data available for this time period.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-modal">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Total Issues: <span className="font-medium text-popover-foreground">{data?.assigned}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Completed: <span className="font-medium text-success">{data?.completed}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Pending: <span className="font-medium text-accent">{data?.pending}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Efficiency: <span className="font-medium text-popover-foreground">{data?.efficiency}%</span>
            </p>
            {data?.avgResolutionTime > 0 && (
              <p className="text-sm text-muted-foreground">
                Avg Resolution: <span className="font-medium text-popover-foreground">{data?.avgResolutionTime} days</span>
              </p>
            )}
          </div>
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
          <p className="text-sm text-muted-foreground">Loading department data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
          <XAxis 
            dataKey="department" 
            stroke="#6C757D"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6C757D"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="completed" 
            fill="#28A745" 
            name="Completed"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="pending" 
            fill="#E63946" 
            name="Pending"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepartmentPerformanceChart;