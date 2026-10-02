import React from 'react';

const AnalyticsCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, colorClass = "bg-white", textColor = "text-gray-900" }) => {
  return (
    <div className={`rounded-xl shadow-sm border border-gray-100 p-6 ${colorClass}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {Icon && (
          <div className={`p-2 rounded-lg bg-gray-50`}>
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${textColor}`}>{value}</h2>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsCard;
