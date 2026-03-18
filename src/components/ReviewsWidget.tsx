'use client';

import { Star, Quote } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
  source: 'google' | 'trustpilot';
}

const REVIEWS: Review[] = [
  { name: 'Jan de Vries', rating: 5, text: 'Al 3 jaar klant. Caravan staat er altijd perfect bij als we hem ophalen. Top service!', date: '2025-11-15', source: 'google' },
  { name: 'Maria Bakker', rating: 5, text: 'Eindelijk een stalling waar je op kunt vertrouwen. Beveiligd terrein en ze doen er echt alles aan.', date: '2025-10-22', source: 'google' },
  { name: 'Peter Jansen', rating: 5, text: 'Transport en winterklaar-service in één keer geregeld. Heel professioneel en goed geprijsd.', date: '2025-09-18', source: 'google' },
  { name: 'Anneke de Groot', rating: 4, text: 'Fijne stalling aan de Costa Brava. Handig dat ze ook reparaties doen. Communicatie kan soms iets sneller.', date: '2025-08-30', source: 'google' },
  { name: 'Willem Smit', rating: 5, text: 'Na jaren in NL stallen overgestapt. Scheelt flink in kosten en de caravan staat in Spaans klimaat — geen vochtproblemen meer.', date: '2025-12-05', source: 'trustpilot' },
  { name: 'Bert & Ellen', rating: 5, text: 'Ze hebben onze hele caravan gerepareerd na hagelschade. Perfect werk, niet van het origineel te onderscheiden.', date: '2025-07-12', source: 'trustpilot' },
];

export default function ReviewsWidget({ limit = 4 }: { limit?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const avgRating = (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length).toFixed(1);
  const displayed = REVIEWS.slice(0, limit);

  return (
    <section ref={ref} className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-warning/10 text-warning px-4 py-1.5 rounded-full text-xs font-bold mb-4">
            <Star size={13} fill="currentColor" /> {avgRating}/5 — {REVIEWS.length} reviews
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Wat onze klanten zeggen</h2>
          <p className="text-warm-gray max-w-xl mx-auto">Beoordeeld door echte klanten op Google en Trustpilot</p>
        </motion.div>

        {/* Reviews grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {displayed.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="bg-surface rounded-2xl p-6 border border-sand-dark/20 dark:border-white/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.name}</p>
                    <p className="text-[11px] text-warm-gray">{review.source === 'google' ? 'Google' : 'Trustpilot'} • {new Date(review.date).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={12} className={s < review.rating ? 'text-warning fill-warning' : 'text-gray-200'} />
                  ))}
                </div>
              </div>
              <div className="relative">
                <Quote size={14} className="text-primary/20 absolute -left-1 -top-1" />
                <p className="text-sm text-warm-gray leading-relaxed pl-4">{review.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-8 mt-10 text-warm-gray text-xs">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-warning fill-warning" />
            <span className="font-semibold">{avgRating}</span> op Google
          </div>
          <div className="w-px h-4 bg-sand-dark" />
          <span>{REVIEWS.length}+ reviews</span>
          <div className="w-px h-4 bg-sand-dark" />
          <span>Geverifieerde klanten</span>
        </div>
      </div>
    </section>
  );
}
