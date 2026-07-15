import { Award, Heart, Camera } from 'lucide-react';

const stats = [
  { value: '500+', label: 'Sessions Captured' },
  { value: '8+', label: 'Years of Experience' },
  { value: '200+', label: 'Weddings Photographed' },
];

const features = [
  { icon: Heart, text: 'Emotion-first storytelling' },
  { icon: Camera, text: 'Artistic fine-art editing' },
  { icon: Award, text: 'Stellar portfolio' },
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative reveal-left">
            <div className="relative aspect-[3/4] max-w-md mx-auto lg:mx-0 overflow-hidden">
              <img
                src="https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/Ny.jpg"
                alt="Lady Ny — Professional Photographer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent" />
            </div>

            <div className="absolute -bottom-6 -right-6 md:right-0 lg:-right-8 bg-white border border-cream-200 shadow-xl p-6 max-w-[200px]">
              <div className="gold-divider-left" style={{ marginTop: 0, marginBottom: '12px', width: '32px' }} />
              <p className="font-serif italic text-charcoal-800 text-sm leading-relaxed">
                "Photography isn’t just about how it looks..it’s about how it feels years from now."
              </p>
              <p className="font-body text-xs text-gold-500 tracking-widest uppercase mt-3">— Lady Ny</p>
            </div>

            <div className="absolute -top-4 -left-4 w-24 h-24 border border-gold-300 opacity-40" />
          </div>

          <div className="reveal-right">
            <p className="font-body text-gold-500 text-xs tracking-[0.4em] uppercase mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-gold-500" />
              About the Photographer
            </p>

            <h2 className="font-serif text-4xl md:text-5xl text-charcoal-900 leading-tight mb-2">
              Hello, I'm
            </h2>
            <h2 className="font-serif text-4xl md:text-5xl text-gold-500 leading-tight italic mb-6">
              Lady Ny
            </h2>

            <div className="gold-divider-left" />

            <div className="space-y-5 text-charcoal-600 leading-relaxed font-body text-base mb-8">
              <p>
  I believe photography is more than capturing what something looked like — it’s about honoring what it meant. The quiet glances, the energy in a room, the feeling you can’t quite put into words… those are the moments I’m drawn to preserve.
</p>
<p>
  What drives me is knowing how easily life moves. Moments pass, people grow, seasons change — and too often, we don’t realize the value of a moment until it’s behind us. Photography gives us a way to hold onto what matters, to revisit the emotions, the connections, and the truth of who we were in that space.
</p>
<p>
  When I work with you, it’s not about perfection or performance. It’s about creating a space where you can show up fully, be seen honestly, and walk away with something real. Images that don’t just remind you of a moment — but bring you back to it.
</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={14} className="text-gold-500 flex-shrink-0" />
                  <span className="font-body text-sm text-charcoal-600">{text}</span>
                </div>
              ))}
            </div>

            {/* <div className="flex gap-8 md:gap-12 py-8 border-t border-cream-300 mb-10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-3xl md:text-4xl text-charcoal-900 font-medium">
                    {stat.value}
                  </p>
                  <p className="font-body text-xs text-charcoal-500 tracking-wide uppercase mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div> */}
 
            <a href="#contact" className="btn-gold">
              Let's Work Together
            </a>
          </div>
        </div>
      </div>

      {/* <div className="bg-charcoal-900 py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="font-body text-center text-xs text-charcoal-400 tracking-[0.4em] uppercase mb-6">
            As Featured In
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50">
            {['Vogue', 'The Knot', 'Martha Stewart Weddings', 'Style Me Pretty', 'Brides'].map((pub) => (
              <span
                key={pub}
                className="font-serif text-white text-sm md:text-base italic tracking-wide"
              >
                {pub}
              </span>
            ))}
          </div>
        </div>
      </div> */} 
    </section>
  );
}
