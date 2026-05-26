import { Clock } from 'lucide-react';

interface Props {
  variant?: 'default' | 'compact' | 'card';
  className?: string;
}

const TEXT = 'Una vez realizada la compra, tenés enter 5 a 10 días hábiles de preparación del producto.';

export default function PreparationNotice({ variant = 'default', className = '' }: Props) {
  if (variant === 'compact') {
    return (
      <p className={`flex items-center gap-1.5 text-xs text-gray-500 ${className}`}>
        <Clock size={12} className="shrink-0" />
        {TEXT}
      </p>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 ${className}`}>
        <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900 leading-relaxed">{TEXT}</p>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2.5 text-sm text-gray-600 ${className}`}>
      <Clock size={16} className="text-gray-500 shrink-0 mt-0.5" />
      <span>{TEXT}</span>
    </div>
  );
}
