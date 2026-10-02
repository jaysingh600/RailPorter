import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const StatusChart = ({ data, type = 'booking' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-gray-500">No data available.</p>
      </div>
    );
  }

  const bookingColors = {
    'COMPLETED': '#10b981',
    'CANCELLED': '#ef4444',
    'REQUESTED': '#f59e0b',
    'ACCEPTED': '#3b82f6',
    'IN_TRANSIT': '#6366f1',
    'REJECTED': '#6b7280',
    'EXPIRED': '#9ca3af',
    'LUGGAGE_PICKED': '#8b5cf6',
    'REACHED_PLATFORM': '#ec4899'
  };

  const paymentColors = {
    'SUCCESS': '#10b981',
    'FAILED': '#ef4444',
    'PENDING': '#f59e0b',
    'REFUNDED': '#6b7280'
  };

  const colors = type === 'booking' ? bookingColors : paymentColors;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="count"
            nameKey="_id"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[entry._id] || '#cbd5e1'} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value, name) => [value, name.replace(/_/g, ' ')]}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => value.replace(/_/g, ' ')}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;
