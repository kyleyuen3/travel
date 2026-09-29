import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function BookmarkButton({ spot, onChange, size = 'sm' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(spot.bookmarked);
  const [busy, setBusy] = useState(false);

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login', { state: { from: `/spots/${spot.id}` } });

    setBusy(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      if (next) await api.bookmark(spot.id);
      else await api.unbookmark(spot.id);
      onChange?.(next);
    } catch {
      setSaved(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`btn btn-${size} ${saved ? 'btn-saved' : 'btn-outline'}`}
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      title={saved ? 'Remove bookmark' : 'Save this spot'}
    >
      {saved ? '★ Saved' : '☆ Save'}
    </button>
  );
}
