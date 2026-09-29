import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { CATEGORIES, CATEGORY_EMOJI } from '../constants.js';
import Field from '../components/Field.jsx';

const EMPTY = { name: '', city: '', country: '', category: '', description: '', mapUrl: '' };

// Used for both "Post a spot" (/spots/new) and "Edit spot" (/spots/:id/edit)
export default function SpotForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api
      .getSpot(id)
      .then(({ spot }) => {
        if (spot.userId !== user.id) {
          setError("You can only edit spots you posted.");
          return;
        }
        setForm({
          name: spot.name,
          city: spot.city,
          country: spot.country,
          category: spot.category,
          description: spot.description,
          mapUrl: spot.mapUrl,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit, user.id]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setError('');
    try {
      const { spot } = isEdit ? await api.updateSpot(id, form) : await api.createSpot(form);
      navigate(`/spots/${spot.id}`);
    } catch (err) {
      setErrors(err.errors);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted center">Loading…</p>;

  return (
    <div className="card form-card">
      <h1>{isEdit ? 'Edit spot' : 'Post a spot'}</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <Field label="Name of place" error={errors.name}>
          <input className="input" value={form.name} onChange={set('name')} maxLength={120} required />
        </Field>

        <div className="form-row">
          <Field label="City" error={errors.city}>
            <input className="input" value={form.city} onChange={set('city')} maxLength={100} placeholder="Hong Kong" required />
          </Field>
          <Field label="Country" error={errors.country}>
            <input className="input" value={form.country} onChange={set('country')} maxLength={100} placeholder="Hong Kong" required />
          </Field>
        </div>

        <Field label="Category" error={errors.category}>
          <select className="input" value={form.category} onChange={set('category')} required>
            <option value="" disabled>
              Choose a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_EMOJI[c]} {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Short review" error={errors.description} hint={`${form.description.length}/500`}>
          <textarea
            className="input"
            rows={5}
            value={form.description}
            onChange={set('description')}
            maxLength={500}
            placeholder="What should people order / do? Any tips?"
            required
          />
        </Field>

        <Field
          label="Link or address"
          error={errors.mapUrl}
          hint="Paste a Google Maps link, an Instagram/TikTok/blog link, or just type the address."
        >
          <input className="input" value={form.mapUrl} onChange={set('mapUrl')} maxLength={2000} required />
        </Field>

        <div className="row">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Post spot'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
