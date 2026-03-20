'use client';

import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

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

export default function ReviewsWidget({ limit }: { limit?: number }) {
  void limit; // carousel shows all reviews one-by-one
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const avgRating = (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length).toFixed(1);

  const next = useCallback(() => setCurrent(c => (c + 1) % REVIEWS.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next]);

  const review = REVIEWS[current];

  return (
    <section
      className="section-immersive"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
        {/* Header */}
        <div className="inline-flex items-center gap-2 bg-warning/15 text-warning px-4 py-1.5 rounded-full text-xs font-bold mb-8">
          <Star size={13} fill="currentColor" /> {avgRating}/5 — Google Reviews
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-10">Wat onze klanten zeggen</h2>

        {/* Carousel */}
        <div className="relative min-h-[180px] sm:min-h-[160px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="card-testimonial max-w-2xl mx-auto"
            >
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed italic font-heading">
                {review.text}
              </p>
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={14} className={s < review.rating ? 'text-warning fill-warning' : 'text-white/20'} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-white">{review.name}</p>
                    <p className="text-xs text-white/40">Google • {new Date(review.date).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Review ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-primary w-6' : 'bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>

        {/* Trust line */}
        <p className="text-white/30 text-xs mt-6">
          {REVIEWS.length}+ geverifieerde Google beoordelingen
        </p>
      </div>
    </section>
  );
}
