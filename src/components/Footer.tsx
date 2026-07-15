import { Camera, Instagram, Facebook, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

const quickLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

const services = [
  'Wedding Photography',
  'Portrait Sessions',
  'Branding Shoots',
  'Event Coverage',
  'Engagement Sessions',
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-charcoal-900 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          <div className="lg:col-span-1">
            <a href="#" className="flex items-center gap-2.5 group mb-6">
             <img
    src={
     
      'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/Logo%20white%20pinkAsset%202.svg'
    }
    alt="Lady Ny Photography logo"
    className="w-24 md:w-28 h-auto object-contain transition-all duration-300"
  />
            </a>
            <p className="font-body text-charcoal-400 text-sm leading-relaxed mb-6 max-w-xs">
              Capturing the heartbeats, the tears, the laughter, and the quiet moments in between.
              Every photograph is a love letter to a moment that mattered.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/ladynyphotography/' },
                { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61573426468614' },
               
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-charcoal-800 hover:bg-gold-500 border border-charcoal-700 hover:border-gold-500 text-charcoal-400 hover:text-white flex items-center justify-center transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-white text-base mb-5 pb-3 border-b border-charcoal-800">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-body text-charcoal-400 text-sm hover:text-gold-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-4 h-px bg-charcoal-700 group-hover:bg-gold-500 transition-colors duration-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-white text-base mb-5 pb-3 border-b border-charcoal-800">
              Services
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <a
                    href="#services"
                    className="font-body text-charcoal-400 text-sm hover:text-gold-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-4 h-px bg-charcoal-700 group-hover:bg-gold-500 transition-colors duration-300" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-white text-base mb-5 pb-3 border-b border-charcoal-800">
              Get In Touch
            </h4>
            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  text: 'Ladynyphotos@gmail.com',
                  href: 'mailto:Ladynyphotos@gmail.com',
                },
                {
                  icon: Phone,
                  text: '+1 (302) 375-5002',
                  href: 'tel:+13023755002',
                },
                {
                  icon: MapPin,
                  text: 'New Castle, DE & Destinations Worldwide',
                  href: null,
                },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon size={14} className="text-gold-500 mt-0.5 flex-shrink-0" />
                  {href ? (
                    <a
                      href={href}
                      className="font-body text-charcoal-400 text-sm hover:text-gold-400 transition-colors duration-300 leading-relaxed"
                    >
                      {text}
                    </a>
                  ) : (
                    <span className="font-body text-charcoal-400 text-sm leading-relaxed">{text}</span>
                  )}
                </div>
              ))}
            </div>

            <a href="#contact" className="btn-gold mt-8 text-xs">
              Book a Session
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-charcoal-500 text-xs">
            © {new Date().getFullYear()} Lady Ny Photography. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="font-body text-charcoal-500 text-xs hover:text-gold-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="font-body text-charcoal-500 text-xs hover:text-gold-400 transition-colors">
              Terms of Service
            </a>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 bg-charcoal-800 hover:bg-gold-500 border border-charcoal-700 hover:border-gold-500 text-charcoal-400 hover:text-white flex items-center justify-center transition-all duration-300"
              aria-label="Scroll to top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
      {/* Designer credit */}
  <div className="text-center pb-4">
    <p className="font-body text-charcoal-600 text-[11px]">
      Designed by <a href="https://www.sitesonpolaris.com" className="hover:text-gold-400 transition-colors">
        Sites on Polaris
      </a>
    </p>
  </div>
    </footer>
  );
}
