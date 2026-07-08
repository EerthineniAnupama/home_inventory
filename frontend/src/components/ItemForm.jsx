import { useState } from 'react';
import { ImagePlus } from 'lucide-react';

const emptyForm = {
  itemName: '',
  category: '',
  description: '',
  purchaseDate: '',
  purchasePrice: '',
  warrantyExpiry: '',
  serialNumber: '',
};

export default function ItemForm({ initialValues = {}, existingImageUrl = null, onSubmit, submitLabel = 'Save item' }) {
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // local preview only, not yet uploaded
  }

  function validate() {
    const next = {};
    if (!form.itemName.trim()) next.itemName = 'Item name is required';
    if (form.purchasePrice && Number(form.purchasePrice) < 0) {
      next.purchasePrice = 'Price cannot be negative';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
        imageUrl: existingImageUrl,
      };

      await onSubmit(payload, imageFile);
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong saving this item.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5" noValidate>
      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Photo</label>
        <label className="flex items-center gap-4 cursor-pointer">
          <div className="h-20 w-20 rounded-card bg-zinc-100 border border-border flex items-center justify-center overflow-hidden shrink-0">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus size={20} className="text-zinc-400" />
            )}
          </div>
          <span className="text-sm text-accent hover:underline">
            {previewUrl ? 'Change photo' : 'Upload a photo'}
          </span>
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Item name" name="itemName" value={form.itemName} onChange={handleChange} error={errors.itemName} required />
        <Field label="Category" name="category" value={form.category} onChange={handleChange} placeholder="Electronics, Furniture…" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Purchase date" name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleChange} />
        <Field label="Purchase price ($)" name="purchasePrice" type="number" step="0.01" value={form.purchasePrice} onChange={handleChange} error={errors.purchasePrice} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Warranty expiry" name="warrantyExpiry" type="date" value={form.warrantyExpiry} onChange={handleChange} />
        <Field label="Serial number" name="serialNumber" value={form.serialNumber} onChange={handleChange} mono />
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-status-danger">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-accent hover:bg-accent-hover transition-colors text-white text-sm font-medium px-5 py-2.5 disabled:opacity-60"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, name, value, onChange, error, type = 'text', required, mono, ...rest }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-700">
        {label} {required && <span className="text-status-danger">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        {...rest}
        className={`mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent outline-none ${mono ? 'font-mono' : ''}`}
      />
      {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
    </div>
  );
}