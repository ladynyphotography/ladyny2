import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  session_type: string;
  message: string;
}

const sessionTypes = [
  'Wedding Photography',
  'Portrait Session',
  'Branding / Business',
  'Event Coverage',
  'Engagement Session',
  'Maternity Session',
  'Family Portrait',
  'Other',
];

const initialForm: FormData = {
  name: '',
  email: '',
  phone: '',
  session_type: '',
  message: '',
};

export default function BookingSection() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.session_type) newErrors.session_type = 'Please select a session type';
    if (!form.message.trim()) newErrors.message = 'Please tell me about your vision';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-inquiry`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        setStatus('error');
      } else {
        setStatus('success');
        setForm(initialForm);
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass = (field: keyof FormData) =>
    `w-full bg-white/5 border text-white placeholder-white/50 px-4 py-3.5 font-body text-sm transition-all duration-300 focus:outline-none focus:border-gold-400 focus:bg-white/8 ${
      errors[field] ? 'border-red-400/60' : 'border-charcoal-600 hover:border-charcoal-500'
    }`;

  return (
    <section id="contact" className="relative overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img
          src="https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_2210.jpg"
          alt="Background photography"
          className="w-full h-full object-cover opacity-50"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-charcoal-900/88" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/20 via-charcoal-900/80 to-charcoal-900/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="reveal-left">
            <p className="font-body text-gold-400 text-xs tracking-[0.4em] uppercase mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-gold-400" />
              Get In Touch
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4">
              Let's Capture
              <span className="block italic text-gold-400">Your Story</span>
            </h2>
            <div className="gold-divider-left" />
            <p className="font-body text-charcoal-400 leading-relaxed mb-10 max-w-md">
              Every great photograph begins with a conversation. Tell me about the moments you want
              preserved forever, and let's create something beautiful together.
            </p>

        

            <div className="space-y-5 mb-6">
              {[
                { label: 'Email', value: 'Ladynyphotos@gmail.com' },
                { label: 'Phone', value: '+1 (302) 375-5002' },
                { label: 'Location', value: 'New Castle, DE & Destinations Worldwide' },
                { label: 'Response Time', value: 'Within 24-48 hours' },
              ].map((item) => (
                <div key={item.label} className="flex gap-4">
                  <span className="font-body text-xs text-gold-500 tracking-widest uppercase w-28 flex-shrink-0 pt-0.5">
                    {item.label}
                  </span>
                  <span className="font-body text-charcoal-300 text-sm">{item.value}</span>
                </div>
              ))}
            </div>
                <div className="flex items-center ">
              <img
                src="https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/character.png"
                alt="Lady Ny"
                className="w-100 h-100  object-cover object-top " 
              />
            
            </div>
          </div>

          <div className="reveal-right">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-8 bg-white/5 border border-gold-500/20">
                <CheckCircle size={56} className="text-gold-400 mb-6" />
                <h3 className="font-serif text-2xl text-white mb-3">
                  Inquiry Received!
                </h3>
                <p className="font-body text-charcoal-400 leading-relaxed mb-8 max-w-sm">
                  Thank you for reaching out. I'll review your message and get back to you within
                  24–48 hours. I can't wait to hear your story.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="btn-gold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your Name *"
                      className={inputClass('name')}
                      aria-label="Your Name"
                    />
                    {errors.name && (
                      <p className="font-body text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email Address *"
                      className={inputClass('email')}
                      aria-label="Email Address"
                    />
                    {errors.email && (
                      <p className="font-body text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone Number (Optional)"
                    className={inputClass('phone')}
                    aria-label="Phone Number"
                  />
                </div>

                <div>
                  <select
                    name="session_type"
                    value={form.session_type}
                    onChange={handleChange}
                    className={`${inputClass('session_type')} ${!form.session_type ? 'text-charcoal-400' : 'text-white'}`}
                    aria-label="Session Type"
                  >
                    <option value="" disabled className="bg-charcoal-800 text-charcoal-400">
                      Session Type *
                    </option>
                    {sessionTypes.map((type) => (
                      <option key={type} value={type} className="bg-charcoal-800 text-white">
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.session_type && (
                    <p className="font-body text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.session_type}
                    </p>
                  )}
                </div>

                <div>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell me about your vision, date, and any special details... *"
                    rows={5}
                    className={inputClass('message')}
                    aria-label="Your Message"
                  />
                  {errors.message && (
                    <p className="font-body text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.message}
                    </p>
                  )}
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400">
                    <AlertCircle size={15} />
                    <p className="font-body text-sm">
                      Something went wrong. Please try again or email directly.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full btn-gold justify-center disabled:opacity-60 disabled:cursor-not-allowed gap-3"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send My Inquiry
                    </>
                  )}
                </button>

                <p className="font-body text-charcoal-500 text-xs text-center leading-relaxed">
                  Your information is kept private and will never be shared.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
