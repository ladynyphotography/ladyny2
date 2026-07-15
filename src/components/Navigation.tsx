import { useState } from 'react';
import { Menu, X, Camera } from 'lucide-react';
import { useNavScroll } from '../hooks/useNavScroll';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrolled, hidden } = useNavScroll();

  const handleLinkClick = () => setMobileOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-cream-200'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
       <a
  href="#"
  className={`flex items-center gap-2.5 group transition-colors duration-300 ${
    scrolled ? 'text-charcoal-900' : 'text-white'
  }`}
>
  <img
    src={
      scrolled
        ? 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/Logo%20black%20pinkAsset%201.svg'
        : 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/Logo%20white%20pinkAsset%202.svg'
    }
    alt="Lady Ny Photography logo"
    className="w-24 md:w-28 h-auto object-contain transition-all duration-300"
  />
</a>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`font-body text-sm tracking-widest uppercase transition-colors duration-300 relative group ${
                  scrolled ? 'text-charcoal-700 hover:text-gold-500' : 'text-white/90 hover:text-gold-300'
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold-500 transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className={`hidden md:inline-flex items-center gap-2 px-6 py-2.5 text-xs font-body font-medium tracking-widest uppercase transition-all duration-300 active:scale-95 ${
            scrolled
              ? 'bg-gold-500 text-white hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/20'
              : 'bg-white/10 border border-white/60 text-white hover:bg-white hover:text-charcoal-900 backdrop-blur-sm'
          }`}
        >
          Book a Session
        </a>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 transition-colors duration-300 ${
            scrolled ? 'text-charcoal-800' : 'text-white'
          }`}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <div
  className={`md:hidden absolute top-full left-0 w-full bg-charcoal-900/95 backdrop-blur-xl border-t border-white/10 transition-all duration-500 overflow-hidden ${
    mobileOpen
      ? 'max-h-screen opacity-100 py-10'
      : 'max-h-0 opacity-0 py-0'
  }`}
>
  <ul className="flex flex-col items-center gap-8 px-6">
    {navLinks.map((link, i) => (
      <li
        key={link.label}
        className={`transition-all duration-500 ${
          mobileOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: `${i * 80}ms` }}
      >
        <a
          href={link.href}
          onClick={handleLinkClick}
          className="font-serif text-3xl italic text-white hover:text-gold-400 transition-colors duration-300"
        >
          {link.label}
        </a>
      </li>
    ))}

    <li
      className={`transition-all duration-500 ${
        mobileOpen
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${navLinks.length * 80}ms` }}
    >
      <a
        href="#contact"
        onClick={handleLinkClick}
        className="btn-gold mt-2"
      >
        Book a Session
      </a>
    </li>
  </ul>
</div>
    </header>
  );
}
