import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, Upload, Image, Loader, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PortfolioImage {
  id: string;
  url: string;
  storage_path: string | null;
  alt: string;
  category: string;
  span: string;
  display_order: number;
  created_at: string;
}

interface BulkItem {
  file: File;
  preview: string;
  alt: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

const CATEGORIES = ['Portraits', 'Events', 'Weddings', 'Branding'];
const BUCKET = 'portfolio';

const emptyForm = {
  alt: '',
  category: 'Events',
  span: 'normal',
  display_order: 0,
  image_url: '',
};

type FormState = typeof emptyForm;

export default function PortfolioTab() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk upload state
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const [bulkCategory, setBulkCategory] = useState('Events');
  const [bulkSpan, setBulkSpan] = useState('normal');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('portfolio_images')
      .select('*')
      .order('display_order', { ascending: true });
    setImages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchImages(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: images.length + 1 });
    setFile(null);
    setFilePreview('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (img: PortfolioImage) => {
    setEditingId(img.id);
    setForm({
      alt: img.alt,
      category: img.category,
      span: img.span,
      display_order: img.display_order,
      image_url: img.url,
    });
    setFile(null);
    setFilePreview(img.url);
    setError('');
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, image_url: '' }));
  };

  const handleSave = async () => {
    if (!form.alt.trim()) {
      setError('Alt text is required.');
      return;
    }
    if (!file && !form.image_url && !editingId) {
      setError('Please upload an image or provide an image URL.');
      return;
    }

    setSaving(true);
    setError('');

    let finalUrl = form.image_url;
    let storagePath: string | null = null;

    if (file) {
      setUploading(true);
      setUploadProgress(10);

      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      storagePath = fileName;

      setUploadProgress(40);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        const isRls = uploadError.message.toLowerCase().includes('row-level security') || uploadError.message.toLowerCase().includes('policy');
        setError(isRls
          ? 'Storage permission denied. Add an INSERT policy for the "portfolio" bucket in your Supabase Dashboard → Storage → Policies.'
          : `Upload failed: ${uploadError.message}`);
        setSaving(false);
        setUploading(false);
        return;
      }

      setUploadProgress(80);

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      finalUrl = urlData.publicUrl;
      setUploadProgress(100);
      setUploading(false);
    }

    const payload: Partial<PortfolioImage> = {
      alt: form.alt.trim(),
      category: form.category,
      span: form.span,
      display_order: form.display_order,
      url: finalUrl,
      ...(storagePath ? { storage_path: storagePath } : {}),
    };

    if (editingId) {
      const { error: err } = await supabase.from('portfolio_images').update(payload).eq('id', editingId);
      if (err) { setError('Save failed. Please try again.'); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('portfolio_images').insert([payload]);
      if (err) { setError('Save failed. Please try again.'); setSaving(false); return; }
    }

    setSaving(false);
    setModalOpen(false);
    setUploadProgress(0);
    fetchImages();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const img = images.find((i) => i.id === deleteId);
    if (img?.storage_path) {
      await supabase.storage.from(BUCKET).remove([img.storage_path]);
    }
    await supabase.from('portfolio_images').delete().eq('id', deleteId);
    setDeleteId(null);
    fetchImages();
  };

  const closeModal = () => {
    setModalOpen(false);
    if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
  };

  // ── Bulk upload ──────────────────────────────────────────────────────────────

  const openBulk = () => {
    setBulkItems([]);
    setBulkCategory('Events');
    setBulkSpan('normal');
    setBulkUploading(false);
    setBulkDone(false);
    setBulkOpen(true);
  };

  const closeBulk = () => {
    if (bulkUploading) return;
    bulkItems.forEach((item) => {
      if (item.preview.startsWith('blob:')) URL.revokeObjectURL(item.preview);
    });
    setBulkOpen(false);
    if (bulkDone) fetchImages();
  };

  const handleBulkFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newItems: BulkItem[] = files.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      alt: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      status: 'pending',
    }));
    setBulkItems((prev) => [...prev, ...newItems]);
    // reset input so same files can be re-added if needed
    e.target.value = '';
  };

  const removeBulkItem = (idx: number) => {
    setBulkItems((prev) => {
      const item = prev[idx];
      if (item.preview.startsWith('blob:')) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateBulkAlt = (idx: number, value: string) => {
    setBulkItems((prev) => prev.map((item, i) => i === idx ? { ...item, alt: value } : item));
  };

  const handleBulkUpload = async () => {
    if (!bulkItems.length) return;
    setBulkUploading(true);
    const baseOrder = images.length + 1;

    for (let i = 0; i < bulkItems.length; i++) {
      const item = bulkItems[i];
      if (item.status === 'done') continue;

      setBulkItems((prev) => prev.map((it, idx) => idx === i ? { ...it, status: 'uploading' } : it));

      try {
        const ext = item.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, item.file, { upsert: false });

        if (uploadErr) {
          const isRls = uploadErr.message.toLowerCase().includes('row-level security') || uploadErr.message.toLowerCase().includes('policy');
          throw new Error(isRls
            ? 'Storage permission denied — add an INSERT policy for the "portfolio" bucket in Supabase Dashboard → Storage → Policies.'
            : uploadErr.message);
        }

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

        const { error: dbErr } = await supabase.from('portfolio_images').insert([{
          url: urlData.publicUrl,
          storage_path: fileName,
          alt: item.alt.trim() || item.file.name,
          category: bulkCategory,
          span: bulkSpan,
          display_order: baseOrder + i,
        }]);

        if (dbErr) throw new Error(dbErr.message);

        setBulkItems((prev) => prev.map((it, idx) => idx === i ? { ...it, status: 'done' } : it));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setBulkItems((prev) => prev.map((it, idx) => idx === i ? { ...it, status: 'error', error: msg } : it));
      }
    }

    setBulkUploading(false);
    setBulkDone(true);
  };

  const bulkSuccessCount = bulkItems.filter((i) => i.status === 'done').length;
  const bulkErrorCount = bulkItems.filter((i) => i.status === 'error').length;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h2 className="font-serif text-xl md:text-2xl text-charcoal-900">Portfolio</h2>
          <p className="font-body text-xs md:text-sm text-charcoal-500 mt-0.5 hidden sm:block">
            Upload and manage gallery images
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={openBulk} className="btn-outline-dark gap-1.5 text-xs px-3 py-2.5">
            <Layers size={13} />
            <span className="hidden sm:inline">Bulk Upload</span>
            <span className="sm:hidden">Bulk</span>
          </button>
          <button onClick={openCreate} className="btn-gold gap-1.5 text-xs px-3 py-2.5">
            <Plus size={13} />
            <span className="hidden sm:inline">Upload Image</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square bg-cream-100 animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-cream-300">
          <Image size={36} className="text-charcoal-300 mx-auto mb-3" />
          <p className="font-body text-charcoal-400 mb-4">No images yet</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={openBulk} className="btn-outline-dark text-xs gap-2">
              <Layers size={13} /> Bulk Upload
            </button>
            <button onClick={openCreate} className="btn-gold text-xs gap-2">
              <Upload size={13} /> Upload First Image
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group aspect-square overflow-hidden bg-cream-100">
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Action overlay — always visible on touch, hover on desktop */}
              <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/60 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <button
                    onClick={() => openEdit(img)}
                    className="w-8 h-8 bg-white flex items-center justify-center text-charcoal-700 hover:bg-gold-500 hover:text-white transition-colors duration-200"
                    aria-label="Edit image"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteId(img.id)}
                    className="w-8 h-8 bg-white flex items-center justify-center text-charcoal-700 hover:bg-red-500 hover:text-white transition-colors duration-200"
                    aria-label="Delete image"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {/* Always-visible action bar for touch devices */}
              <div className="absolute top-0 right-0 flex sm:hidden">
                <button
                  onClick={() => openEdit(img)}
                  className="w-8 h-8 bg-charcoal-900/70 flex items-center justify-center text-white"
                  aria-label="Edit image"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={() => setDeleteId(img.id)}
                  className="w-8 h-8 bg-charcoal-900/70 flex items-center justify-center text-white"
                  aria-label="Delete image"
                >
                  <Trash2 size={11} />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-charcoal-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="font-body text-white text-xs truncate">{img.alt}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-body text-gold-400 text-xs">{img.category}</span>
                  {img.span === 'tall' && (
                    <span className="font-body text-charcoal-400 text-xs">tall</span>
                  )}
                </div>
              </div>
              <div className="absolute top-2 left-2 font-body text-xs bg-charcoal-900/60 text-white px-1.5 py-0.5">
                #{img.display_order}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Single upload modal ──────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl rounded-t-2xl sm:rounded-none">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-cream-200 sticky top-0 bg-white z-10">
              <h3 className="font-serif text-lg text-charcoal-900">
                {editingId ? 'Edit Image' : 'Upload New Image'}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600">
                  <AlertCircle size={14} />
                  <p className="font-body text-sm">{error}</p>
                </div>
              )}

              {!editingId && (
                <div>
                  <label className="admin-label">Image Upload</label>
                  <div
                    className="relative border-2 border-dashed border-cream-300 hover:border-gold-400 transition-colors duration-200 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {filePreview ? (
                      <div className="relative">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="font-body text-white text-sm">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Upload size={28} className="text-charcoal-300" />
                        <div className="text-center">
                          <p className="font-body text-charcoal-600 text-sm">Click to upload</p>
                          <p className="font-body text-charcoal-400 text-xs mt-1">JPG, PNG, WebP up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!file && (
                    <div className="mt-3">
                      <p className="font-body text-xs text-charcoal-400 mb-2 text-center">— or paste an image URL —</p>
                      <input
                        type="url"
                        value={form.image_url}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, image_url: e.target.value }));
                          setFilePreview(e.target.value);
                        }}
                        placeholder="https://..."
                        className="admin-input"
                      />
                    </div>
                  )}

                  {uploading && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-body text-xs text-charcoal-500">Uploading...</span>
                        <span className="font-body text-xs text-gold-500">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-cream-200 h-1">
                        <div
                          className="bg-gold-500 h-1 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editingId && filePreview && (
                <div>
                  <label className="admin-label">Current Image</label>
                  <img src={filePreview} alt="Current" className="w-full h-40 object-cover border border-cream-300" />
                </div>
              )}

              <div>
                <label className="admin-label">Alt Text *</label>
                <input
                  type="text"
                  value={form.alt}
                  onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))}
                  placeholder="Describe the image for accessibility..."
                  className="admin-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="admin-input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="admin-label">Layout Span</label>
                  <select
                    value={form.span}
                    onChange={(e) => setForm((f) => ({ ...f, span: e.target.value }))}
                    className="admin-input"
                  >
                    <option value="normal">Normal</option>
                    <option value="tall">Tall (double height)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="admin-label">Display Order</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                  className="admin-input"
                  min={1}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-cream-200 sticky bottom-0 bg-white">
              <button onClick={closeModal} className="flex-1 sm:flex-none btn-outline-dark text-xs px-5 py-2.5">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex-1 sm:flex-none btn-gold text-xs gap-2 disabled:opacity-50 justify-center"
              >
                {saving || uploading ? (
                  <><Loader size={13} className="animate-spin" /> {uploading ? 'Uploading...' : 'Saving...'}</>
                ) : (
                  <><Save size={13} /> {editingId ? 'Save Changes' : 'Upload & Save'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk upload modal ────────────────────────────────────────────────── */}
      {bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-3xl max-h-[92vh] flex flex-col shadow-2xl rounded-t-2xl sm:rounded-none">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-cream-200">
              <div>
                <h3 className="font-serif text-lg text-charcoal-900">Bulk Upload</h3>
                <p className="font-body text-xs text-charcoal-400 mt-0.5 hidden sm:block">
                  Select multiple images — edit alt text per image before uploading
                </p>
              </div>
              <button
                onClick={closeBulk}
                disabled={bulkUploading}
                className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 transition-colors disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            {/* Shared settings */}
            <div className="px-4 sm:px-6 py-3 border-b border-cream-100 bg-cream-50">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[120px]">
                  <label className="admin-label">Category</label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    disabled={bulkUploading}
                    className="admin-input py-2"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="admin-label">Span</label>
                  <select
                    value={bulkSpan}
                    onChange={(e) => setBulkSpan(e.target.value)}
                    disabled={bulkUploading}
                    className="admin-input py-2"
                  >
                    <option value="normal">Normal</option>
                    <option value="tall">Tall</option>
                </select>
              </div>
              <div className="flex-shrink-0">
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBulkFilePick}
                  className="hidden"
                />
                <button
                  onClick={() => bulkFileInputRef.current?.click()}
                  disabled={bulkUploading}
                  className="btn-outline-dark gap-1.5 text-xs px-3 py-2 disabled:opacity-40"
                >
                  <Plus size={12} />
                  <span className="hidden sm:inline">Add More Files</span>
                  <span className="sm:hidden">Add Files</span>
                </button>
              </div>
              </div>
            </div>

            {/* File list */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              {bulkItems.length === 0 ? (
                <div
                  className="border-2 border-dashed border-cream-300 hover:border-gold-400 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center py-12 gap-3"
                  onClick={() => bulkFileInputRef.current?.click()}
                >
                  <Layers size={32} className="text-charcoal-300" />
                  <div className="text-center">
                    <p className="font-body text-charcoal-600 text-sm">Tap to select images</p>
                    <p className="font-body text-charcoal-400 text-xs mt-1 hidden sm:block">Hold Shift or Cmd/Ctrl to select multiple files</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {bulkItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 p-2.5 border ${
                        item.status === 'done'
                          ? 'border-green-200 bg-green-50'
                          : item.status === 'error'
                          ? 'border-red-200 bg-red-50'
                          : item.status === 'uploading'
                          ? 'border-gold-200 bg-gold-50'
                          : 'border-cream-200 bg-white'
                      }`}
                    >
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 overflow-hidden bg-cream-100">
                        <img
                          src={item.preview}
                          alt={item.alt}
                          className="w-full h-full object-cover"
                        />
                        {item.status === 'uploading' && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <Loader size={14} className="text-gold-500 animate-spin" />
                          </div>
                        )}
                        {item.status === 'done' && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <span className="text-green-600 text-base font-bold">✓</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={item.alt}
                          onChange={(e) => updateBulkAlt(idx, e.target.value)}
                          placeholder="Alt text..."
                          disabled={bulkUploading || item.status === 'done'}
                          className="admin-input text-xs py-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        <p className="font-body text-xs text-charcoal-400 mt-1 truncate">{item.file.name}</p>
                        {item.status === 'error' && (
                          <p className="font-body text-xs text-red-500 mt-0.5 flex items-center gap-1">
                            <AlertCircle size={10} /> {item.error}
                          </p>
                        )}
                      </div>

                      {item.status !== 'uploading' && item.status !== 'done' && (
                        <button
                          onClick={() => removeBulkItem(idx)}
                          disabled={bulkUploading}
                          className="w-7 h-7 flex items-center justify-center text-charcoal-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40 self-start mt-0.5"
                          aria-label="Remove"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-cream-200 bg-white">
              {bulkDone && (
                <p className="font-body text-sm text-charcoal-600 mb-3">
                  <span className="text-green-600 font-medium">{bulkSuccessCount} uploaded</span>
                  {bulkErrorCount > 0 && (
                    <span className="text-red-500 ml-2">{bulkErrorCount} failed</span>
                  )}
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <p className="font-body text-xs text-charcoal-400">
                  {bulkItems.length} {bulkItems.length === 1 ? 'file' : 'files'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={closeBulk}
                    disabled={bulkUploading}
                    className="btn-outline-dark text-xs px-4 py-2.5 disabled:opacity-40"
                  >
                    {bulkDone ? 'Close' : 'Cancel'}
                  </button>
                  {!bulkDone && (
                    <button
                      onClick={handleBulkUpload}
                      disabled={bulkUploading || bulkItems.length === 0}
                      className="btn-gold text-xs gap-2 disabled:opacity-50"
                    >
                      {bulkUploading ? (
                        <><Loader size={13} className="animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload size={13} /> Upload {bulkItems.length > 0 ? `${bulkItems.length} ` : ''}Image{bulkItems.length !== 1 ? 's' : ''}</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-serif text-xl text-charcoal-900 mb-2">Delete Image?</h3>
            <p className="font-body text-sm text-charcoal-500 mb-6">
              This will permanently delete the image from the gallery and storage bucket.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline-dark text-xs py-2.5">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-body text-xs tracking-widest uppercase py-2.5 transition-colors duration-200" 
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
