import React, { useState } from 'react';
import { Calendar, Check } from 'lucide-react';

const DateRangePicker = ({ onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Last 7 Days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [error, setError] = useState('');

  const ranges = [
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days',
    'This Month',
    'Previous Month',
    'Custom Range'
  ];

  const calculateDates = (range) => {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case 'Today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'Yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'Last 7 Days':
        start.setDate(start.getDate() - 7);
        break;
      case 'Last 30 Days':
        start.setDate(start.getDate() - 30);
        break;
      case 'This Month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'Previous Month':
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setDate(0); // Last day of previous month
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return null;
    }
    
    return { 
      fromDate: start.toISOString(), 
      toDate: end.toISOString() 
    };
  };

  const handleSelect = (range) => {
    setSelectedRange(range);
    setError('');
    
    if (range !== 'Custom Range') {
      const dates = calculateDates(range);
      if (dates) {
        onApply(dates.fromDate, dates.toDate, range);
        setIsOpen(false);
      }
    }
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) {
      setError('Please select both dates');
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      setError('Start date cannot be after end date');
      return;
    }
    
    onApply(new Date(customStart).toISOString(), new Date(customEnd).toISOString(), 'Custom Range');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Calendar size={18} className="text-gray-500" />
        <span className="font-medium text-sm">{selectedRange}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-2 right-0">
          <div className="grid grid-cols-1 gap-1">
            {ranges.map(range => (
              <button
                key={range}
                onClick={() => handleSelect(range)}
                className={`flex items-center justify-between px-4 py-2 text-sm rounded-md transition-colors ${
                  selectedRange === range ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range}
                {selectedRange === range && <Check size={16} className="text-blue-600" />}
              </button>
            ))}
          </div>

          {selectedRange === 'Custom Range' && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                <input 
                  type="date" 
                  value={customStart}
                  onChange={(e) => { setCustomStart(e.target.value); setError(''); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                <input 
                  type="date" 
                  value={customEnd}
                  onChange={(e) => { setCustomEnd(e.target.value); setError(''); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApplyCustom}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
