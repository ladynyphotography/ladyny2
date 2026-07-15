import { useState, useEffect } from 'react';
import { Heart, User, Briefcase, Calendar, Camera, Star, Image, Gift, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Service {
  id: string;
  title: string;
  description: string;
  pricing: string;
  image_url: string;
  icon: string;
  tag: string | null;
  display_order: number;
}

const iconMap: Record<string, React.ElementType> = {
  Heart,
  User,
  Briefcase,
  Calendar,
  Camera,
  Star,
  Image,
  Gift,
};

function ServiceCardSkeleton() {
  return (
    <div className="bg-white border border-cream-300 overflow-hidden animate-pulse">
      <div className="h-56 bg-cream-200" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-cream-200 rounded w-2/3" />
        <div className="h-3 bg-cream-100 rounded w-full" />
        <div className="h-3 bg-cream-100 rounded w-4/5" />
        <div className="h-px bg-cream-200 mt-4" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-3 bg-cream-200 rounded w-1/3" />
          <div className="h-3 bg-cream-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(true);
        } else {
          setServices(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  return (
    <section id="services" className="bg-cream-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="text-center mb-16 reveal">
          <p className="font-body text-gold-500 text-xs tracking-[0.4em] uppercase mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-gold-500" />
            What I Offer
            <span className="w-8 h-px bg-gold-500" />
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-charcoal-900 mb-4">
            Photography Services
          </h2>
          <div className="gold-divider" />
          <p className="font-body text-charcoal-500 max-w-xl mx-auto leading-relaxed">
            Tailored experiences designed to capture the essence of your most meaningful moments,
            with artistry and care in every frame.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ServiceCardSkeleton key={i} />)
            : error
            ? (
              <div className="col-span-full text-center py-12 font-body text-charcoal-400 text-sm">
                Unable to load services at this time. Please try again later.
              </div>
            )
            : services.map((service, index) => {
                const Icon = iconMap[service.icon] ?? Camera;
                return (
                  <div
                    key={service.id}
                    className="group relative bg-white overflow-hidden cursor-pointer border border-cream-300 hover:border-gold-400 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                    style={{ animation: `fadeInUp 0.6s ease both`, animationDelay: `${index * 120}ms` }}
                  >
                    {service.tag && (
                      <div className="absolute top-4 right-4 z-20 bg-gold-500 text-white text-xs font-body tracking-widest uppercase px-3 py-1">
                        {service.tag}
                      </div>
                    )}

                    <div className="relative aspect-square w-full overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={`${service.title} photography`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-cream-200 flex items-center justify-center group-hover:bg-gold-500 transition-colors duration-300">
                          <Icon
                            size={16}
                            className="text-gold-500 group-hover:text-white transition-colors duration-300"
                          />
                        </div>
                        <h3 className="font-serif text-xl text-charcoal-900">{service.title}</h3>
                      </div>

                      <p className="font-body text-sm text-charcoal-500 leading-relaxed mb-4">
                        {service.description}
                      </p>

                      <div className="pt-4 border-t border-cream-300 flex items-center justify-between">
                        <span className="font-body text-xs text-gold-600 tracking-wide font-medium">
                          {service.pricing}
                        </span>
                        <a
                          href="#contact"
                          className="inline-flex items-center gap-1.5 font-body text-xs text-charcoal-700 hover:text-gold-500 transition-colors duration-300 group/link tracking-wide uppercase"
                        >
                          Inquire
                          <ArrowRight
                            size={12}
                            className="transition-transform duration-300 group-hover/link:translate-x-1"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        <div className="text-center mt-12 reveal">
          <p className="font-body text-charcoal-500 text-sm mb-5">
            Not sure which package is right for you?
          </p>
          <a href="#contact" className="btn-outline-dark">
            Let's Chat About Your Vision
          </a>
        </div>
      </div>
    </section>
  );
}
