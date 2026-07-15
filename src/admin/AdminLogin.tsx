import { useState } from 'react';
import { Camera, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid email or password. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPassword('');
    } else {
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center px-6">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div
        className={`relative w-full max-w-md transition-all duration-150 ${
          shake ? 'animate-[shake_0.5s_ease-in-out]' : ''
        }`}
        style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            15% { transform: translateX(-6px); }
            30% { transform: translateX(6px); }
            45% { transform: translateX(-4px); }
            60% { transform: translateX(4px); }
            75% { transform: translateX(-2px); }
            90% { transform: translateX(2px); }
          }
        `}</style>

        <div className="text-center mb-8 flex flex-col items-center">
           <img
    src='https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/Logo%20white%20pinkAsset%202.png'
    alt="Lady Ny Photography logo"
    className="w-24 md:w-28 h-auto object-contain transition-all duration-300 mb-8"
  />
         
          <div className="w-12 h-12 bg-charcoal-800 border border-charcoal-700 flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-gold-400" />
          </div>
          <h1 className="font-serif text-2xl text-white mb-1">Admin Dashboard</h1>
          <p className="font-body text-charcoal-400 text-sm">Sign in to continue</p>
        </div>

        <div className="bg-charcoal-800 border border-charcoal-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-body text-xs text-charcoal-400 tracking-widest uppercase mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="admin@example.com"
                  className="w-full bg-charcoal-900 border border-charcoal-600 text-white placeholder-charcoal-500 px-4 py-3.5 pr-12 font-body text-sm focus:outline-none focus:border-gold-400 transition-colors duration-200"
                  autoFocus
                  autoComplete="email"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-500 pointer-events-none">
                  <Mail size={16} />
                </span>
              </div>
            </div>

            <div>
              <label className="block font-body text-xs text-charcoal-400 tracking-widest uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="w-full bg-charcoal-900 border border-charcoal-600 text-white placeholder-charcoal-500 px-4 py-3.5 pr-12 font-body text-sm focus:outline-none focus:border-gold-400 transition-colors duration-200"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-charcoal-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="font-body text-red-400 text-xs mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!email || !password || loading}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-body text-xs tracking-widest uppercase py-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98]"
            >
              {loading ? 'Signing In...' : 'Enter Dashboard'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-charcoal-700 text-center">
            <a
              href="/"
              className="font-body text-xs text-charcoal-500 hover:text-gold-400 transition-colors tracking-wide"
            >
              ← Return to Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
