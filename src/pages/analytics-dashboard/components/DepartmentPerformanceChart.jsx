import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DepartmentPerformanceChart = ({ data, loading = false }) => {
  // Process real data or use fallback
  const chartData = data && data.length > 0 ?
    data.map(item => ({
      department: item.name || 'Unknown',
      assigned: item.total || 0,
      completed: item.resolved || 0,
      pending: (item.total || 0) - (item.resolved || 0),
      efficiency: item.efficiency || 0,
      avgResolutionTime: item.avgResolutionTime || 0
    })) : [
      {
        department: 'No Data',
        assigned: 0,
        completed: 0,
        pending: 0,
        efficiency: 0,
        avgResolutionTime: 0
      }
    ];

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
          data={chartData}
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