import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 5V2" />
    <path d="M16.24 7.76l1.42-1.42" />
    <path d="M19 12h3" />
    <path d="M16.24 16.24l1.42 1.42" />
    <path d="M12 19v3" />
    <path d="M7.76 16.24l-1.42 1.42" />
    <path d="M5 12H2" />
    <path d="M7.76 7.76L6.34 6.34" />
    <circle cx="12" cy="12" r="5" />
    <path d="M12 12h.01" />
  </svg>
);
