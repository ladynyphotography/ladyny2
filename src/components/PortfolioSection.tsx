import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PortfolioImage {
  id: string;
  url: string;
  alt: string;
  category: string;
  span: string;
  display_order: number;
}

type Category = 'All' | 'Portraits' | 'Events' | 'Weddings' | 'Branding';

const DEFAULT_CATEGORIES: Category[] = ['All', 'Portraits', 'Events', 'Weddings', 'Branding'];

export default function PortfolioSection() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('portfolio_images')
      .select('*')
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        setImages(data ?? []);
        setLoading(false);
      });
  }, []);

  const categories = DEFAULT_CATEGORIES.filter(
    (cat) => cat === 'All' || images.some((img) => img.category === cat)
  );

  const filtered =
    activeCategory === 'All'
      ? images
      : images.filter((img) => img.category === activeCategory);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + filtered.length) % filtered.length : null
    );
  }, [filtered.length]);

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % filtered.length : null
    );
  }, [filtered.length]);

  return (
    <section id="portfolio" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="text-center mb-12 reveal">
          <p className="font-body text-gold-500 text-xs tracking-[0.4em] uppercase mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-gold-500" />
            My Work
            <span className="w-8 h-px bg-gold-500" />
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-charcoal-900 mb-4">
            Portfolio Gallery
          </h2>
          <div className="gold-divider" />
          <p className="font-body text-charcoal-500 max-w-xl mx-auto leading-relaxed">
            A curated collection of moments captured with intention, artistry, and heart.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 reveal">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setLightboxIndex(null); }}
              className={`font-body text-xs tracking-widest uppercase px-5 py-2.5 transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-charcoal-900 text-white'
                  : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200 hover:text-charcoal-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid bg-cream-100 animate-pulse"
                style={{ height: i % 3 === 0 ? '360px' : '240px' }}
              />
            ))}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((image, index) => (
              <div
                key={`${image.id}-${activeCategory}`}
                className={`break-inside-avoid relative group overflow-hidden cursor-pointer ${
                  image.span === 'tall' ? 'row-span-2' : ''
                }`}
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/40 transition-all duration-500 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                      <ZoomIn size={20} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="font-body text-white text-xs tracking-widest uppercase">{image.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12 reveal">
          <a href="#contact" className="btn-outline-dark">
            Book Your Session
          </a>
        </div>
      </div>

      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300 z-10"
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 md:left-8 w-12 h-12 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="relative max-w-5xl max-h-[85vh] mx-16 md:mx-24"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filtered[lightboxIndex].url}
              alt={filtered[lightboxIndex].alt}
              className="max-w-full max-h-[85vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="font-body text-white text-sm text-center tracking-wide">
                {filtered[lightboxIndex].alt}
              </p>
              <p className="font-body text-gold-400 text-xs text-center tracking-widest uppercase mt-1">
                {filtered[lightboxIndex].category}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 md:right-8 w-12 h-12 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300 z-10"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
            {filtered.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === lightboxIndex ? 'bg-gold-400 w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
