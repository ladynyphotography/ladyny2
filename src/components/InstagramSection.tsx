import { Instagram, Heart, ExternalLink } from 'lucide-react';

const posts = [
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_1478.jpg',
    alt: 'Man in black suite',
    likes: '1.2k',
  },
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/a.jpg',
    alt: 'Elegant portrait session',
    likes: '847',
  },
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/portfolio/1780949716648-v7fkvvhblra.jpg',
    alt: 'Portrait with window light',
    likes: '932',
  },
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/c.jpg',
    alt: 'Wedding ceremony moment',
    likes: '2.1k',
  },
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/portfolio/1780949715766-6zo3s1kw1ao.jpg',
    alt: 'Bride preparation close-up',
    likes: '1.5k',
  },
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/e.jpg',
    alt: 'Branding lifestyle photography',
    likes: '688',
  },
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/portfolio/1780949715183-vf1kriz77nc.jpg',
    alt: 'Natural light portrait outdoors',
    likes: '1.1k',
  },
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/g.jpg',
    alt: 'Wedding reception first dance',
    likes: '1.8k',
  },
  {
    url: 'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/h.jpg',
    alt: 'Professional business portrait',
    likes: '759',
  },
];

export default function InstagramSection() {
  return (
    <section className="bg-cream-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="text-center mb-10 reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Instagram size={20} className="text-gold-500" />
            <p className="font-body text-gold-500 text-xs tracking-[0.4em] uppercase">
              Instagram
            </p>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal-900 mb-2">
            @LadyNyPhotography
          </h2>
          <div className="gold-divider" />
          <p className="font-body text-charcoal-500 text-sm">
            Follow along for behind-the-scenes, sneak peeks, and daily inspiration
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-1.5 md:gap-2 reveal">
          {posts.map((post) => (
            <a
              key={post.url}
              href="https://www.instagram.com/ladynyphotography/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group aspect-square overflow-hidden block"
              aria-label={`Instagram post: ${post.alt}`}
            >
              <img
                src={post.url}
                alt={post.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/50 transition-all duration-400 flex items-center justify-center gap-2">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5">
                  <Heart size={14} className="text-white fill-white" />
                  {/* <span className="font-body text-white text-xs font-medium">{post.likes}</span> */}
                </div>
              </div> 
            </a>
          ))}
        </div>

        <div className="text-center mt-10 reveal">
          <a
            href="https://www.instagram.com/ladynyphotography/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-charcoal-900 text-white font-body text-xs tracking-widest uppercase transition-all duration-300 hover:bg-charcoal-800 hover:shadow-xl active:scale-95 group"
          >
            <Instagram size={15} />
            Follow @LadyNyPhotography
            <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </section>
  );
}
