import { useState } from 'react';
import { deleteFoodItem } from '../repo';
import { useFoodLibrary } from '../hooks';
import { formatQuantity } from '../quantity';

interface FoodLibraryScreenProps {
  onClose: () => void;
}

export function FoodLibraryScreen({ onClose }: FoodLibraryScreenProps) {
  const items = useFoodLibrary();
  const [query, setQuery] = useState('');

  if (items === undefined) {
    return null;
  }

  const q = query.trim().toLowerCase();
  const filtered = q ? items.filter((item) => item.name.toLowerCase().includes(q)) : items;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-line">
          <button type="button" className="nav-arrow" aria-label="Back" onClick={onClose}>
            ‹
          </button>
          <span className="app-header-date">Food Library</span>
        </div>
      </header>

      <input
        type="text"
        placeholder="Search foods…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search food library"
        className="library-search"
      />

      {filtered.length === 0 ? (
        <p className="empty-state">No foods match "{query}".</p>
      ) : (
        <ul className="entry-list">
          {filtered.map((item) => (
            <li key={item.id} className="entry-row">
              <span className="entry-name">{item.name}</span>
              <div className="entry-row-right">
                <span className="entry-calories">
                  {formatQuantity(item.servingSize, item.servingUnit)} · {item.calories} cal
                </span>
                <button
                  type="button"
                  className="row-icon-button"
                  aria-label={`Delete ${item.name} from food library`}
                  onClick={() => {
                    if (
                      confirm(
                        `Delete "${item.name}" from your food library? Days you've already logged it on keep their own record and won't change.`,
                      )
                    ) {
                      deleteFoodItem(item.id);
                    }
                  }}
                >
                  ⛔
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
