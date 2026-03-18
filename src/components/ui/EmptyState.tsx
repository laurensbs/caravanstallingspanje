import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 bg-sand rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Icon size={28} className="text-primary/40" />
      </div>
      <h3 className="text-base font-bold text-surface-dark mb-1.5">{title}</h3>
      {description && <p className="text-sm text-warm-gray max-w-sm mx-auto mb-6">{description}</p>}
      {action}
    </div>
  );
}
