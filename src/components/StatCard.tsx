interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down';
  color?: string;
  suffix?: string;
}

export default function StatCard({ label, value, change, changeType, color, suffix }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <p className="text-[10px] lg:text-xs font-medium text-slate-500 mb-1 lg:mb-2">{label}</p>
      <p className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${color || 'text-slate-900'}`}>
        {value}
        {suffix && <span className="text-lg font-medium text-slate-400 ml-1">{suffix}</span>}
      </p>
      {change && (
        <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
          changeType === 'up' ? 'text-green-600' : 
          changeType === 'down' ? 'text-red-500' : 
          color || 'text-slate-500'
        }`}>
          {changeType === 'up' && (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          )}
          {changeType === 'down' && (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
          {change}
        </p>
      )}
    </div>
  );
}
