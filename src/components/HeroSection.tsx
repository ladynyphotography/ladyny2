import { useState, useEffect } from 'react';
import { ChevronDown, Play } from 'lucide-react';

const slides = [
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/portfolio/goldreddress.jpg',
    alt: 'goldreddress',
  },
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/portfolio/1780949713823-s2q6s1gau8b.jpg',
    alt: 'eating',
  },
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/portfolio/1780949716648-v7fkvvhblra.jpg',
    alt: 'princess',
  },
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/portfolio/prayer.jpg',
    alt: 'prayer',
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setAnimating(false);
      }, 800);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden" aria-label="Hero">
      {slides.map((slide, index) => (
        <div
          key={slide.url}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide
              ? animating ? 'opacity-0' : 'opacity-100'
              : 'opacity-0'
          }`}
        >
          <img
            src={slide.url}
            alt={slide.alt}
            className="w-full h-full object-cover animate-kenburns"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 max-w-5xl mx-auto">
        <div
          className={`transition-all duration-1000 delay-300 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="font-body text-gold-400 text-xs md:text-sm tracking-[0.4em] uppercase mb-6 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-gold-400" />
            Fine Art Photography
            <span className="w-8 h-px bg-gold-400" />
          </p>
        </div>

        <h1
          className={`font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white leading-[1.1] font-medium mb-6 max-w-4xl transition-all duration-1000 delay-500 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Capturing Moments
          <h3 className="block italic text-cream-200">That Feel Like</h3>
          <h3 className="block text-gold-400">Forever</h3>
        </h1>

        <div className={`gold-divider transition-all duration-1000 delay-700 ${
          loaded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
        }`} />

        <p
          className={`font-body text-white/80 text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed mb-10 transition-all duration-1000 delay-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Timeless Photography for Life's Most Meaningful Experiences
        </p>

        <div
          className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-1000 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <a href="#contact" className="btn-gold group">
            Book a Session
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <a href="#portfolio" className="btn-outline-white group">
            <Play size={14} className="transition-transform duration-300 group-hover:scale-110" />
            View Portfolio
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 z-10">
        <div className="flex gap-2 mb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide ? 'w-8 h-1.5 bg-gold-400' : 'w-2 h-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <a
          href="#about"
          className="text-white/60 hover:text-gold-400 transition-colors duration-300 animate-bounce-subtle"
          aria-label="Scroll down"
        >
          <ChevronDown size={28} strokeWidth={1.5} />
        </a>
      </div>
    </section>
  );
}
