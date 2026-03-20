import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import AnimateIn from './AnimateIn';

interface CtaSectionProps {
  title: string;
  subtitle: string;
  hours?: string;
  primaryLabel: string;
  primaryHref?: string;
  onPrimaryClick?: () => void;
  primaryColor?: 'primary' | 'accent';
  secondaryPhone?: boolean;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function CtaSection({ title, subtitle, hours, primaryLabel, primaryHref = '/contact', onPrimaryClick, primaryColor = 'primary', secondaryPhone = true, secondaryLabel, secondaryHref }: CtaSectionProps) {
  const btnColor = primaryColor === 'accent' ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary-light';
  return (
    <section className="bg-primary relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center relative">
        <AnimateIn>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-white/75 mb-4 max-w-lg mx-auto leading-relaxed">{subtitle}</p>
          {hours && <p className="text-white/70 text-sm mb-8">{hours}</p>}
          {!hours && <div className="mb-4" />}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onPrimaryClick ? (
              <button onClick={onPrimaryClick} className={`${btnColor} text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5`}>
                {primaryLabel} <ArrowRight size={15} />
              </button>
            ) : (
              <Link href={primaryHref} className={`${btnColor} text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5`}>
                {primaryLabel} <ArrowRight size={15} />
              </Link>
            )}
            {secondaryPhone ? (
              <a href="tel:+34650036755" className="text-white/60 hover:text-white font-medium px-6 py-3.5 rounded-xl text-sm transition-colors inline-flex items-center gap-2 border border-white/10 hover:border-white/20">
                <Phone size={15} /> +34 650 036 755
              </a>
            ) : secondaryLabel && secondaryHref ? (
              <Link href={secondaryHref} className="text-white/60 hover:text-white font-medium px-6 py-3.5 rounded-xl text-sm transition-colors inline-flex items-center gap-2 border border-white/10 hover:border-white/20">
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
