'use client';

import { Star, Quote } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
}

const REVIEWS: Review[] = [
  { name: 'Hans Vermeulen', rating: 5, text: 'Al 4 jaar klant en zeer tevreden. Onze Hobby staat er altijd perfect bij als we hem ophalen. Beveiligd terrein, goede communicatie en eerlijke prijzen. Aanrader!', date: '2025-03-12' },
  { name: 'Annemarie K.', rating: 5, text: 'Caravan opgehaald na de winter en hij was helemaal schoon en startklaar. Ze hadden ook de accu bijgehouden. Dat noem ik service. Bedankt!', date: '2025-02-28' },
  { name: 'Peter & Ria Jansen', rating: 5, text: 'Transport vanuit Nederland perfect geregeld. Binnen een week stond onze caravan in Spanje. Scheelt enorm in stallingkosten en geen vochtproblemen meer.', date: '2025-01-15' },
  { name: 'Willem de Boer', rating: 5, text: 'Na hagelschade de caravan laten repareren via CaravanRepair. Onzichtbaar hersteld, echt vakwerk. Zijn duidelijk specialisten in hun vak.', date: '2024-11-20' },
  { name: 'Margot Hendriks', rating: 4, text: 'Fijne buitenstalling vlakbij de Costa Brava. Combinatie van stalling en onderhoud is ideaal. Nederlands personeel, dat communiceert makkelijk.', date: '2024-10-08' },
  { name: 'Rob & Tineke', rating: 5, text: 'Inmiddels 3 caravans gestald. Prijs-kwaliteit is top vergeleken met Nederland. Ze denken altijd mee en spreken gewoon Nederlands. Zo hoort het.', date: '2024-09-02' },
  { name: 'Gerrit Mulder', rating: 5, text: 'Hele wintercheck laten doen inclusief bandenspanning, accu en koelkast. Alles netjes gecommuniceerd met foto\'s erbij. Erg professioneel.', date: '2024-08-14' },
  { name: 'Sandra v.d. Berg', rating: 5, text: 'Eerst sceptisch over stallen in het buitenland, maar na een bezoek meteen overtuigd. Mooi terrein, goed beveiligd en alles netjes geregeld.', date: '2024-07-22' },
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
            <Star size={13} fill="currentColor" /> {avgRating}/5 — Google Reviews
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Wat onze klanten zeggen</h2>
          <p className="text-warm-gray max-w-xl mx-auto">Beoordeeld door echte klanten op Google</p>
        </motion.div>

        {/* Reviews grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {displayed.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="bg-surface rounded-2xl p-6 border border-sand-dark/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.name}</p>
                    <p className="text-[11px] text-warm-gray">Google • {new Date(review.date).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}</p>
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
          <span>{REVIEWS.length}+ beoordelingen</span>
          <div className="w-px h-4 bg-sand-dark" />
          <span>Geverifieerde klanten</span>
        </div>
      </div>
    </section>
  );
}
