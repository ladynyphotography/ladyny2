import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, GripVertical, Tag, Upload, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BUCKET = 'services';

interface Service {
  id: string;
  title: string;
  description: string;
  pricing: string;
  image_url: string;
  icon: string;
  tag: string | null;
  display_order: number;
  created_at: string;
}

const ICON_OPTIONS = [
  'Heart',
  'User',
  'Briefcase',
  'Calendar',
  'Camera',
  'Star',
  'Image',
  'Gift',
];

const emptyForm = {
  title: '',
  description: '',
  pricing: '',
  image_url: '',
  icon: 'Camera',
  tag: '',
  display_order: 0,
};

type FormState = typeof emptyForm;

export default function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    setServices(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetFileState = () => {
    setFile(null);
    setFilePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: services.length + 1 });
    resetFileState();
    setError('');
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({
      title: s.title,
      description: s.description,
      pricing: s.pricing,
      image_url: s.image_url,
      icon: s.icon,
      tag: s.tag ?? '',
      display_order: s.display_order,
    });
    resetFileState();
    setError('');
    setModalOpen(true);
  };

  const applyFile = (f: File) => {
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, image_url: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) applyFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) applyFile(f);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.pricing.trim()) {
      setError('Title, description, and pricing are required.');
      return;
    }

    setSaving(true);
    setError('');

    let finalImageUrl = form.image_url;

    if (file) {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        const isRls =
          uploadError.message.toLowerCase().includes('row-level security') ||
          uploadError.message.toLowerCase().includes('policy');
        setError(
          isRls
            ? 'Storage permission denied. Add an INSERT policy for the "services" bucket in Supabase Dashboard → Storage → Policies.'
            : `Upload failed: ${uploadError.message}`
        );
        setSaving(false);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      finalImageUrl = urlData.publicUrl;
      setUploading(false);
    }

    const payload = {
      ...form,
      image_url: finalImageUrl,
      tag: form.tag.trim() || null,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from('services')
        .update(payload)
        .eq('id', editingId);

      if (err) {
        setError('Save failed. Please try again.');
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from('services').insert([payload]);

      if (err) {
        setError('Save failed. Please try again.');
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setModalOpen(false);
    fetchServices();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('services').delete().eq('id', deleteId);
    setDeleteId(null);
    fetchServices();
  };

  const previewSrc = filePreview || form.image_url;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-charcoal-900">Services</h2>
          <p className="font-body text-sm text-charcoal-500 mt-0.5">
            Manage the service cards displayed on the landing page
          </p>
        </div>

        <button onClick={openCreate} className="btn-gold gap-2 text-xs w-full sm:w-auto">
          <Plus size={14} /> Add Service
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-cream-100 animate-pulse rounded" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-cream-300">
          <p className="font-body text-charcoal-400 mb-4">No services yet</p>
          <button onClick={openCreate} className="btn-gold text-xs gap-2">
            <Plus size={13} /> Add First Service
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-cream-300 p-4 hover:border-gold-300 transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="text-charcoal-300 hidden sm:block flex-shrink-0" />
                  <img
                    src={s.image_url}
                    alt={s.title}
                    className="w-14 h-14 object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/56x56/f5f0eb/C9A84C?text=Img';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-serif text-charcoal-900 font-medium">{s.title}</span>
                    {s.tag && (
                      <span className="mt-1 sm:mt-0 inline-flex items-center gap-1 font-body text-xs text-gold-600 bg-gold-50 border border-gold-200 px-2 py-0.5 w-fit">
                        <Tag size={10} /> {s.tag}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-charcoal-400 mt-1 line-clamp-2">{s.description}</p>
                  <p className="font-body text-xs text-gold-600 mt-1">{s.pricing}</p>

                  <div className="flex items-center justify-between mt-3 sm:hidden">
                    <span className="font-body text-xs text-charcoal-400">Order #{s.display_order}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-gold-500 hover:bg-gold-50"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(s.id)}
                        className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                  <span className="font-body text-xs text-charcoal-400 mr-2">#{s.display_order}</span>
                  <button
                    onClick={() => openEdit(s)}
                    className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-gold-500 hover:bg-gold-50"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(s.id)}
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
                {editingId ? 'Edit Service' : 'Add New Service'}
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
                <div className="col-span-2">
                  <label className="admin-label">Service Title *</label>
                  <input
                    className="admin-input"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div className="col-span-2">
                  <label className="admin-label">Description *</label>
                  <textarea
                    className="admin-input resize-none"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="admin-label">Pricing *</label>
                  <input
                    className="admin-input"
                    value={form.pricing}
                    onChange={(e) => setForm((f) => ({ ...f, pricing: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="admin-label">Tag</label>
                  <input
                    className="admin-input"
                    value={form.tag}
                    onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                  />
                </div>

                {/* Image upload */}
                <div className="col-span-2">
                  <label className="admin-label">Service Image</label>

                  {/* Drop zone / preview */}
                  <div
                    className={`relative border-2 border-dashed transition-colors duration-200 ${
                      dragOver
                        ? 'border-gold-400 bg-gold-50'
                        : 'border-cream-300 hover:border-gold-300'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    {previewSrc ? (
                      <div className="relative group">
                        <img
                          src={previewSrc}
                          alt="Service preview"
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://placehold.co/600x240/f5f0eb/C9A84C?text=Invalid+URL';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-charcoal-800 font-body text-xs tracking-wider uppercase px-4 py-2 flex items-center gap-2 shadow-lg"
                          >
                            <Upload size={13} /> Replace Image
                          </button>
                        </div>
                        {file && (
                          <span className="absolute top-2 left-2 bg-gold-500 text-white font-body text-xs px-2 py-0.5">
                            New upload
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-8 flex flex-col items-center gap-2 text-charcoal-400 hover:text-gold-500 transition-colors duration-200"
                      >
                        {uploading ? (
                          <Loader size={24} className="animate-spin text-gold-500" />
                        ) : (
                          <ImageIcon size={24} />
                        )}
                        <span className="font-body text-sm">
                          {uploading ? 'Uploading…' : 'Drop image here or click to browse'}
                        </span>
                        <span className="font-body text-xs text-charcoal-300">
                          JPG, PNG, WebP recommended
                        </span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* URL fallback */}
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-px bg-cream-200" />
                      <span className="font-body text-xs text-charcoal-300 uppercase tracking-wider">or paste URL</span>
                      <div className="flex-1 h-px bg-cream-200" />
                    </div>
                    <input
                      className="admin-input text-sm"
                      placeholder="https://..."
                      value={file ? '' : form.image_url}
                      disabled={!!file}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, image_url: e.target.value }));
                        if (e.target.value) resetFileState();
                      }}
                    />
                    {file && (
                      <button
                        type="button"
                        onClick={resetFileState}
                        className="mt-1 font-body text-xs text-charcoal-400 hover:text-red-500 transition-colors"
                      >
                        Remove uploaded file and use URL instead
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="admin-label">Icon</label>
                  <select
                    className="admin-input"
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon}>{icon}</option>
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
                  <><Loader size={13} className="animate-spin" /> {uploading ? 'Uploading…' : 'Saving…'}</>
                ) : (
                  <><Save size={13} /> Save Service</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-serif text-xl text-charcoal-900 mb-2">Delete Service?</h3>
            <p className="font-body text-sm text-charcoal-500 mb-6">
              This will permanently remove the service from the landing page.
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
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-body text-xs tracking-widest uppercase py-2.5"
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
