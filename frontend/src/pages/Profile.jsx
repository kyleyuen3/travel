import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import ProfileHeader from '../components/ProfileHeader.jsx';
import SpotGrid from '../components/SpotGrid.jsx';

// Public profile: /users/:username — username, bio, home city, posted spots
export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setUser(null);
    setError('');
    Promise.all([api.getUser(username), api.getUserSpots(username)])
      .then(([u, s]) => {
        setUser(u.user);
        setSpots(s.spots);
      })
      .catch((err) => setError(err.message));
  }, [username, me?.id]);

  if (error) return <p className="error center">{error}</p>;
  if (!user) return <p className="muted center">Loading…</p>;

  return (
    <>
      <ProfileHeader user={user}>
        {me?.id === user.id && (
          <Link to="/me" className="btn btn-outline btn-sm">
            Edit profile
          </Link>
        )}
      </ProfileHeader>
      <h2 className="section-title">
        Posted spots <span className="muted">({spots.length})</span>
      </h2>
      {spots.length ? <SpotGrid spots={spots} /> : <p className="muted">No spots posted yet.</p>}
    </>
  );
}
