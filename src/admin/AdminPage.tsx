import { useState, useEffect } from 'react';
import { LogOut, ExternalLink, Layers, Image, MessageSquare } from 'lucide-react';
import AdminLogin from './AdminLogin';
import ServicesTab from './ServicesTab';
import PortfolioTab from './PortfolioTab';
import TestimonialsTab from './TestimonialsTab';
import { supabase } from '../lib/supabase';

type Tab = 'services' | 'portfolio' | 'testimonials';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'services', label: 'Services', icon: Layers },
  { id: 'portfolio', label: 'Portfolio', icon: Image },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('services');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-10 flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-2.5">
            <img
              src="https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/Logo%20black%20pinkAsset%201.svg"
              alt="Lady Ny Photography logo"
              className="w-14 md:w-20 h-auto object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-body text-xs md:text-sm text-charcoal-800 tracking-wide">
                Lady Ny Photography
              </span>
              <span className="font-body text-[10px] md:text-[11px] text-charcoal-400 tracking-widest uppercase">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 font-body text-xs text-charcoal-500 hover:text-charcoal-800 transition-colors tracking-wide"
            >
              <ExternalLink size={12} />
              View Site
            </a>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden w-8 h-8 flex items-center justify-center text-charcoal-500 hover:text-charcoal-800 transition-colors"
              aria-label="View site"
            >
              <ExternalLink size={15} />
            </a>
            <div className="w-px h-4 bg-cream-300 hidden sm:block" />
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 font-body text-xs text-charcoal-500 hover:text-red-500 transition-colors tracking-wide"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-5 md:py-8">
        <div className="mb-5 flex items-center gap-1 bg-white border border-cream-300 p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 font-body text-sm transition-all duration-200 ${
                activeTab === id
                  ? 'bg-charcoal-900 text-white'
                  : 'text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-100'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-cream-300 p-4 md:p-8 min-h-[500px]">
          {activeTab === 'services' && <ServicesTab />}
          {activeTab === 'portfolio' && <PortfolioTab />}
          {activeTab === 'testimonials' && <TestimonialsTab />}
        </div>
      </div>
    </div>
  );
}
