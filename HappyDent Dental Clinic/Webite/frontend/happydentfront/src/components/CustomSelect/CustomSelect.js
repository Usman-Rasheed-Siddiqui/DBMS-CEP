import { useState, useEffect, useRef } from 'react';
import './CustomSelect.css';

const CustomSelect = ({ options, value, onChange, placeholder, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // HIGHLIGHT: Track type-to-filter text
  const ref = useRef(null);

  const selected = options.find(o => o.value === value);

  // HIGHLIGHT: Filter choices dynamically based on the user's input string
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearchTerm(""); // Reset search when clicking outside
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`cs-wrap ${disabled ? 'disabled' : ''}`} ref={ref}>
      <div
        className={`cs-trigger ${open ? 'open' : ''}`}
        onClick={() => !disabled && setOpen(prev => !prev)}
      >
        <span className={`cs-value ${!selected ? 'placeholder' : ''}`}>
          {selected ? selected.label : placeholder || 'Select...'}
        </span>
        <svg className="cs-arrow" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className={`cs-menu ${open ? 'open' : ''}`}>
        {/* HIGHLIGHT: Inline filter search box */}
        <div className="cs-search-box">
          <input
            type="text"
            placeholder="Type to find..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()} // Keep dropdown from closing when clicking input
            className="cs-search-input"
          />
        </div>

        {/* Dynamic menu content wrapper */}
        <div className="cs-options-list">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                className={`cs-option ${value === opt.value ? 'selected' : ''} ${opt.disabled ? 'disabled' : ''}`}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange(opt.value); 
                  setOpen(false);
                  setSearchTerm(""); // Clean up text filter state
                }}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="cs-no-data">No matching records found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomSelect;