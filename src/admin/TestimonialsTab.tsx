import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, GripVertical, Loader, Star, CheckCircle, CircleSlash } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  image_url: string | null;
  stars: number;
  event: string;
  display_order: number;
  approved: boolean;
  created_at: string;
}

const SESSION_TYPES = ['Events', 'Portrait', 'Wedding', 'Branding', 'Other'];

const emptyForm = {
  name: '',
  role: '',
  quote: '',
  image_url: '',
  stars: 5,
  event: 'Events',
  display_order: 0,
  approved: false,
};

type FormState = typeof emptyForm;

function InteractiveStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform duration-100 hover:scale-110"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            size={20}
            className={
              n <= (hover || value)
                ? 'text-gold-500 fill-gold-500'
                : 'text-charcoal-300'
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });
    setTestimonials(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: testimonials.length + 1 });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      role: t.role,
      quote: t.quote,
      image_url: t.image_url ?? '',
      stars: t.stars,
      event: t.event,
      display_order: t.display_order,
      approved: t.approved,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim() || !form.quote.trim()) {
      setError('Name, role, and message are required.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      quote: form.quote.trim(),
      image_url: form.image_url.trim() || null,
      stars: form.stars,
      event: form.event,
      display_order: form.display_order,
      approved: form.approved,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from('testimonials')
        .update(payload)
        .eq('id', editingId);
      if (err) {
        setError('Save failed. Please try again.');
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from('testimonials').insert([payload]);
      if (err) {
        setError('Save failed. Please try again.');
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setModalOpen(false);
    fetchTestimonials();
  };

  const handleToggleApproved = async (t: Testimonial) => {
    setTogglingId(t.id);
    await supabase
      .from('testimonials')
      .update({ approved: !t.approved })
      .eq('id', t.id);
    setTogglingId(null);
    fetchTestimonials();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('testimonials').delete().eq('id', deleteId);
    setDeleteId(null);
    fetchTestimonials();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-charcoal-900">Testimonials</h2>
          <p className="font-body text-sm text-charcoal-500 mt-0.5">
            Manage reviews displayed on the landing page
          </p>
        </div>
        <button onClick={openCreate} className="btn-gold gap-2 text-xs w-full sm:w-auto">
          <Plus size={14} /> Add Testimonial
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-cream-100 animate-pulse rounded" />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-cream-300">
          <p className="font-body text-charcoal-400 mb-4">No testimonials yet</p>
          <button onClick={openCreate} className="btn-gold text-xs gap-2">
            <Plus size={13} /> Add First Testimonial
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-cream-300 p-4 hover:border-gold-300 transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <GripVertical size={16} className="text-charcoal-300 hidden sm:block" />
                  {t.image_url ? (
                    <img
                      src={t.image_url}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-cream-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-cream-200 border-2 border-cream-300 flex items-center justify-center">
                      <span className="font-serif text-charcoal-600 text-sm">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-charcoal-900 font-medium">{t.name}</span>
                    <span className="font-body text-xs text-charcoal-400">{t.role}</span>
                    {!t.approved && (
                      <span className="inline-flex items-center font-body text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} size={11} className="text-gold-500 fill-gold-500" />
                    ))}
                    <span className="font-body text-xs text-gold-600">{t.event}</span>
                  </div>

                  <p className="font-body text-sm text-charcoal-400 mt-1.5 line-clamp-2">
                    "{t.quote}"
                  </p>

                  {/* Mobile actions */}
                  <div className="flex items-center justify-between mt-3 sm:hidden">
                    <span className="font-body text-xs text-charcoal-400">
                      Order #{t.display_order}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleApproved(t)}
                        disabled={togglingId === t.id}
                        className={`w-8 h-8 flex items-center justify-center transition-colors ${
                          t.approved
                            ? 'text-green-500 hover:text-charcoal-400'
                            : 'text-charcoal-300 hover:text-green-500'
                        }`}
                        title={t.approved ? 'Unapprove' : 'Approve'}
                      >
                        {togglingId === t.id ? (
                          <Loader size={14} className="animate-spin" />
                        ) : t.approved ? (
                          <CheckCircle size={14} />
                        ) : (
                          <CircleSlash size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(t)}
                        className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-gold-500 hover:bg-gold-50"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(t.id)}
                        className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop actions */}
                <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                  <span className="font-body text-xs text-charcoal-400 mr-2">
                    #{t.display_order}
                  </span>
                  <button
                    onClick={() => handleToggleApproved(t)}
                    disabled={togglingId === t.id}
                    className={`w-8 h-8 flex items-center justify-center transition-colors ${
                      t.approved
                        ? 'text-green-500 hover:text-charcoal-400 hover:bg-cream-100'
                        : 'text-charcoal-300 hover:text-green-500 hover:bg-green-50'
                    }`}
                    title={t.approved ? 'Unapprove' : 'Approve'}
                  >
                    {togglingId === t.id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : t.approved ? (
                      <CheckCircle size={14} />
                    ) : (
                      <CircleSlash size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-gold-500 hover:bg-gold-50"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 sticky top-0 bg-white z-10">
              <h3 className="font-serif text-lg text-charcoal-900">
                {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-charcoal-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <p className="font-body text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Name *</label>
                  <input
                    className="admin-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="admin-label">Role / Title *</label>
                  <input
                    className="admin-input"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  />
                </div>

                <div className="col-span-2">
                  <label className="admin-label">Message *</label>
                  <textarea
                    className="admin-input resize-none"
                    rows={4}
                    value={form.quote}
                    onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                  />
                </div>

                <div className="col-span-2">
                  <label className="admin-label">Photo URL</label>
                  <input
                    className="admin-input"
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="admin-label">Star Rating *</label>
                  <InteractiveStars
                    value={form.stars}
                    onChange={(v) => setForm((f) => ({ ...f, stars: v }))}
                  />
                </div>

                <div>
                  <label className="admin-label">Session Type</label>
                  <select
                    className="admin-input"
                    value={form.event}
                    onChange={(e) => setForm((f) => ({ ...f, event: e.target.value }))}
                  >
                    {SESSION_TYPES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="admin-label">Display Order</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.display_order}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={form.approved}
                      onChange={(e) => setForm((f) => ({ ...f, approved: e.target.checked }))}
                    />
                    <div className="w-10 h-5 bg-cream-300 peer-checked:bg-gold-500 rounded-full transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                  <span className="font-body text-sm text-charcoal-700">Approved (visible publicly)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-cream-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setModalOpen(false)}
                className="btn-outline-dark text-xs px-5 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-gold text-xs gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader size={13} className="animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save size={13} /> Save Testimonial
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-serif text-xl text-charcoal-900 mb-2">Delete Testimonial?</h3>
            <p className="font-body text-sm text-charcoal-500 mb-6">
              This will permanently remove the testimonial from the landing page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 btn-outline-dark text-xs py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-body text-xs tracking-widest uppercase py-2.5 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
