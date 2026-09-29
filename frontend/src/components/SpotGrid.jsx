import SpotCard from './SpotCard.jsx';

export default function SpotGrid({ spots, onBookmarkChange }) {
  return (
    <div className="grid">
      {spots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} onBookmarkChange={onBookmarkChange} />
      ))}
    </div>
  );
}
