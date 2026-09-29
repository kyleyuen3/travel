import { Link } from 'react-router-dom';
import { CATEGORY_EMOJI } from '../constants.js';
import BookmarkButton from './BookmarkButton.jsx';

export default function SpotCard({ spot, onBookmarkChange }) {
  const preview = spot.description.length > 120 ? `${spot.description.slice(0, 120).trimEnd()}…` : spot.description;

  return (
    <article className="card spot-card">
      <div className="spot-card-top">
        <span className="tag">
          {CATEGORY_EMOJI[spot.category]} {spot.category}
        </span>
        <BookmarkButton spot={spot} onChange={(saved) => onBookmarkChange?.(spot, saved)} />
      </div>
      <h3>
        <Link to={`/spots/${spot.id}`}>{spot.name}</Link>
      </h3>
      <p className="muted small">
        📍 {spot.city}, {spot.country}
      </p>
      <p className="preview">{preview}</p>
      <div className="spot-card-bottom small">
        <span className="muted">
          by <Link to={`/users/${spot.username}`}>@{spot.username}</Link>
        </span>
        <Link to={`/spots/${spot.id}`}>View details →</Link>
      </div>
    </article>
  );
}
