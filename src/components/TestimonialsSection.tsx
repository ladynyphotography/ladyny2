import { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Quote, X, CheckCircle, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  image_url: string | null;
  stars: number;
  event: string;
  display_order: number;
}

const SESSION_TYPES = ['Events', 'Portrait', 'Wedding', 'Branding', 'Other'];
const AUTOPLAY_MS = 5000;

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} className="text-gold-400 fill-gold-400" />
      ))}
    </div>
  );
}

function InteractiveStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform duration-100 hover:scale-110"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            size={22}
            className={
              n <= (hover || value)
                ? 'text-gold-400 fill-gold-400'
                : 'text-charcoal-600'
            }
          />
        </button>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="relative bg-charcoal-800 border border-charcoal-700 hover:border-gold-500/40 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 flex flex-col">
      <Quote size={40} className="text-gold-500/20 mb-4 -ml-1 flex-shrink-0" fill="currentColor" />
     <p className="font-body text-charcoal-300 leading-relaxed text-sm mb-6">
        "{testimonial.quote}"
      </p>
      <div className="flex items-center gap-4 pt-6 border-t border-charcoal-700">
        {testimonial.image_url ? (
          <img
            src={testimonial.image_url}
            alt={testimonial.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-gold-500/30 flex-shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-charcoal-700 border-2 border-gold-500/30 flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-gold-400 text-sm">
              {testimonial.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-serif text-white text-sm font-medium leading-tight truncate">
            {testimonial.name}
          </p>
          <p className="font-body text-charcoal-500 text-xs mt-0.5 tracking-wide truncate">
            {testimonial.role}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StarRating count={testimonial.stars} />
          <span className="font-body text-gold-500/60 text-xs tracking-widest uppercase">
            {testimonial.event}
          </span>
        </div>
      </div>
    </div>
  );
}

const emptyForm = {
  name: '',
  role: '',
  stars: 5,
  event: 'Events',
  quote: '',
  image_url: '',
};

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Carousel state
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('display_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load testimonials:', error.message);
          setFetchError(true);
        } else {
          setTestimonials(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  // Determine how many cards are visible based on a JS window-width proxy.
  // We use breakpoints matching Tailwind md=768 lg=1024.
  const getVisible = useCallback(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }, []);

  const [visibleCount, setVisibleCount] = useState(getVisible);

  useEffect(() => {
    const onResize = () => setVisibleCount(getVisible());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [getVisible]);

  const total = testimonials.length;
  const maxIndex = Math.max(0, total - visibleCount);

  const advance = useCallback(
    (dir: 1 | -1) => {
      setIndex((prev) => {
        const next = prev + dir;
        if (next < 0) return maxIndex;
        if (next > maxIndex) return 0;
        return next;
      });
    },
    [maxIndex]
  );

  // Autoplay
  useEffect(() => {
    if (paused || total <= visibleCount) return;
    timerRef.current = setInterval(() => advance(1), AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, advance, total, visibleCount]);

  const manualNav = (dir: 1 | -1) => {
    if (timerRef.current) clearInterval(timerRef.current);
    advance(dir);
  };

  const goTo = (i: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIndex(Math.min(i, maxIndex));
  };

  // Keep index in bounds when visibleCount changes
  useEffect(() => {
    setIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const openModal = () => {
    setForm({ ...emptyForm });
    setSubmitted(false);
    setSubmitError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim() || !form.quote.trim()) {
      setSubmitError('Name, title, and message are required.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const { error } = await supabase.from('testimonials').insert([
      {
        name: form.name.trim(),
        role: form.role.trim(),
        quote: form.quote.trim(),
        image_url: form.image_url.trim() || null,
        stars: form.stars,
        event: form.event,
        approved: false,
      },
    ]);

    setSubmitting(false);

    if (error) {
      setSubmitError('Something went wrong. Please try again.');
      return;
    }

    setSubmitted(true);
  };

  const cardWidthPct = 100 / visibleCount;
  const translatePct = -(index * cardWidthPct);

  return (
    <section id="testimonials" className="bg-charcoal-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="text-center mb-16 reveal">
          <p className="font-body text-gold-400 text-xs tracking-[0.4em] uppercase mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-gold-400" />
            Client Love
            <span className="w-8 h-px bg-gold-400" />
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Words from the Heart
          </h2>
          <div className="gold-divider" />
          <p className="font-body text-charcoal-400 max-w-xl mx-auto leading-relaxed">
            The greatest honor is hearing how these photographs have become irreplaceable pieces of
            someone's story.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-charcoal-800 border border-charcoal-700 p-8 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : fetchError ? (
          <div className="text-center py-12">
            <p className="font-body text-charcoal-500 text-sm">
              Reviews could not be loaded. Please try refreshing.
            </p>
          </div>
        ) : total > 0 ? (
          <div className="relative">
            {/* Carousel viewport */}
            <div
              className="overflow-hidden"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(${translatePct}%)` }}
              >
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${cardWidthPct}%` }}
                  >
                    <TestimonialCard testimonial={t} />
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow buttons — only show when there are more cards than fit */}
            {total > visibleCount && (
              <>
                <button
                  onClick={() => manualNav(-1)}
                  aria-label="Previous testimonial"
                  className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-charcoal-800 border border-charcoal-700 hover:border-gold-500/50 hover:bg-charcoal-700 text-charcoal-400 hover:text-gold-400 transition-all duration-200 z-10"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => manualNav(1)}
                  aria-label="Next testimonial"
                  className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-charcoal-800 border border-charcoal-700 hover:border-gold-500/50 hover:bg-charcoal-700 text-charcoal-400 hover:text-gold-400 transition-all duration-200 z-10"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {total > visibleCount && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      i === index
                        ? 'w-6 h-1.5 bg-gold-400'
                        : 'w-1.5 h-1.5 bg-charcoal-600 hover:bg-charcoal-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="text-center mt-14 reveal">
          <p className="font-body text-charcoal-500 text-sm mb-2">
            Rated 5 stars by many clients
          </p>
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} className="text-gold-400 fill-gold-400" />
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#contact" className="btn-gold">
              Join Happy Clients
            </a>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase border border-gold-500/40 text-gold-400 hover:border-gold-400 hover:text-gold-300 px-7 py-3 transition-all duration-300"
            >
              <Star size={13} />
              Leave a Review
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-charcoal-900 border border-charcoal-700 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-700 sticky top-0 bg-charcoal-900 z-10">
              <div>
                <h3 className="font-serif text-xl text-white">Share Your Experience</h3>
                <p className="font-body text-charcoal-400 text-xs mt-0.5">
                  Your review will be shared once approved
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-gold-400" />
                </div>
                <h4 className="font-serif text-2xl text-white mb-2">Thank You!</h4>
                <p className="font-body text-charcoal-400 text-sm leading-relaxed max-w-xs mx-auto mb-6">
                  Your review has been received and will appear here once approved. We truly
                  appreciate you taking the time to share your experience.
                </p>
                <button onClick={closeModal} className="btn-gold text-xs">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {submitError && (
                  <div className="px-4 py-3 bg-red-900/30 border border-red-700/50 text-red-400 font-body text-sm">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs tracking-widest uppercase text-charcoal-400 mb-1.5 block">
                      Name *
                    </label>
                    <input
                      className="w-full bg-charcoal-800 border border-charcoal-600 focus:border-gold-500/60 text-white font-body text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-charcoal-600"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="font-body text-xs tracking-widest uppercase text-charcoal-400 mb-1.5 block">
                      Title / Role *
                    </label>
                    <input
                      className="w-full bg-charcoal-800 border border-charcoal-600 focus:border-gold-500/60 text-white font-body text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-charcoal-600"
                      placeholder="e.g. Bride, Artist"
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-body text-xs tracking-widest uppercase text-charcoal-400 mb-2 block">
                    Your Rating *
                  </label>
                  <InteractiveStars
                    value={form.stars}
                    onChange={(v) => setForm((f) => ({ ...f, stars: v }))}
                  />
                </div>

                <div>
                  <label className="font-body text-xs tracking-widest uppercase text-charcoal-400 mb-1.5 block">
                    Session Type
                  </label>
                  <select
                    className="w-full bg-charcoal-800 border border-charcoal-600 focus:border-gold-500/60 text-white font-body text-sm px-3 py-2.5 outline-none transition-colors"
                    value={form.event}
                    onChange={(e) => setForm((f) => ({ ...f, event: e.target.value }))}
                  >
                    {SESSION_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-body text-xs tracking-widest uppercase text-charcoal-400 mb-1.5 block">
                    Your Message *
                  </label>
                  <textarea
                    className="w-full bg-charcoal-800 border border-charcoal-600 focus:border-gold-500/60 text-white font-body text-sm px-3 py-2.5 outline-none transition-colors resize-none placeholder:text-charcoal-600"
                    rows={4}
                    placeholder="Tell us about your experience..."
                    value={form.quote}
                    onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="font-body text-xs tracking-widest uppercase text-charcoal-400 mb-1.5 block">
                    Photo URL{' '}
                    <span className="normal-case tracking-normal text-charcoal-600">(optional)</span>
                  </label>
                  <input
                    className="w-full bg-charcoal-800 border border-charcoal-600 focus:border-gold-500/60 text-white font-body text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-charcoal-600"
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 font-body text-xs tracking-widest uppercase border border-charcoal-600 text-charcoal-400 hover:border-charcoal-400 hover:text-charcoal-200 py-3 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-gold text-xs gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader size={13} className="animate-spin" /> Submitting…
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
