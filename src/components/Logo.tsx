import React from 'react';

interface LogoProps {
  /**
   * Optional logo image URL. When provided, replaces the placeholder.
   * Drop your final logo image into /public and pass `src="/your-logo.png"`
   * (or pass an imported asset). Recommended size: 64x64 transparent PNG/SVG.
   */
  src?: string;
  showWordmark?: boolean;
  size?: number;
}

/**
 * Logo with an upload-friendly placeholder.
 *
 * To swap in the real logo later:
 *   1. Drop your logo file in `public/` (e.g. `public/booksee-logo.png`)
 *   2. Render `<Logo src="/booksee-logo.png" />`
 *      — or set `defaultSrc` below to that path so every Logo picks it up.
 */
const Logo: React.FC<LogoProps> = ({ src, showWordmark = true, size = 36 }) => {
  const defaultSrc: string | undefined = undefined; // <-- replace later with '/booksee-logo.png'
  const resolvedSrc = src ?? defaultSrc;

  return (
    <div className="bs-logo" aria-label="BookSee.App">
      <div
        className="bs-logo__mark"
        style={{ width: size, height: size }}
        title="Logo placeholder — replace via <Logo src='/your-logo.png' />"
      >
        {resolvedSrc ? (
          <img className="bs-logo__img" src={resolvedSrc} alt="BookSee logo" />
        ) : (
          <span className="bs-logo__placeholder">LOGO</span>
        )}
      </div>
      {showWordmark && (
        <span className="bs-logo__text">
          Book<span className="bs-logo__text--accent">See</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
