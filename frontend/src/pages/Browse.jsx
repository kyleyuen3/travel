import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { CATEGORIES, CATEGORY_EMOJI } from '../constants.js';
import SpotGrid from '../components/SpotGrid.jsx';

const PAGE_SIZE = 20;

export default function Browse() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const city = params.get('city') || '';
  const category = params.get('category') || 'All';
  const sort = params.get('sort') || 'newest';
  const q = params.get('q') || '';

  const [cityInput, setCityInput] = useState(city);
  const [qInput, setQInput] = useState(q);
  const [cities, setCities] = useState([]);
  const [spots, setSpots] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listCities().then(({ cities }) => setCities(cities)).catch(() => {});
  }, []);

  // Keep inputs in sync when the URL changes (e.g. back button)
  useEffect(() => setCityInput(city), [city]);
  useEffect(() => setQInput(q), [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .listSpots({ city, category, sort, q, limit: PAGE_SIZE, offset: 0 })
      .then((data) => {
        if (cancelled) return;
        setSpots(data.spots);
        setTotal(data.total);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [city, category, sort, q, user?.id]);

  function update(changes) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (!value || (key === 'category' && value === 'All') || (key === 'sort' && value === 'newest')) next.delete(key);
      else next.set(key, value);
    }
    setParams(next);
  }

  async function loadMore() {
    const data = await api.listSpots({ city, category, sort, q, limit: PAGE_SIZE, offset: spots.length });
    setSpots((prev) => [...prev, ...data.spots]);
    setTotal(data.total);
  }

  const filtersActive = city || q || category !== 'All';

  return (
    <>
      <section className="hero">
        <h1>{city ? `Spots in ${city}` : 'Where are you headed?'}</h1>
        <p className="muted">Real recommendations from real travelers — restaurants, cafés, viewpoints and more.</p>

        <form
          className="search-row"
          onSubmit={(e) => {
            e.preventDefault();
            update({ city: cityInput.trim(), q: qInput.trim() });
          }}
        >
          <input
            className="input"
            list="city-options"
            placeholder="City (e.g. Hong Kong, Taipei)"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            aria-label="City"
          />
          <datalist id="city-options">
            {cities.map((c) => (
              <option key={`${c.city}-${c.country}`} value={c.city}>
                {c.country} · {c.count} spots
              </option>
            ))}
          </datalist>
          <input
            className="input"
            placeholder="Search name or review (optional)"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            aria-label="Keyword"
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>

        <div className="filter-row">
          <select className="input" value={category} onChange={(e) => update({ category: e.target.value })} aria-label="Category">
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_EMOJI[c]} {c}
              </option>
            ))}
          </select>
          <select className="input" value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          {filtersActive && (
            <button className="btn-link" onClick={() => setParams({})}>
              Clear filters
            </button>
          )}
          <span className="spacer" />
          {user ? (
            <Link to="/spots/new" className="btn btn-primary">
              + Post a spot
            </Link>
          ) : (
            <Link to="/login" className="btn btn-outline">
              Log in to post
            </Link>
          )}
        </div>

        {!city && cities.length > 0 && (
          <div className="chips">
            {cities.slice(0, 10).map((c) => (
              <button key={`${c.city}-${c.country}`} className="chip" onClick={() => update({ city: c.city })}>
                {c.city} <span className="muted">{c.count}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {!city && !q && !loading && spots.length > 0 && <h2 className="section-title">Recently posted</h2>}

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted center">Loading spots…</p>
      ) : spots.length === 0 ? (
        <div className="empty">
          <p>{city ? `No spots in ${city} yet. Be the first to post.` : 'No spots yet. Be the first to post.'}</p>
          <Link to={user ? '/spots/new' : '/login'} className="btn btn-primary">
            {user ? 'Post a spot' : 'Log in to post'}
          </Link>
        </div>
      ) : (
        <>
          <SpotGrid spots={spots} />
          {spots.length < total && (
            <div className="center">
              <button className="btn btn-outline" onClick={loadMore}>
                Load more ({total - spots.length} left)
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
