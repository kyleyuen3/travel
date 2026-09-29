import { formatDate } from '../constants.js';

export default function ProfileHeader({ user, children }) {
  return (
    <section className="card profile-header">
      {user.avatarUrl ? (
        <img className="avatar" src={user.avatarUrl} alt="" />
      ) : (
        <div className="avatar avatar-fallback">{user.username[0].toUpperCase()}</div>
      )}
      <div className="profile-info">
        <h1>@{user.username}</h1>
        {user.homeCity && <p className="muted">🏠 {user.homeCity}</p>}
        {user.bio && <p>{user.bio}</p>}
        <p className="muted small">Joined {formatDate(user.createdAt)}</p>
        {children}
      </div>
    </section>
  );
}
