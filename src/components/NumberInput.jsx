import { useState, useEffect } from 'react';

/**
 * A number input that allows the field to go blank while editing.
 * The `value` prop is a number. `onChange` is called with a number
 * only on blur or Enter. While typing, the raw string is shown.
 */
export default function NumberInput({ value, onChange, style, placeholder, min, max }) {
  const [display, setDisplay] = useState(value === 0 ? '' : String(value));

  // Sync when external value changes (e.g. from parent reset)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    setDisplay(value === 0 ? '' : String(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    // Allow empty, digits, decimal point, and negative
    if (raw === '' || raw === '-' || /^-?\d*\.?\d*$/.test(raw)) {
      setDisplay(raw);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(display);
    if (isNaN(parsed)) {
      // Field is empty, keep it empty visually but store 0
      setDisplay('');
      onChange(0);
    } else {
      const clamped = min !== undefined ? Math.max(min, parsed) : parsed;
      const final = max !== undefined ? Math.min(max, clamped) : clamped;
      setDisplay(String(final));
      onChange(final);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder ?? ''}
      style={style}
    />
  );
}
