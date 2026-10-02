import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BookingChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-gray-500">No booking data available for this period.</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="_id" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888', fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            type="monotone" 
            name="Total Bookings" 
            dataKey="total" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#3b82f6' }} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            name="Completed" 
            dataKey="completed" 
            stroke="#10b981" 
            strokeWidth={2} 
            dot={{ r: 3, fill: '#10b981' }} 
          />
          <Line 
            type="monotone" 
            name="Cancelled" 
            dataKey="cancelled" 
            stroke="#ef4444" 
            strokeWidth={2} 
            dot={{ r: 3, fill: '#ef4444' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingChart;
