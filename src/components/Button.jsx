// components/Button.jsx
// Reusable button that can render as <button> or <a> (via the `as` prop).
//
// Props:
//   variant  — 'primary' | 'secondary' | 'secondary-maroon'  (default: 'primary')
//   as       — 'button' | 'a'  (default: 'button')
//   href     — used when as='a'
//   onClick  — used when as='button'
//   children — button label

import './Button.css';

export default function Button({
  variant = 'primary',
  as: Tag = 'button',
  href,
  onClick,
  children,
  className = '',
  ...rest
}) {
  const classes = `btn btn--${variant} ${className}`.trim();

  return (
    <Tag
      className={classes}
      href={Tag === 'a' ? href : undefined}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Tag>
  );
}
