import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { CATEGORY_EMOJI, formatDate, linkLabel, mapHref } from '../constants.js';
import BookmarkButton from '../components/BookmarkButton.jsx';

export default function SpotDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSpot(null);
    setError('');
    api
      .getSpot(id)
      .then(({ spot }) => setSpot(spot))
      .catch((err) => setError(err.message));
  }, [id, user?.id]);

  async function handleDelete() {
    if (!confirm(`Delete "${spot.name}"? This can't be undone.`)) return;
    try {
      await api.deleteSpot(spot.id);
      navigate('/me');
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p className="error center">{error}</p>;
  if (!spot) return <p className="muted center">Loading…</p>;

  const isOwner = user?.id === spot.userId;

  return (
    <article className="card detail">
      <Link to={`/?city=${encodeURIComponent(spot.city)}`} className="small">
        ← More in {spot.city}
      </Link>
      <div className="detail-head">
        <div>
          <span className="tag">
            {CATEGORY_EMOJI[spot.category]} {spot.category}
          </span>
          <h1>{spot.name}</h1>
          <p className="muted">
            📍 {spot.city}, {spot.country}
          </p>
        </div>
        <BookmarkButton key={`${spot.id}-${spot.bookmarked}`} spot={spot} size="md" />
      </div>

      <p className="description">{spot.description}</p>

      <a className="btn btn-primary" href={mapHref(spot.mapUrl)} target="_blank" rel="noopener noreferrer">
        {linkLabel(spot.mapUrl)} ↗
      </a>

      <p className="muted small meta">
        Posted by <Link to={`/users/${spot.username}`}>@{spot.username}</Link> on {formatDate(spot.createdAt)} ·{' '}
        {spot.bookmarkCount} {spot.bookmarkCount === 1 ? 'save' : 'saves'}
      </p>

      {isOwner && (
        <div className="row">
          <Link to={`/spots/${spot.id}/edit`} className="btn btn-outline btn-sm">
            Edit
          </Link>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
