'use client';

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  size?: 'sm' | 'md';
}

export default function Tabs({ tabs, active, onChange, size = 'md' }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 bg-gray-100 rounded-xl p-1.5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
            font-semibold rounded-lg transition-all duration-200
            ${active === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
              active === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-300/50 text-gray-500'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
