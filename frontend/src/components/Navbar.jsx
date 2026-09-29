import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          📍 CityPins
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>
            Browse
          </NavLink>
          {user ? (
            <>
              <Link to="/spots/new" className="btn btn-primary btn-sm">
                + Post a spot
              </Link>
              <NavLink to="/me">@{user.username}</NavLink>
              <button
                className="btn-link"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
