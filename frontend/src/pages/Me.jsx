import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Field from '../components/Field.jsx';
import ProfileHeader from '../components/ProfileHeader.jsx';
import SpotGrid from '../components/SpotGrid.jsx';

// Private profile: public info + bookmarks + edit profile
export default function Me() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('saved');
  const [bookmarks, setBookmarks] = useState(null);
  const [mySpots, setMySpots] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    api.myBookmarks().then(({ spots }) => setBookmarks(spots));
    api.getUserSpots(user.username).then(({ spots }) => setMySpots(spots));
  }, [user.username]);

  // Drop a card from "Saved" as soon as it's un-bookmarked
  function handleBookmarkChange(spot, saved) {
    if (!saved) setBookmarks((list) => list.filter((s) => s.id !== spot.id));
  }

  const list = tab === 'saved' ? bookmarks : mySpots;

  return (
    <>
      <ProfileHeader user={user}>
        <div className="row">
          <button className="btn btn-outline btn-sm" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Close' : 'Edit profile'}
          </button>
          <Link to={`/users/${user.username}`} className="btn-link small">
            View public profile
          </Link>
        </div>
        <p className="muted small">Email (private): {user.email}</p>
      </ProfileHeader>

      {editing && (
        <EditProfile
          user={user}
          onSaved={(u) => {
            setUser(u);
            setEditing(false);
          }}
        />
      )}

      <div className="tabs">
        <button className={tab === 'saved' ? 'active' : ''} onClick={() => setTab('saved')}>
          ★ Saved {bookmarks && `(${bookmarks.length})`}
        </button>
        <button className={tab === 'posted' ? 'active' : ''} onClick={() => setTab('posted')}>
          📍 My spots {mySpots && `(${mySpots.length})`}
        </button>
      </div>
      {tab === 'saved' && <p className="muted small">Only you can see your saved spots.</p>}

      {list === null ? (
        <p className="muted center">Loading…</p>
      ) : list.length === 0 ? (
        <div className="empty">
          {tab === 'saved' ? (
            <p>
              Nothing saved yet. <Link to="/">Browse spots</Link> and tap ☆ Save.
            </p>
          ) : (
            <p>
              You haven't posted anything. <Link to="/spots/new">Post your first spot</Link>.
            </p>
          )}
        </div>
      ) : (
        <SpotGrid spots={list} onBookmarkChange={tab === 'saved' ? handleBookmarkChange : undefined} />
      )}
    </>
  );
}

function EditProfile({ user, onSaved }) {
  const [form, setForm] = useState({
    bio: user.bio || '',
    homeCity: user.homeCity || '',
    avatarUrl: user.avatarUrl || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const { user: updated } = await api.updateMe(form);
      onSaved(updated);
    } catch (err) {
      setErrors({ ...err.errors, _: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      {errors._ && <p className="error">{errors._}</p>}
      <Field label="Bio" error={errors.bio} hint={`${form.bio.length}/200`}>
        <textarea className="input" rows={3} maxLength={200} value={form.bio} onChange={set('bio')} />
      </Field>
      <div className="form-row">
        <Field label="Home city" error={errors.homeCity}>
          <input className="input" maxLength={100} value={form.homeCity} onChange={set('homeCity')} />
        </Field>
        <Field label="Avatar URL" error={errors.avatarUrl}>
          <input className="input" value={form.avatarUrl} onChange={set('avatarUrl')} placeholder="https://…" />
        </Field>
      </div>
      <div>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  );
}
